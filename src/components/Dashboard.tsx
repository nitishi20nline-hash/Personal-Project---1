import React from 'react';
import { APQPProject, FMEAItem, PPAPElement, CAPALog } from '../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, Play, Calendar, User, FileText, ArrowUpRight, Activity } from 'lucide-react';

interface DashboardProps {
  projects: APQPProject[];
  fmea: FMEAItem[];
  ppap: PPAPElement[];
  capa: CAPALog[];
  onNavigate: (tab: 'projects' | 'capa' | 'dashboard') => void;
  onSelectProject: (projId: string) => void;
}

export default function Dashboard({
  projects,
  fmea,
  ppap,
  capa,
  onNavigate,
  onSelectProject
}: DashboardProps) {
  // Calculations
  const activeProjects = projects.filter(p => p.status !== 'Completed').length;
  
  // High risk FMEA (RPN >= 150)
  const highRiskFmeaCount = fmea.filter(f => f.rpn >= 150).length;

  // PPAP approval rate
  const totalPpap = ppap.length;
  const approvedPpap = ppap.filter(p => p.status === 'Approved').length;
  const ppapApprovalRate = totalPpap > 0 ? Math.round((approvedPpap / totalPpap) * 100) : 0;

  // Open CAPAs
  const openCapas = capa.filter(c => c.status !== 'Closed');
  const openCapasCount = openCapas.length;
  const criticalCapaCount = openCapas.filter(c => c.severity === 'Critical' || c.severity === 'High').length;

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900 tracking-tight flex items-center gap-2">
            Quality Lifecycle Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enterprise QLM Portal: APQP Planning, FMEA Risk Assessments, PPAP Submission Sign-offs, and CAPA Operations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full font-mono font-medium">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          SYSTEM STATUS: AUDIT READY
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div 
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group"
          onClick={() => onNavigate('projects')}
          id="kpi-apqp"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold font-mono text-gray-400 tracking-wider uppercase">Active APQP Projects</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-display text-gray-900">{activeProjects}</span>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>{projects.length} Total tracked</span>
              <span className="text-gray-300">•</span>
              <span className="text-blue-600 group-hover:underline inline-flex items-center gap-0.5">
                View All <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div 
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group"
          onClick={() => onNavigate('projects')}
          id="kpi-ppap"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold font-mono text-gray-400 tracking-wider uppercase">PPAP Approvals</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-display text-gray-900">{ppapApprovalRate}%</span>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>{approvedPpap}/{totalPpap} Approved elements</span>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-600 font-medium">Stage 4 Validated</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div 
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group"
          id="kpi-fmea"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold font-mono text-gray-400 tracking-wider uppercase">Critical FMEA Risks</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-display text-gray-900">{highRiskFmeaCount}</span>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-amber-700 font-medium font-mono">RPN ≥ 150</span>
              <span className="text-gray-300">•</span>
              <span>Needs mitigation actions</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div 
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group"
          onClick={() => onNavigate('capa')}
          id="kpi-capa"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold font-mono text-gray-400 tracking-wider uppercase">Open CAPAs</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-display text-gray-900">{openCapasCount}</span>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-rose-700 font-semibold">{criticalCapaCount} Critical/High</span>
              <span className="text-gray-300">•</span>
              <span className="text-rose-600 group-hover:underline inline-flex items-center gap-0.5">
                Investigate <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active APQP Project Tracking Progress */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="active-apqp-tracking">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-display text-gray-900">Active APQP Milestones</h3>
              <button 
                onClick={() => onNavigate('projects')} 
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Manage Projects
              </button>
            </div>
            
            <div className="space-y-4">
              {projects.map(proj => {
                const projPpap = ppap.filter(p => p.projectId === proj.id);
                const approved = projPpap.filter(p => p.status === 'Approved').length;
                const total = projPpap.length || 8;
                
                return (
                  <div 
                    key={proj.id} 
                    className="border border-gray-50 rounded-xl p-4 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer group/item"
                    onClick={() => onSelectProject(proj.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover/item:text-blue-600 transition-colors duration-150">{proj.name}</h4>
                        <p className="text-xs text-gray-400 font-mono">PN: {proj.partNumber} | Customer: {proj.customer}</p>
                      </div>
                      <div className="flex items-center gap-1.5 self-start sm:self-center">
                        <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full font-semibold ${
                          proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          proj.status === 'Validation' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          proj.status === 'ProcessDev' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          proj.status === 'Design' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                        <span>PPAP Checkpoints: {approved}/{total} Approved</span>
                        <span className="font-bold">{proj.progress}% Progress</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            proj.progress >= 80 ? 'bg-emerald-500' :
                            proj.progress >= 50 ? 'bg-blue-500' :
                            proj.progress >= 25 ? 'bg-amber-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${proj.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-5 pt-4 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400">
              * APQP project progress adapts dynamically as elements are completed and PPAP deliverables are verified and signed off.
            </p>
          </div>
        </div>

        {/* Right Column: Open Critical Defects & CAPA Actions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="active-capas-tracking">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-display text-gray-900">Active Quality Actions (CAPA)</h3>
              <button 
                onClick={() => onNavigate('capa')} 
                className="text-xs text-rose-600 hover:underline font-medium"
              >
                View Log
              </button>
            </div>

            <div className="space-y-3">
              {openCapas.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">All CAPAs Closed</p>
                  <p className="text-xs text-gray-400 mt-0.5">No active open defects tracked.</p>
                </div>
              ) : (
                openCapas.slice(0, 3).map(c => (
                  <div 
                    key={c.id} 
                    className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                    onClick={() => onNavigate('capa')}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                        c.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        c.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {c.severity} Priority
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{c.createdAt}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.defectDescription}</p>
                    
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {c.owner}
                      </span>
                      <span className="text-blue-600 font-medium px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-[10px]">
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-700">Next Internal Audit</p>
                <p className="text-gray-500 mt-0.5">Scheduled for July 28, 2026. Review all DFMEAs & PSW warrants.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Education Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden" id="qlm-guidance-banner">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 w-72 h-72 rounded-full border-[20px] border-white"></div>
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono tracking-widest text-blue-400 uppercase font-bold bg-blue-950 border border-blue-800 px-2.5 py-1 rounded-full">
            Methodology Primer
          </span>
          <h3 className="text-xl font-bold font-display">The QLM Core Pillars</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            QLM structures standard quality planning and responsiveness in advanced manufacturing. 
            <strong> APQP</strong> manages products from planning down to start of production. 
            <strong> FMEA</strong> analyzes process safety risks by combining Severity, Occurrence, and Detection indices into a Risk Priority Number (RPN). 
            <strong> PPAP</strong> compiles structural verification documents to lock in part warrants, and 
            <strong> CAPA</strong> uses systemic 5-Whys root cause isolation to prevent defect recurrences.
          </p>
        </div>
      </div>
    </div>
  );
}
