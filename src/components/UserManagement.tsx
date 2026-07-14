import React, { useState } from 'react';
import { 
  Plus, Search, UserPlus, Mail, MoreVertical, Check, X, Shield, Lock, 
  Settings, Layers, ChevronDown, CheckCircle, HelpCircle, Save, Info, Key, Edit, Trash,
  Users, Truck
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  username: string;
  contact: string;
  isAdmin: boolean;
  role: string;
  userViews: string;
  facility: string;
  createdOn: string;
  email: string;
}

interface Role {
  name: string;
  description: string;
}

interface MenuPermission {
  subMenu: string;
  permission: 'Read' | 'Write' | 'Modify' | 'All' | 'None';
  isEnabled: boolean;
}

// Initial Mock Data matching screenshots
const INITIAL_ROLES: Role[] = [
  { name: 'Administrator', description: 'Full system control, users authorization, security definitions, and configuration overrides.' },
  { name: 'Quality Manager', description: 'Signs off Part Submission Warrants, registers reject defect codes, and configures APQP timelines.' },
  { name: 'Supplier Engineer', description: 'Prepares and uploads PPAP documents, metrology studies, and chemical reports.' },
  { name: 'Viewer', description: 'Read-only access across the quality lifecycle and performance reporting portals.' }
];

const INITIAL_USERS: User[] = [
  {
    id: 'USR-1',
    fullName: 'Admin User',
    username: 'User',
    contact: '1234567890',
    isAdmin: true,
    role: 'Administrator',
    userViews: 'All',
    facility: '',
    createdOn: '2026-07-14',
    email: 'admin@mfrquality.com'
  },
  {
    id: 'USR-2',
    fullName: 'Sarah Jenkins',
    username: 'sjenkins',
    contact: '9876543210',
    isAdmin: false,
    role: 'Quality Manager',
    userViews: 'PPAP, APQP',
    facility: 'Detroit Giga 1',
    createdOn: '2026-07-10',
    email: 'sarah.j@mfrquality.com'
  }
];

const INITIAL_PERMISSIONS: Record<string, MenuPermission[]> = {
  'Administrator': [
    { subMenu: 'Users', permission: 'All', isEnabled: true },
    { subMenu: 'Suppliers', permission: 'All', isEnabled: true },
    { subMenu: 'Dealers', permission: 'All', isEnabled: true },
    { subMenu: 'Roles', permission: 'All', isEnabled: true },
    { subMenu: 'Menus', permission: 'All', isEnabled: true }
  ],
  'Quality Manager': [
    { subMenu: 'Users', permission: 'Read', isEnabled: true },
    { subMenu: 'Suppliers', permission: 'Modify', isEnabled: true },
    { subMenu: 'Dealers', permission: 'Read', isEnabled: true },
    { subMenu: 'Roles', permission: 'Read', isEnabled: true },
    { subMenu: 'Menus', permission: 'Read', isEnabled: false }
  ],
  'Supplier Engineer': [
    { subMenu: 'Users', permission: 'None', isEnabled: false },
    { subMenu: 'Suppliers', permission: 'Write', isEnabled: true },
    { subMenu: 'Dealers', permission: 'None', isEnabled: false },
    { subMenu: 'Roles', permission: 'None', isEnabled: false },
    { subMenu: 'Menus', permission: 'None', isEnabled: false }
  ]
};

// ==========================================
// MAIN EXPORTED COMPONENT FOR SWITCHING SUB-TABS
// ==========================================
interface UserManagementProps {
  subTab: 'users' | 'roles' | 'menus';
}

