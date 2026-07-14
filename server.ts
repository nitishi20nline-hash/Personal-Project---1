import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { readDB, writeDB } from './server/db.js';
import { APQPProject, FMEAItem, PPAPElement, CAPALog } from './src/types.js';

// Load environment variables
dotenv.config();

const PORT = 3000;

// Standard PPAP Elements
const PPAP_TEMPLATE = [
  { code: 'DRE', name: 'Design Records & Specifications' },
  { code: 'DFMEA', name: 'Design Failure Mode & Effects Analysis (DFMEA)' },
  { code: 'PFMEA', name: 'Process Failure Mode & Effects Analysis (PFMEA)' },
  { code: 'DIM', name: 'Dimensional Measurement Results' },
  { code: 'MAT', name: 'Material & Performance Test Results' },
  { code: 'MSA', name: 'Measurement System Analysis (MSA) Studies' },
  { code: 'SPC', name: 'Initial Process Capability Studies (Cpk)' },
  { code: 'PSW', name: 'Part Submission Warrant (PSW)' }
];

// Lazy initialize Gemini client
let aiClient: any = null;
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please provide it in the Secrets panel.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API: APQP Projects
  app.get('/api/projects', (req: Request, res: Response) => {
    try {
      const db = readDB();
      res.json(db.projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { name, partNumber, customer, launchDate, status } = req.body;
      
      if (!name || !partNumber || !customer) {
        return res.status(400).json({ error: 'Name, part number, and customer are required' });
      }

      const newId = `proj-${Date.now()}`;
      const newProject: APQPProject = {
        id: newId,
        name,
        partNumber,
        customer,
        status: status || 'Planning',
        progress: status === 'Planning' ? 10 : 25,
        launchDate: launchDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Auto-initialize standard PPAP elements checklist for the new project
      const newPpapElements: PPAPElement[] = PPAP_TEMPLATE.map((t, idx) => ({
        id: `ppap-${newId}-${idx}`,
        projectId: newId,
        elementCode: t.code,
        elementName: t.name,
        status: 'Not Started',
        submittedBy: '',
        submittedAt: '',
        comments: ''
      }));

      db.projects.push(newProject);
      db.ppap.push(...newPpapElements);

      writeDB(db);
      res.status(201).json(newProject);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/projects/:id', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { id } = req.params;
      const index = db.projects.findIndex(p => p.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Project not found' });
      }

      db.projects[index] = {
        ...db.projects[index],
        ...req.body,
        id // keep immutable
      };

      writeDB(db);
      res.json(db.projects[index]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/projects/:id', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { id } = req.params;
      
      db.projects = db.projects.filter(p => p.id !== id);
      db.fmea = db.fmea.filter(f => f.projectId !== id);
      db.ppap = db.ppap.filter(p => p.projectId !== id);
      db.capa = db.capa.map(c => c.projectId === id ? { ...c, projectId: undefined } : c);

      writeDB(db);
      res.json({ success: true, message: 'Project and all related QLM sheets removed successfully.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: FMEA Items
  app.get('/api/projects/:projectId/fmea', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { projectId } = req.params;
      const items = db.fmea.filter(f => f.projectId === projectId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/projects/:projectId/fmea', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { projectId } = req.params;
      const {
        id,
        processStep,
        potentialFailureMode,
        potentialFailureEffects,
        severity,
        potentialCauses,
        occurrence,
        currentControls,
        detection,
        recommendedActions,
        actionResponsibility,
        actionStatus
      } = req.body;

      if (!processStep || !potentialFailureMode || !potentialFailureEffects) {
        return res.status(400).json({ error: 'Process step, Failure Mode, and Failure Effects are required' });
      }

      const sev = Number(severity) || 1;
      const occ = Number(occurrence) || 1;
      const det = Number(detection) || 1;
      const rpn = sev * occ * det;

      if (id) {
        // Edit existing FMEA item
        const idx = db.fmea.findIndex(f => f.id === id);
        if (idx !== -1) {
          db.fmea[idx] = {
            id,
            projectId,
            processStep,
            potentialFailureMode,
            potentialFailureEffects,
            severity: sev,
            potentialCauses,
            occurrence: occ,
            currentControls,
            detection: det,
            rpn,
            recommendedActions: recommendedActions || '',
            actionResponsibility: actionResponsibility || '',
            actionStatus: actionStatus || 'Open'
          };
          writeDB(db);
          return res.json(db.fmea[idx]);
        }
      }

      // Create new FMEA item
      const newItem: FMEAItem = {
        id: `fmea-${Date.now()}`,
        projectId,
        processStep,
        potentialFailureMode,
        potentialFailureEffects,
        severity: sev,
        potentialCauses: potentialCauses || '',
        occurrence: occ,
        currentControls: currentControls || '',
        detection: det,
        rpn,
        recommendedActions: recommendedActions || '',
        actionResponsibility: actionResponsibility || '',
        actionStatus: actionStatus || 'Open'
      };

      db.fmea.push(newItem);
      writeDB(db);
      res.status(201).json(newItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/projects/:projectId/fmea/:fmeaId', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { fmeaId } = req.params;
      db.fmea = db.fmea.filter(f => f.id !== fmeaId);
      writeDB(db);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: PPAP Checklist
  app.get('/api/projects/:projectId/ppap', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { projectId } = req.params;
      let elements = db.ppap.filter(p => p.projectId === projectId);
      
      // Fallback: If no elements found, generate them dynamically
      if (elements.length === 0) {
        elements = PPAP_TEMPLATE.map((t, idx) => ({
          id: `ppap-${projectId}-${idx}`,
          projectId: projectId,
          elementCode: t.code,
          elementName: t.name,
          status: 'Not Started',
          submittedBy: '',
          submittedAt: '',
          comments: ''
        }));
        db.ppap.push(...elements);
        writeDB(db);
      }

      res.json(elements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/projects/:projectId/ppap/:ppapId', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { ppapId } = req.params;
      const idx = db.ppap.findIndex(p => p.id === ppapId);

      if (idx === -1) {
        return res.status(404).json({ error: 'PPAP element not found' });
      }

      db.ppap[idx] = {
        ...db.ppap[idx],
        ...req.body,
        id: ppapId // keep immutable
      };

      // Calculate total PPAP elements status to adjust project progress automatically!
      const projectId = db.ppap[idx].projectId;
      const projectPpap = db.ppap.filter(p => p.projectId === projectId);
      const approvedCount = projectPpap.filter(p => p.status === 'Approved').length;
      const inProgressCount = projectPpap.filter(p => p.status === 'In Progress' || p.status === 'Under Review').length;
      
      const projIdx = db.projects.findIndex(p => p.id === projectId);
      if (projIdx !== -1) {
        // Base APQP progress: approved PPAP elements contribute, plus status weight
        let calculatedProgress = Math.round((approvedCount / projectPpap.length) * 60); // PPAP is worth up to 60%
        if (db.projects[projIdx].status === 'Planning') calculatedProgress += 10;
        else if (db.projects[projIdx].status === 'Design') calculatedProgress += 20;
        else if (db.projects[projIdx].status === 'ProcessDev') calculatedProgress += 30;
        else if (db.projects[projIdx].status === 'Validation') calculatedProgress += 40;
        else if (db.projects[projIdx].status === 'Production') calculatedProgress += 50;
        else if (db.projects[projIdx].status === 'Completed') calculatedProgress = 100;
        
        db.projects[projIdx].progress = Math.min(100, Math.max(10, calculatedProgress));
      }

      writeDB(db);
      res.json(db.ppap[idx]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: CAPA Logs
  app.get('/api/capa', (req: Request, res: Response) => {
    try {
      const db = readDB();
      res.json(db.capa);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/capa', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { title, projectId, defectDescription, source, severity, containmentAction, rootCauseAnalysis, correctiveAction, preventiveAction, owner } = req.body;

      if (!title || !defectDescription || !source) {
        return res.status(400).json({ error: 'Title, defect description, and source are required' });
      }

      const newCapa: CAPALog = {
        id: `capa-${Date.now()}`,
        title,
        projectId,
        defectDescription,
        source,
        status: 'Draft',
        severity: severity || 'Medium',
        containmentAction: containmentAction || '',
        rootCauseAnalysis: rootCauseAnalysis || { method: '5Whys', whys: ['', '', '', '', ''] },
        correctiveAction: correctiveAction || '',
        preventiveAction: preventiveAction || '',
        owner: owner || 'Quality Engineer',
        createdAt: new Date().toISOString().split('T')[0]
      };

      db.capa.push(newCapa);
      writeDB(db);
      res.status(201).json(newCapa);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/capa/:id', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { id } = req.params;
      const idx = db.capa.findIndex(c => c.id === id);

      if (idx === -1) {
        return res.status(404).json({ error: 'CAPA log not found' });
      }

      const prevStatus = db.capa[idx].status;
      const nextStatus = req.body.status;

      let closedAt = db.capa[idx].closedAt;
      if (nextStatus === 'Closed' && prevStatus !== 'Closed') {
        closedAt = new Date().toISOString().split('T')[0];
      } else if (nextStatus !== 'Closed') {
        closedAt = undefined;
      }

      db.capa[idx] = {
        ...db.capa[idx],
        ...req.body,
        closedAt,
        id // keep immutable
      };

      writeDB(db);
      res.json(db.capa[idx]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/capa/:id', (req: Request, res: Response) => {
    try {
      const db = readDB();
      const { id } = req.params;
      db.capa = db.capa.filter(c => c.id !== id);
      writeDB(db);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Gemini FMEA Copilot
  app.post('/api/gemini/fmea-suggest', async (req: Request, res: Response) => {
    try {
      const { processStep, productContext } = req.body;
      if (!processStep) {
        return res.status(400).json({ error: 'Process step is required to brainstorm FMEA' });
      }

      const ai = getAIClient();
      const contextString = productContext ? `for the product: "${productContext}"` : '';
      
      const prompt = `You are an elite Quality and Reliability Engineer specializing in FMEA (Failure Mode and Effects Analysis) according to AIAG-VDA standards.
Analyze this manufacturing process step: "${processStep}" ${contextString}.
Brainstorm 3 highly realistic and technical potential failure modes that could occur at this step.
For each failure mode, supply:
1. The potential failure mode.
2. The specific downstream or customer effects of this failure.
3. A severity rating (1-10) where 10 is catastrophic/safety-critical and 1 is unnoticeable.
4. Potential root causes (e.g. equipment wear, human error, parameters drift).
5. An occurrence rating (1-10) where 10 is nearly certain and 1 is extremely rare.
6. Current typical prevention or detection controls.
7. A detection rating (1-10) where 10 is completely undetectable and 1 is 100% automatically caught.
8. A recommended proactive engineering corrective action.

Respond ONLY with a JSON array that matches the schema described. Do not write any conversational intro or markdown outside the JSON structure.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an AI assistant specialized in Quality Lifecycle Management, FMEA, and APQP manufacturing processes. Return valid JSON only.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'List of suggested FMEA entries',
            items: {
              type: Type.OBJECT,
              properties: {
                potentialFailureMode: { type: Type.STRING, description: 'E.g., Over-torque on casing screws' },
                potentialFailureEffects: { type: Type.STRING, description: 'Downstream effects, including performance degradation or safety risks' },
                severity: { type: Type.INTEGER, description: 'Severity score 1 to 10' },
                potentialCauses: { type: Type.STRING, description: 'Possible mechanical or process root causes' },
                occurrence: { type: Type.INTEGER, description: 'Occurrence rating 1 to 10 based on likelihood' },
                currentControls: { type: Type.STRING, description: 'Existing prevention or inspection protocols' },
                detection: { type: Type.INTEGER, description: 'Detection rating 1 to 10' },
                recommendedActions: { type: Type.STRING, description: 'Recommended corrective engineering action' }
              },
              required: [
                'potentialFailureMode',
                'potentialFailureEffects',
                'severity',
                'potentialCauses',
                'occurrence',
                'currentControls',
                'detection',
                'recommendedActions'
              ]
            }
          }
        }
      });

      const responseText = response.text || '[]';
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error('Gemini FMEA Copilot Error:', error);
      res.status(500).json({ error: error.message || 'Failed to call Gemini API' });
    }
  });

  // API: Gemini CAPA Assistant
  app.post('/api/gemini/capa-suggest', async (req: Request, res: Response) => {
    try {
      const { defectDescription, title } = req.body;
      if (!defectDescription) {
        return res.status(400).json({ error: 'Defect description is required for CAPA assist' });
      }

      const ai = getAIClient();
      const titleStr = title ? `for defect titled "${title}"` : '';

      const prompt = `You are an expert Six Sigma Master Black Belt and Quality Systems Director.
We have received the following quality defect ${titleStr}:
"${defectDescription}"

Provide an expert draft of the CAPA (Corrective and Preventive Action) report, specifying:
1. Recommended Immediate Containment Action (how to protect the customer right away).
2. A rigorous "5 Whys" Root Cause Analysis. Detail exactly 5 logical, sequential steps, tracing from the direct symptom back to the systemic process/policy gap. It must be an array of exactly 5 strings.
3. Permanent Corrective Action (how to fix the process to remove this root cause).
4. Preventive Action (how to update standards, design guides, or policies to prevent recurrence across other lines).

Respond ONLY with a JSON object that matches the requested schema. Do not write any conversational intro or markdown outside the JSON structure.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an AI assistant specialized in CAPA root cause analysis, 5 Whys, and quality systems. Return valid JSON only.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              containmentAction: { type: Type.STRING, description: 'Immediate lockdown steps' },
              whys: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of exactly 5 sequential "Why" steps tracing symptom to root cause'
              },
              correctiveAction: { type: Type.STRING, description: 'Permanent solution' },
              preventiveAction: { type: Type.STRING, description: 'Systemic preventive methods' }
            },
            required: ['containmentAction', 'whys', 'correctiveAction', 'preventiveAction']
          }
        }
      });

      const responseText = response.text || '{}';
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error('Gemini CAPA Assistant Error:', error);
      res.status(500).json({ error: error.message || 'Failed to call Gemini API' });
    }
  });

  // Mount Vite middleware in development, serve static bundle in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QLM Applet running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start full-stack server:', err);
});
