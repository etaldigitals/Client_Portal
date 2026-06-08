import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Building2, 
  ShieldCheck, 
  HelpCircle, 
  Volume2, 
  Laptop, 
  CheckCircle,
  Clock,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react';
import { User, ClientCompany, NotificationItem } from '../types';

interface ProfileViewProps {
  currentUser: User;
  clients: ClientCompany[];
  notifications: NotificationItem[];
  onUpdateProfile: (updated: Omit<User, 'id' | 'role' | 'clientId' | 'companyName'>) => void;
  onSwitchUserSession: (role: User['role'], clientId?: string) => void;
  onMarkNotificationRead: (notifId: string) => void;
  onMarkAllNotificationsRead: () => void;
}

export default function ProfileView({
  currentUser,
  clients,
  notifications,
  onUpdateProfile,
  onSwitchUserSession,
  onMarkNotificationRead,
  onMarkAllNotificationsRead
}: ProfileViewProps) {
  
  // Profile inputs
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [emailInput, setEmailInput] = useState(currentUser.email);
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '+1 (555) 123-4567');
  const [rememberMeInput, setRememberMeInput] = useState(currentUser.rememberMe || false);

  // Impersonator state
  const [chosenRole, setChosenRole] = useState<User['role']>(currentUser.role);
  const [chosenClient, setChosenClient] = useState(currentUser.clientId || 'client-1');

  const [passwordState, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: nameInput,
      email: emailInput,
      phone: phoneInput,
      rememberMe: rememberMeInput
    });
    alert('⚡ Profile contact preferences updated successfully.');
  };

  const handleRoleImpersonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSwitchUserSession(chosenRole, chosenRole === 'client' ? chosenClient : undefined);
  };

  const handleResetPasswordSimulate = () => {
    alert(`📨 Secure password reset link has been dispatched to ${currentUser.email}. Please verify your sandbox email service inbox.`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Configuration & Settings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Convey preferences, review notifications feed, and switch sandbox impersonation rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE PROFILE CONTACT FORMS */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
              <UserIcon size={16} className="text-blue-500" />
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">My Contact Profile</h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Contact Name</label>
                <input
                  id="profile-name-input"
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Email Account Reference</label>
                <input
                  id="profile-email-input"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Telephone Line</label>
                <input
                  id="profile-phone-input"
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              {/* REMEMBER ME TOGGLE */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="profile-remember-checkbox"
                  type="checkbox"
                  checked={rememberMeInput}
                  onChange={(e) => setRememberMeInput(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-550 cursor-pointer"
                />
                <label htmlFor="profile-remember-checkbox" className="text-[11px] text-slate-650 font-semibold cursor-pointer">
                  Remember me next session (Automatic logins)
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  id="btn-profile-submit"
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex-1 transition text-center"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* SIMULATED CREDENTIAL OPERATIONS & SECURITY */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
              <Lock size={16} className="text-blue-500" />
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Security & Passwords</h3>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Want to change your credentials? Trigger a sandbox dispatch link to resets your access hash code.
              </p>

              <button
                id="btn-simulate-forgot-password"
                onClick={handleResetPasswordSimulate}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition"
              >
                Send Password Reset Email
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: SANDBOX QUICK ROLE IMPERSONATOR - THE DEMO HUB */}
        <div className="space-y-4">
          {currentUser.role === 'admin' ? (
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-850 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck size={16} className="text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Sandbox Impersonator Console</h3>
              </div>

              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                Verify role isolations! This sandbox allows you to seamlessly swap between a **Super Admin** with complete access to all organizations, and individual **Clients** restricted to their own ledger datasets.
              </p>

              <form onSubmit={handleRoleImpersonationSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Persona Role</label>
                  <select
                    id="select-choose-role-impersonate"
                    value={chosenRole}
                    onChange={(e) => {
                      const r = e.target.value as User['role'];
                      setChosenRole(r);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-bold outline-none text-white focus:border-blue-500"
                  >
                    <option value="admin">👮 Super Admin (Full Agency Access)</option>
                    <option value="client">🏢 Client User (Company Restricted)</option>
                  </select>
                </div>

                {chosenRole === 'client' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Association Isolator</label>
                    <select
                      id="select-choose-client-impersonate"
                      value={chosenClient}
                      onChange={(e) => setChosenClient(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-bold outline-none text-white focus:border-blue-500"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>🏢 {c.name} ({c.industry})</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  id="btn-confirm-impersonation"
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-xs transition"
                >
                  <RefreshCw size={13} />
                  <span>Switch Sandbox Session</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-lg border border-emerald-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-emerald-900 pb-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Access Isolated & Verified</h3>
              </div>

              <p className="text-[11px] text-emerald-200 font-medium leading-relaxed">
                Your client session is fully isolated under status-compliance protocols. Data segmentation prevents cross-tenant leaks.
              </p>

              <div className="space-y-2.5 text-xs bg-emerald-900/40 p-3.5 rounded-xl border border-emerald-800/50 font-mono text-emerald-300">
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-bold">Client ID:</span>
                  <span>{currentUser.clientId}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-1">
                  <span className="text-emerald-400 font-bold">Company:</span>
                  <span>{currentUser.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-bold">User Role:</span>
                  <span className="uppercase font-bold tracking-wider">Client Member</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-bold">Security Key:</span>
                  <span>SSL_AES_256</span>
                </div>
              </div>

              <div className="pt-1 text-center">
                <span className="text-[9px] font-mono uppercase bg-emerald-905 bg-emerald-900/65 text-emerald-200 border border-emerald-800/40 px-2 py-1 rounded select-none">
                  Authenticated Gateway Locked
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-205 p-5 shadow-sm text-xs font-semibold text-slate-500 space-y-2">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-widest text-slate-400 text-[10px] block">Role Permissions Matrix</h4>
            <ul className="space-y-1.5 pt-1 text-slate-600 leading-normal pl-4 list-disc">
              <li>**Super Admin**: Manage client directory, create projects, issue bills, schedule meetings, audit global logs, write replies.</li>
              <li>**Clients**: Isolated view of own projects, check-off tasks, upload documents, review invoice records, pay outstanding dues.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT NOTIFICATIONS & BADGING CONTROL */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-blue-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">System Notifications</h3>
                </div>

                {notifications.filter(n => !n.read).length > 0 && (
                  <button
                    id="btn-notif-mark-all-read"
                    onClick={onMarkAllNotificationsRead}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div 
                    id={`notif-alert-capsule-${notif.id}`}
                    key={notif.id} 
                    className={`p-3 rounded-xl border text-xs font-medium space-y-1 relative group transition ${
                      notif.read 
                        ? 'bg-slate-50/50 text-slate-500 border-slate-100/80' 
                        : 'bg-blue-50/40 text-slate-800 border-blue-100/50 font-bold'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-wide select-none">{notif.createdAt}</span>
                      {!notif.read && (
                        <button
                          id={`btn-notif-mark-read-${notif.id}`}
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className="text-[9px] text-blue-600 hover:underline shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>

                    <h4 className="font-extrabold text-[#0F172A] leading-snug">{notif.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{notif.text}</p>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs font-medium flex flex-col items-center justify-center gap-2">
                    <CheckCircle size={24} className="text-slate-200" />
                    <span>No unread notifications alerts logged so far.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-[9px] font-mono uppercase font-black text-slate-400 tracking-widest block text-right">
                SSL Secured connection active
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
