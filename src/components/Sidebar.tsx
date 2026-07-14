import React from 'react';
import { 
  Box, Truck, Layers, Save, Activity, X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  
  const SIDEBAR_ITEMS = [
    { id: 'product', label: 'Product', icon: Box, plus: true },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, plus: true },
    { id: 'apqp-new', label: 'APQP', icon: Layers, plus: true },
    { id: 'ppap', label: 'PPAP', icon: Save, plus: true },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 md:sticky md:z-0 w-72 bg-black text-zinc-300 flex flex-col shrink-0 h-screen overflow-y-auto border-r border-zinc-900 scrollbar-none transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
    }`}>
      
      {/* Sidebar Brand Header */}
      <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl">
            <Layers className="w-5 h-5 text-lime-500 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-white font-display text-base tracking-tight leading-none block">Empower QLM</span>
            <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase tracking-wider block mt-1">
              MFR Quality System
            </span>
          </div>
        </div>

        {/* Close button for mobile/collapsible view */}
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                // On mobile, auto close sidebar after selection
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-left cursor-pointer ${
                isActive 
                  ? 'bg-zinc-900/90 text-white shadow-sm border-l-2 border-lime-500' 
                  : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Left Side: Icon + Label + Optional Badge */}
              <div className="flex items-center gap-3">
                {/* Icon Container with screenshot matching active highlight color */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 border ${
                  isActive 
                    ? 'bg-lime-500 border-lime-400 text-white' 
                    : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 group-hover:text-zinc-200'
                }`}>
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-zinc-950 font-bold' : 'text-zinc-300'}`} />
                </div>
                
                <span className={`text-sm font-sans tracking-tight ${
                  isActive ? 'font-semibold text-white' : 'font-medium'
                }`}>
                  {item.label}
                </span>
              </div>

              {/* Right Side: Square with Plus Symbol (+), matching screenshot */}
              {item.plus && (
                <div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center transition-colors duration-200 shadow-sm shrink-0">
                  <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-300 font-mono">+</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950 text-center space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase">
          <Activity className="w-3 h-3 text-lime-500 animate-pulse" />
          Gateway Active: Level 3
        </div>
      </div>

    </div>
  );
}
