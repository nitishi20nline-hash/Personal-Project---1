import React, { useState, useEffect } from 'react';
import { APQPProject, FMEAItem, PPAPElement } from '../types';
import { 
  ArrowLeft, Brain, ChevronDown, CheckCircle2, AlertTriangle, HelpCircle, 
  Trash2, Plus, RefreshCw, Layers, Edit, Check, ShieldCheck, XCircle, Send, Sparkles 
} from 'lucide-react';

interface ProjectDetailProps {
  project: APQPProject;
  onBack: () => void;
  fmeaItems: FMEAItem[];
  ppapElements: PPAPElement[];
  onAddFmeaItem: (item: Omit<FMEAItem, 'id' | 'projectId' | 'rpn'> & { id?: string }) => Promise<void>;
  onDeleteFmeaItem: (fmeaId: string) => void;
  onUpdatePpapElement: (elementId: string, updates: Partial<PPAPElement>) => Promise<void>;
  onSuggestFMEA: (processStep: string, productContext: string) => Promise<any[]>;
  onUpdateProjectStatus: (status: APQPProject['status']) => void;
}

export default function ProjectDetail({
  project,
  onBack,
  fmeaItems,
  ppapElements,
  onAddFmeaItem,
  onDeleteFmeaItem,
  onUpdatePpapElement,
  onSuggestFMEA,
  onUpdateProjectStatus
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'fmea' | 'ppap'>('fmea');
  
  // FMEA Form State
  const [fmeaStep, setFmeaStep] = useState('');
  const [fmeaMode, setFmeaMode] = useState('');
  const [fmeaEffects, setFmeaEffects] = useState('');
  const [fmeaSev, setFmeaSev] = useState(5);
  const [fmeaCauses, setFmeaCauses] = useState('');
  const [fmeaOcc, setFmeaOcc] = useState(3);
  const [fmeaControls, setFmeaControls] = useState('');
  const [fmeaDet, setFmeaDet] = useState(3);
  const [fmeaRecAction, setFmeaRecAction] = useState('');
  const [fmeaResp, setFmeaResp] = useState('');
  const [fmeaStatus, setFmeaStatus] = useState<FMEAItem['actionStatus']>('Open');
  const [editingFmeaId, setEditingFmeaId] = useState<string | null>(null);

  // AI Suggestion State
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiInputStep, setAiInputStep] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  // PPAP Edit State
  const [editingPpapId, setEditingPpapId] = useState<string | null>(null);
  const [ppapStatus, setPpapStatus] = useState<PPAPElement['status']>('Not Started');
  const [ppapSubmittedBy, setPpapSubmittedBy] = useState('');
  const [ppapComments, setPpapComments] = useState('');

  // Handle Project Stage Shift
  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateProjectStatus(e.target.value as APQPProject['status']);
  };

  // FMEA CRUD
  const handleFmeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fmeaStep || !fmeaMode || !fmeaEffects) return;

    await onAddFmeaItem({
      id: editingFmeaId || undefined,
      processStep: fmeaStep,
      potentialFailureMode: fmeaMode,
      potentialFailureEffects: fmeaEffects,
      severity: Number(fmeaSev),
      potentialCauses: fmeaCauses,
      occurrence: Number(fmeaOcc),
      currentControls: fmeaControls,
      detection: Number(fmeaDet),
      recommendedActions: fmeaRecAction,
      actionResponsibility: fmeaResp,
      actionStatus: fmeaStatus
    });

    // Reset Form
    setFmeaStep('');
    setFmeaMode('');
    setFmeaEffects('');
    setFmeaSev(5);
    setFmeaCauses('');
    setFmeaOcc(3);
    setFmeaControls('');
    setFmeaDet(3);
    setFmeaRecAction('');
    setFmeaResp('');
    setFmeaStatus('Open');
    setEditingFmeaId(null);
  };

  const handleEditFmea = (item: FMEAItem) => {
    setEditingFmeaId(item.id);
    setFmeaStep(item.processStep);
    setFmeaMode(item.potentialFailureMode);
    setFmeaEffects(item.potentialFailureEffects);
    setFmeaSev(item.severity);
    setFmeaCauses(item.potentialCauses);
    setFmeaOcc(item.occurrence);
    setFmeaControls(item.currentControls);
    setFmeaDet(item.detection);
    setFmeaRecAction(item.recommendedActions);
    setFmeaResp(item.actionResponsibility);
    setFmeaStatus(item.actionStatus);
    // Scroll to form or focus
    document.getElementById('fmea-editor-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelFmeaEdit = () => {
    setEditingFmeaId(null);
    setFmeaStep('');
    setFmeaMode('');
    setFmeaEffects('');
    setFmeaSev(5);
    setFmeaCauses('');
    setFmeaOcc(3);
    setFmeaControls('');
    setFmeaDet(3);
    setFmeaRecAction('');
    setFmeaResp('');
    setFmeaStatus('Open');
  };

  // Call Gemini AI for FMEA Failure modes
  const handleAiBrainstorm = async () => {
    if (!aiInputStep) return;
    setIsAiSuggesting(true);
    setAiError(null);
    setAiSuggestions([]);

    try {
      const suggestions = await onSuggestFMEA(aiInputStep, project.name);
      setAiSuggestions(suggestions);
    } catch (err: any) {
      setAiError(err.message || 'Failed to brainstorm FMEA with AI');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleImportAiSuggestion = async (sugg: any) => {
    await onAddFmeaItem({
      processStep: aiInputStep,
      potentialFailureMode: sugg.potentialFailureMode,
      potentialFailureEffects: sugg.potentialFailureEffects,
      severity: sugg.severity,
      potentialCauses: sugg.potentialCauses,
      occurrence: sugg.occurrence,
      currentControls: sugg.currentControls,
      detection: sugg.detection,
      recommendedActions: sugg.recommendedActions,
      actionResponsibility: 'Assigned to Quality Engineering Team',
      actionStatus: 'Open'
    });

    // Remove imported suggestion from suggestions preview
    setAiSuggestions(prev => prev.filter(item => item.potentialFailureMode !== sugg.potentialFailureMode));
  };

  // PPAP CRUD
  const handleEditPpap = (element: PPAPElement) => {
    setEditingPpapId(element.id);
    setPpapStatus(element.status);
    setPpapSubmittedBy(element.submittedBy || '');
    setPpapComments(element.comments || '');
  };

  const handlePpapSave = async (elementId: string) => {
    await onUpdatePpapElement(elementId, {
      status: ppapStatus,
      submittedBy: ppapSubmittedBy,
      submittedAt: ppapStatus !== 'Not Started' ? new Date().toISOString().split('T')[0] : '',
      comments: ppapComments
    });
    setEditingPpapId(null);
  };

  // Severity explanation guides
  const getSevColor = (score: number) => {
    if (score >= 8) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (score >= 5) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const sortedFmea = [...fmeaItems].sort((a, b) => b.rpn - a.rpn);

  return (
    <div className="space-y-6" id="project-detail-workspace">
      
      {/* Back navigation & header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1.5">
          <button 
            onClick={onBack}
            className="text-xs font-mono font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Programs
          </button>
          
          <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-gray-400 font-mono">
            Part Number: {project.partNumber} | Customer: {project.customer}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 self-start md:self-center">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold">Active Program Stage</span>
            <select
              value={project.status}
              onChange={handleStageChange}
              className="bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Planning">Planning</option>
              <option value="Design">Design</option>
              <option value="ProcessDev">ProcessDev</option>
              <option value="Validation">Validation</option>
              <option value="Production">Production</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold">Completeness</span>
            <div className="text-lg font-bold font-display text-gray-900">{project.progress}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('fmea')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'fmea' ? 'border-blue-600 text-blue-600 font-display' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Failure Mode & Effects Analysis (FMEA)
        </button>
        <button
          onClick={() => setActiveTab('ppap')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ppap' ? 'border-blue-600 text-blue-600 font-display' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Production Part Approval Process (PPAP) Checklist
        </button>
      </div>

      {/* Tab 1: FMEA Workspace */}
      {activeTab === 'fmea' && (
        <div className="space-y-6" id="fmea-section">
          
          {/* APQP AI COPILOT CARD */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-indigo-800 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 w-48 h-48 rounded-full bg-blue-500"></div>
            
            <div className="flex items-start gap-4 max-w-4xl">
              <div className="p-3 bg-white/10 text-blue-300 rounded-xl">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-bold font-display text-lg tracking-tight flex items-center gap-1.5">
                    Gemini FMEA Risk Copilot <Sparkles className="w-4 h-4 text-amber-300" />
                  </h3>
                  <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                    Instantly draft professional failure mode sheets using artificial intelligence. Specify the manufacturing or design step below, and Gemini will predict failure risks, standard severity scores, failure causes, detection strategies, and optimal corrective action plans.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-3 max-w-2xl">
                  <input
                    type="text"
                    value={aiInputStep}
                    onChange={(e) => setAiInputStep(e.target.value)}
                    placeholder="e.g. Laser engraving barcode onto electronic chips"
                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAiBrainstorm}
                    disabled={isAiSuggesting || !aiInputStep}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isAiSuggesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Risks...
                      </>
                    ) : (
                      <>
                        Brainstorm with AI
                      </>
                    )}
                  </button>
                </div>

                {/* AI Error Warning */}
                {aiError && (
                  <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-lg p-2.5 max-w-2xl mt-2">
                    {aiError}
                  </div>
                )}
              </div>
            </div>

            {/* AI Generated Suggestions Preview Container */}
            {aiSuggestions.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-5 space-y-4">
                <h4 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">AI Copilot Analysis Results</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiSuggestions.map((sugg, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 relative flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="font-semibold text-xs text-slate-100 line-clamp-2">{sugg.potentialFailureMode}</h5>
                          <span className="text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                            RPN {sugg.severity * sugg.occurrence * sugg.detection}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] line-clamp-3"><strong>Effects:</strong> {sugg.potentialFailureEffects}</p>
                        <p className="text-slate-300 text-[11px] line-clamp-2"><strong>Cause:</strong> {sugg.potentialCauses}</p>
                        
                        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                          <div className="bg-white/5 p-1 rounded">Sev: {sugg.severity}</div>
                          <div className="bg-white/5 p-1 rounded">Occ: {sugg.occurrence}</div>
                          <div className="bg-white/5 p-1 rounded">Det: {sugg.detection}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleImportAiSuggestion(sugg)}
                        className="mt-3 w-full bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition-all text-[11px] font-semibold py-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Import Into Worksheet
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FMEA Spreadsheet Table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 font-display">FMEA Worksheet (Sorted by highest RPN)</h3>
              <span className="text-xs text-gray-400 font-mono">{fmeaItems.length} Hazard Rows Found</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-500 font-mono uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <th className="p-3">Process Step</th>
                    <th className="p-3">Failure Mode</th>
                    <th className="p-3">Effects</th>
                    <th className="p-3 text-center">S</th>
                    <th className="p-3">Causes</th>
                    <th className="p-3 text-center">O</th>
                    <th className="p-3">Controls</th>
                    <th className="p-3 text-center">D</th>
                    <th className="p-3 text-center font-bold text-gray-800">RPN</th>
                    <th className="p-3">Recommended Actions</th>
                    <th className="p-3">Owner & Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedFmea.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-gray-400 font-medium">
                        No FMEA rows analyzed. Add items below or use the AI Copilot above to generate rows instantly.
                      </td>
                    </tr>
                  ) : (
                    sortedFmea.map(item => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-gray-50/40 transition-colors ${
                          item.rpn >= 150 ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="p-3 font-medium text-gray-800 max-w-[140px] truncate" title={item.processStep}>{item.processStep}</td>
                        <td className="p-3 text-gray-800 font-medium max-w-[140px] truncate" title={item.potentialFailureMode}>{item.potentialFailureMode}</td>
                        <td className="p-3 text-gray-500 max-w-[160px] truncate" title={item.potentialFailureEffects}>{item.potentialFailureEffects}</td>
                        <td className="p-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${getSevColor(item.severity)}`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 max-w-[120px] truncate" title={item.potentialCauses}>{item.potentialCauses}</td>
                        <td className="p-3 text-center font-mono font-medium">{item.occurrence}</td>
                        <td className="p-3 text-gray-500 max-w-[120px] truncate" title={item.currentControls}>{item.currentControls}</td>
                        <td className="p-3 text-center font-mono font-medium">{item.detection}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            item.rpn >= 150 ? 'bg-rose-100 text-rose-700 font-extrabold border border-rose-200' :
                            item.rpn >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.rpn}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 max-w-[150px] truncate" title={item.recommendedActions}>{item.recommendedActions || 'N/A'}</td>
                        <td className="p-3 max-w-[130px] truncate">
                          <p className="font-semibold text-gray-700 text-[10px]">{item.actionResponsibility || 'Unassigned'}</p>
                          <span className={`inline-block text-[9px] uppercase font-mono font-bold mt-0.5 px-1.5 py-0.2 rounded ${
                            item.actionStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            item.actionStatus === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-gray-50 text-gray-500 border border-gray-100'
                          }`}>
                            {item.actionStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleEditFmea(item)}
                              className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Edit item"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteFmeaItem(item.id)}
                              className="text-gray-400 hover:text-rose-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FMEA Editor Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs" id="fmea-editor-form">
            <h3 className="text-lg font-bold font-display text-gray-900 border-b border-gray-50 pb-3 mb-4">
              {editingFmeaId ? 'Edit FMEA Row' : 'Analyze New FMEA Failure Risk Row'}
            </h3>

            <form onSubmit={handleFmeaSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Process Step / Function</label>
                <input
                  type="text"
                  value={fmeaStep}
                  onChange={(e) => setFmeaStep(e.target.value)}
                  placeholder="e.g. Solder SMD chips to main controller"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Potential Failure Mode</label>
                <input
                  type="text"
                  value={fmeaMode}
                  onChange={(e) => setFmeaMode(e.target.value)}
                  placeholder="e.g. Weak solder joint / cold joints"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Downstream Failure Effects</label>
                <input
                  type="text"
                  value={fmeaEffects}
                  onChange={(e) => setFmeaEffects(e.target.value)}
                  placeholder="e.g. Dynamic electrical failure, circuit breaks"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase flex items-center justify-between">
                  <span>Severity (S)</span>
                  <span className="text-[10px] text-gray-400 capitalize">{fmeaSev >= 8 ? 'Critical' : fmeaSev >= 5 ? 'Moderate' : 'Minor'}</span>
                </label>
                <select
                  value={fmeaSev}
                  onChange={(e) => setFmeaSev(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                >
                  <option value={10}>10 - Catastrophic (Safety critical, no warning)</option>
                  <option value={9}>9 - Hazardous (Safety critical, with warning)</option>
                  <option value={8}>8 - Major Loss (Device completely disabled)</option>
                  <option value={7}>7 - Serious Loss (Device degrades, low performance)</option>
                  <option value={6}>6 - Medium Loss (Primary function active but limited)</option>
                  <option value={5}>5 - Moderate (Comfort/convenience function disabled)</option>
                  <option value={4}>4 - Minor Loss (Minor convenience disabled)</option>
                  <option value={3}>3 - Annoyance (Slightly noticeable finish defect)</option>
                  <option value={2}>2 - Very Minor (Barely noticeable defect)</option>
                  <option value={1}>1 - Unnoticeable (No effect on function or appearance)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Potential Failure Causes</label>
                <input
                  type="text"
                  value={fmeaCauses}
                  onChange={(e) => setFmeaCauses(e.target.value)}
                  placeholder="e.g. Solder paste stencil clogged, laser power low"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase flex items-center justify-between">
                  <span>Occurrence (O)</span>
                  <span className="text-[10px] text-gray-400 capitalize">{fmeaOcc >= 8 ? 'Frequent' : fmeaOcc >= 5 ? 'Occasional' : 'Remote'}</span>
                </label>
                <select
                  value={fmeaOcc}
                  onChange={(e) => setFmeaOcc(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                >
                  <option value={10}>10 - Unavoidable (Constant frequent defects)</option>
                  <option value={9}>9 - Very High (Defects occur in every batch)</option>
                  <option value={8}>8 - High (Occurs very often in standard runs)</option>
                  <option value={7}>7 - Fairly High (Repeated historic fails)</option>
                  <option value={6}>6 - Medium (Defect occurs occasionally)</option>
                  <option value={5}>5 - Moderate (Defect has been seen before)</option>
                  <option value={4}>4 - Moderately Low (Infrequent defect records)</option>
                  <option value={3}>3 - Low (Extremely rare occurrence)</option>
                  <option value={2}>2 - Very Low (Remote chance, robust tooling)</option>
                  <option value={1}>1 - Improbable (Almost impossible to occur)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Current Preventive/Detection Controls</label>
                <input
                  type="text"
                  value={fmeaControls}
                  onChange={(e) => setFmeaControls(e.target.value)}
                  placeholder="e.g. Camera-based optical print inspection"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase flex items-center justify-between">
                  <span>Detection (D)</span>
                  <span className="text-[10px] text-gray-400 capitalize">{fmeaDet >= 8 ? 'Poor' : fmeaDet >= 5 ? 'Medium' : 'Excellent'}</span>
                </label>
                <select
                  value={fmeaDet}
                  onChange={(e) => setFmeaDet(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                >
                  <option value={10}>10 - Undetectable (No inspection can catch it)</option>
                  <option value={9}>9 - Extremely Poor (Operator visual check only)</option>
                  <option value={8}>8 - Poor (Sample physical pull checks)</option>
                  <option value={7}>7 - Very Low (Manual measurement tooling checks)</option>
                  <option value={6}>6 - Low (Dynamic checking instruments)</option>
                  <option value={5}>5 - Moderate (Standard automated optical testing)</option>
                  <option value={4}>4 - Moderately High (Robust multi-stage electrical test)</option>
                  <option value={3}>3 - High (Auto sensor lockouts, 100% check)</option>
                  <option value={2}>2 - Very High (Integrated mistake proofing Poka-Yoke)</option>
                  <option value={1}>1 - Certain (Defect is mechanically impossible to slip)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Calculated Risk Priority (RPN)</label>
                <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-gray-800 flex justify-between items-center">
                  <span>S ({fmeaSev}) × O ({fmeaOcc}) × D ({fmeaDet}) =</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    fmeaSev * fmeaOcc * fmeaDet >= 150 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-white'
                  }`}>
                    {fmeaSev * fmeaOcc * fmeaDet}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Recommended Mitigation Actions</label>
                <input
                  type="text"
                  value={fmeaRecAction}
                  onChange={(e) => setFmeaRecAction(e.target.value)}
                  placeholder="e.g. Conduct Gage R&R study, install smart shut-off"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Action Responsible Party</label>
                <input
                  type="text"
                  value={fmeaResp}
                  onChange={(e) => setFmeaResp(e.target.value)}
                  placeholder="e.g. Marcus Wright (Lead Process Eng)"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-gray-500 uppercase">Action Stage Status</label>
                <select
                  value={fmeaStatus}
                  onChange={(e) => setFmeaStatus(e.target.value as FMEAItem['actionStatus'])}
                  className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="md:col-span-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
                {editingFmeaId && (
                  <button
                    type="button"
                    onClick={handleCancelFmeaEdit}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase cursor-pointer shadow-xs"
                >
                  {editingFmeaId ? 'Apply Edit Changes' : 'Record Risk Row'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: PPAP Submission Elements */}
      {activeTab === 'ppap' && (
        <div className="space-y-6" id="ppap-section">
          
          {/* PPAP Info Box */}
          <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 font-display">Part Submission Warrant (PSW) Verification</h3>
              <p className="text-xs text-gray-500">
                To approve production parts, all 8 standard elements must be submitted and approved. Once done, the product moves to standard production.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-mono font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              APPROVED: {ppapElements.filter(p => p.status === 'Approved').length}/8 ELEMENTS
            </div>
          </div>

          {/* PPAP Table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 font-display">PPAP Production Readiness Checklist</h3>
              <span className="text-xs text-gray-400 font-mono">Stage 4 Approval Gate</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-500 font-mono uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <th className="p-4 w-[80px]">Element</th>
                    <th className="p-4 w-[280px]">Element Name</th>
                    <th className="p-4 w-[130px] text-center">Status</th>
                    <th className="p-4 w-[160px]">Submitted By</th>
                    <th className="p-4 w-[110px] text-center">Timestamp</th>
                    <th className="p-4">Comments / Reviewer Feedback</th>
                    <th className="p-4 text-center w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ppapElements.map(el => {
                    const isEditing = editingPpapId === el.id;

                    return (
                      <tr key={el.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-blue-600">{el.elementCode}</td>
                        <td className="p-4 font-semibold text-gray-900">{el.elementName}</td>
                        
                        {/* Status Column */}
                        <td className="p-4 text-center">
                          {isEditing ? (
                            <select
                              value={ppapStatus}
                              onChange={(e) => setPpapStatus(e.target.value as PPAPElement['status'])}
                              className="bg-white border border-gray-200 rounded px-1.5 py-1 text-xs font-mono font-medium focus:outline-none"
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          ) : (
                            <span className={`inline-block text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                              el.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              el.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              el.status === 'Under Review' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              el.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-gray-50 text-gray-500 border-gray-200'
                            }`}>
                              {el.status}
                            </span>
                          )}
                        </td>

                        {/* Submitted By */}
                        <td className="p-4 text-gray-700 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={ppapSubmittedBy}
                              onChange={(e) => setPpapSubmittedBy(e.target.value)}
                              placeholder="Engineer Name"
                              className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs"
                            />
                          ) : (
                            el.submittedBy || <span className="text-gray-300 font-mono">—</span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="p-4 text-center text-gray-400 font-mono text-[11px]">
                          {el.submittedAt || <span className="text-gray-300">—</span>}
                        </td>

                        {/* Comments */}
                        <td className="p-4 text-gray-500">
                          {isEditing ? (
                            <textarea
                              value={ppapComments}
                              onChange={(e) => setPpapComments(e.target.value)}
                              placeholder="Add document comments or reason for rejection"
                              className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs h-12 resize-none"
                            />
                          ) : (
                            el.comments || <span className="text-gray-300 italic text-[11px]">No comments logged</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          {isEditing ? (
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handlePpapSave(el.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingPpapId(null)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded cursor-pointer"
                                title="Cancel"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditPpap(el)}
                              className="text-blue-600 hover:text-blue-800 font-mono font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Edit className="w-3 h-3" /> Update Element
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
