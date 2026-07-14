import React, { useState, useEffect } from 'react';
import { APQPProject, FMEAItem, PPAPElement, CAPALog } from './types';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import CAPALogger from './components/CAPALogger';
import Sidebar from './components/Sidebar';
import PPAPDashboard from './components/PPAPDashboard';
import UserManagement from './components/UserManagement';
import { 
  PPAPReasonLibrary, PPAPRejectReasonLibrary, PPAPInterimStatus, 
  PPAPRoles, PPAPTemplates, PPAPRequests, PPAPUserAssignment, 
  PPAPMassDownload, PPAPReports 
} from './components/PPAPSubmenus';
import { 
  BarChart3, Layers, ShieldAlert, Library, Loader2, AlertCircle, Info, Activity,
  Package, Landmark, Settings, Users, Truck, ShieldCheck, HelpCircle, HardDrive, Cpu, Lock, ChevronRight, User,
  UserCheck, ClipboardCheck, Menu
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('product');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
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
    setApiError(null);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId || projects[0]?.id}/ppap/${elementId}`, {
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

  // Gemini AI Proxies
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

  // Handler for custom sidebar tab navigations
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== 'projects' && tabId !== 'dashboard') {
      setSelectedProjectId(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            projects={projects}
            fmea={fmeaItems.length > 0 ? fmeaItems : []} 
            ppap={ppapElements}
            capa={capaList}
            onNavigate={handleTabChange}
            onSelectProject={handleSelectProject}
          />
        );
      case 'projects':
        return selectedProjectId && projects.find(p => p.id === selectedProjectId) ? (
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
        );
      case 'apqp-new':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
              <h2 className="text-xl font-bold font-display text-gray-950 mb-2">Initialize New APQP Program</h2>
              <p className="text-xs text-gray-400 mb-6">Launch a new quality tracking workspace including FMEA worksheets and PPAP gates.</p>
              <ProjectList 
                projects={projects}
                onCreateProject={async (newP) => {
                  await handleCreateProject(newP);
                  setActiveTab('projects');
                }}
                onDeleteProject={handleDeleteProject}
                onSelectProject={handleSelectProject}
              />
            </div>
          </div>
        );
      case 'capa':
        return (
          <CAPALogger 
            capaList={capaList}
            projects={projects}
            onCreateCapa={handleCreateCapa}
            onUpdateCapa={handleUpdateCapa}
            onDeleteCapa={handleDeleteCapa}
            onSuggestCapa={handleSuggestCapa}
          />
        );
      case 'ppap':
      case 'ppap-new':
      case 'ppap-dashboard':
        return (
          <PPAPDashboard 
            projects={projects}
            ppapElements={ppapElements}
            onUpdatePpapElement={handleUpdatePpapElement}
            onSelectProject={handleSelectProject}
          />
        );
      case 'ppap-library-reason':
        return <PPAPReasonLibrary />;
      case 'ppap-library-reject-reason':
        return <PPAPRejectReasonLibrary />;
      case 'ppap-library-interim-status':
        return <PPAPInterimStatus />;
      case 'ppap-library-roles':
        return <PPAPRoles />;
      case 'ppap-templates':
        return <PPAPTemplates />;
      case 'ppap-requests':
        return <PPAPRequests />;
      case 'ppap-user-assignment':
        return <PPAPUserAssignment />;
      case 'ppap-mass-download':
        return <PPAPMassDownload />;
      case 'ppap-reports':
        return <PPAPReports />;
      case 'user-management-users':
        return <UserManagement subTab="users" />;
      case 'user-management-roles':
        return <UserManagement subTab="roles" />;
      case 'user-management-menus':
        return <UserManagement subTab="menus" />;
      case 'product':
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-gray-950">Product Specifications Vault</h2>
                <p className="text-xs text-gray-400">Precision manufacturing mechanical drawings, CAD models, and inspection frequencies.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-150 p-5 rounded-2xl space-y-3.5 hover:shadow-md transition-all bg-slate-50/20">
                <span className="font-mono text-[10px] font-bold text-gray-400 block tracking-wider uppercase">PART # MS-SB-8009</span>
                <h4 className="font-bold text-gray-900 text-sm">Model Y Steering Bracket Assembly</h4>
                <p className="text-xs text-gray-500 leading-relaxed">AlSi10Mg Cast Aluminum alloy. Weight: 1.42kg. CAD Revision: C. Complete automated optical inspection gating required.</p>
                <div className="flex justify-between items-center pt-2 text-[10px] font-mono">
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">LEVEL 3 PPAP APPROVED</span>
                  <span className="text-gray-400">REV-C</span>
                </div>
              </div>
              <div className="border border-gray-150 p-5 rounded-2xl space-y-3.5 hover:shadow-md transition-all bg-slate-50/20">
                <span className="font-mono text-[10px] font-bold text-gray-400 block tracking-wider uppercase">PART # MS-BC-4412</span>
                <h4 className="font-bold text-gray-900 text-sm">EV Battery Chassis Crossmember</h4>
                <p className="text-xs text-gray-500 leading-relaxed">6061-T6 Extruded Aluminum. Weight: 8.90kg. CAD Revision: A. Welding safety compliance gates active.</p>
                <div className="flex justify-between items-center pt-2 text-[10px] font-mono">
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">LEVEL 3 PPAP APPROVED</span>
                  <span className="text-gray-400">REV-A</span>
                </div>
              </div>
              <div className="border border-gray-150 p-5 rounded-2xl space-y-3.5 hover:shadow-md transition-all bg-slate-50/20">
                <span className="font-mono text-[10px] font-bold text-gray-400 block tracking-wider uppercase">PART # MS-RN-9921</span>
                <h4 className="font-bold text-gray-900 text-sm">E-Axle Rotor Shaft Assembly</h4>
                <p className="text-xs text-gray-500 leading-relaxed">SCM440 High-Tensile Forged Steel. Weight: 4.15kg. CAD Revision: D. Critical Class-A Safety component.</p>
                <div className="flex justify-between items-center pt-2 text-[10px] font-mono">
                  <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-bold uppercase">GATE 4 VALIDATION</span>
                  <span className="text-gray-400">REV-D</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'customer':
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-gray-950">Customer Quality Scorecards</h2>
                <p className="text-xs text-gray-400">Live Tier-1 satisfaction registries, active APQP programs, and parts-per-million (PPM) scores.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl space-y-3 hover:shadow-sm transition-all">
                <h4 className="font-bold text-indigo-950 text-base">Tesla Motors</h4>
                <p className="text-xs text-gray-500">Active APQP Programs: <strong>1 Active</strong></p>
                <p className="text-xs text-gray-500">Defect PPM Rate: <strong className="text-indigo-600">2.1 PPM</strong></p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '98.5%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono font-bold text-indigo-600 pt-1">
                  <span>AAG RATED: A+</span>
                  <span>98.5% SCORE</span>
                </div>
              </div>
              <div className="border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl space-y-3 hover:shadow-sm transition-all">
                <h4 className="font-bold text-indigo-950 text-base">Ford Motor Co.</h4>
                <p className="text-xs text-gray-500">Active APQP Programs: <strong>1 Active</strong></p>
                <p className="text-xs text-gray-500">Defect PPM Rate: <strong className="text-indigo-600">4.5 PPM</strong></p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '96.2%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono font-bold text-indigo-600 pt-1">
                  <span>Q1 PREFERRED</span>
                  <span>96.2% SCORE</span>
                </div>
              </div>
              <div className="border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl space-y-3 hover:shadow-sm transition-all">
                <h4 className="font-bold text-indigo-950 text-base">General Motors</h4>
                <p className="text-xs text-gray-500">Active APQP Programs: <strong>0 Active</strong></p>
                <p className="text-xs text-gray-500">Defect PPM Rate: <strong className="text-indigo-600">5.0 PPM</strong></p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '95.0%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono font-bold text-indigo-600 pt-1">
                  <span>BIQS LEVEL 5</span>
                  <span>95.0% SCORE</span>
                </div>
              </div>
              <div className="border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl space-y-3 hover:shadow-sm transition-all">
                <h4 className="font-bold text-indigo-950 text-base">SpaceX Aerospace</h4>
                <p className="text-xs text-gray-500">Active APQP Programs: <strong>1 Active</strong></p>
                <p className="text-xs text-gray-500">Defect PPM Rate: <strong className="text-indigo-600">0.4 PPM</strong></p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '99.5%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono font-bold text-indigo-600 pt-1">
                  <span>AS9100 APPROVED</span>
                  <span>99.5% SCORE</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'dealer':
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-lime-100 text-lime-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-gray-950">Dealer Network & Warranty Portal</h2>
                  <p className="text-xs text-gray-400">Dealership warranty claims registry, field failure tracking, and rapid response dispatches.</p>
                </div>
              </div>
              <span className="text-xs bg-lime-50 text-lime-800 border border-lime-200 px-3 py-1.5 rounded-full font-mono font-bold animate-pulse">
                • CLAIMS PIPELINE: AUDIT READY
              </span>
            </div>

            {/* Claims Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-extrabold tracking-wider">Total Dealer Claims</span>
                <p className="text-2xl font-bold font-display text-zinc-900">14 Active Cases</p>
                <p className="text-[10px] text-zinc-500">Across 320 authorized service networks</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-extrabold tracking-wider">Average Close Time</span>
                <p className="text-2xl font-bold font-display text-blue-600">4.2 Days</p>
                <p className="text-[10px] text-emerald-600 font-semibold font-mono">✓ Exceeds 7-Day SLA limits</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl space-y-1 shadow-xs">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-extrabold tracking-wider">Warranty Cost Mitigation</span>
                <p className="text-2xl font-bold font-display text-rose-600">$4,120 / Mo</p>
                <p className="text-[10px] text-rose-500 font-semibold">9% decrease since Q1 audit</p>
              </div>
            </div>

            {/* Active Claims Table */}
            <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-gray-50/80 text-xs font-bold text-gray-800 border-b border-gray-150 flex justify-between">
                <span>Recent Dealership Incident Registry Logs</span>
                <span className="text-[10px] font-mono text-gray-400">Secure Live Connection</span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 font-mono">CLAIM-7721</span>
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 font-mono px-1.5 py-0.2 rounded font-bold uppercase">CRITICAL</span>
                    </div>
                    <p className="text-gray-700">Thread stripping detected on Model Y steering bracket mounting points during initial dealer torque assembly.</p>
                    <p className="text-[10px] text-gray-400 font-mono">Reporting Dealer: <strong>Austin Tesla Service Hub</strong> | Part No: MS-SB-8009</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                      Linked to CAPA #12
                    </span>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Reported: 2 days ago</p>
                  </div>
                </div>

                <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 font-mono">CLAIM-7694</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-mono px-1.5 py-0.2 rounded font-bold uppercase">HIGH</span>
                    </div>
                    <p className="text-gray-700">Excessive aluminum micro-cavities detected in EV Battery crossmember upon unpackaging assembly inspections.</p>
                    <p className="text-[10px] text-gray-400 font-mono">Reporting Dealer: <strong>Detroit Ford Parts & Service</strong> | Part No: MS-BC-4412</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded">
                      Closed Resolved
                    </span>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Reported: 1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'suppliers':
      case 'suppliers-new':
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-gray-950">Tier-1 Supplier Quality Management</h2>
                <p className="text-xs text-gray-400">Automotive supplier performance tracking, audits checklists, and SCAR corrective orders.</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-150">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-mono uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <th className="p-4">Supplier Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-center">Quality score</th>
                    <th className="p-4">Certifications</th>
                    <th className="p-4 text-center">SCARs Pending</th>
                    <th className="p-4 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-gray-950">Apex Forging Co.</td>
                    <td className="p-4 text-gray-600">Metal Casting & Forging</td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-600 text-sm">98.2%</td>
                    <td className="p-4 font-mono text-gray-500">IATF 16949, ISO 9001</td>
                    <td className="p-4 text-center font-semibold text-gray-400">0 SCARs</td>
                    <td className="p-4 text-center"><span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">PASSED</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-gray-950">Precision Fasteners Ltd.</td>
                    <td className="p-4 text-gray-600">Threaded Screws & Studs</td>
                    <td className="p-4 text-center font-mono font-bold text-amber-600 text-sm">92.5%</td>
                    <td className="p-4 font-mono text-gray-500">ISO 9001:2015</td>
                    <td className="p-4 text-center text-amber-600 font-bold">1 Active SCAR</td>
                    <td className="p-4 text-center"><span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold">WATCHLIST</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-gray-950">Centra Electronics</td>
                    <td className="p-4 text-gray-600">PCBA & Sensor Controllers</td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-600 text-sm">99.4%</td>
                    <td className="p-4 font-mono text-gray-500">IATF 16949, ISO 14001</td>
                    <td className="p-4 text-center font-semibold text-gray-400">0 SCARs</td>
                    <td className="p-4 text-center"><span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">PASSED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'assessment':
      case 'survey':
      case 'program-assessment':
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-gray-950">Audits & Assessments Hub</h2>
                <p className="text-xs text-gray-400">Layered Process Audits (LPA), IATF Readiness checksheets, and Customer quality surveys.</p>
              </div>
            </div>
            <div className="p-8 text-center border-2 border-dashed border-gray-150 rounded-2xl space-y-3 bg-slate-50/50">
              <Activity className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
              <h4 className="font-bold text-gray-950 text-sm">System Auditor Ready</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                No active assessments pending. ISO 9001:2015 surveillance audit is fully synchronized with no outstanding non-conformances.
              </p>
            </div>
          </div>
        );
      case 'compliance':
      case 'cyber-security':
      case 'crs-management':
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-gray-955">Regulatory Security & CRS Gate</h2>
                <p className="text-xs text-gray-400">Customer Specific Requirements (CRS) logs and digital cybersecurity compliance frameworks.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-150 p-5 rounded-2xl space-y-3 bg-slate-50/10">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-gray-900 text-sm">Cybersecurity Shield (AES-256)</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">All quality logs, FMEA risk tables, and CAD blueprint hashes are digitally sealed to prevent third-party manipulation or leaks.</p>
              </div>
              <div className="border border-gray-150 p-5 rounded-2xl space-y-3 bg-slate-50/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-gray-900 text-sm">CRS Compliant - Tesla V4</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">Automated integration and synchronization with OEM databases ensures part submission warrants (PSW) align with Tesla Quality Spec V4.2.</p>
              </div>
            </div>
          </div>
        );
      case 'change-management':
      case 'change-management-new':
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-gray-950">Engineering Change Management (ECR/ECO)</h2>
                <p className="text-xs text-gray-400">Track and approve manufacturing specification adjustments through standard Engineering Change Orders.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
              <div className="bg-amber-50/20 border border-amber-150 p-5 rounded-2xl space-y-2.5">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">ECR-1029</span>
                <h4 className="font-bold text-gray-900 text-sm font-sans">Steering Bracket casting revision</h4>
                <p className="text-[11px] text-gray-500 font-sans leading-relaxed">Modify thickness tolerances by +0.5mm to eliminate minor stress fractures found on high stress vibration cycles.</p>
                <div className="text-[10px] text-emerald-700 font-bold uppercase mt-3 pt-2 border-t border-amber-100">✓ APPROVED FOR TOOLING</div>
              </div>
              <div className="bg-slate-50/50 border border-gray-150 p-5 rounded-2xl space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">ECO-8842</span>
                <h4 className="font-bold text-gray-900 text-sm font-sans">EV Battery Crossmember welding step</h4>
                <p className="text-[11px] text-gray-500 font-sans leading-relaxed">Transition welding operations from manual gas-tungsten Arc to automated robotic laser welding cells.</p>
                <div className="text-[10px] text-blue-600 font-bold uppercase mt-3 pt-2 border-t border-gray-200">UNDER EVALUATION</div>
              </div>
              <div className="bg-slate-50/50 border border-gray-150 p-5 rounded-2xl space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">ECO-9011</span>
                <h4 className="font-bold text-gray-900 text-sm font-sans">Rotor Shaft forging cooling rate</h4>
                <p className="text-[11px] text-gray-500 font-sans leading-relaxed">Extend induction cooling cycle by 12 seconds to boost core tensile resilience.</p>
                <div className="text-[10px] text-gray-400 font-bold uppercase mt-3 pt-2 border-t border-gray-200">DRAFT STATUS</div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl animate-fadeIn">
            <Info className="w-12 h-12 text-zinc-300 mx-auto mb-2 animate-bounce" />
            <h3 className="font-bold font-display text-gray-800">Module Initialized</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
              This standard quality workspace has been provisioned and is waiting for live ERP integration.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-zinc-900 flex relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Layout from uploaded image */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Right Side Work area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Navigation Header bar */}
        <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-600 transition-colors cursor-pointer mr-1 flex items-center justify-center"
              title={isSidebarOpen ? "Collapse Sidebar" : "Open Sidebar"}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <span className="font-bold font-display text-base text-gray-900 tracking-tight capitalize">
              {(() => {
                if (activeTab === 'dashboard') return 'Overview Dashboard';
                if (activeTab === 'apqp-new') return 'Initialize APQP';
                if (activeTab === 'ppap' || activeTab === 'ppap-dashboard') return 'PPAP Dashboard';
                if (activeTab === 'ppap-library-reason') return 'PPAP Submission Reasons';
                if (activeTab === 'ppap-library-reject-reason') return 'PPAP Rejection Reasons';
                if (activeTab === 'ppap-library-interim-status') return 'PPAP Interim Approvals';
                if (activeTab === 'ppap-library-roles') return 'PPAP Sign-off Roles';
                if (activeTab === 'ppap-templates') return 'PSW & PPAP Templates';
                if (activeTab === 'ppap-requests') return 'OEM Submission Demands';
                if (activeTab === 'ppap-user-assignment') return 'Quality Engineer Assignments';
                if (activeTab === 'ppap-mass-download') return 'PPAP Bulk Document Compiler';
                if (activeTab === 'ppap-reports') return 'PPAP Performance Metrics';
                if (activeTab === 'user-management-users') return 'User Registry Database';
                if (activeTab === 'user-management-roles') return 'System Role Authorities';
                if (activeTab === 'user-management-menus') return 'Menu Access Authorization';
                return activeTab.replace('-', ' ');
              })()}
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-400 font-mono">
              {selectedProjectId && activeTab === 'projects' 
                ? projects.find(p => p.id === selectedProjectId)?.name 
                : 'Corporate Workspace'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              SECURE SESSION
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center font-mono">
              QE
            </div>
          </div>
        </header>

        {/* Main Body container */}
        <main className="flex-1 px-6 py-8">
          
          {/* Error Warning Banner */}
          {apiError && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 animate-fadeIn">
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
            <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl mb-6 font-mono text-xs font-medium animate-fadeIn">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              Synchronizing Quality Databases... please wait
            </div>
          )}

          {/* Render appropriate screen */}
          {renderTabContent()}

        </main>

        {/* Footer bar */}
        <footer className="bg-white border-t border-gray-150 py-5 text-center shrink-0 px-6 mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-400">
              &copy; 2026 Empower Quality Lifecycle Management (QLM) Systems. Built in modern full-stack MERN with AI-assisted diagnostics.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
              <Activity className="w-3 h-3 text-emerald-500" /> Standards Compliance: AIAG-VDA FMEA & ISO 9001:2015
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
