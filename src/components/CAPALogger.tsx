import React, { useState } from 'react';
import { CAPALog, APQPProject } from '../types';
import { 
  ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Brain, Plus, Calendar, 
  User, Layers, Trash2, Edit, Save, RefreshCw, Sparkles, Check, Info, FileWarning
} from 'lucide-react';

interface CAPALoggerProps {
  capaList: CAPALog[];
  projects: APQPProject[];
  onCreateCapa: (capa: Omit<CAPALog, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  onUpdateCapa: (id: string, updates: Partial<CAPALog>) => Promise<void>;
  onDeleteCapa: (id: string) => void;
  onSuggestCapa: (defectDescription: string, title: string) => Promise<any>;
}

export default function CAPALogger({
  capaList,
  projects,
  onCreateCapa,
  onUpdateCapa,
  onDeleteCapa,
  onSuggestCapa
}: CAPALoggerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedCapaId, setExpandedCapaId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [defectDescription, setDefectDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [source, setSource] = useState<CAPALog['source']>('Production Inspection');
  const [severity, setSeverity] = useState<CAPALog['severity']>('Medium');
  const [owner, setOwner] = useState('');

  // Filtering State
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  // AI Investigation State
  const [isAiInvestigating, setIsAiInvestigating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Expanded edit states
  const [editContainment, setEditContainment] = useState('');
  const [editWhys, setEditWhys] = useState<string[]>(['', '', '', '', '']);
  const [editCorrective, setEditCorrective] = useState('');
  const [editPreventive, setEditPreventive] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editStatus, setEditStatus] = useState<CAPALog['status']>('Draft');
  const [editSeverity, setEditSeverity] = useState<CAPALog['severity']>('Medium');

  // Load editing values when expanding CAPA
  const handleExpandCapa = (capa: CAPALog) => {
    if (expandedCapaId === capa.id) {
      setExpandedCapaId(null);
    } else {
      setExpandedCapaId(capa.id);
      setEditContainment(capa.containmentAction || '');
      setEditWhys(capa.rootCauseAnalysis?.whys || ['', '', '', '', '']);
      setEditCorrective(capa.correctiveAction || '');
      setEditPreventive(capa.preventiveAction || '');
      setEditOwner(capa.owner || '');
      setEditStatus(capa.status);
      setEditSeverity(capa.severity);
      setAiError(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !defectDescription || !source) return;

    await onCreateCapa({
      title,
      projectId: projectId || undefined,
      defectDescription,
      source,
      severity,
      containmentAction: '',
      rootCauseAnalysis: {
        method: '5Whys',
        whys: ['', '', '', '', '']
      },
      correctiveAction: '',
      preventiveAction: '',
      owner: owner || 'Quality Engineer'
    });

    // Reset Form
    setTitle('');
    setDefectDescription('');
    setProjectId('');
    setSource('Production Inspection');
    setSeverity('Medium');
    setOwner('');
    setShowCreateForm(false);
  };

  const handleUpdateSave = async (id: string) => {
    await onUpdateCapa(id, {
      containmentAction: editContainment,
      rootCauseAnalysis: {
        method: '5Whys',
        whys: editWhys
      },
      correctiveAction: editCorrective,
      preventiveAction: editPreventive,
      owner: editOwner,
      status: editStatus,
      severity: editSeverity
    });
    setExpandedCapaId(null);
  };

  // Perform AI 5 Whys and actions proposal
  const handleAiInvestigate = async (capa: CAPALog) => {
    setIsAiInvestigating(true);
    setAiError(null);

    try {
      const result = await onSuggestCapa(capa.defectDescription, capa.title);
      
      // Auto populate state fields
      setEditContainment(result.containmentAction || '');
      setEditWhys(result.whys && result.whys.length >= 5 ? result.whys : ['', '', '', '', '']);
      setEditCorrective(result.correctiveAction || '');
      setEditPreventive(result.preventiveAction || '');
      setEditStatus('Investigation'); // Move status to active investigation!
      
    } catch (err: any) {
      setAiError(err.message || 'Failed to analyze with AI');
    } finally {
      setIsAiInvestigating(false);
    }
  };

  const handleWhyChange = (index: number, val: string) => {
    const updated = [...editWhys];
    updated[index] = val;
    setEditWhys(updated);
  };

  // Filter list
  const filteredCapaList = capaList.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || c.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const severityLevels: CAPALog['severity'][] = ['Low', 'Medium', 'High', 'Critical'];
  const statusLevels: CAPALog['status'][] = ['Draft', 'Investigation', 'ActionPlan', 'Verification', 'Closed'];

  return (
    <div className="space-y-6" id="capa-manager-workspace">
      
      {/* CAPA Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">
            CAPA Corrective Actions Registry
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Systemic Corrective and Preventive Action logs. Root cause tracking using 8D-compliant 5-Whys isolation.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-250 inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
          id="btn-new-capa"
        >
          <Plus className="w-4 h-4" /> Log Quality Defect
        </button>
      </div>

      {/* Log Defect Form */}
      {showCreateForm && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 shadow-sm animate-fadeIn" id="create-capa-form">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200/50 pb-3">
            <h3 className="font-bold font-display text-slate-800 text-lg">Log New Quality Defect Report</h3>
            <button 
              onClick={() => setShowCreateForm(false)} 
              className="text-xs text-slate-400 hover:text-slate-600 font-mono"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Defect Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PCB solder voiding on controller chip"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Related Quality Program (Optional)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Generic/Not Related --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Defect & Symptom Description</label>
              <textarea
                value={defectDescription}
                onChange={(e) => setDefectDescription(e.target.value)}
                placeholder="Detail the failure. Include measurements, quantity of defective parts, lines affected, and immediate failure indicators."
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Defect Discovery Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as CAPALog['source'])}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Production Inspection">Production Inspection</option>
                <option value="Customer Complaint">Customer Complaint</option>
                <option value="Internal Audit">Internal Audit</option>
                <option value="Supplier Quality">Supplier Quality</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Severity Priority Rating</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as CAPALog['severity'])}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {severityLevels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Assigned Investigative Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Dr. Sarah Connor (Lead Quality Systems)"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Launch Investigations & containment Actions
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-gray-55/30 border border-gray-100 p-3 rounded-2xl items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-150 rounded-xl px-2 py-1">
            <span className="text-[10px] font-mono text-gray-400 font-semibold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-gray-800 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {statusLevels.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-150 rounded-xl px-2 py-1">
            <span className="text-[10px] font-mono text-gray-400 font-semibold uppercase">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-gray-800 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Severities</option>
              {severityLevels.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-gray-400 font-mono">Showing {filteredCapaList.length} Case Logs</span>
      </div>

      {/* CAPA List cards */}
      <div className="space-y-4">
        {filteredCapaList.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-55/20 space-y-2">
            <FileWarning className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-gray-600 font-medium font-display">No CAPA Action Records Found</p>
            <p className="text-xs text-gray-400">Modify filters or click "Log Quality Defect" to begin a CAPA report.</p>
          </div>
        ) : (
          filteredCapaList.map(c => {
            const isExpanded = expandedCapaId === c.id;
            const project = projects.find(p => p.id === c.projectId);

            return (
              <div 
                key={c.id} 
                className={`bg-white border rounded-2xl shadow-xs transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
                }`}
                id={`capa-item-${c.id}`}
              >
                
                {/* Collapsed Header Summary */}
                <div 
                  onClick={() => handleExpandCapa(c)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/20 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                        c.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        c.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                        c.severity === 'Medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {c.severity} Severity
                      </span>

                      <span className="text-[10px] uppercase font-mono font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        DISCOVERED: {c.source}
                      </span>

                      {project && (
                        <span className="text-[10px] font-mono text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                          APQP: {project.name}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 font-display text-base md:text-lg tracking-tight">
                      {c.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-1">{c.defectDescription}</p>
                  </div>

                  {/* Status, Date and Arrow */}
                  <div className="flex items-center gap-4 justify-between md:justify-end shrink-0">
                    <div className="text-left md:text-right font-mono text-xs">
                      <div className="text-gray-400">Filed: {c.createdAt}</div>
                      {c.closedAt && <div className="text-emerald-600 font-bold">Closed: {c.closedAt}</div>}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold font-mono tracking-wider uppercase px-2.5 py-1 rounded border ${
                        c.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        c.status === 'Verification' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        c.status === 'ActionPlan' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        c.status === 'Investigation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {c.status}
                      </span>

                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Investigative Workspace */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-6">
                    
                    {/* Defect Symptom Info Callout */}
                    <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-2">
                      <div className="text-xs font-semibold text-gray-400 font-mono uppercase">Full Defect Symptom Record</div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.defectDescription}</p>
                    </div>

                    {/* GEMINI AI INVESTIGATION COPILOT ACCELERATOR */}
                    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-800 text-blue-400 rounded-lg shrink-0">
                          <Brain className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm font-display flex items-center gap-1">
                            Gemini AI 5-Whys Investigator <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          </h4>
                          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                            Leverage Gemini's expert quality knowledge base to run an engineering assessment of this defect. The model will draft immediate containment lock-outs, run a structured sequential "5 Whys" progression, and recommend permanent corrective & preventive guidelines.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleAiInvestigate(c)}
                          disabled={isAiInvestigating}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-slate-400 text-white px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {isAiInvestigating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deep System Investigation...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" /> Propose Systemic RCA & CAPA Plan
                            </>
                          )}
                        </button>
                      </div>

                      {aiError && (
                        <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-lg p-2.5">
                          {aiError}
                        </div>
                      )}
                    </div>

                    {/* Investigative Input Fields Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: General & Containment & Actions */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold font-display text-gray-900 border-b border-gray-100 pb-1.5">Action Plans</h4>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-semibold text-gray-500 uppercase flex items-center gap-1">
                            <span>Immediate Containment Actions</span>
                            <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1 py-0.1 rounded font-normal">Isolate Defect</span>
                          </label>
                          <textarea
                            value={editContainment}
                            onChange={(e) => setEditContainment(e.target.value)}
                            placeholder="Detail urgent containment steps. e.g. Stop line, quarantine raw lots, audit stock."
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs h-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-semibold text-gray-500 uppercase flex items-center gap-1">
                            <span>Permanent Corrective Actions</span>
                            <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.1 rounded font-normal">Remove Root Cause</span>
                          </label>
                          <textarea
                            value={editCorrective}
                            onChange={(e) => setEditCorrective(e.target.value)}
                            placeholder="Identify permanent actions that repair the direct root cause. e.g. Recalibrate machine recipe, lock parameter edit screens."
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs h-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-semibold text-gray-500 uppercase flex items-center gap-1">
                            <span>Systemic Preventive Actions</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.1 rounded font-normal">Prevent Re-occurrence</span>
                          </label>
                          <textarea
                            value={editPreventive}
                            onChange={(e) => setEditPreventive(e.target.value)}
                            placeholder="Systemic actions across other operations/lines. e.g. Update design criteria specs, operator training matrices."
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs h-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Right: 5 Whys Root Cause Analysis */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold font-display text-gray-900 border-b border-gray-100 pb-1.5">5 Whys Root Cause isolation</h4>

                        <div className="space-y-3">
                          {editWhys.map((why, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                              <span className="bg-slate-200 text-slate-800 text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1">
                                {idx + 1}
                              </span>
                              <div className="space-y-0.5 flex-1">
                                <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
                                  {idx === 0 ? 'Why did the defect occur?' : `Why did ${idx === 1 ? 'this' : 'the prior step'} happen?`}
                                </span>
                                <input
                                  type="text"
                                  value={why}
                                  onChange={(e) => handleWhyChange(idx, e.target.value)}
                                  placeholder={`Why level ${idx + 1}`}
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Meta Investigation Control panel */}
                    <div className="border-t border-gray-200/60 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/40 p-4 rounded-xl border border-gray-200">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Investigating Owner</label>
                        <input
                          type="text"
                          value={editOwner}
                          onChange={(e) => setEditOwner(e.target.value)}
                          placeholder="Engineer Name"
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Case Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as CAPALog['status'])}
                          className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none font-semibold text-gray-800"
                        >
                          {statusLevels.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Severity Priority Level</label>
                        <select
                          value={editSeverity}
                          onChange={(e) => setEditSeverity(e.target.value as CAPALog['severity'])}
                          className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none font-semibold text-gray-800"
                        >
                          {severityLevels.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3 pt-3 flex justify-between items-center border-t border-gray-150">
                        <button
                          onClick={() => onDeleteCapa(c.id)}
                          className="text-xs font-mono font-bold text-gray-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Defect Record
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedCapaId(null)}
                            className="bg-gray-150 hover:bg-gray-250 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase cursor-pointer"
                          >
                            Minimize
                          </button>
                          <button
                            onClick={() => handleUpdateSave(c.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Save className="w-4 h-4" /> Save Investigation Changes
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Closed Status Green stamp badge */}
                    {c.status === 'Closed' && (
                      <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 flex items-center gap-3.5 animate-fadeIn">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold font-display text-emerald-800 text-sm">CAPA Systemic Closure Approved</p>
                          <p className="text-emerald-700 text-xs mt-0.5">
                            Root cause trace successfully documented. Containment, Corrective and systemic Preventive actions successfully verified on lines. Audit approved.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
