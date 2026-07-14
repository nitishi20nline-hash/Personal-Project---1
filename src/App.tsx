import React, { useState, useEffect } from 'react';
import { APQPProject, FMEAItem, PPAPElement, CAPALog } from './types';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import CAPALogger from './components/CAPALogger';
import { 
  BarChart3, Layers, ShieldAlert, Library, Loader2, AlertCircle, Info, Activity 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'capa'>('dashboard');
  const [projects, setProjects] = useState<APQPProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Quality workspace states for selected project
  const [fmeaItems, setFmeaItems] = useState<FMEAItem[]>([]);
  const [ppapElements, setPpapElements] = useState<PPAPElement[]>([]);

  // CAPA States
  const [capaList, setCapaList] = useState<CAPALog[]>([]);

  // Global loading & UI states
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initial Loading Fetch
  useEffect(() => {
    async function loadInitialData() {
      setIsGlobalLoading(true);
      setApiError(null);
      try {
        const [projRes, capaRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/capa')
        ]);

        if (!projRes.ok || !capaRes.ok) {
          throw new Error('Failed to synchronize quality data registries with full-stack server.');
        }

        const projData = await projRes.json();
        const capaData = await capaRes.json();

        setProjects(projData);
        setCapaList(capaData);
      } catch (err: any) {
        console.error('Initial load error:', err);
        setApiError(err.message || 'Connection lost. Unable to load QLM records.');
      } finally {
        setIsGlobalLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Fetch FMEA and PPAP details when selecting a project
  const handleSelectProject = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setApiError(null);
    setIsGlobalLoading(true);
    setActiveTab('projects');

    try {
      const [fmeaRes, ppapRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/fmea`),
        fetch(`/api/projects/${projectId}/ppap`)
      ]);

      if (!fmeaRes.ok || !ppapRes.ok) {
        throw new Error('Failed to retrieve program checklists.');
      }

      const fmeaData = await fmeaRes.json();
      const ppapData = await ppapRes.json();

      setFmeaItems(fmeaData);
      setPpapElements(ppapData);
    } catch (err: any) {
      console.error('Project details fetch error:', err);
      setApiError(err.message || 'Error loading quality program checklists.');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  // APQP Projects CRUD Methods
  const handleCreateProject = async (newProj: {
    name: string;
    partNumber: string;
    customer: string;
    status: APQPProject['status'];
    launchDate: string;
  }) => {
    setApiError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create APQP program.');
      }

      const created = await res.json();
      setProjects(prev => [...prev, created]);
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this quality program and all related FMEAs, PPAP checklists, and records? This action is irreversible.')) {
      return;
    }

    setApiError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete program.');
      }

      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
        setFmeaItems([]);
        setPpapElements([]);
      }
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleUpdateProjectStatus = async (status: APQPProject['status']) => {
    if (!selectedProjectId) return;
    setApiError(null);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        throw new Error('Failed to shift program stage.');
      }

      const updated = await res.json();
      
      // Update projects list
      setProjects(prev => prev.map(p => p.id === selectedProjectId ? updated : p));
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  // FMEA Worksheet CRUD Methods
  const handleAddFmeaItem = async (item: Omit<FMEAItem, 'id' | 'projectId' | 'rpn'> & { id?: string }) => {
    if (!selectedProjectId) return;
    setApiError(null);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/fmea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (!res.ok) {
        throw new Error('Failed to record risk analysis row.');
      }

      const recorded = await res.json();

      // If editing, replace. Otherwise append.
      if (item.id) {
        setFmeaItems(prev => prev.map(f => f.id === item.id ? recorded : f));
      } else {
        setFmeaItems(prev => [...prev, recorded]);
      }
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleDeleteFmeaItem = async (fmeaId: string) => {
    if (!selectedProjectId) return;
    setApiError(null);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/fmea/${fmeaId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to remove risk row.');
      }

      setFmeaItems(prev => prev.filter(f => f.id !== fmeaId));
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  // PPAP Document Checklist Updates
  const handleUpdatePpapElement = async (elementId: string, updates: Partial<PPAPElement>) => {
    if (!selectedProjectId) return;
    setApiError(null);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/ppap/${elementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        throw new Error('Failed to update PPAP status.');
      }

      const updated = await res.json();
      setPpapElements(prev => prev.map(el => el.id === elementId ? updated : el));

      // Re-fetch project list to synchronize progress percentage
      const projRes = await fetch('/api/projects');
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
      }
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  // CAPA Defects CRUD Methods
  const handleCreateCapa = async (newCapa: Omit<CAPALog, 'id' | 'status' | 'createdAt'>) => {
    setApiError(null);
    try {
      const res = await fetch('/api/capa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCapa)
      });

      if (!res.ok) {
        throw new Error('Failed to file corrective defect case.');
      }

      const created = await res.json();
      setCapaList(prev => [...prev, created]);
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleUpdateCapa = async (id: string, updates: Partial<CAPALog>) => {
    setApiError(null);
    try {
      const res = await fetch(`/api/capa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        throw new Error('Failed to commit corrective action changes.');
      }

      const updated = await res.json();
      setCapaList(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleDeleteCapa = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this CAPA log entry? This action is irreversible.')) {
      return;
    }

    setApiError(null);
    try {
      const res = await fetch(`/api/capa/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to remove CAPA record.');
      }

      setCapaList(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  // Gemini AI Proxies (Passed as triggers down to child components)
  const handleSuggestFMEA = async (processStep: string, productContext: string) => {
    const res = await fetch('/api/gemini/fmea-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processStep, productContext })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'AI Copilot unable to process risk parameters.');
    }

    return res.json();
  };

  const handleSuggestCapa = async (defectDescription: string, title: string) => {
    const res = await fetch('/api/gemini/capa-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defectDescription, title })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'AI Investigation Copilot was unable to analyze root causes.');
    }

    return res.json();
  };

  // Helper to trigger navigation back to projects list
  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setFmeaItems([]);
    setPpapElements([]);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-gray-900 flex flex-col justify-between">
      
      {/* Navigation Header bar */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo/Identity */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => { setActiveTab('dashboard'); setSelectedProjectId(null); }}
            >
              <div className="p-2 bg-slate-900 text-white rounded-xl">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-gray-900 font-display text-base tracking-tight leading-none block">Empower QLM</span>
                <span className="text-[10px] font-mono text-gray-400 font-semibold uppercase tracking-wider block mt-0.5">Quality Lifecycle</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex space-x-1">
              <button
                onClick={() => { setActiveTab('dashboard'); setSelectedProjectId(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dashboard' && !selectedProjectId 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Dashboard
              </button>
              
              <button
                onClick={() => { setActiveTab('projects'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'projects' 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Layers className="w-4 h-4" /> APQP programs
              </button>

              <button
                onClick={() => { setActiveTab('capa'); setSelectedProjectId(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'capa' 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4" /> CAPA actions
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* Main Body container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Warning Banner */}
        {apiError && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold font-display text-sm">System Conflict Occurred</p>
              <p className="text-xs text-rose-600 mt-0.5">{apiError}</p>
            </div>
            <button 
              onClick={() => setApiError(null)}
              className="text-xs font-semibold font-mono text-rose-400 hover:text-rose-700 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Spinner overlay block (non-obstructive) */}
        {isGlobalLoading && (
          <div className="flex items-center justify-center gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl mb-6 font-mono text-xs font-medium animate-fadeIn">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            Synchronizing Quality Databases... please wait
          </div>
        )}

        {/* Render appropriate screen */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            projects={projects}
            fmea={fmeaItems.length > 0 ? fmeaItems : []} // quick reference
            ppap={ppapElements}
            capa={capaList}
            onNavigate={setActiveTab}
            onSelectProject={handleSelectProject}
          />
        )}

        {activeTab === 'projects' && (
          selectedProjectId && projects.find(p => p.id === selectedProjectId) ? (
            <ProjectDetail 
              project={projects.find(p => p.id === selectedProjectId)!}
              onBack={handleBackToProjects}
              fmeaItems={fmeaItems}
              ppapElements={ppapElements}
              onAddFmeaItem={handleAddFmeaItem}
              onDeleteFmeaItem={handleDeleteFmeaItem}
              onUpdatePpapElement={handleUpdatePpapElement}
              onSuggestFMEA={handleSuggestFMEA}
              onUpdateProjectStatus={handleUpdateProjectStatus}
            />
          ) : (
            <ProjectList 
              projects={projects}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onSelectProject={handleSelectProject}
            />
          )
        )}

        {activeTab === 'capa' && (
          <CAPALogger 
            capaList={capaList}
            projects={projects}
            onCreateCapa={handleCreateCapa}
            onUpdateCapa={handleUpdateCapa}
            onDeleteCapa={handleDeleteCapa}
            onSuggestCapa={handleSuggestCapa}
          />
        )}

      </main>

      {/* Footer bar */}
      <footer className="bg-white border-t border-gray-150 py-5 text-center mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400">
            &copy; 2026 Empower Quality Lifecycle Management (QLM) Systems. Built in modern full-stack MERN with AI-assisted diagnostics.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
            <Activity className="w-3 h-3 text-emerald-500" /> Standards Compliance: AIAG-VDA FMEA & ISO 9001:2015
          </div>
        </div>
      </footer>

    </div>
  );
}
