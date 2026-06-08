import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Receipt, 
  Clock, 
  Bell, 
  User as UserIcon, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';
import { User, ClientCompany } from '../types';

interface SidebarProps {
  currentUser: User;
  clients: ClientCompany[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  onSwitchUser: () => void;
  unreadNotificationsCount: number;
}

export default function Sidebar({
  currentUser,
  clients,
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  onLogout,
  onSwitchUser,
  unreadNotificationsCount
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', name: 'Projects', icon: Briefcase },
    { id: 'timeline', name: 'Timeline', icon: Clock },
    { id: 'files', name: 'Files', icon: FileText },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare },
    { id: 'reports', name: 'Reports', icon: TrendingUp },
    { id: 'invoices', name: 'Invoices', icon: Receipt },
    { id: 'meetings', name: 'Meetings', icon: Calendar },
    { id: 'profile', name: 'Profile', icon: UserIcon },
  ];

  return (
    <div 
      className={`h-screen fixed left-0 top-0 z-30 flex flex-col bg-slate-900 text-white ${
        collapsed ? 'w-20' : 'w-72'
      } border-r border-slate-800 shadow-xl transition-all duration-300`}
    >
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between px-5 border-b border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20 text-white">
              ED
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white leading-none">ETAL Digitals</h1>
              <span className="text-xs text-slate-400 font-medium">Client Hub</span>
            </div>
          </div>
        ) : (
          <div className="bg-blue-600 mx-auto w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg text-white">
            ED
          </div>
        )}

        <button 
          id="btn-sidebar-collapse"
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800 transition shadow"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User Session Segment Info */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow referrerPolicy='no-referrer'" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center border border-slate-700">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate text-white leading-tight">{currentUser.name}</h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">{currentUser.email}</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div id="role-badge" className="mt-3 bg-slate-800/50 rounded-xl p-2.5 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                {currentUser.role === 'admin' ? (
                  <>
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span>Super Admin</span>
                  </>
                ) : (
                  <>
                    <Building2 size={14} className="text-emerald-500" />
                    <span className="truncate max-w-[120px]">{currentUser.companyName || 'Client'}</span>
                  </>
                )}
              </div>
              <button
                id="btn-switch-impersonation"
                onClick={onSwitchUser}
                title="Switch/Impersonate Role"
                className="hover:text-blue-400 p-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md text-slate-400 transition flex items-center gap-1"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={19} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span className="flex-1 text-left">{item.name}</span>}
              
              {/* Optional Notifications Badging */}
              {!collapsed && item.id === 'profile' && unreadNotificationsCount > 0 && (
                <span className="bg-red-500/15 text-red-500 border border-red-500/25 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Log out */}
      <div className="p-4 border-t border-slate-800">
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={19} />
          {!collapsed && <span>Logout / Reset Portal</span>}
        </button>
      </div>
    </div>
  );
}
