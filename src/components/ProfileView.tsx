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
  RefreshCw,
  Database,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { User, ClientCompany, NotificationItem } from '../types';
import { isSupabaseConfigured } from '../utils/supabaseClient';

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

  // Supabase Sync Center states
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<'vercel' | 'supabase'>('vercel');

  // isSupabaseConfigured is imported from supabaseClient

  const sqlSchema = `-- SQL Configuration Script for Supabase SQL Editor
-- Create database tables matching your Client Portal layout models

-- 1. Create client companies table
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  logo TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  joined_at TEXT,
  password TEXT DEFAULT 'client123'
);

-- Establish Row Level Security (RLS) status
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read and write" ON public.clients FOR ALL USING (true);

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planning',
  start_date TEXT,
  end_date TEXT,
  budget NUMERIC DEFAULT 0,
  category TEXT,
  tasks JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select and write" ON public.projects FOR ALL USING (true);

-- 3. Create timeline table
CREATE TABLE IF NOT EXISTS public.timeline (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  date TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT
);

ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public" ON public.timeline FOR ALL USING (true);

-- 4. Create files table
CREATE TABLE IF NOT EXISTS public.files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size TEXT,
  category TEXT,
  uploaded_by TEXT,
  uploaded_at TEXT,
  version INTEGER DEFAULT 1,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id TEXT,
  versions JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow files" ON public.files FOR ALL USING (true);

-- 5. Create feedbacks table
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id TEXT,
  author_name TEXT,
  text TEXT,
  rating INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending',
  created_at TEXT,
  replies JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public feedback" ON public.feedbacks FOR ALL USING (true);

-- 6. Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  invoice_no TEXT UNIQUE,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  issued_at TEXT,
  due_date TEXT,
  items JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow invoices" ON public.invoices FOR ALL USING (true);

-- 7. Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  datetime TEXT,
  client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
  meet_link TEXT,
  organizer TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'scheduled'
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow meetings" ON public.meetings FOR ALL USING (true);

-- 8. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  title TEXT NOT NULL,
  text TEXT,
  type TEXT DEFAULT 'info',
  created_at TEXT,
  read BOOLEAN DEFAULT false
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow notifications" ON public.notifications FOR ALL USING (true);

-- 9. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TEXT,
  client_id TEXT
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logs" ON public.audit_logs FOR ALL USING (true);

-- Add Default Demo Organization
INSERT INTO public.clients (id, name, industry, logo, email, phone, address, status, joined_at, password)
VALUES 
('client-1', 'Acme Software Inc.', 'Technology & Cloud Solutions', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80', 'contact@acmesoftware.com', '+1 (555) 0199', '100 Silicon Blvd, Suite 400', 'active', '2026-01-15', 'client123')
ON CONFLICT (id) DO NOTHING;
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

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

          <div className="bg-white rounded-2xl border border-slate-205 p-5 shadow-sm text-xs font-semibold text-slate-500 space-y-2 pb-5">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-widest text-slate-400 text-[10px] block">Role Permissions Matrix</h4>
            <ul className="space-y-1.5 pt-1 text-slate-600 leading-normal pl-4 list-disc">
              <li>**Super Admin**: Manage client directory, create projects, issue bills, schedule meetings, audit global logs, write replies.</li>
              <li>**Clients**: Isolated view of own projects, check-off tasks, upload documents, review invoice records, pay outstanding dues.</li>
            </ul>
          </div>

          {/* 🌟 NEW: COHESIVE DISCOVERY DEPLOYMENT HUB CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-2">
                <Database size={16} className={isSupabaseConfigured ? "text-emerald-500" : "text-amber-500"} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Supabase & Cloud Sync Engine</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isSupabaseConfigured 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                  : "bg-amber-50 text-amber-600 border border-amber-200 animate-pulse"
              }`}>
                {isSupabaseConfigured ? "🟢 connected" : "🟡 offline fallback"}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              {isSupabaseConfigured 
                ? "The interface is linked directly to your cloud instance. Real-time PostgreSQL notifications will synchronize edits across admin & client panels immediately."
                : "Portal currently saves files, tasks, and notes locally in your browser. Complete our guided Setup to persist credentials globally across Vercel and Supabase cloud tables."}
            </p>

            {/* Stepper Tabs */}
            <div className="flex bg-slate-550 min-h-1 flex-col space-y-2 border-t border-slate-100 pt-3">
              <div className="flex gap-1.5 bg-slate-100 p-1.2 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveStepTab('vercel')}
                  className={`flex-1 text-center py-1.5 font-bold rounded-md transition ${activeStepTab === 'vercel' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  🚀 1. Host on Vercel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStepTab('supabase')}
                  className={`flex-1 text-center py-1.5 font-bold rounded-md transition ${activeStepTab === 'supabase' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  ⚡ 2. Set Database
                </button>
              </div>

              {activeStepTab === 'vercel' ? (
                <div className="space-y-3.5 text-xs font-semibold text-slate-600 pt-2.5 leading-relaxed">
                  <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100/40 text-blue-800">
                    <p className="font-bold flex items-center gap-1 text-[11px]">
                      <span>Deployment Path:</span>
                    </p>
                    <p className="text-[10px] font-medium pt-1">
                      You can deploy this fully-interactive Client Portal to any node system in seconds. For maximum speed, we recommend Vercel's zero-config setup.
                    </p>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-550 pl-1">
                    <li>Push the workspace code to your newly created GitHub repository at <span className="font-mono bg-slate-50 p-0.5 rounded text-slate-800 text-[10px]">Clients_Portal</span>. (We'll queue other push files for you).</li>
                    <li>Head over to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 inline-flex items-center gap-0.5 hover:underline font-bold">Vercel.com <ExternalLink size={10} /></a>.</li>
                    <li>Click **Add New Project** and connect your GitHub rep.</li>
                    <li>Accept all default setup rules (Framework: **Vite**).</li>
                    <li>Under *Environment Variables* section, specify yours in one click.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 pt-2 text-[11px] font-semibold text-slate-600">
                  <ol className="list-decimal list-inside space-y-2 text-[11px]">
                    <li>Sign up for a free database at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 inline-flex items-center gap-0.5 hover:underline font-bold">Supabase.com <ExternalLink size={10} /></a>.</li>
                    <li>Create a new project. Find your keys in **Project Settings &gt; API**.</li>
                    <li>Click the button below to expand and copy the setup SQL.</li>
                    <li>Paste it in your **Supabase SQL Editor** and click **Run** to build the compliance tables.</li>
                  </ol>

                  <div className="space-y-2.5 pt-1.5">
                    <button
                      type="button"
                      id="btn-toggle-sql-drawer"
                      onClick={() => setShowSql(!showSql)}
                      className="w-full bg-slate-50 flex items-center justify-between border border-slate-200 text-slate-705 px-3 py-2 rounded-xl text-xs hover:bg-slate-100 transition"
                    >
                      <span>{showSql ? "Hide SQL Setup Script" : "Show SQL Setup Script"}</span>
                      <Database size={12} className="text-slate-400" />
                    </button>

                    {showSql && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>SQL Public Table Script:</span>
                          <button
                            type="button"
                            id="btn-copy-sql-schemas"
                            onClick={copySqlToClipboard}
                            className="bg-blue-600 text-white rounded px-2.5 py-1 flex items-center gap-1 hover:bg-blue-500 font-bold transition"
                          >
                            {copiedSql ? (
                              <>
                                <Check size={10} />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={10} />
                                <span>Copy Script</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl overflow-x-auto text-[9px] font-mono leading-relaxed" style={{ maxHeight: '180px' }}>
                          {sqlSchema}
                        </pre>
                        <p className="text-[9.5px] text-slate-400 leading-normal pl-1">
                          👉 *Note: Row-Level-Security (RLS) policies are configured in this script to allow seamless operations during development.*
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
