import React, { useState } from 'react';
import { APQPProject, PPAPElement } from '../types';
import { 
  ShieldCheck, FileText, CheckCircle2, AlertTriangle, Cpu, Wrench, ChevronRight, 
  Sparkles, Download, Signature, RefreshCw, Calculator, BarChart4, ClipboardCheck, Info
} from 'lucide-react';

interface PPAPDashboardProps {
  projects: APQPProject[];
  ppapElements: PPAPElement[];
  onUpdatePpapElement: (elementId: string, updates: Partial<PPAPElement>) => Promise<void>;
  onSelectProject: (projId: string) => void;
}

export default function PPAPDashboard({
  projects,
  ppapElements,
  onUpdatePpapElement,
  onSelectProject
}: PPAPDashboardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.length > 0 ? projects[0].id : ''
  );
  
  // PPAP Tools State ($C_{pk}$ Calculator)
  const [usl, setUsl] = useState<number>(10.5);
  const [lsl, setLsl] = useState<number>(9.5);
  const [samples, setSamples] = useState<string>('10.1, 10.2, 9.9, 10.0, 10.3');
  const [cpkResult, setCpkResult] = useState<{
    mean: number;
    stdDev: number;
    cp: number;
    cpk: number;
    status: 'Excellent' | 'Capable' | 'Inadequate' | 'Failing';
    statusColor: string;
  } | null>(null);

  // PSW Form State
  const [pswPartName, setPswPartName] = useState('');
  const [pswPartNum, setPswPartNum] = useState('');
  const [pswOrgChange, setPswOrgChange] = useState('Initial Release');
  const [pswSubmissionLevel, setPswSubmissionLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [pswDeclaration, setPswDeclaration] = useState(true);
  const [pswSigned, setPswSigned] = useState(false);
  const [pswSignee, setPswSignee] = useState('');
  const [pswTitle, setPswTitle] = useState('Quality Lead Engineer');

  // Interactive PPAP Edit State
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<PPAPElement['status']>('Not Started');
  const [editSubmittedBy, setEditSubmittedBy] = useState('');
  const [editComments, setEditComments] = useState('');

  // Active project PPAP elements
  const activeProject = projects.find(p => p.id === selectedProjectId);
  const activeElements = ppapElements.filter(el => el.projectId === selectedProjectId);

  // Initialize PSW with project defaults
  React.useEffect(() => {
    if (activeProject) {
      setPswPartName(activeProject.name);
      setPswPartNum(activeProject.partNumber);
      setPswSignee('Marcus Wright');
      setPswSigned(false);
    }
  }, [selectedProjectId, activeProject]);

  // Calculate Process Capability (Cpk)
  const handleCalculateCpk = () => {
    try {
      const dataPoints = samples
        .split(',')
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n));

      if (dataPoints.length < 3) {
        alert('Please provide at least 3 numerical sample readings separated by commas.');
        return;
      }

      // Mean
      const sum = dataPoints.reduce((a, b) => a + b, 0);
      const mean = sum / dataPoints.length;

      // Sample StdDev
      const varianceSum = dataPoints.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
      const stdDev = Math.sqrt(varianceSum / (dataPoints.length - 1));

      if (stdDev === 0) {
        setCpkResult({
          mean,
          stdDev: 0,
          cp: 99.9,
          cpk: 99.9,
          status: 'Excellent',
          statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
        });
        return;
      }

      // Cp
      const cp = (usl - lsl) / (6 * stdDev);

      // Cpk
      const cpu = (usl - mean) / (3 * stdDev);
      const cpl = (mean - lsl) / (3 * stdDev);
      const cpk = Math.min(cpu, cpl);

      let status: 'Excellent' | 'Capable' | 'Inadequate' | 'Failing' = 'Failing';
      let statusColor = 'text-rose-600 bg-rose-50 border-rose-200';

      if (cpk >= 1.67) {
        status = 'Excellent';
        statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
      } else if (cpk >= 1.33) {
        status = 'Capable';
        statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
      } else if (cpk >= 1.0) {
        status = 'Inadequate';
        statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
      }

      setCpkResult({
        mean: parseFloat(mean.toFixed(4)),
        stdDev: parseFloat(stdDev.toFixed(4)),
        cp: parseFloat(cp.toFixed(2)),
        cpk: parseFloat(cpk.toFixed(2)),
        status,
        statusColor
      });
    } catch (e) {
      alert('Error performing statistical calculations. Check input format.');
    }
  };

  const handleEditElement = (el: PPAPElement) => {
    setEditingElementId(el.id);
    setEditStatus(el.status);
    setEditSubmittedBy(el.submittedBy || '');
    setEditComments(el.comments || '');
  };

  const handleSaveElement = async (elId: string) => {
    await onUpdatePpapElement(elId, {
      status: editStatus,
      submittedBy: editSubmittedBy,
      submittedAt: editStatus !== 'Not Started' ? new Date().toISOString().split('T')[0] : '',
      comments: editComments
    });
    setEditingElementId(null);
  };

  // Summary counts for projects
  const approvedCount = activeElements.filter(e => e.status === 'Approved').length;

  return (
    <div className="space-y-6" id="ppap-portal-workspace">
      {/* View Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-lime-600 shrink-0" /> PPAP Operations Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Production Part Approval Process Level-3 Warrant Sign-offs, Process Capability (Cpk) Audits, and Customer PSW Declarations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-lime-50 text-lime-800 border border-lime-200 px-3 py-1.5 rounded-full font-mono font-medium">
          <Cpu className="w-3.5 h-3.5 animate-spin text-lime-600" />
          PPAP PROTOCOL: AIAG 4TH EDITION
        </div>
      </div>

      {/* Selector and high-level progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider block mb-1">Select Assembly/Part Program</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.partNumber})
                  </option>
                ))}
              </select>
            </div>

            {activeProject && (
              <div className="space-y-3.5 text-xs border-t border-gray-50 pt-3.5">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Customer:</span>
                  <span className="font-semibold text-gray-800">{activeProject.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">Part Code:</span>
                  <span className="font-bold text-blue-600 font-mono">{activeProject.partNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono">APQP Stage:</span>
                  <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-mono">{activeProject.status}</span>
                </div>
              </div>
            )}
          </div>

          {activeProject && (
            <div className="border-t border-gray-50 pt-4 mt-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">PPAP Elements Signed-Off</span>
                <span className="font-bold text-emerald-600">{approvedCount} / 8 Approved</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(approvedCount / 8) * 100}%` }}
                ></div>
              </div>
              <button
                onClick={() => onSelectProject(selectedProjectId)}
                className="w-full mt-2 text-center text-[11px] font-bold font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                Go to Full Program Workspace <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Level Guide */}
        <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 to-zinc-950 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-zinc-800">
          <div className="space-y-3">
            <span className="text-xs font-mono text-lime-400 font-semibold tracking-widest uppercase">Submission Levels Guidelines</span>
            <h3 className="text-lg font-bold font-display tracking-tight flex items-center gap-2">
              AIAG PPAP Submission Standards <Info className="w-4 h-4 text-blue-400" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                <h4 className="font-bold text-xs text-lime-300 font-mono">LEVEL 1</h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">Warrant (PSW) and appearance approval reports only submitted to the customer.</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                <h4 className="font-bold text-xs text-lime-300 font-mono">LEVEL 3 (Standard)</h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">Warrant, product samples, and complete supporting documentation submitted for review.</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                <h4 className="font-bold text-xs text-lime-300 font-mono">LEVEL 5</h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">Warrant, samples, and full data reviewed at the supplier's manufacturing facility.</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-4 border-t border-white/5 pt-3">
            * Complete Level 3 warrant validation is a mandatory prerequisite for full series automotive parts release.
          </p>
        </div>
      </div>

      {/* Main PPAP checklist and PSW tab split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Elements list or active forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 font-display">Checklist Element Submissions</h3>
              <span className="text-xs text-gray-400 font-mono font-semibold">AIAG Production Gate</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-500 font-mono uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <th className="p-3.5 w-[70px]">Code</th>
                    <th className="p-3.5">Element Name</th>
                    <th className="p-3.5 text-center w-[120px]">Status</th>
                    <th className="p-3.5 w-[140px]">Signee</th>
                    <th className="p-3.5">Review Comments</th>
                    <th className="p-3.5 text-center w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeElements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                        No elements generated. Select a valid APQP Project or initialize program records.
                      </td>
                    </tr>
                  ) : (
                    activeElements.map(el => {
                      const isEditing = editingElementId === el.id;
                      return (
                        <tr key={el.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-blue-600">{el.elementCode}</td>
                          <td className="p-3.5 font-semibold text-gray-900">{el.elementName}</td>
                          
                          <td className="p-3.5 text-center">
                            {isEditing ? (
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as PPAPElement['status'])}
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

                          <td className="p-3.5 text-gray-700 font-medium">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editSubmittedBy}
                                onChange={(e) => setEditSubmittedBy(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs"
                              />
                            ) : (
                              el.submittedBy || <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="p-3.5 text-gray-500 max-w-[180px] truncate" title={el.comments}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editComments}
                                onChange={(e) => setEditComments(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs"
                              />
                            ) : (
                              el.comments || <span className="text-gray-300 italic text-[11px]">No feedback logged</span>
                            )}
                          </td>

                          <td className="p-3.5 text-center">
                            {isEditing ? (
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => handleSaveElement(el.id)}
                                  className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 cursor-pointer"
                                  title="Save"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingElementId(null)}
                                  className="bg-gray-100 text-gray-600 p-1 rounded hover:bg-gray-200 cursor-pointer"
                                  title="Cancel"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditElement(el)}
                                className="text-blue-600 hover:text-blue-800 font-mono font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-0.5 cursor-pointer hover:underline"
                              >
                                Sign-off
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form: Part Submission Warrant (PSW) */}
          <div className="bg-amber-50/25 border border-amber-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-amber-200 pb-3 flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-gray-900 font-display">AIAG Part Submission Warrant (PSW)</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold uppercase">
                FORM CFG-1001 (Automotive Release)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase">Part Name</label>
                <input
                  type="text"
                  value={pswPartName}
                  onChange={(e) => setPswPartName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase">Part Number / Code</label>
                <input
                  type="text"
                  value={pswPartNum}
                  onChange={(e) => setPswPartNum(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase">Engineering Change Level</label>
                <input
                  type="text"
                  value={pswOrgChange}
                  onChange={(e) => setPswOrgChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase">Submission level</label>
                <select
                  value={pswSubmissionLevel}
                  onChange={(e) => setPswSubmissionLevel(Number(e.target.value) as any)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-semibold"
                >
                  <option value={1}>Level 1 - Warrant & Appearance Only</option>
                  <option value={2}>Level 2 - Warrant, Samples & Limited Support</option>
                  <option value={3}>Level 3 - Full Warrant, Samples & Documentation</option>
                  <option value={4}>Level 4 - Warrant & Customer Specific Records</option>
                  <option value={5}>Level 5 - Facility Evaluation & Warrant Samples</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5 p-3 bg-white border border-gray-150 rounded-xl">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="declaration"
                    checked={pswDeclaration}
                    onChange={(e) => setPswDeclaration(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 border-gray-300 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="declaration" className="text-[11px] text-gray-600 leading-relaxed cursor-pointer">
                    <strong>Conformity Declaration:</strong> I hereby declare that the production samples used for these checks represent our standard series production parts and conform completely to all customer specification drawings, dimensions, tolerances, and quality guidelines.
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={pswSignee}
                  onChange={(e) => setPswSignee(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold text-gray-400 uppercase">Title / Role</label>
                <input
                  type="text"
                  value={pswTitle}
                  onChange={(e) => setPswTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Signature Area */}
            <div className="border border-dashed border-amber-200 rounded-2xl p-4 bg-white text-center space-y-3">
              {pswSigned ? (
                <div className="space-y-1 animate-fadeIn">
                  <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 inline-block uppercase">
                    WARRANT LEGALLY SIGNED & SIGNED OFF
                  </span>
                  <p className="font-serif text-2xl italic text-slate-800 tracking-wide select-none py-1.5 font-bold">
                    {pswSignee}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Electronic Signature Lock: {new Date().toISOString().split('T')[0]} @ SECURE_QLM_MD5
                  </p>
                  <button
                    onClick={() => setPswSigned(false)}
                    className="text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear Signature & Revoke Warrant
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-500">
                    Sign off the Part Submission Warrant to finalize the PPAP bundle submission.
                  </p>
                  <button
                    onClick={() => {
                      if (!pswSignee) {
                        alert('Please fill out the Authorized Signatory Name.');
                        return;
                      }
                      setPswSigned(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Signature className="w-4 h-4" /> Apply Digital Signature
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: PPAP Tools ($C_{pk}$ calculator) */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-gray-50 pb-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 font-display text-sm">PPAP Process Capability (Cpk) Tool</h3>
                <p className="text-[11px] text-gray-400 font-mono uppercase font-semibold">Stage 4 Initial Study</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Automate process capability studies for dimensional measurements. Enter the Upper/Lower spec limits and at least 3 measured samples.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">USL (Upper Limit)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={usl}
                    onChange={(e) => setUsl(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">LSL (Lower Limit)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lsl}
                    onChange={(e) => setLsl(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Measured Sample Values (Comma separated)</label>
                <input
                  type="text"
                  value={samples}
                  onChange={(e) => setSamples(e.target.value)}
                  placeholder="e.g. 10.05, 9.98, 10.12, 10.02, 9.95"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono font-semibold"
                />
              </div>

              <button
                onClick={handleCalculateCpk}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BarChart4 className="w-4 h-4" /> Compute Cp & Cpk Indices
              </button>
            </div>

            {cpkResult && (
              <div className={`border p-4 rounded-xl space-y-2.5 animate-fadeIn ${cpkResult.statusColor}`}>
                <div className="flex justify-between items-center border-b border-current/10 pb-2">
                  <span className="font-bold text-xs">Statistical Capability Summary</span>
                  <span className="font-mono text-[10px] font-bold uppercase">{cpkResult.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase">Mean ($\mu$)</span>
                    <span className="font-bold text-gray-900 text-sm">{cpkResult.mean}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase">Std Dev ($\sigma$)</span>
                    <span className="font-bold text-gray-900 text-sm">{cpkResult.stdDev}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase">Cp (Potential)</span>
                    <span className="font-bold text-gray-900 text-sm">{cpkResult.cp}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase">Cpk (Capability)</span>
                    <span className="font-bold text-blue-600 text-base">{cpkResult.cpk}</span>
                  </div>
                </div>

                <div className="text-[10px] leading-relaxed border-t border-current/10 pt-2 text-gray-500">
                  {cpkResult.cpk >= 1.33 ? (
                    <p className="text-emerald-700 font-medium">
                      ✓ Process is capable (Cpk &ge; 1.33). Standard production toolings meet safety and accuracy limits.
                    </p>
                  ) : (
                    <p className="text-rose-700 font-medium">
                      ⚠️ Process is NOT capable (Cpk &lt; 1.33). Standard deviation is too high or mean is shifted. Mitigate failure risk with tooling adjustments or Gage studies.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Education Box */}
          <div className="bg-slate-50 border border-gray-150 p-5 rounded-2xl space-y-2.5">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-slate-500" /> PPAP Elements Reference
            </h4>
            <ol className="text-[11px] text-gray-500 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Design Records & Specifications</li>
              <li>FMEA (Process / Design Risks)</li>
              <li>Process Flow Diagrams</li>
              <li>Control Plans (Tool Checklists)</li>
              <li>Initial Process Studies (Cpk &ge; 1.33)</li>
              <li>Dimensional Results reports</li>
              <li>Material & Performance test results</li>
              <li>Part Submission Warrant (PSW) sign-off</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}
