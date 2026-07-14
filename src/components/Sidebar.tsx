import React, { useState, useEffect } from 'react';
import { 
  Box, Truck, Layers, Save, Activity, X, ChevronDown, ChevronLeft, ChevronRight, Users
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const [isPpapExpanded, setIsPpapExpanded] = useState<boolean>(false);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState<boolean>(false);
  const [isUserManagementExpanded, setIsUserManagementExpanded] = useState<boolean>(false);

  // Auto-expand PPAP or User Management if any sub-tab is active
  useEffect(() => {
    if (activeTab.startsWith('ppap')) {
      setIsPpapExpanded(true);
    }
    if (activeTab.startsWith('user-management')) {
      setIsUserManagementExpanded(true);
    }
  }, [activeTab]);
  
  const SIDEBAR_ITEMS = [
    { id: 'product', label: 'Product', icon: Box, plus: true },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, plus: true },
    { id: 'apqp-new', label: 'APQP', icon: Layers, plus: true },
    { id: 'ppap', label: 'PPAP', icon: Save, plus: false },
    { id: 'user-management', label: 'User Management', icon: Users, plus: false },
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
      <nav className="flex-1 py-3 px-2 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isMainPpapActive = activeTab.startsWith('ppap');
          const isMainUserManagementActive = activeTab.startsWith('user-management');
          const isActive = item.id === 'ppap' 
            ? isMainPpapActive 
            : item.id === 'user-management'
              ? isMainUserManagementActive
              : activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (item.id === 'ppap') {
                    setIsPpapExpanded(!isPpapExpanded);
                    // Also switch to default dashboard when opening/selecting PPAP category
                    onTabChange('ppap-dashboard');
                  } else if (item.id === 'user-management') {
                    setIsUserManagementExpanded(!isUserManagementExpanded);
                    onTabChange('user-management-users');
                  } else {
                    onTabChange(item.id);
                  }
                  // On mobile, auto close sidebar after selection (except for expandable items)
                  if (window.innerWidth < 768 && item.id !== 'ppap' && item.id !== 'user-management') {
                    onClose();
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-left cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-sm border-l-2 border-lime-500' 
                    : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {/* Left Side: Icon + Label */}
                <div className="flex items-center gap-3">
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

                {/* Right Side: Plus or Expand Arrow */}
                {item.id === 'ppap' ? (
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                    isPpapExpanded ? 'rotate-180' : ''
                  }`} />
                ) : item.id === 'user-management' ? (
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                    isUserManagementExpanded ? 'rotate-180' : ''
                  }`} />
                ) : item.plus ? (
                  <div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center transition-colors duration-200 shadow-sm shrink-0">
                    <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-300 font-mono">+</span>
                  </div>
                ) : null}
              </button>

              {/* Nested User Management Submenu */}
              {item.id === 'user-management' && isUserManagementExpanded && (
                <div className="mt-1 ml-4 mr-1 pl-1.5 py-2 space-y-1.5 rounded-xl border border-zinc-900/80 bg-zinc-950/40 animate-fadeIn transition-all">
                  {[
                    { id: 'user-management-users', label: 'Users' },
                    { id: 'user-management-roles', label: 'Roles' },
                    { id: 'user-management-menus', label: 'Menus' },
                  ].map((subItem) => {
                    const isSubActive = activeTab === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTabChange(subItem.id);
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          isSubActive 
                            ? 'text-white font-semibold' 
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-3.5 h-[3px] rounded-full shrink-0 mr-2.5 ${
                            isSubActive ? 'bg-lime-500' : 'bg-zinc-600'
                          }`} />
                          <span className="font-sans text-xs tracking-tight">{subItem.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Nested PPAP Submenu Matching Screenshot */}
              {item.id === 'ppap' && isPpapExpanded && (
                <div className="mt-1 ml-4 mr-1 pl-1.5 py-2 space-y-1.5 rounded-xl border border-zinc-900/80 bg-zinc-950/40 animate-fadeIn transition-all">
                  
                  {/* Library Subcategory */}
                  <div className="space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLibraryExpanded(!isLibraryExpanded);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        activeTab.startsWith('ppap-library') 
                          ? 'text-white font-semibold' 
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-3.5 h-[3px] rounded-full shrink-0 mr-2.5 ${
                          activeTab.startsWith('ppap-library') ? 'bg-lime-500' : 'bg-zinc-600'
                        }`} />
                        <span className="font-sans text-xs tracking-tight">Library</span>
                      </div>
                      
                      <ChevronLeft className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${
                        isLibraryExpanded ? '-rotate-90' : ''
                      }`} />
                    </button>

                    {/* Library Indented Children */}
                    {isLibraryExpanded && (
                      <div className="mt-1 space-y-1 pl-1">
                        {[
                          { id: 'ppap-library-reason', label: 'Reason' },
                          { id: 'ppap-library-reject-reason', label: 'Reject Reason' },
                          { id: 'ppap-library-interim-status', label: 'Interim Status' },
                          { id: 'ppap-library-roles', label: 'PPAP Roles' },
                        ].map((child) => {
                          const isChildActive = activeTab === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onTabChange(child.id);
                                if (window.innerWidth < 768) onClose();
                              }}
                              className={`w-full flex items-center px-3.5 py-1 rounded-lg text-left text-[11px] transition-colors cursor-pointer ${
                                isChildActive 
                                  ? 'text-lime-400 font-bold' 
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              <div className={`w-2 h-[2px] rounded-full shrink-0 mr-2.5 ml-3 ${
                                isChildActive ? 'bg-lime-400' : 'bg-zinc-700/80'
                              }`} />
                              <span className="font-sans">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sister Items: Templates, Requests, User Assignment, Mass Download, Dashboard, Reports */}
                  {[
                    { id: 'ppap-templates', label: 'Templates' },
                    { id: 'ppap-requests', label: 'Requests' },
                    { id: 'ppap-user-assignment', label: 'User Assignment' },
                    { id: 'ppap-mass-download', label: 'Mass Download' },
                    { id: 'ppap-dashboard', label: 'Dashboard' },
                    { id: 'ppap-reports', label: 'Reports', hasArrow: true }
                  ].map((subItem) => {
                    const isSubActive = activeTab === subItem.id || (subItem.id === 'ppap-dashboard' && activeTab === 'ppap');
                    return (
                      <button
                        key={subItem.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTabChange(subItem.id);
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          isSubActive 
                            ? 'text-white font-semibold' 
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-3.5 h-[3px] rounded-full shrink-0 mr-2.5 ${
                            isSubActive ? 'bg-lime-500' : 'bg-zinc-600'
                          }`} />
                          <span className="font-sans text-xs tracking-tight">{subItem.label}</span>
                        </div>

                        {subItem.hasArrow && (
                          <ChevronRight className="w-3 h-3 text-zinc-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
