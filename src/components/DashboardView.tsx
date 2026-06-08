import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  FolderGit2, 
  MessageSquare, 
  CheckCircle2, 
  Users, 
  FileBox, 
  Calendar, 
  PhoneCall, 
  ShieldAlert, 
  Activity, 
  Search, 
  UserPlus, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Key,
  Copy,
  Check
} from 'lucide-react';
import { 
  User, 
  ClientCompany, 
  Project, 
  FileRecord, 
  FeedbackItem, 
  Invoice, 
  Meeting, 
  AuditLog 
} from '../types';

interface DashboardViewProps {
  currentUser: User;
  clients: ClientCompany[];
  projects: Project[];
  files: FileRecord[];
  feedbacks: FeedbackItem[];
  invoices: Invoice[];
  meetings: Meeting[];
  auditLogs: AuditLog[];
  onAddClient: (newClient: Omit<ClientCompany, 'joinedAt'>) => void;
  onSelectClient: (clientId: string) => void;
  onUpdateClientCredentials: (clientId: string, email: string, password?: string) => void;
}

export default function DashboardView({
  currentUser,
  clients,
  projects,
  files,
  feedbacks,
  invoices,
  meetings,
  auditLogs,
  onAddClient,
  onSelectClient,
  onUpdateClientCredentials
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [editedCredentials, setEditedCredentials] = useState<Record<string, { email: string; password?: string }>>({});
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

  // 1. DATA ISOLATION & FILTERING
  const isAdmin = currentUser.role === 'admin';
  const clientId = currentUser.clientId;

  // Filter entities according to scope
  const filteredProjects = isAdmin 
    ? projects 
    : projects.filter(p => p.clientId === clientId);
    
  const filteredFiles = isAdmin 
    ? files 
    : files.filter(f => f.clientId === clientId);
    
  const filteredFeedbacks = isAdmin 
    ? feedbacks 
    : feedbacks.filter(f => f.clientId === clientId);
    
  const filteredInvoices = isAdmin 
    ? invoices 
    : invoices.filter(i => i.clientId === clientId);
    
  const filteredMeetings = isAdmin 
    ? meetings 
    : meetings.filter(m => m.clientId === clientId);

  const filteredLogs = isAdmin
    ? auditLogs
    : auditLogs.filter(l => l.clientId === clientId);

  // 2. METRICS CALCULATIONS
  // Total Budget
  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  
  // Project Completion %
  const avgCompletion = filteredProjects.length > 0
    ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length)
    : 0;

  // Key Dashboard Widgets Metrics from OCR: 
  // "project completion %, open tasks, files uploaded, pending feedback, next meeting, current campaign status"
  const openTasksCount = filteredProjects.reduce((total, p) => {
    return total + p.tasks.filter(t => t.status !== 'completed').length;
  }, 0);

  const filesUploadedCount = filteredFiles.length;
  
  const pendingFeedbackCount = filteredFeedbacks.filter(f => f.status === 'pending').length;
  
  // Next Meeting lookup
  const upcomingMeetings = filteredMeetings
    .filter(m => m.status === 'scheduled' && new Date(m.datetime) > new Date())
    .sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  
  const nextMeeting = upcomingMeetings[0];

  // Campaign description or major project focus
  const currentCampaignStatus = filteredProjects.find(p => p.category === 'Marketing' || p.status === 'in-progress')?.name 
    || filteredProjects[0]?.name 
    || 'No active projects';

  const currentCampaignProgress = filteredProjects.find(p => p.category === 'Marketing' || p.status === 'in-progress')?.progress 
    || filteredProjects[0]?.progress 
    || 0;

  // ADMIN-ONLY: Total Invoiced vs Paid
  const totalPaid = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = filteredInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = filteredInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  const handleCredentialChange = (clientId: string, field: 'email' | 'password', value: string) => {
    const matched = clients.find(c => c.id === clientId);
    const current = editedCredentials[clientId] || { 
      email: matched?.email || '', 
      password: matched?.password || 'client123' 
    };
    setEditedCredentials(prev => ({
      ...prev,
      [clientId]: {
        ...current,
        [field]: value
      }
    }));
  };

  const handleSaveCredential = (clientId: string) => {
    const cred = editedCredentials[clientId];
    if (!cred) return;
    onUpdateClientCredentials(clientId, cred.email, cred.password);
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;
    const generatedId = newClientId.trim() || `client-${Date.now()}`;
    onAddClient({
      id: generatedId,
      name: newClientName,
      industry: newClientIndustry || 'General Business',
      logo: newClientName.charAt(0).toUpperCase(),
      email: newClientEmail,
      phone: newClientPhone || '+1 (555) 000-0000',
      address: newClientAddress || 'HQ Address, USA',
      status: 'active',
      password: newClientPassword || 'client123'
    });
    setNewClientName('');
    setNewClientId('');
    setNewClientIndustry('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientAddress('');
    setNewClientPassword('');
    setShowAddClientModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm glass-panel">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>ETAL Client Hub Platform</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin 
              ? `You are in Super Admin mode, overseeing ${clients.length} business accounts and digital developments.`
              : `Accessing campaign portals for ${currentUser.companyName}. Track deliverables, clear payments, or leave notes.`}
          </p>
        </div>

        {/* WhatsApp Quick Link Floating in the Dashboard Header for Clients */}
        {!isAdmin && (
          <a
            href="https://wa.me/15550199"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all scale-100 hover:scale-102 active:scale-98"
          >
            <PhoneCall size={16} />
            <span>WhatsApp Quick Support</span>
            <ArrowUpRight size={14} className="opacity-80" />
          </a>
        )}
      </div>

      {/* CORE WIDGETS segment matching PDF Checklist: 
          "project completion %, open tasks, files uploaded, pending feedback, next meeting, current campaign status" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Widget 1: Project Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Metrics Status</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{avgCompletion}%</span>
            <h3 className="text-xs font-semibold text-slate-600 mt-1">Project Completion</h3>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${avgCompletion}%` }}
            />
          </div>
        </div>

        {/* Widget 2: Open Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Deliverables</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{openTasksCount}</span>
            <h3 className="text-xs font-semibold text-slate-600 mt-1">Open Tasks</h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
            Awaiting direct execution
          </p>
        </div>

        {/* Widget 3: Files Uploaded */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-sans">Storage</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <FileBox size={16} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{filesUploadedCount}</span>
            <h3 className="text-xs font-semibold text-slate-600 mt-1">Files Uploaded</h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full inline-block" />
            Signed files & assets
          </p>
        </div>

        {/* Widget 4: Pending Feedback */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Communications</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-[#EF4444] font-mono">{pendingFeedbackCount}</span>
            <h3 className="text-xs font-semibold text-slate-600 mt-1">Pending Feedback</h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block" />
            Requiring immediate reply
          </p>
        </div>

        {/* Widget 5: Next Meeting */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-sans">Calendar</span>
            <div className="p-2 rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
              <Calendar size={16} />
            </div>
          </div>
          <div className="mt-4 truncate">
            {nextMeeting ? (
              <>
                <span className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">
                  {nextMeeting.title}
                </span>
                <span className="text-[10px] text-[#22C55E] block font-mono font-medium mt-1">
                  {new Date(nextMeeting.datetime).toLocaleDateString()} at {new Date(nextMeeting.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-slate-400">None</span>
                <span className="text-xs font-semibold text-slate-500 block mt-1">Next Meeting</span>
              </>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 block">
            Google Meet scheduled
          </p>
        </div>

        {/* Widget 6: Campaign Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Focus</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-xs font-bold text-slate-800 truncate leading-tight" title={currentCampaignStatus}>
              {currentCampaignStatus}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold">{currentCampaignProgress}% Progress</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Primary development status</p>
        </div>
      </div>

      {/* ADMIN LEVEL: High precision aggregate billing and clients portal directory */}
      {isAdmin && (
        <div id="admin-directory-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Clients Directory List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Clients Accounts</h3>
                <p className="text-xs text-slate-500">Isolate views or modify business directories.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="client-search"
                    type="text"
                    placeholder="Search client directory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-44 md:w-56"
                  />
                </div>
                <button
                  id="btn-add-client-modal"
                  onClick={() => setShowAddClientModal(true)}
                  className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3.5 rounded-lg shadow-sm transition"
                >
                  <UserPlus size={14} />
                  <span className="hidden sm:inline">New Client</span>
                </button>
              </div>
            </div>

            {/* Client Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Active Projects</th>
                    <th className="py-3 px-4">Ledger Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {clients
                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((client) => {
                      const clientProjects = projects.filter(p => p.clientId === client.id);
                      const outstandingAmount = invoices
                        .filter(i => i.clientId === client.id && i.status !== 'paid')
                        .reduce((sum, i) => sum + i.amount, 0);

                      return (
                        <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-black flex items-center justify-center">
                                {client.logo}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight">{client.name}</h4>
                                <span className="text-[10px] text-slate-400 font-semibold">{client.industry}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="leading-tight">
                              <div>{client.email}</div>
                              <div className="text-[10px] text-slate-400">{client.phone}</div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-slate-100 text-slate-700 text-[10px] py-0.5 px-2 rounded-full font-bold">
                              {clientProjects.length} Projects
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-800">
                            {outstandingAmount === 0 ? (
                              <span className="text-[10px] bg-green-50 text-[#22C55E] py-0.5 px-2 rounded-full font-bold">Paid</span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-[#F59E0B]">
                                ${outstandingAmount.toLocaleString()} Due
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              id={`select-client-scope-btn-${client.id}`}
                              onClick={() => onSelectClient(client.id)}
                              className="text-xs text-blue-600 hover:text-white border border-blue-100 hover:bg-blue-600 py-1 px-2.5 rounded-md font-bold transition"
                            >
                              Impersonate Client
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Grid with Interactive Custom SVG Chart */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest text-slate-500 mb-4 font-mono">
                Financial Ledger Overviews
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Paid Total</span>
                  <div className="text-lg font-black font-mono text-[#22C55E] mt-0.5">${totalPaid.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Due (Pending)</span>
                  <div className="text-lg font-black font-mono text-[#F59E0B] mt-0.5">${totalPending.toLocaleString()}</div>
                </div>
              </div>

              {/* Responsive SVG Billing Bar Chart representation */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-4 flex items-center justify-between">
                  <span>Invoice Health Breakdown</span>
                  <span className="text-[10px] text-slate-400 font-mono">Total ${ (totalPaid + totalPending + totalOverdue).toLocaleString() }</span>
                </h4>

                <div className="h-28 flex items-end justify-between gap-3 pt-4">
                  {/* Paid bar */}
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[10px] font-bold font-mono text-[#22C55E]">${Math.round(totalPaid/1000)}k</div>
                    <div 
                      className="w-full bg-[#22C55E] rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(15, ((totalPaid) / (totalPaid + totalPending + totalOverdue + 1)) * 100)}%` }}
                    />
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Paid</div>
                  </div>

                  {/* Pending bar */}
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[10px] font-bold font-mono text-[#F59E0B]">${Math.round(totalPending/1000)}k</div>
                    <div 
                      className="w-full bg-[#F59E0B] rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(15, ((totalPending) / (totalPaid + totalPending + totalOverdue + 1)) * 100)}%` }}
                    />
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Pending</div>
                  </div>

                  {/* Overdue bar */}
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[10px] font-bold font-mono text-red-500">${Math.round(totalOverdue/1000)}k</div>
                    <div 
                      className="w-full bg-[#EF4444] rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(15, ((totalOverdue) / (totalPaid + totalPending + totalOverdue + 1)) * 100)}%` }}
                    />
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Overdue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action / Tips panel */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
              <div className="relative z-10 space-y-3">
                <span className="bg-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Tip for Admins</span>
                <h4 className="text-base font-bold tracking-tight">Need a Sandbox Client?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate a temporary client or use the switch icon to check exact permissions. Change statuses on tasks or files, which immediately affects telemetry metrics.
                </p>
                <button
                  id="dashboard-sandbox-add-btn"
                  onClick={() => setShowAddClientModal(true)}
                  className="w-full bg-white hover:bg-slate-50 text-slate-950 font-bold text-xs py-2 rounded-lg transition text-center"
                >
                  Quick Launch Onboard
                </button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-3 translate-y-3">
                <Building2 size={120} />
              </div>
            </div>
          </div>

          {/* CLIENT PORTAL ACCESS & CREDENTIALS HUB (Admin Only) */}
          <div id="client-credentials-hub" className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Key className="text-blue-600" size={18} />
                  <span>🔑 Client Portal Access & Credentials Hub</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configure client logins, automatic random password creations, and copy instructions draft for instant user onboarding.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100/60 uppercase px-2 py-1 rounded select-none">
                  Admin Security Console
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {clients.map((client) => {
                const currentEdit = editedCredentials[client.id] || {
                  email: client.email,
                  password: client.password || 'client123'
                };
                const isCopied = copiedClientId === client.id;

                return (
                  <div 
                    key={client.id} 
                    className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/65 hover:border-slate-300/80 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Organisation Label */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 font-extrabold text-white text-xs flex items-center justify-center">
                          {client.logo}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-850 text-xs leading-none">{client.name}</h4>
                          <span className="text-[9px] text-slate-400 font-bold">{client.industry}</span>
                        </div>
                      </div>

                      {/* Login Credential Inputs */}
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[9px] uppercase font-mono font-bold text-slate-400 mb-1">
                            Login Username (Email)
                          </label>
                          <input
                            type="email"
                            required
                            value={currentEdit.email}
                            onChange={(e) => handleCredentialChange(client.id, 'email', e.target.value)}
                            className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[9px] uppercase font-mono font-bold text-slate-400 mb-1">
                            <span>Client Access Password</span>
                            <button
                              type="button"
                              onClick={() => {
                                const generated = Math.random().toString(36).substring(2, 10);
                                handleCredentialChange(client.id, 'password', generated);
                              }}
                              className="text-[9px] text-blue-500 hover:underline font-bold"
                            >
                              Auto Generate
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="Set client password"
                            value={currentEdit.password}
                            onChange={(e) => handleCredentialChange(client.id, 'password', e.target.value)}
                            className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold font-mono focus:outline-none focus:border-blue-500 text-slate-850"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                      <button
                        onClick={() => {
                          const inviteDraft = `📢 Client Access Generated!\n\nHere are your secure credentials to join the ETAL Portal:\n- Login Page: ${window.location.origin}\n- Username/Email: ${currentEdit.email}\n- Secure Password: ${currentEdit.password}\n\nStrict data isolation measures are locked. Your invoice tracking is fully setup.`;
                          navigator.clipboard.writeText(inviteDraft);
                          setCopiedClientId(client.id);
                          setTimeout(() => setCopiedClientId(null), 2500);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-bold rounded-lg transition"
                      >
                        {isCopied ? (
                          <>
                            <Check size={11} className="text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied Direct!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Login Card</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveCredential(client.id)}
                        disabled={
                          currentEdit.email === client.email &&
                          currentEdit.password === (client.password || 'client123')
                        }
                        className={`text-xs font-extrabold py-1.5 px-3 rounded-lg transition ${
                          currentEdit.email === client.email &&
                          currentEdit.password === (client.password || 'client123')
                            ? 'bg-slate-100 text-slate-350 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        Save Access
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LOWER GRID: Client Activity Tracker (Audit Logs) and Project Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Summaries Panel (Column Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Deliverables Tracker</h3>
              <p className="text-xs text-slate-500">Live development milestones.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {filteredProjects.length} Managed
            </span>
          </div>

          <div className="space-y-4">
            {filteredProjects.map((p) => {
              const client = clients.find(c => c.id === p.clientId);
              return (
                <div key={p.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                    </div>
                    {client && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        For <span className="font-bold text-slate-700">{client.name}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 pb-3">{p.description}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">{p.progress}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-md ${
                        p.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                        p.status === 'review' ? 'bg-violet-50 text-violet-600' :
                        p.status === 'in-progress' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">No projects associated with this client.</div>
            )}
          </div>
        </div>

        {/* Client Activity Tracking - Audit logs listed in a timeline format */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              <span>Real-Time Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">Verifying system access & isolations.</p>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex gap-3 relative pb-2 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-white z-10 group-header" />
                    <div className="w-0.5 bg-slate-150 h-full -mt-0.5 absolute left-1.25" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">{log.userName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.1 select-none rounded font-bold font-mono">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-slate-400 block font-mono mt-1">{log.timestamp}</span>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">No activity logged yet.</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Role isolation enforced
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Every single database query is filtered strictly matching the client ID structure.
            </p>
          </div>
        </div>
      </div>

      {/* CREATE NEW CLIENT MODAL PANEL (Admin Only) */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} />
                <span>Onboard New Slate Client</span>
              </h3>
              <button 
                id="close-add-client-modal"
                onClick={() => setShowAddClientModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Client Name *</label>
                <input
                  id="input-new-client-name"
                  type="text"
                  required
                  placeholder="e.g. Paramount Studios"
                  value={newClientName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewClientName(val);
                    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setNewClientId(slug ? `client-${slug}` : '');
                  }}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Custom Client ID / Code *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomSuffix = Math.random().toString(36).substring(2, 7);
                      setNewClientId(`client-${randomSuffix}`);
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Generate Random ID
                  </button>
                </div>
                <input
                  id="input-new-client-id"
                  type="text"
                  required
                  placeholder="e.g. client-paramount"
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, ''))}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-bold font-mono text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block font-medium leading-normal">
                  Unique identifier code (e.g. client-apex). Used in Client ID logins & database isolation matching.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Industry Sector</label>
                  <input
                    id="input-new-client-industry"
                    type="text"
                    placeholder="e.g. Media/Crypto"
                    value={newClientIndustry}
                    onChange={(e) => setNewClientIndustry(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Email *</label>
                  <input
                    id="input-new-client-email"
                    type="email"
                    required
                    placeholder="contact@paramount.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telephone Account Contact</label>
                <input
                  id="input-new-client-phone"
                  type="text"
                  placeholder="+1 (555) 720-1100"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mailing Address Details</label>
                <textarea
                  id="input-new-client-address"
                  rows={2}
                  placeholder="Street and Postal credentials"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Set Portal Login Password *</label>
                  <button
                    type="button"
                    onClick={() => setNewClientPassword(Math.random().toString(36).substring(2, 10))}
                    className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Auto Generate Password
                  </button>
                </div>
                <input
                  id="input-new-client-password"
                  type="text"
                  required
                  placeholder="e.g. securePass123"
                  value={newClientPassword}
                  onChange={(e) => setNewClientPassword(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  id="btn-cancel-client-onboard"
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-client-onboard"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
