import React, { useState } from 'react';
import { 
  Check, FileText, Download, AlertCircle, Trash2, Plus, Search, Building, 
  CheckCircle2, Clock, ArrowRight, Lock, ShieldCheck, FileSpreadsheet, 
  Layers, User, RefreshCw, Play, BarChart3, AlertTriangle, ShieldAlert
} from 'lucide-react';

// ==========================================
// 1. PPAP SUBMISSION REASONS LIBRARY
// ==========================================
export function PPAPReasonLibrary() {
  const [reasons, setReasons] = useState([
    { code: 'R1', title: 'Initial Submission', desc: 'New part or material approval for standard product release.', category: 'New Product', status: 'Active' },
    { code: 'R2', title: 'Engineering Change', desc: 'Submission due to modification in design, spec, or raw materials.', category: 'Design Modification', status: 'Active' },
    { code: 'R3', title: 'Tooling Transfer', desc: 'Production relocation or tooling transfer to alternative manufacturing lines.', category: 'Process Change', status: 'Active' },
    { code: 'R4', title: 'Correction of Discrepancy', desc: 'Resubmission after correcting prior dimensional or quality defects.', category: 'Correction', status: 'Active' },
    { code: 'R5', title: 'Inactive Tooling (> 12 mo)', desc: 'Resubmission for production tooling inactive for twelve months or more.', category: 'Tooling Status', status: 'Active' },
    { code: 'R6', title: 'Alternative Source', desc: 'Integration of an approved alternative Tier-2 source or raw supplier.', category: 'Supply Chain', status: 'Active' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('New Product');

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newReason = {
      code: `R${reasons.length + 1}`,
      title: newTitle,
      desc: newDesc || 'No description provided.',
      category: newCategory,
      status: 'Active'
    };
    setReasons([...reasons, newReason]);
    setNewTitle('');
    setNewDesc('');
  };

  const filteredReasons = reasons.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50 pb-4">
        <div>
          <h2 className="text-lg font-bold font-display text-gray-950">PPAP Submission Reasons Dictionary</h2>
          <p className="text-xs text-gray-400 mt-1">Automotive regulatory codes mapping PSW warrants to specific manufacturing/engineering catalysts.</p>
        </div>
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search reasons..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-lime-500 w-full sm:w-64 font-sans bg-slate-50/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table List of Reasons */}
        <div className="lg:col-span-2 space-y-3">
          <div className="overflow-hidden border border-gray-150 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-mono text-[10px] uppercase border-b border-gray-150">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Submission Reason</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredReasons.map((r) => (
                  <tr key={r.code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-gray-400">{r.code}</td>
                    <td className="p-3">
                      <span className="font-semibold text-gray-950 block">{r.title}</span>
                      <span className="text-[11px] text-gray-400 mt-0.5 block leading-normal">{r.desc}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded-full">
                        {r.category}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded-full">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Reason Form */}
        <div className="bg-slate-50/60 border border-gray-150 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-lime-600" /> Register Custom Submission Reason
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Append custom, customer-specific submission criteria or specialty compliance overrides to the PPAP catalog.
          </p>

          <form onSubmit={handleAddReason} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Reason Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Line Relocation Trial" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Category</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              >
                <option value="New Product">New Product</option>
                <option value="Design Modification">Design Modification</option>
                <option value="Process Change">Process Change</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="Correction">Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Description</label>
              <textarea 
                placeholder="Detail submission conditions..." 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
            >
              Add to Library
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. PPAP REJECT REASON LIBRARY
// ==========================================
export function PPAPRejectReasonLibrary() {
  const [rejectReasons, setRejectReasons] = useState([
    { code: 'ERR-01', name: 'Dimensional Non-Conformance', description: 'Caliper or CMM reports indicate physical tolerances transcend approved GD&T limits.', frequency: 'High', layer: 'Metrology' },
    { code: 'ERR-02', name: 'Gage R&R Variance', description: 'Measurement system analysis indicates reproducibility & repeatability error exceed 10%.', frequency: 'Medium', layer: 'MSA Study' },
    { code: 'ERR-03', name: 'Incomplete Material Certifications', description: 'Missing mill test reports or chemical composition analysis verification hashes.', frequency: 'High', layer: 'Raw Materials' },
    { code: 'ERR-04', name: 'Control Plan Mismatch', description: 'Control Plan frequencies or sample sizes deviate from standard FMEA recommendations.', frequency: 'Low', layer: 'Documentation' },
    { code: 'ERR-05', name: 'Surface Defect Inspection', description: 'Pitting, micro-cracks, or gas porosity detected during raw optical scan checkpoints.', frequency: 'Medium', layer: 'Visual' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLayer, setNewLayer] = useState('Metrology');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newReason = {
      code: `ERR-0${rejectReasons.length + 1}`,
      name: newName,
      description: newDesc || 'No detail listed.',
      frequency: 'Low',
      layer: newLayer
    };
    setRejectReasons([...rejectReasons, newReason]);
    setNewName('');
    setNewDesc('');
  };

  const filtered = rejectReasons.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.layer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50 pb-4">
        <div>
          <h2 className="text-lg font-bold font-display text-gray-950">PPAP Rejection Reason Codes</h2>
          <p className="text-xs text-gray-400 mt-1">Authorized quality defect codes triggering direct warrant rejections during sign-off.</p>
        </div>
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search defects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-lime-500 w-full sm:w-64 font-sans bg-slate-50/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="overflow-hidden border border-gray-150 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-mono text-[10px] uppercase border-b border-gray-150">
                <tr>
                  <th className="p-3">Defect Code</th>
                  <th className="p-3">Defect / Reason Name</th>
                  <th className="p-3">Assessment Gate</th>
                  <th className="p-3 text-center">Defect Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((r) => (
                  <tr key={r.code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-red-600 bg-red-50/30 text-center">{r.code}</td>
                    <td className="p-3">
                      <span className="font-semibold text-gray-950 block">{r.name}</span>
                      <span className="text-[11px] text-gray-400 mt-0.5 block leading-normal">{r.description}</span>
                    </td>
                    <td className="p-3 font-mono text-zinc-500 text-[11px]">{r.layer}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[9px] font-bold border px-2.5 py-0.5 rounded-full uppercase ${
                        r.frequency === 'High' 
                          ? 'bg-rose-50 text-rose-700 border-rose-100' 
                          : r.frequency === 'Medium' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-slate-100 text-slate-700 border-gray-200'
                      }`}>
                        {r.frequency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-slate-50/60 border border-gray-150 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-red-600" /> Log Custom Defect Code
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Record recurrent fail criteria to automate warranty rejection notifications and direct corrective CAPA creation.
          </p>

          <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Reason / Defect Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Failure Mode Cpk < 1.33" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Assessment Gate</label>
              <select 
                value={newLayer}
                onChange={(e) => setNewLayer(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              >
                <option value="Metrology">Metrology (CMM)</option>
                <option value="MSA Study">MSA Study (Gage R&R)</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Documentation">Documentation (PPAP Level)</option>
                <option value="Visual">Visual Inspection</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Defect Description</label>
              <textarea 
                placeholder="Detail non-compliance parameters..." 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
            >
              Log Defect Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. PPAP INTERIM STATUS
// ==========================================
export function PPAPInterimStatus() {
  const [statuses, setStatuses] = useState([
    { status: 'Full Approval', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-950', icon: CheckCircle2, text: 'Part conforms fully to all drawing dimensions, laboratory and physical fatigue specs.', rule: 'Warrant released immediately. Shipping container authorized.' },
    { status: 'Interim Approval', color: 'border-amber-200 bg-amber-50/40 text-amber-950', icon: Clock, text: 'Allows shipment of product for limited production periods or specific part quantities.', rule: 'Valid for max 90 days. Requires a pending deviation file.' },
    { status: 'Rejected', color: 'border-rose-200 bg-rose-50/40 text-rose-950', icon: AlertTriangle, text: 'Part or document package fails specification requirements.', rule: 'No shipping authorized. New tooling submission required.' },
  ]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold font-display text-gray-950">PPAP Approval Status Classifications</h2>
        <p className="text-xs text-gray-400 mt-1">Regulatory specifications governing Level 3 PSW sign-off gating levels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statuses.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.status} className={`border p-5 rounded-2xl space-y-4 ${s.color}`}>
              <div className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm tracking-tight">{s.status}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{s.text}</p>
              <div className="pt-3 border-t border-current/10 text-[10px] font-mono font-bold uppercase tracking-wider">
                Rule: {s.rule}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-gray-150 p-5 rounded-2xl space-y-3">
        <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-lime-600" /> Interim Approval Threshold Overrides
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          In emergency supply chain disruptions (e.g., semiconductor delay or tooling damage), a quality manager can issue a 30-day <strong>Temporary Interim Status</strong>, provided a formal Deviation request is approved by the Component Lead Engineer.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 4. PPAP ROLES & AUTHORITIES
// ==========================================
export function PPAPRoles() {
  const roles = [
    { name: 'Supplier Quality Engineer (SQE)', authority: 'Prepare & Validate', scope: 'Compiles FMEA, Control Plans, metrology reports, and uploads PSW to portals.', level: 'Level 1-5 compilation' },
    { name: 'Quality Manager (QM)', authority: 'Sign-off Lead', scope: 'Approves or rejects final PSW warrants. Directs SCAR and CAPA creation.', level: 'Corporate warranty approval' },
    { name: 'Component Engineer (CE)', authority: 'Technical Audit', scope: 'Validates critical CAD dimensions, chemical tolerances, and laboratory reports.', level: 'GD&T compliance verification' },
    { name: 'Plant Director', authority: 'Production Release', scope: 'Releases logistics line locks upon receipt of active Full PPAP status.', level: 'Logistics Release' },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold font-display text-gray-950">Warrant Authority Matrix</h2>
        <p className="text-xs text-gray-400 mt-1">Standardized sign-off roles and operational authority bounds for Part Submission Warrants.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => (
          <div key={r.name} className="border border-gray-150 p-5 rounded-2xl space-y-3.5 bg-slate-50/30 hover:shadow-xs transition-shadow">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-700 bg-lime-50 border border-lime-150 px-2 py-0.5 rounded-full inline-block">
              {r.authority}
            </span>
            <h4 className="font-bold text-gray-950 text-xs leading-normal">{r.name}</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">{r.scope}</p>
            <div className="pt-2.5 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
              Role Focus: {r.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 5. PPAP TEMPLATES VAULT
// ==========================================
export function PPAPTemplates() {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  const templates = [
    { id: 'psw', title: 'Part Submission Warrant (PSW) Standard Form', format: 'XLSX', size: '240 KB', desc: 'AIAG Edition 4 Standard warrant warrant layout for formal level submissions.' },
    { id: 'fmea', title: 'Design/Process FMEA Risk matrix Template', format: 'XLSX', size: '420 KB', desc: 'Standard Failure Mode Effects Analysis worksheet compiling severity & RPN.' },
    { id: 'cp', title: 'Manufacturing Process Control Plan', format: 'XLSX', size: '180 KB', desc: 'Inspection frequency layout mapping key features to metrology checks.' },
    { id: 'grr', title: 'MSA Gage R&R Study (ANOVA method)', format: 'XLSM', size: '310 KB', desc: 'Automated statistical template calculating equipment variation margins.' },
    { id: 'ps', title: 'Process Capability Studies Cpk Calc', format: 'XLSX', size: '290 KB', desc: 'Calculates bilateral process distribution scores from sample inputs.' },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold font-display text-gray-950">AIAG Template Repository</h2>
        <p className="text-xs text-gray-400 mt-1">Pre-validated spreadsheet templates fully compliant with automotive standards.</p>
      </div>

      <div className="divide-y divide-gray-150 border border-gray-150 rounded-2xl overflow-hidden">
        {templates.map((t) => (
          <div key={t.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-3.5">
              <div className="p-2.5 bg-zinc-950 text-white rounded-xl h-10 w-10 flex items-center justify-center shrink-0 border border-zinc-800">
                <FileSpreadsheet className="w-5 h-5 text-lime-400" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-gray-950 text-xs sm:text-sm block">{t.title}</span>
                <span className="text-[11px] text-gray-400 block">{t.desc}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase mr-2">{t.format} • {t.size}</span>
              <button 
                onClick={() => setSelectedPreview(t.title)}
                className="px-3.5 py-1.5 border border-gray-200 hover:border-zinc-900 rounded-xl text-xs font-semibold cursor-pointer transition-colors bg-white hover:bg-zinc-50"
              >
                Preview Document
              </button>
              <button 
                onClick={() => alert(`Initiating mock secure file transmission for: ${t.title}`)}
                className="p-1.5 bg-lime-500 hover:bg-lime-600 text-zinc-950 border border-lime-400 hover:border-lime-500 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                title="Download Template"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="font-bold text-sm text-gray-900">Live AIAG Document Preview</span>
              <button 
                onClick={() => setSelectedPreview(null)}
                className="text-xs hover:text-red-500 cursor-pointer font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-gray-950 text-xs sm:text-sm">{selectedPreview}</h4>
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl font-mono text-[10px] text-gray-500 space-y-1">
                <p className="font-bold text-gray-800">[SECURE PREVIEW HEADER - AUTOMOTIVE SYSTEM CORE]</p>
                <p>MAPPED EXCEL FIELD: A1: PSW Warrant Title</p>
                <p>MAPPED EXCEL FIELD: A2: Part No: MS-SB-8009</p>
                <p>MAPPED EXCEL FIELD: A3: Approved By: Corporate Quality Hub</p>
                <p>MAPPED EXCEL FIELD: B1: Metrology Tolerance Matrix (Cpk Checksums Verified)</p>
                <p className="text-lime-600">✓ Digital Signature Verification: APPROVED (SHA-256 Validated)</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button 
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
              <button 
                onClick={() => {
                  alert(`Downloading ${selectedPreview}`);
                  setSelectedPreview(null);
                }}
                className="px-4 py-2 bg-zinc-950 text-white rounded-xl cursor-pointer font-bold hover:bg-zinc-800"
              >
                Download Excel File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. PPAP OEM SUBMISSION DEMANDS / REQUESTS
// ==========================================
export function PPAPRequests() {
  const [requests, setRequests] = useState([
    { id: 'REQ-412', oem: 'Tesla Inc.', component: 'Model 3/Y Front Subframe Casting', level: 'Level 3', deadline: '2026-08-01', status: 'In Review' },
    { id: 'REQ-889', oem: 'Ford Motor Co.', component: 'Mach-E battery structural studs', level: 'Level 1', deadline: '2026-07-28', status: 'Awaiting Files' },
    { id: 'REQ-012', oem: 'Rivian Automotive', component: 'R1S suspension assembly link', level: 'Level 5', deadline: '2026-09-15', status: 'Draft' },
  ]);

  const handleAction = (id: string, action: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold font-display text-gray-950">OEM PPAP Demands Portal</h2>
        <p className="text-xs text-gray-400 mt-1">Monitor and respond to incoming Part Submission Warrant (PSW) requests from OEM customers.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((r) => (
          <div key={r.id} className="p-5 border border-gray-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/10 hover:shadow-xs transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-400">{r.id}</span>
                <span className="text-[10px] font-bold font-mono text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded uppercase">{r.oem}</span>
                <span className="text-[10px] font-bold font-mono text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase">{r.level} SUBMISSION</span>
              </div>
              <h4 className="font-bold text-gray-950 text-sm">{r.component}</h4>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Deadline target: <strong>{r.deadline}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold border px-3 py-1 rounded-full uppercase ${
                r.status === 'In Review' 
                  ? 'bg-amber-50 text-amber-700 border-amber-100' 
                  : r.status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : r.status === 'Awaiting Files'
                      ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                      : 'bg-slate-100 text-slate-700 border-gray-200'
              }`}>
                {r.status}
              </span>

              {r.status === 'Awaiting Files' && (
                <button 
                  onClick={() => handleAction(r.id, 'In Review')}
                  className="px-3 py-1 bg-zinc-950 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
                >
                  Upload PSW Package
                </button>
              )}

              {r.status === 'In Review' && (
                <button 
                  onClick={() => handleAction(r.id, 'Approved')}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 border border-emerald-400 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Approve Sign-off
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 7. PPAP USER / ENGINEER ASSIGNMENTS
// ==========================================
export function PPAPUserAssignment() {
  const [assignments, setAssignments] = useState([
    { part: 'AlSi10Mg Casting Housing', customer: 'Tesla Gigafactory', engineer: 'Sarah Jenkins', avatar: 'SJ', email: 'sarah.j@mfrquality.com', status: 'Lead Auditor' },
    { part: 'Battery Crossmember Structural', customer: 'Rivian Normal Plant', engineer: 'Dave Kowalski', avatar: 'DK', email: 'dave.k@mfrquality.com', status: 'Audit Pending' },
    { part: 'EV Inverter Controller Board', customer: 'Lucid Motors Plant 1', engineer: 'Emma Watson', avatar: 'EW', email: 'emma.w@mfrquality.com', status: 'Lead Auditor' },
  ]);

  const [partInput, setPartInput] = useState('');
  const [customerInput, setCustomerInput] = useState('Tesla Gigafactory');
  const [engineerInput, setEngineerInput] = useState('Sarah Jenkins');

  const engineers = [
    { name: 'Sarah Jenkins', avatar: 'SJ', email: 'sarah.j@mfrquality.com' },
    { name: 'Dave Kowalski', avatar: 'DK', email: 'dave.k@mfrquality.com' },
    { name: 'Emma Watson', avatar: 'EW', email: 'emma.w@mfrquality.com' },
  ];

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partInput.trim()) return;
    const selectedEng = engineers.find(e => e.name === engineerInput)!;
    const newAssignment = {
      part: partInput,
      customer: customerInput,
      engineer: selectedEng.name,
      avatar: selectedEng.avatar,
      email: selectedEng.email,
      status: 'Lead Auditor'
    };
    setAssignments([...assignments, newAssignment]);
    setPartInput('');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50 pb-4">
        <div>
          <h2 className="text-lg font-bold font-display text-gray-950">Warrant Engineering Assignment</h2>
          <p className="text-xs text-gray-400 mt-1">Assign lead quality auditors to oversee level-specific PPAP document compilations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment grid */}
        <div className="lg:col-span-2 space-y-3">
          {assignments.map((a, idx) => (
            <div key={idx} className="p-4 border border-gray-150 rounded-2xl flex items-center justify-between gap-4 bg-slate-50/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-950 text-lime-400 font-mono text-xs font-extrabold border border-zinc-800 flex items-center justify-center">
                  {a.avatar}
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-xs sm:text-sm block">{a.part}</span>
                  <span className="text-[11px] text-gray-400 block">{a.customer}</span>
                </div>
              </div>

              <div className="text-right text-xs shrink-0">
                <span className="font-bold text-gray-950 block">{a.engineer}</span>
                <span className="text-[10px] text-zinc-400 block font-mono">{a.email}</span>
                <span className="text-[9px] bg-lime-50 text-lime-800 font-semibold border border-lime-200 px-2 py-0.2 rounded-full inline-block mt-1 font-mono uppercase">{a.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Assignment Form panel */}
        <div className="bg-slate-50/60 border border-gray-150 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-lime-600" /> Delegate Component Lead
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Link component specifications to verified, ASQ-certified lead Quality Assurance personnel.
          </p>

          <form onSubmit={handleAssign} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Component name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. AlSi10Mg Cast Front Hub" 
                value={partInput}
                onChange={(e) => setPartInput(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Customer / Plant</label>
              <select 
                value={customerInput}
                onChange={(e) => setCustomerInput(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              >
                <option value="Tesla Gigafactory">Tesla Gigafactory</option>
                <option value="Rivian Normal Plant">Rivian Normal Plant</option>
                <option value="Lucid Motors Plant 1">Lucid Motors Plant 1</option>
                <option value="Ford Flat Rock Plant">Ford Flat Rock Plant</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Lead Quality Engineer</label>
              <select 
                value={engineerInput}
                onChange={(e) => setEngineerInput(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-lime-500"
              >
                {engineers.map((e) => (
                  <option key={e.name} value={e.name}>{e.name} ({e.avatar})</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
            >
              Assign Engineer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. PPAP MASS BULK DOWNLOAD CONSOLE
// ==========================================
export function PPAPMassDownload() {
  const [selectedDocs, setSelectedDocs] = useState<string[]>(['psw', 'fmea', 'cp']);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const docOptions = [
    { id: 'psw', label: 'Part Submission Warrant (PSW)', desc: 'AIAG standard signature validation warrant.' },
    { id: 'fmea', label: 'Failure Mode Effects Analysis (FMEA)', desc: 'Risk worksheets capturing process failure modes.' },
    { id: 'cp', label: 'Manufacturing Process Control Plan (CP)', desc: 'Standard inspection layout and metrology specs.' },
    { id: 'msa', label: 'Measurement Systems Analysis (Gage R&R)', desc: 'Variance study analyzing reproducibility indexes.' },
    { id: 'dim', label: 'Dimensional Metrology Layout Study', desc: 'Metrology records verifying drawing tolerances.' },
  ];

  const handleToggle = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDownload = () => {
    if (selectedDocs.length === 0) return;
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(p => {
        if (p === null) return 0;
        if (p >= 100) {
          clearInterval(interval);
          alert(`Mass Document compilation successfully completed! PPAP_SecureArchive.zip is ready.`);
          return null;
        }
        return p + 10;
      });
    }, 150);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold font-display text-gray-950">Bulk PPAP Documentation Compiler</h2>
        <p className="text-xs text-gray-400 mt-1">Compile and export secure level warrant packages in pre-packaged ZIP archives.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document checklists */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs text-gray-950 uppercase tracking-wide">Select Warrants & Supporting Evidence</h3>
          <div className="space-y-2.5">
            {docOptions.map((opt) => {
              const isChecked = selectedDocs.includes(opt.id);
              return (
                <div 
                  key={opt.id} 
                  onClick={() => handleToggle(opt.id)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                    isChecked 
                      ? 'bg-lime-50/40 border-lime-300 shadow-xs' 
                      : 'bg-white border-gray-150 hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                    isChecked 
                      ? 'bg-lime-500 border-lime-500 text-zinc-950' 
                      : 'border-gray-300'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 font-bold" />}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isChecked ? 'text-gray-950' : 'text-gray-800'}`}>{opt.label}</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5 leading-normal">{opt.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export compiler action */}
        <div className="border border-gray-150 p-6 rounded-2xl flex flex-col justify-between space-y-6 bg-slate-50/30">
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-gray-950 uppercase tracking-wide">Secure Export Engine</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Export builds a digital SHA-256 seal across each FMEA and dimensional metrology workbook to prevent downstream tampering. Files are bundled in one production zip.
            </p>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-white font-mono text-[10px]">
              <p className="text-lime-400 font-bold">• ARCHIVE CONTROLLER ACTIVE</p>
              <p>MAPPED BUNDLE SIZE: {selectedDocs.length} files selected</p>
              <p>STATUS: Ready for secure payload creation</p>
            </div>
          </div>

          <div>
            {downloadProgress !== null ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-gray-700">Compiling Payload ZIP...</span>
                  <span className="font-mono text-lime-600">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-lime-500 h-full transition-all duration-150 ease-out rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                disabled={selectedDocs.length === 0}
                onClick={handleDownload}
                className={`w-full py-3.5 rounded-xl text-center font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  selectedDocs.length > 0 
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white' 
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" /> Build & Download Secure ZIP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. PPAP PERFORMANCE ANALYTICS / REPORTS
// ==========================================
export function PPAPReports() {
  const metrics = [
    { title: 'First-time Pass Rate', value: '94.2%', change: '+1.8% since Q1', detail: 'Based on last 120 Level-3 submissions' },
    { title: 'Average Sign-off Delay', value: '4.8 Days', change: '-1.2 Days improvement', detail: 'Days from SQE upload to OEM signature' },
    { title: 'Outstanding Demands', value: '3 Pending', change: 'All within SLA bounds', detail: 'Tesla (1), Ford (1), Rivian (1)' },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold font-display text-gray-950">PPAP Performance Reports</h2>
        <p className="text-xs text-gray-400 mt-1">Real-time warrant sign-off speeds, validation pass rates, and compliance trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {metrics.map((m) => (
          <div key={m.title} className="bg-slate-50/50 border border-gray-150 p-5 rounded-2xl space-y-1.5 hover:shadow-xs transition-shadow">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">{m.title}</span>
            <p className="text-2xl font-bold font-display text-gray-900">{m.value}</p>
            <p className="text-[11px] text-lime-600 font-medium font-mono">{m.change}</p>
            <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-100 mt-2">{m.detail}</p>
          </div>
        ))}
      </div>

      {/* Visual Bar representation using HTML elements */}
      <div className="border border-gray-150 p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-xs text-gray-950 uppercase tracking-wide">Submission Status Distributions</h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1 font-semibold text-gray-700">
              <span>Full Approval (PSW Completed)</span>
              <span className="font-mono text-emerald-600">88%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 font-semibold text-gray-700">
              <span>Interim Approval (Temporary Shipment Authorized)</span>
              <span className="font-mono text-amber-600">8%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '8%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 font-semibold text-gray-700">
              <span>Rejected / Pending Corrective Action</span>
              <span className="font-mono text-rose-600">4%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: '4%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