export default function UserManagement({ subTab }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [permissions, setPermissions] = useState<Record<string, MenuPermission[]>>(INITIAL_PERMISSIONS);

  // Users views state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Users form state
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [emailId, setEmailId] = useState('');
  const [contact, setContact] = useState('');
  const [userRole, setUserRole] = useState('Administrator');

  // Roles views state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');

  // Menus state
  const [selectedRoleForMenus, setSelectedRoleForMenus] = useState('Administrator');
  const [activeMenuAccordion, setActiveMenuAccordion] = useState(true);
  const [localPermissions, setLocalPermissions] = useState<MenuPermission[]>(
    INITIAL_PERMISSIONS['Administrator']
  );

  // Sync menu state when role changes
  const handleRoleChangeForMenus = (role: string) => {
    setSelectedRoleForMenus(role);
    const existingPerms = permissions[role] || [
      { subMenu: 'Users', permission: 'Read', isEnabled: false },
      { subMenu: 'Suppliers', permission: 'Read', isEnabled: false },
      { subMenu: 'Dealers', permission: 'Read', isEnabled: false },
      { subMenu: 'Roles', permission: 'Read', isEnabled: false },
      { subMenu: 'Menus', permission: 'Read', isEnabled: false }
    ];
    setLocalPermissions(existingPerms);
  };

  const handleSaveMenuPermissions = () => {
    setPermissions(prev => ({
      ...prev,
      [selectedRoleForMenus]: [...localPermissions]
    }));
    alert(`Success: Menu authorization permissions saved for role "${selectedRoleForMenus}"!`);
  };

  const handleToggleSubMenuEnabled = (index: number) => {
    const updated = [...localPermissions];
    updated[index].isEnabled = !updated[index].isEnabled;
    if (updated[index].isEnabled && updated[index].permission === 'None') {
      updated[index].permission = 'Read';
    }
    setLocalPermissions(updated);
  };

  const handleChangeSubMenuPermission = (index: number, value: 'Read' | 'Write' | 'Modify' | 'All') => {
    const updated = [...localPermissions];
    updated[index].permission = value;
    updated[index].isEnabled = true;
    setLocalPermissions(updated);
  };

  // Add User action
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !firstName || !lastName || !password || !emailId || !userRole) {
      alert('Please fill out all mandatory fields!');
      return;
    }

    const newUser: User = {
      id: `USR-${users.length + 1}`,
      fullName: `${firstName} ${lastName}`,
      username: username,
      contact: contact || '-',
      isAdmin: userRole === 'Administrator',
      role: userRole,
      userViews: userRole === 'Administrator' ? 'All' : 'PPAP, APQP',
      facility: 'Detroit Giga 1',
      createdOn: new Date().toISOString().split('T')[0],
      email: emailId
    };

    setUsers([newUser, ...users]);
    setIsUserModalOpen(false);
    
    // Reset form
    setUsername('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setEmailId('');
    setContact('');
    setUserRole('Administrator');
  };

  // Add Role action
  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) {
      alert('Please specify the Role Name!');
      return;
    }

    const newRole: Role = {
      name: roleName,
      description: roleDesc || 'No description listed.'
    };

    setRoles([...roles, newRole]);
    setIsRoleModalOpen(false);

    // Reset form
    setRoleName('');
    setRoleDesc('');
  };

  // Search filter
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. USERS VIEW
          ======================================================== */}
      {subTab === 'users' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
          {/* Main Title Block */}
          <div className="flex items-center gap-2.5 border-b border-gray-150 pb-4">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-gray-955">User Registry Database</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage system operators, login permissions, and digital security credentials across the QLM ecosystem.</p>
            </div>
          </div>

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input 
                type="text" 
                placeholder="Search Users..." 
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:border-[#0ea5e9] w-full font-sans bg-slate-50/50"
              />
            </div>

            {/* Custom Vertical styled Add Button from screenshot */}
            <button 
              onClick={() => setIsUserModalOpen(true)}
              className="flex flex-col items-center justify-center text-[#0ea5e9] hover:text-sky-600 transition-colors cursor-pointer self-end sm:self-auto px-4"
              id="add-user-btn"
            >
              <UserPlus className="w-6 h-6 text-[#0ea5e9]" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Add</span>
            </button>
          </div>

          {/* User Table matching screenshot style */}
          <div className="overflow-x-auto border border-gray-150 rounded-xl">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-gray-150 font-bold">
                <tr>
                  <th className="p-3.5 w-12 text-center">Status</th>
                  <th className="p-3.5">User Details</th>
                  <th className="p-3.5">UserName</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5 text-center">Admin</th>
                  <th className="p-3.5">Roles</th>
                  <th className="p-3.5">User Views</th>
                  <th className="p-3.5">Facility</th>
                  <th className="p-3.5 text-center">Notify</th>
                  <th className="p-3.5">Created On</th>
                  <th className="p-3.5 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredUsers.map((u) => {
                  const initials = u.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Active Status Dot */}
                      <td className="p-3.5 text-center">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                      </td>
                      
                      {/* User details containing avatar + name */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 text-pink-500 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-gray-950 block">{u.fullName}</span>
                            <span className="text-[11px] text-gray-400 block mt-0.5">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-gray-700">{u.username}</td>
                      <td className="p-3.5 text-gray-500 font-mono text-[11px]">{u.contact}</td>
                      
                      {/* Admin status checkmark */}
                      <td className="p-3.5 text-center">
                        {u.isAdmin && (
                          <Check className="w-4 h-4 text-emerald-600 font-extrabold mx-auto" />
                        )}
                      </td>

                      {/* Roles badge */}
                      <td className="p-3.5">
                        <span className="text-[10px] text-sky-600 bg-sky-50 border border-sky-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-tight">
                          {u.role}
                        </span>
                      </td>

                      {/* User views */}
                      <td className="p-3.5">
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                          {u.userViews}
                        </span>
                      </td>

                      {/* Facility */}
                      <td className="p-3.5 text-gray-500">{u.facility || <span className="text-gray-300">—</span>}</td>

                      {/* Notify icon button */}
                      <td className="p-3.5 text-center">
                        <button 
                          onClick={() => alert(`Sending system credential verification mail to ${u.email}`)}
                          className="flex flex-col items-center justify-center text-sky-600 hover:text-sky-700 mx-auto group cursor-pointer"
                        >
                          <Mail className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] text-gray-400 font-sans tracking-tight mt-0.5">Notify</span>
                        </button>
                      </td>

                      {/* Created date */}
                      <td className="p-3.5 text-gray-400 font-mono text-[11px]">{u.createdOn}</td>

                      {/* Action trigger */}
                      <td className="p-3.5 text-center">
                        <button className="p-1 hover:bg-slate-100 rounded text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-gray-400">
                      No matching registered users located. Click Add to register a user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Form Modal: Add User */}
          {isUserModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#0ea5e9]" />
                    <span className="font-bold text-gray-950 text-sm">Add New Quality User</span>
                  </div>
                  <button 
                    onClick={() => setIsUserModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. jdoe" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. John" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Doe" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Email ID <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. john.doe@mfrquality.com" 
                        value={emailId}
                        onChange={(e) => setEmailId(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                        Contact Number
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 1234567890" 
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                      Role Selection <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9] text-gray-700"
                    >
                      {roles.map((r) => (
                        <option key={r.name} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Submit actions */}
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setIsUserModalOpen(false)}
                      className="px-4 py-2 border border-gray-200 hover:bg-slate-100 text-gray-600 font-bold rounded-xl cursor-pointer"
                    >
                      Close
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          2. ROLES VIEW
          ======================================================== */}
      {subTab === 'roles' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
          {/* Header row with consistent icon badge style */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-150 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-gray-955">System Governance Roles</h2>
                <p className="text-xs text-gray-400 mt-0.5">Configure permission templates and custom responsibilities across the QLM ecosystem.</p>
              </div>
            </div>
            
            {/* Custom Vertical styled Add Button */}
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              className="flex flex-col items-center justify-center text-[#0ea5e9] hover:text-sky-600 transition-colors cursor-pointer px-4 self-end sm:self-auto"
              id="add-role-btn"
            >
              <Plus className="w-6 h-6 text-[#0ea5e9]" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Add</span>
            </button>
          </div>

          {/* Roles Table */}
          <div className="overflow-x-auto border border-gray-150 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-gray-150 font-bold">
                <tr>
                  <th className="p-3.5 w-1/4">Role Title</th>
                  <th className="p-3.5">Scope & Description</th>
                  <th className="p-3.5 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {roles.map((r) => (
                  <tr key={r.name} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-3.5 font-bold text-gray-950">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-sky-500" />
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-500 leading-relaxed">{r.description}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => alert(`Editing role: ${r.name}`)}
                          className="p-1 hover:bg-slate-100 rounded text-gray-400 hover:text-sky-600 transition-colors cursor-pointer"
                          title="Edit Role"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (r.name === 'Administrator') {
                              alert('The core Administrator role cannot be deleted.');
                              return;
                            }
                            setRoles(roles.filter(role => role.name !== r.name));
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Role"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Form Modal */}
          {isRoleModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#0ea5e9]" />
                    <span className="font-bold text-gray-950 text-sm">Add New QLM Role</span>
                  </div>
                  <button 
                    onClick={() => setIsRoleModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddRoleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Component Engineer" 
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                      Description / Scope Bound
                    </label>
                    <textarea 
                      placeholder="Define capabilities, data partitions, and clearance levels..." 
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                      rows={4}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setIsRoleModalOpen(false)}
                      className="px-4 py-2 border border-gray-200 hover:bg-slate-100 text-gray-600 font-bold rounded-xl cursor-pointer"
                    >
                      Close
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. MENUS VIEW
          ======================================================== */}
      {subTab === 'menus' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6 animate-fadeIn">
          {/* Main Title Block */}
          <div className="flex items-center gap-2.5 border-b border-gray-150 pb-4">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-gray-955">Menu Access Authorization</h2>
              <p className="text-xs text-gray-400 mt-0.5">Control granularity level authorization bounds and sidebar module visibility rules.</p>
            </div>
          </div>
          
          {/* Main layout splitting Menu Items Accordion and Menu Actions Permission table */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Pane - Menu Items Accordion */}
            <div className="lg:col-span-1 border border-gray-200 rounded-2xl p-4 space-y-4 bg-slate-50/40">
              <div className="border-b border-gray-150 pb-3 flex items-center justify-between">
                <span className="font-bold text-xs text-gray-400 uppercase tracking-wider font-sans block">Menu Navigation</span>
                <span className="text-[10px] text-gray-400 font-mono bg-white px-2 py-0.5 rounded-md border border-gray-200">System</span>
              </div>

              {/* Collapsible Card/Accordion row matching first screenshot */}
              <div className="border border-gray-200 rounded-xl bg-white shadow-xs overflow-hidden transition-all duration-200 hover:border-gray-300">
                <button
                  onClick={() => setActiveMenuAccordion(!activeMenuAccordion)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/50">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-xs sm:text-sm block">User Management</span>
                      <span className="text-[10px] text-gray-400 block -mt-0.5">5 Core Sub-menus</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${activeMenuAccordion ? 'rotate-180' : ''}`} />
                </button>

                {activeMenuAccordion && (
                  <div className="p-2 bg-slate-50/50 border-t border-gray-100 space-y-1">
                    {[
                      { name: 'Users', icon: Users },
                      { name: 'Suppliers', icon: Truck },
                      { name: 'Dealers', icon: Layers },
                      { name: 'Roles', icon: Shield },
                      { name: 'Menus', icon: Settings }
                    ].map((item) => (
                      <div 
                        key={item.name} 
                        className="flex items-center gap-2.5 p-2.5 text-xs text-gray-600 font-semibold hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100"
                      >
                        <item.icon className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="font-sans text-gray-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-gray-150 rounded-xl p-3.5 bg-white space-y-2.5 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Other Access Modules</span>
                <div className="text-[11px] text-gray-500 space-y-2 pl-1 font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">• Product</span>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-gray-400 font-bold">1 item</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">• Suppliers</span>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-gray-400 font-bold">1 item</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">• APQP</span>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-gray-400 font-bold">1 item</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">• PPAP</span>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-gray-400 font-bold">10 items</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane - Menu Actions Permission matrix */}
            <div className="lg:col-span-3 border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-6 flex flex-col justify-between shadow-2xs bg-slate-50/10">
              
              <div className="space-y-6">
                {/* Right Pane Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-150 pb-4">
                  <div>
                    <span className="font-bold text-gray-950 text-base font-display block">Menu Action Authorization</span>
                    <p className="text-xs text-gray-400 mt-0.5">Control granularity level authorization bounds for system views.</p>
                  </div>
                  
                  {/* Select Role and Save button beside it */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <select
                      value={selectedRoleForMenus}
                      onChange={(e) => handleRoleChangeForMenus(e.target.value)}
                      className="border border-gray-200 text-xs text-gray-700 p-2.5 rounded-xl focus:outline-none focus:border-[#0ea5e9] bg-white w-44 sm:w-56 font-bold shadow-2xs"
                    >
                      {roles.map((r) => (
                        <option key={r.name} value={r.name}>{r.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={handleSaveMenuPermissions}
                      className="px-4 py-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>

                {/* Submenus section layout matching screenshot */}
                <div className="space-y-4">
                  {/* Group header block */}
                  <div className="bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 text-xs font-extrabold font-sans uppercase tracking-wider flex items-center justify-between">
                    <span>User Management Module</span>
                    <span className="text-[10px] text-gray-400 font-mono normal-case">Sub-menu Access Matrix</span>
                  </div>

                  {/* Indented Sub-menu entries with Segmented controllers */}
                  <div className="space-y-3.5">
                    {localPermissions.map((item, idx) => {
                      // Get correct icon based on name
                      const IconComp = item.subMenu === 'Users' ? Users : 
                                      item.subMenu === 'Suppliers' ? Truck : 
                                      item.subMenu === 'Dealers' ? Layers : 
                                      item.subMenu === 'Roles' ? Shield : Settings;
                      return (
                        <div 
                          key={item.subMenu} 
                          className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-white border border-gray-150 rounded-xl hover:shadow-xs hover:border-gray-300 transition-all duration-200 gap-4"
                        >
                          {/* Left Side: Sub-menu name + state toggle slider */}
                          <div className="flex items-center gap-3.5 min-w-[220px]">
                            <button
                              type="button"
                              onClick={() => handleToggleSubMenuEnabled(idx)}
                              className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                                item.isEnabled ? 'bg-emerald-500' : 'bg-gray-200'
                              }`}
                              title={item.isEnabled ? "Disable Submenu" : "Enable Submenu"}
                            >
                              <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                                item.isEnabled ? 'translate-x-4' : 'translate-x-0'
                              }`} />
                            </button>
                            
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                                item.isEnabled 
                                  ? 'bg-sky-50 text-sky-500 border-sky-100' 
                                  : 'bg-slate-50 text-slate-300 border-slate-100'
                              }`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div>
                                <span className={`text-xs font-bold font-sans block ${item.isEnabled ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                  {item.subMenu}
                                </span>
                                <span className="text-[10px] text-gray-400 block -mt-0.5 font-semibold">
                                  {item.isEnabled ? "Menu path is visible" : "Menu hidden in sidebar"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: High Fidelity Segmented Pill Controller for Permission Level */}
                          <div className={`flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 transition-all duration-300 gap-0.5 self-start lg:self-auto ${
                            item.isEnabled ? 'opacity-100' : 'opacity-35 pointer-events-none'
                          }`}>
                            {(['Read', 'Write', 'Modify', 'All'] as const).map((level) => {
                              const isChecked = item.isEnabled && item.permission === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  disabled={!item.isEnabled}
                                  onClick={() => handleChangeSubMenuPermission(idx, level)}
                                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                    isChecked
                                      ? 'bg-white text-sky-600 shadow-xs border border-slate-200/40'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                  }`}
                                >
                                  {level}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Informative footer card */}
              <div className="bg-sky-50/50 border border-sky-100/60 p-4 rounded-xl mt-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-sky-950 block">About Role Matrix Configurations</span>
                  <p className="text-[11px] text-sky-700/80 leading-relaxed mt-0.5 font-semibold">
                    Changes take effect dynamically upon saving. Access authorizations lock or unlock sidebar modules dynamically based on selected role limits. Ensure at least one module visibility is active to grant access.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
