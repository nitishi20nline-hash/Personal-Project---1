import React, { useState } from 'react';
import { APQPProject } from '../types';
import { Plus, Trash2, Calendar, FileText, ArrowRight, Layers, UserCheck } from 'lucide-react';

interface ProjectListProps {
  projects: APQPProject[];
  onCreateProject: (project: {
    name: string;
    partNumber: string;
    customer: string;
    status: APQPProject['status'];
    launchDate: string;
  }) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (id: string) => void;
}

export default function ProjectList({
  projects,
  onCreateProject,
  onDeleteProject,
  onSelectProject
}: ProjectListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [status, setStatus] = useState<APQPProject['status']>('Planning');
  const [launchDate, setLaunchDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !partNumber || !customer) return;
    
    onCreateProject({
      name,
      partNumber,
      customer,
      status,
      launchDate
    });

    // Reset Form
    setName('');
    setPartNumber('');
    setCustomer('');
    setStatus('Planning');
    setLaunchDate('');
    setShowCreateForm(false);
  };

  const filteredProjects = filterStatus === 'All' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  const statuses: APQPProject['status'][] = ['Planning', 'Design', 'ProcessDev', 'Validation', 'Production', 'Completed'];

  return (
    <div className="space-y-6" id="project-list-panel">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">
            APQP Quality Programs
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Advanced Product Quality Planning portal for automotive and aerospace manufacturing programs.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-250 inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
          id="btn-new-project"
        >
          <Plus className="w-4 h-4" /> Initialize Project
        </button>
      </div>

      {/* Initialize Form (Drawer/Card) */}
      {showCreateForm && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 shadow-sm animate-fadeIn" id="create-project-form">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200/50 pb-3">
            <h3 className="font-bold font-display text-slate-800 text-lg">Initialize New APQP Program</h3>
            <button 
              onClick={() => setShowCreateForm(false)} 
              className="text-xs text-slate-400 hover:text-slate-600 font-mono"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Program Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Model Y Steering Bracket Assembly"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Part Number / Code</label>
              <input
                type="text"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="e.g. MS-SB-8009"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">End Customer</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Prime Aerospace Group"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">APQP Initial Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as APQPProject['status'])}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono font-semibold text-slate-500 uppercase">Target PPAP Launch Date</label>
              <input
                type="date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Launch Quality Program Checklist & FMEA
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 bg-gray-50 border border-gray-100 p-1.5 rounded-xl self-start">
        <button
          onClick={() => setFilterStatus('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors cursor-pointer ${
            filterStatus === 'All' ? 'bg-white text-gray-900 shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          All Programs
        </button>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors cursor-pointer ${
              filterStatus === s ? 'bg-white text-gray-900 shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-55/20 space-y-3">
            <Layers className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-gray-600 font-medium font-display">No APQP Quality Programs Found</p>
            <p className="text-xs text-gray-400">Initialize a new APQP project to launch PPAP and FMEA workspaces.</p>
          </div>
        ) : (
          filteredProjects.map(proj => (
            <div 
              key={proj.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
              id={`project-card-${proj.id}`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full uppercase border ${
                    proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    proj.status === 'Validation' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    proj.status === 'ProcessDev' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    proj.status === 'Design' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {proj.status}
                  </span>
                  
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete program"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 font-display text-lg tracking-tight group-hover:text-blue-600">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Part No: {proj.partNumber}</p>
                </div>
              </div>

              {/* Specs Details */}
              <div className="border-t border-b border-gray-50 py-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono uppercase tracking-wider text-[10px]">Customer:</span>
                  <span className="font-semibold text-gray-800">{proj.customer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Target PPAP:
                  </span>
                  <span className="font-semibold text-gray-800 font-mono">{proj.launchDate || 'N/A'}</span>
                </div>
              </div>

              {/* Project Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-500">
                  <span>Program Completeness</span>
                  <span className="font-bold text-gray-800">{proj.progress}%</span>
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

              {/* Action */}
              <button
                onClick={() => onSelectProject(proj.id)}
                className="w-full bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 border border-slate-200 hover:border-blue-600 text-xs font-bold font-mono py-2.5 px-4 rounded-xl tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Quality Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
