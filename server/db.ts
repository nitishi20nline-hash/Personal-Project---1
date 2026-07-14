import fs from 'fs';
import path from 'path';
import { APQPProject, FMEAItem, PPAPElement, CAPALog } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'qlm-db.json');

interface QLMDatabase {
  projects: APQPProject[];
  fmea: FMEAItem[];
  ppap: PPAPElement[];
  capa: CAPALog[];
}

const DEFAULT_PPAP_ELEMENTS = [
  { code: 'DRE', name: 'Design Records & Specifications' },
  { code: 'DFMEA', name: 'Design Failure Mode & Effects Analysis (DFMEA)' },
  { code: 'PFMEA', name: 'Process Failure Mode & Effects Analysis (PFMEA)' },
  { code: 'DIM', name: 'Dimensional Measurement Results' },
  { code: 'MAT', name: 'Material & Performance Test Results' },
  { code: 'MSA', name: 'Measurement System Analysis (MSA) Studies' },
  { code: 'SPC', name: 'Initial Process Capability Studies (Cpk)' },
  { code: 'PSW', name: 'Part Submission Warrant (PSW)' }
];

const INITIAL_DB: QLMDatabase = {
  projects: [
    {
      id: 'proj-1',
      name: 'Model 3 Battery Pack Module V4',
      partNumber: 'BP-4680-V4',
      customer: 'Apex Motors Ltd.',
      status: 'Validation',
      progress: 75,
      launchDate: '2026-12-15',
      createdAt: '2026-01-10'
    },
    {
      id: 'proj-2',
      name: 'NextGen ECU Control PCB',
      partNumber: 'ECU-PCB-990',
      customer: 'Boschmann Electronics',
      status: 'ProcessDev',
      progress: 55,
      launchDate: '2027-03-01',
      createdAt: '2026-03-15'
    },
    {
      id: 'proj-3',
      name: 'Titanium Turbine Housing',
      partNumber: 'TTH-88-A',
      customer: 'AeroSpace Global Corp',
      status: 'Planning',
      progress: 20,
      launchDate: '2027-08-30',
      createdAt: '2026-06-20'
    }
  ],
  fmea: [
    {
      id: 'fmea-1',
      projectId: 'proj-1',
      processStep: 'Cell Tab Laser Welding',
      potentialFailureMode: 'Laser power fluctuations causing weak weld joints',
      potentialFailureEffects: 'High internal resistance, thermal hot-spots, module failure or cell combustion',
      severity: 9,
      potentialCauses: 'Laser lens contamination, unstable power supply calibration',
      occurrence: 4,
      currentControls: 'Post-weld visual camera, periodic pull-testing',
      detection: 6,
      rpn: 216,
      recommendedActions: 'Install real-time laser energy calorimeter tracking and auto-shutoff',
      actionResponsibility: 'Dr. Sarah Connor (Mfg Engineering)',
      actionStatus: 'In Progress'
    },
    {
      id: 'fmea-2',
      projectId: 'proj-1',
      processStep: 'Module Encapsulation (Potting)',
      potentialFailureMode: 'Incomplete polyurethane distribution / voids',
      potentialFailureEffects: 'Moisture ingress, short circuits, degraded vibration damping',
      severity: 8,
      potentialCauses: 'Nozzle clog, resin viscosity too high (low temperature)',
      occurrence: 3,
      currentControls: 'X-ray inspection sample (1 in 50), potting mass balance check',
      detection: 5,
      rpn: 120,
      recommendedActions: 'Integrate dynamic inline heating of resin and automatic flow meter alarms',
      actionResponsibility: 'Marcus Wright (Quality Supervisor)',
      actionStatus: 'Completed'
    },
    {
      id: 'fmea-3',
      projectId: 'proj-2',
      processStep: 'SMT Solder Paste Printing',
      potentialFailureMode: 'Insufficient solder paste volume on ECU micro-pads',
      potentialFailureEffects: 'Intermittent electrical contact during high-vibration automotive operations',
      severity: 8,
      potentialCauses: 'Aperture clog in PCB stencil, scraping blade pressure misaligned',
      occurrence: 5,
      currentControls: 'SPI (Solder Paste Inspection) 3D camera mapping 100% boards',
      detection: 2,
      rpn: 80,
      recommendedActions: 'Implement auto stencil under-wipe cleaner cycle every 5 boards instead of 10',
      actionResponsibility: 'Hiroshi Tanaka (SMT Lead)',
      actionStatus: 'Completed'
    }
  ],
  ppap: [
    {
      id: 'ppap-1-1',
      projectId: 'proj-1',
      elementCode: 'DRE',
      elementName: 'Design Records & Specifications',
      status: 'Approved',
      submittedBy: 'Dr. Sarah Connor',
      submittedAt: '2026-02-15',
      comments: 'All 3D CAD files and fabrication specs released under Rev E.'
    },
    {
      id: 'ppap-1-2',
      projectId: 'proj-1',
      elementCode: 'DFMEA',
      elementName: 'Design Failure Mode & Effects Analysis (DFMEA)',
      status: 'Approved',
      submittedBy: 'Dr. Sarah Connor',
      submittedAt: '2026-03-01',
      comments: 'Full design review completed. System level hazards minimized.'
    },
    {
      id: 'ppap-1-3',
      projectId: 'proj-1',
      elementCode: 'PFMEA',
      elementName: 'Process Failure Mode & Effects Analysis (PFMEA)',
      status: 'Under Review',
      submittedBy: 'Marcus Wright',
      submittedAt: '2026-06-11',
      comments: 'PFMEA uploaded. Awaiting signatures on welding and potting steps.'
    },
    {
      id: 'ppap-1-4',
      projectId: 'proj-1',
      elementCode: 'DIM',
      elementName: 'Dimensional Measurement Results',
      status: 'In Progress',
      submittedBy: 'Marcus Wright',
      submittedAt: '',
      comments: 'First article CMM inspection underway for 30 sample packs.'
    },
    {
      id: 'ppap-1-5',
      projectId: 'proj-1',
      elementCode: 'MAT',
      elementName: 'Material & Performance Test Results',
      status: 'Not Started',
      submittedBy: '',
      submittedAt: '',
      comments: ''
    },
    {
      id: 'ppap-1-6',
      projectId: 'proj-1',
      elementCode: 'MSA',
      elementName: 'Measurement System Analysis (MSA) Studies',
      status: 'Not Started',
      submittedBy: '',
      submittedAt: '',
      comments: ''
    },
    {
      id: 'ppap-1-7',
      projectId: 'proj-1',
      elementCode: 'SPC',
      elementName: 'Initial Process Capability Studies (Cpk)',
      status: 'Not Started',
      submittedBy: '',
      submittedAt: '',
      comments: ''
    },
    {
      id: 'ppap-1-8',
      projectId: 'proj-1',
      elementCode: 'PSW',
      elementName: 'Part Submission Warrant (PSW)',
      status: 'Not Started',
      submittedBy: '',
      submittedAt: '',
      comments: 'Final sign-off document.'
    },
    // Project 2 PPAP Items
    {
      id: 'ppap-2-1',
      projectId: 'proj-2',
      elementCode: 'DRE',
      elementName: 'Design Records & Specifications',
      status: 'Approved',
      submittedBy: 'Hiroshi Tanaka',
      submittedAt: '2026-04-01',
      comments: 'Gerber layers and schematics reviewed and locked.'
    },
    {
      id: 'ppap-2-2',
      projectId: 'proj-2',
      elementCode: 'DFMEA',
      elementName: 'Design Failure Mode & Effects Analysis (DFMEA)',
      status: 'Approved',
      submittedBy: 'Hiroshi Tanaka',
      submittedAt: '2026-04-18',
      comments: 'DFMEA complete. Focus on heat dissipation and thermal cycle limits.'
    },
    {
      id: 'ppap-2-3',
      projectId: 'proj-2',
      elementCode: 'PFMEA',
      elementName: 'Process Failure Mode & Effects Analysis (PFMEA)',
      status: 'Approved',
      submittedBy: 'Hiroshi Tanaka',
      submittedAt: '2026-05-10',
      comments: 'Process risk matrix signed off. Highlighted SMT paste risk.'
    },
    {
      id: 'ppap-2-4',
      projectId: 'proj-2',
      elementCode: 'DIM',
      elementName: 'Dimensional Measurement Results',
      status: 'In Progress',
      submittedBy: 'Hiroshi Tanaka',
      submittedAt: '',
      comments: 'Caliper and X-ray dimensional tests for board layer thickness in progress.'
    },
    {
      id: 'ppap-2-5',
      projectId: 'proj-2',
      elementCode: 'MAT',
      elementName: 'Material & Performance Test Results',
      status: 'Not Started',
      submittedBy: '',
      submittedAt: '',
      comments: ''
    },
    {
      id: 'ppap-2-6',
      projectId: 'proj-2',
      elementCode: 'MSA',
      elementName: 'Measurement System Analysis (MSA) Studies',
      status: 'Not Started',
      submittedBy: '',
      submittedAt: '',
      comments: ''
    },
    {
      id: 'ppap-2-7',
      projectId: 'proj-2',
      elementCode: 'SPC',
      elementName: 'Initial Process Capability Studies (Cpk)',
      status: 'Not Started',
      submittedBy: '',
      submittedAt: '',
      comments: ''
    },
    {
      id: 'ppap-2-8',
      projectId: 'proj-2',
      elementCode: 'PSW',
      elementName: 'Part Submission Warrant (PSW)',
      status: 'Not Started',
      submittedBy: '',
      submittedAt: '',
      comments: ''
    }
  ],
  capa: [
    {
      id: 'capa-1',
      title: 'ECU Reflow Voiding Issue',
      projectId: 'proj-2',
      defectDescription: 'X-ray inspection discovered voiding levels of 32% (limit is 15%) on the main power regulator chip, risking overheating under high current.',
      source: 'Production Inspection',
      status: 'ActionPlan',
      severity: 'High',
      containmentAction: 'Quarantined all ECU lots ECU-2607-01 through ECU-2607-05. Standard 100% X-ray audit on all existing warehouse stock.',
      rootCauseAnalysis: {
        method: '5Whys',
        whys: [
          'High void percentage occurred inside the solder joints of the QFN-24 power package.',
          'The solder paste did not outgas fully during the liquidus state of the reflow cycle.',
          'The temperature ramp-up slope was too steep, trapping solvent bubbles under the component body.',
          'The reflow profile on Oven Line B was loaded from an unverified standard recipe instead of the specific component profile.',
          'An operator selected the incorrect reflow recipe due to missing visual QR scanners on the control panel.'
        ]
      },
      correctiveAction: 'Program Oven Line B controller with dedicated Profile #ECU-QFN-9 and lock recipe access with supervisor credentials. Implement barcode matching.',
      preventiveAction: 'Update operator training standard operating procedures (SOP-SMT-098) to require dual signature verification on reflow ovens before starting production runs.',
      owner: 'Hiroshi Tanaka',
      createdAt: '2026-07-02'
    },
    {
      id: 'capa-2',
      title: 'Laser Weld Delamination',
      projectId: 'proj-1',
      defectDescription: 'Customer Apex Motors reported 2 instances of high electrical resistance and structural weld tab separation on modules after 500 thermal cycles.',
      source: 'Customer Complaint',
      status: 'Investigation',
      severity: 'Critical',
      containmentAction: 'Halted module shipment. Suspended laser welding line #3. Initiated urgent mechanical shear-testing of current production buffer.',
      rootCauseAnalysis: {
        method: '5Whys',
        whys: [
          'Laser welds separated during customer thermal cycling.',
          'Weld penetration depth was insufficient (only 0.2mm instead of 0.5mm standard).',
          'Laser heat output dropped during welding pulse.',
          'Laser protective glass lens was coated with dynamic copper splatter residue, absorbing 40% of the beam power.',
          'The argon gas nozzle angle was slightly out of specification, allowing excessive splatter toward the lens instead of blowing it away.'
        ]
      },
      correctiveAction: 'Redesign the shielding gas nozzle to optimize cross-flow and blow weld fumes away from the laser focus optics. Install auto-clearing clean nozzle cycle.',
      preventiveAction: 'Integrate real-time optic power sensors that measure beam power directly in the nozzle. Trigger auto-fault if power degrades below 95% threshold.',
      owner: 'Dr. Sarah Connor',
      createdAt: '2026-07-10'
    }
  ]
};

// Initialize DB File if not exists
export function initDB(): QLMDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    return INITIAL_DB;
  }

  try {
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading QLM DB file, resetting to default:', error);
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    return INITIAL_DB;
  }
}

export function readDB(): QLMDatabase {
  return initDB();
}

export function writeDB(db: QLMDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Ensure database is initialized on load
initDB();
