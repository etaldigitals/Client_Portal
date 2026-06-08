import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  ArrowUpRight, 
  HelpCircle, 
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  User, 
  ClientCompany, 
  Project, 
  Task, 
  TimelineItem, 
  FileRecord, 
  FeedbackItem, 
  FeedbackReply,
  Invoice, 
  Meeting, 
  NotificationItem, 
  AuditLog 
} from './types';

// Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import TimelineView from './components/TimelineView';
import FilesView from './components/FilesView';
import FeedbackView from './components/FeedbackView';
import ReportsView from './components/ReportsView';
import InvoicesView from './components/InvoicesView';
import MeetingsView from './components/MeetingsView';
import ProfileView from './components/ProfileView';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';

// Initial boilerplates datasets
import { 
  initialClients, 
  initialProjects, 
  initialTimeline, 
  initialFiles, 
  initialFeedback, 
  initialInvoices, 
  initialMeetings, 
  initialNotifications, 
  initialAuditLogs 
} from './utils/initialData';

const STORAGE_KEYS = {
  CLIENTS: 'etal_portal_clients',
  PROJECTS: 'etal_portal_projects',
  TIMELINE: 'etal_portal_timeline',
  FILES: 'etal_portal_files',
  FEEDBACK: 'etal_portal_feedback',
  INVOICES: 'etal_portal_invoices',
  MEETINGS: 'etal_portal_meetings',
  NOTIFICATIONS: 'etal_portal_notifications',
  LOGS: 'etal_portal_audit_logs',
  USER: 'etal_portal_auth_user',
  AUTH: 'etal_portal_is_auth'
};

const defaultAdminUser: User = {
  id: 'admin-user',
  email: 'etaldigitals@gmail.com',
  name: 'Super Admin',
  role: 'admin',
  rememberMe: true
};

export default function App() {
  // 1. AUTH STATES
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved ? JSON.parse(saved) : false; // default false so user is forced to see login screen
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : defaultAdminUser;
  });

  // 2. PRIMARY ENTITY STATES WITH LOCALSTORAGE DEFAULTING
  const [clients, setClients] = useState<ClientCompany[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    return saved ? JSON.parse(saved) : initialTimeline;
  });

  const [files, setFiles] = useState<FileRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FILES);
    return saved ? JSON.parse(saved) : initialFiles;
  });

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    return saved ? JSON.parse(saved) : initialFeedback;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    return saved ? JSON.parse(saved) : initialMeetings;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // UI States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Login inputs states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 3. STORAGE PERSISTENCE BINDING
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [
    isAuthenticated, currentUser, clients, projects, timeline, 
    files, feedbacks, invoices, meetings, notifications, auditLogs
  ]);

  // Supabase connection validation matches global import from supabaseClient

  // State sync and save helpers
  const safeSupaInsert = async (table: string, record: any) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from(table).upsert(record);
      if (error) console.error(`[Supabase insert ${table}]:`, error);
    } catch (err) {
      console.error(err);
    }
  };

  const safeSupaDelete = async (table: string, id: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) console.error(`[Supabase delete ${table}]:`, error);
    } catch (err) {
      console.error(err);
    }
  };

  // LOAD CLOUD DATA ON AUTHENTICATION/MOUNT
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (!isAuthenticated) return;

    const loadAllDatabaseSyncData = async () => {
      try {
        const { data: c } = await supabase.from('clients').select('*');
        if (c && c.length > 0) {
          setClients(c.map(item => ({
            id: item.id,
            name: item.name,
            industry: item.industry || '',
            logo: item.logo || '',
            email: item.email || '',
            phone: item.phone || '',
            address: item.address || '',
            status: (item.status as any) || 'active',
            joinedAt: item.joined_at || '',
            password: item.password || 'client123'
          })));
        }

        const { data: p } = await supabase.from('projects').select('*');
        if (p && p.length > 0) {
          setProjects(p.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            clientId: item.client_id || '',
            progress: Number(item.progress || 0),
            status: (item.status as any) || 'planning',
            startDate: item.start_date || '',
            endDate: item.end_date || '',
            budget: Number(item.budget || 0),
            category: item.category || '',
            tasks: (item.tasks as any) || []
          })));
        }

        const { data: t } = await supabase.from('timeline').select('*');
        if (t && t.length > 0) {
          setTimeline(t.map(item => ({
            id: item.id,
            projectId: item.project_id || '',
            clientId: item.client_id || '',
            date: item.date || '',
            title: item.title,
            description: item.description || '',
            type: (item.type || 'checkpoint') as any
          })));
        }

        const { data: f } = await supabase.from('files').select('*');
        if (f && f.length > 0) {
          setFiles(f.map(item => ({
            id: item.id,
            name: item.name,
            size: item.size || '0 KB',
            category: (item.category as any) || 'spec',
            uploadedBy: item.uploaded_by || 'Admin',
            uploadedAt: item.uploaded_at || '',
            version: Number(item.version || 1),
            clientId: item.client_id || '',
            projectId: item.project_id || '',
            versions: (item.versions as any) || []
          })));
        }

        const { data: fb } = await supabase.from('feedbacks').select('*');
        if (fb && fb.length > 0) {
          setFeedbacks(fb.map(item => ({
            id: item.id,
            clientId: item.client_id || '',
            projectId: item.project_id || '',
            authorName: item.author_name || 'Anonymous',
            text: item.text || '',
            rating: Number(item.rating || 5),
            status: (item.status as any) || 'pending',
            createdAt: item.created_at || '',
            replies: (item.replies as any) || []
          })));
        }

        const { data: inv } = await supabase.from('invoices').select('*');
        if (inv && inv.length > 0) {
          setInvoices(inv.map(item => ({
            id: item.id,
            invoiceNo: item.invoice_no || '',
            clientId: item.client_id || '',
            description: item.description || '',
            amount: Number(item.amount || 0),
            status: item.status as any,
            issuedAt: item.issued_at || '',
            dueDate: item.due_date || '',
            items: (item.items as any) || []
          })));
        }

        const { data: mt } = await supabase.from('meetings').select('*');
        if (mt && mt.length > 0) {
          setMeetings(mt.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            datetime: item.datetime || '',
            clientId: item.client_id || '',
            meetLink: item.meet_link || '',
            organizer: item.organizer || '',
            notes: (item.notes as any) || [],
            status: item.status as any
          })));
        }

        const { data: n } = await supabase.from('notifications').select('*');
        if (n && n.length > 0) {
          setNotifications(n.map(item => ({
            id: item.id,
            clientId: item.client_id || undefined,
            title: item.title,
            text: item.text || '',
            type: (item.type || 'info') as any,
            createdAt: item.created_at || '',
            read: !!item.read
          })));
        }

        const { data: logs } = await supabase.from('audit_logs').select('*');
        if (logs && logs.length > 0) {
          setAuditLogs(logs.map(item => ({
            id: item.id,
            userId: item.user_id || '',
            userName: item.user_name || 'System',
            action: item.action,
            details: item.details || '',
            timestamp: item.timestamp || '',
            clientId: item.client_id || undefined
          })));
        }
      } catch (err) {
        console.error('Offline loading fallback triggered:', err);
      }
    };

    loadAllDatabaseSyncData();

    // ⚡ REALTIME SYNC WORKFLOWS
    const clientSub = supabase.channel('clients-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
      supabase.from('clients').select('*').then(({ data }) => {
        if (data && data.length > 0) {
          setClients(data.map(item => ({
            id: item.id,
            name: item.name,
            industry: item.industry || '',
            logo: item.logo || '',
            email: item.email || '',
            phone: item.phone || '',
            address: item.address || '',
            status: (item.status as any) || 'active',
            joinedAt: item.joined_at || '',
            password: item.password || 'client123'
          })));
        }
      });
    }).subscribe();

    const projSub = supabase.channel('projects-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
      supabase.from('projects').select('*').then(({ data }) => {
        if (data) {
          setProjects(data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            clientId: item.client_id || '',
            progress: Number(item.progress || 0),
            status: (item.status as any) || 'planning',
            startDate: item.start_date || '',
            endDate: item.end_date || '',
            budget: Number(item.budget || 0),
            category: item.category || '',
            tasks: (item.tasks as any) || []
          })));
        }
      });
    }).subscribe();

    const timelineSub = supabase.channel('timeline-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'timeline' }, () => {
      supabase.from('timeline').select('*').then(({ data }) => {
        if (data) {
          setTimeline(data.map(item => ({
            id: item.id,
            projectId: item.project_id || '',
            clientId: item.client_id || '',
            date: item.date || '',
            title: item.title,
            description: item.description || '',
            type: (item.type || 'checkpoint') as any
          })));
        }
      });
    }).subscribe();

    const filesSub = supabase.channel('files-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => {
      supabase.from('files').select('*').then(({ data }) => {
        if (data) {
          setFiles(data.map(item => ({
            id: item.id,
            name: item.name,
            size: item.size || '0 KB',
            category: (item.category as any) || 'spec',
            uploadedBy: item.uploaded_by || 'Admin',
            uploadedAt: item.uploaded_at || '',
            version: Number(item.version || 1),
            clientId: item.client_id || '',
            projectId: item.project_id || '',
            versions: (item.versions as any) || []
          })));
        }
      });
    }).subscribe();

    const feedbackSub = supabase.channel('feedbacks-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'feedbacks' }, () => {
      supabase.from('feedbacks').select('*').then(({ data }) => {
        if (data) {
          setFeedbacks(data.map(item => ({
            id: item.id,
            clientId: item.client_id || '',
            projectId: item.project_id || '',
            authorName: item.author_name || 'Anonymous',
            text: item.text || '',
            rating: Number(item.rating || 5),
            status: (item.status as any) || 'pending',
            createdAt: item.created_at || '',
            replies: (item.replies as any) || []
          })));
        }
      });
    }).subscribe();

    const invoiceSub = supabase.channel('invoices-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
      supabase.from('invoices').select('*').then(({ data }) => {
        if (data) {
          setInvoices(data.map(item => ({
            id: item.id,
            invoiceNo: item.invoice_no || '',
            clientId: item.client_id || '',
            description: item.description || '',
            amount: Number(item.amount || 0),
            status: item.status as any,
            issuedAt: item.issued_at || '',
            dueDate: item.due_date || '',
            items: (item.items as any) || []
          })));
        }
      });
    }).subscribe();

    const meetSub = supabase.channel('meetings-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => {
      supabase.from('meetings').select('*').then(({ data }) => {
        if (data) {
          setMeetings(data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            datetime: item.datetime || '',
            clientId: item.client_id || '',
            meetLink: item.meet_link || '',
            organizer: item.organizer || '',
            notes: (item.notes as any) || [],
            status: item.status as any
          })));
        }
      });
    }).subscribe();

    return () => {
      supabase.removeChannel(clientSub);
      supabase.removeChannel(projSub);
      supabase.removeChannel(timelineSub);
      supabase.removeChannel(filesSub);
      supabase.removeChannel(feedbackSub);
      supabase.removeChannel(invoiceSub);
      supabase.removeChannel(meetSub);
    };
  }, [isAuthenticated]);

  // 4. ACTION DISPATCH WRAPPERS (PROMOTING STATE UPDATES)
  
  // Audits logger
  const writeAuditLog = (action: string, details: string, clientIdContext?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: `${currentUser.name} (${currentUser.role === 'admin' ? 'ETAL Admin' : currentUser.companyName})`,
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      clientId: clientIdContext
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Send mock notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      clientId: clientIdContext,
      title: action,
      text: details,
      type: 'info',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Async push to Supabase
    safeSupaInsert('audit_logs', {
      id: newLog.id,
      user_id: newLog.userId,
      user_name: newLog.userName,
      action: newLog.action,
      details: newLog.details,
      timestamp: newLog.timestamp,
      client_id: newLog.clientId || null
    });

    safeSupaInsert('notifications', {
      id: newNotif.id,
      client_id: newNotif.clientId || null,
      title: newNotif.title,
      text: newNotif.text,
      type: newNotif.type,
      created_at: newNotif.createdAt,
      read: newNotif.read
    });
  };

  // Switch/Impersonate another user
  const handleSwitchUserSession = (role: User['role'], targetClientId?: string) => {
    let swUser: User;
    if (role === 'admin') {
      swUser = defaultAdminUser;
    } else {
      const company = clients.find(c => c.id === targetClientId) || clients[0];
      swUser = {
        id: `client-${company.id}-user`,
        email: company.email,
        name: `Contact Agent (${company.name})`,
        role: 'client',
        clientId: company.id,
        companyName: company.name,
        phone: company.phone
      };
    }
    setCurrentUser(swUser);
    setActiveTab('dashboard');
    writeAuditLog('User Session Initiated', `Assumed portal session role: ${role === 'admin' ? 'Super Admin' : swUser.companyName}`, targetClientId);
  };

  // Add Client organization
  const handleAddClientCompany = (newClient: Omit<ClientCompany, 'joinedAt'>) => {
    const clientRecord: ClientCompany = {
      ...newClient,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [...prev, clientRecord]);
    writeAuditLog('Client Onboarded', `Added company account profile for ${clientRecord.name} (${clientRecord.industry}).`, clientRecord.id);

    // Save client public profile
    safeSupaInsert('clients', {
      id: clientRecord.id,
      name: clientRecord.name,
      industry: clientRecord.industry || '',
      logo: clientRecord.logo || '',
      email: clientRecord.email || '',
      phone: clientRecord.phone || '',
      address: clientRecord.address || '',
      status: clientRecord.status || 'active',
      joined_at: clientRecord.joinedAt,
      password: clientRecord.password || 'client123'
    });
  };

  const handleUpdateClientCredentials = (clientId: string, email: string, password?: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const updated = { ...c, email, password };
        safeSupaInsert('clients', {
          id: updated.id,
          name: updated.name,
          industry: updated.industry || '',
          logo: updated.logo || '',
          email: updated.email || '',
          phone: updated.phone || '',
          address: updated.address || '',
          status: updated.status || 'active',
          joined_at: updated.joinedAt,
          password: updated.password || 'client123'
        });
        return updated;
      }
      return c;
    }));
    const clientName = clients.find(c => c.id === clientId)?.name || 'Client';
    writeAuditLog('Client Credentials Updated', `Updated portal login credentials for client "${clientName}". Email: ${email}`, clientId);
  };

  // Add Project Pipeline
  const handleAddProject = (newProj: Omit<Project, 'id' | 'tasks'>) => {
    const projectRecord: Project = {
      ...newProj,
      id: `project-${Date.now()}`,
      tasks: []
    };
    setProjects(prev => [...prev, projectRecord]);

    // Append to timeline
    const timelineRecord: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: projectRecord.id,
      clientId: projectRecord.clientId,
      date: projectRecord.startDate,
      title: 'Project Initiated',
      description: `New developmental portfolio mapped: ${projectRecord.name}. Budget allocated: $${projectRecord.budget}`,
      type: 'milestone'
    };
    setTimeline(prev => [...prev, timelineRecord]);

    writeAuditLog('Project Pipeline Built', `Registered active development folder: ${projectRecord.name}`, projectRecord.clientId);

    // Sync to cloud
    safeSupaInsert('projects', {
      id: projectRecord.id,
      name: projectRecord.name,
      description: projectRecord.description || '',
      client_id: projectRecord.clientId,
      progress: projectRecord.progress,
      status: projectRecord.status,
      start_date: projectRecord.startDate,
      end_date: projectRecord.endDate,
      budget: projectRecord.budget,
      category: projectRecord.category,
      tasks: projectRecord.tasks
    });

    safeSupaInsert('timeline', {
      id: timelineRecord.id,
      project_id: timelineRecord.projectId,
      client_id: timelineRecord.clientId,
      date: timelineRecord.date,
      title: timelineRecord.title,
      description: timelineRecord.description,
      type: timelineRecord.type
    });
  };

  const handleUpdateProjectProgress = (projectId: string, progress: number, status: Project['status']) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        // Log on milestone completion
        if (progress === 100 && p.progress !== 100) {
          setTimeout(() => {
            const timelineRecord: TimelineItem = {
              id: `tl-${Date.now()}`,
              projectId: p.id,
              clientId: p.clientId,
              date: new Date().toISOString().split('T')[0],
              title: 'Project Development Delivery Stable',
              description: `100% development progress achieved for project: ${p.name}. Delivering clean verified outputs.`,
              type: 'milestone'
            };
            setTimeline(t => [...t, timelineRecord]);
            safeSupaInsert('timeline', {
              id: timelineRecord.id,
              project_id: timelineRecord.projectId,
              client_id: timelineRecord.clientId,
              date: timelineRecord.date,
              title: timelineRecord.title,
              description: timelineRecord.description,
              type: timelineRecord.type
            });
          }, 100);
        }

        const updated = { ...p, progress, status };
        safeSupaInsert('projects', {
          id: updated.id,
          name: updated.name,
          description: updated.description || '',
          client_id: updated.clientId,
          progress: updated.progress,
          status: updated.status,
          start_date: updated.startDate,
          end_date: updated.endDate,
          budget: updated.budget,
          category: updated.category,
          tasks: updated.tasks
        });
        return updated;
      }
      return p;
    }));
    
    const projName = projects.find(p => p.id === projectId)?.name || 'Project';
    writeAuditLog('Project Progress Mutated', `Set progress to ${progress}% and status to ${status} for ${projName}`);
  };

  // Tasks Add & Status Switch
  const handleAddTask = (projectId: string, task: Omit<Task, 'id'>) => {
    const taskRecord: Task = {
      ...task,
      id: `task-${Date.now()}`
    };
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, tasks: [...p.tasks, taskRecord] };
        safeSupaInsert('projects', {
          id: updated.id,
          name: updated.name,
          description: updated.description || '',
          client_id: updated.clientId,
          progress: updated.progress,
          status: updated.status,
          start_date: updated.startDate,
          end_date: updated.endDate,
          budget: updated.budget,
          category: updated.category,
          tasks: updated.tasks
        });
        return updated;
      }
      return p;
    }));
    writeAuditLog('Task Dispatched', `Assigned deliverables: "${taskRecord.title}" to ${taskRecord.assignedTo}`);
  };

  const handleUpdateTaskStatus = (projectId: string, taskId: string, status: Task['status']) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextTasks = p.tasks.map(t => {
          if (t.id === taskId) {
            return { ...t, status };
          }
          return t;
        });
        const updated = { ...p, tasks: nextTasks };
        safeSupaInsert('projects', {
          id: updated.id,
          name: updated.name,
          description: updated.description || '',
          client_id: updated.clientId,
          progress: updated.progress,
          status: updated.status,
          start_date: updated.startDate,
          end_date: updated.endDate,
          budget: updated.budget,
          category: updated.category,
          tasks: updated.tasks
        });
        return updated;
      }
      return p;
    }));
    
    const taskTitle = projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId)?.title || 'Task';
    writeAuditLog('Task State Toggled', `Swapped status mapping of "${taskTitle}" to ${status}`);
  };

  const handleDeleteProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    writeAuditLog('Project Removed', `Archived and dissociated developmental module folder: ${proj.name}`, proj.clientId);
    safeSupaDelete('projects', projectId);
  };

  // Add Document File
  const handleAddFile = (newFile: Omit<FileRecord, 'id' | 'uploadedBy' | 'uploadedAt' | 'version' | 'versions'>) => {
    const fileRecord: FileRecord = {
      ...newFile,
      id: `file-${Date.now()}`,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      version: 1,
      versions: [
        {
          version: 1,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          size: newFile.size,
          changedBy: currentUser.name,
          description: 'Document initial sandbox deposit.'
        }
      ]
    };
    setFiles(prev => [...prev, fileRecord]);

    // Timeline record
    const timelineRecord: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: newFile.projectId || '',
      clientId: newFile.clientId,
      date: new Date().toISOString().split('T')[0],
      title: 'Digital Spec Vault Uploaded',
      description: `Secure file uploaded to cloud repository: ${fileRecord.name} (${fileRecord.size})`,
      type: 'file'
    };
    setTimeline(prev => [...prev, timelineRecord]);

    writeAuditLog('Asset Deposited', `Uploaded folder item: ${fileRecord.name}`, fileRecord.clientId);

    safeSupaInsert('files', {
      id: fileRecord.id,
      name: fileRecord.name,
      size: fileRecord.size,
      category: fileRecord.category,
      uploaded_by: fileRecord.uploadedBy,
      uploaded_at: fileRecord.uploadedAt,
      version: fileRecord.version,
      client_id: fileRecord.clientId,
      project_id: fileRecord.projectId || null,
      versions: fileRecord.versions
    });

    safeSupaInsert('timeline', {
      id: timelineRecord.id,
      project_id: timelineRecord.projectId || null,
      client_id: timelineRecord.clientId,
      date: timelineRecord.date,
      title: timelineRecord.title,
      description: timelineRecord.description,
      type: timelineRecord.type
    });
  };

  const handleAddFileVersion = (fileId: string, description: string, size: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const nextVer = f.version + 1;
        const newVerRec = {
          version: nextVer,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          size,
          changedBy: currentUser.name,
          description
        };
        const updated = {
          ...f,
          version: nextVer,
          size,
          versions: [newVerRec, ...f.versions]
        };
        safeSupaInsert('files', {
          id: updated.id,
          name: updated.name,
          size: updated.size,
          category: updated.category,
          uploaded_by: updated.uploadedBy,
          uploaded_at: updated.uploadedAt,
          version: updated.version,
          client_id: updated.clientId,
          project_id: updated.projectId || null,
          versions: updated.versions
        });
        return updated;
      }
      return f;
    }));
    
    const fName = files.find(f => f.id === fileId)?.name || 'File';
    const fClient = files.find(f => f.id === fileId)?.clientId || 'client-1';
    writeAuditLog('Asset Version Appended', `Pushed revision updates to ${fName}`, fClient);
  };

  const handleDeleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    setFiles(prev => prev.filter(f => f.id !== fileId));
    writeAuditLog('Asset Purged', `Deleted file record: ${file.name}`, file.clientId);
    safeSupaDelete('files', fileId);
  };

  // Feedbacks rating handlers
  const handleAddFeedback = (newFb: Omit<FeedbackItem, 'id' | 'createdAt' | 'replies'>) => {
    const feedbackRecord: FeedbackItem = {
      ...newFb,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      replies: []
    };
    setFeedbacks(prev => [...prev, feedbackRecord]);
    writeAuditLog('Client Feedback Lodged', `Left star rating comment on delivery checkpoints.`, feedbackRecord.clientId);

    safeSupaInsert('feedbacks', {
      id: feedbackRecord.id,
      client_id: feedbackRecord.clientId,
      project_id: feedbackRecord.projectId || null,
      author_name: feedbackRecord.authorName,
      text: feedbackRecord.text,
      rating: feedbackRecord.rating,
      status: feedbackRecord.status,
      created_at: feedbackRecord.createdAt,
      replies: feedbackRecord.replies
    });
  };

  const handleReplyFeedback = (feedbackId: string, replyText: string) => {
    const replyRecord: FeedbackReply = {
      id: `fbr-${Date.now()}`,
      authorName: currentUser.name,
      text: replyText,
      isAdmin: true,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setFeedbacks(prev => prev.map(f => {
      if (f.id === feedbackId) {
        const updated = {
          ...f,
          status: 'resolved' as const,
          replies: [...f.replies, replyRecord]
        };
        safeSupaInsert('feedbacks', {
          id: updated.id,
          client_id: updated.clientId,
          project_id: updated.projectId || null,
          author_name: updated.authorName,
          text: updated.text,
          rating: updated.rating,
          status: updated.status,
          created_at: updated.createdAt,
          replies: updated.replies
        });
        return updated;
      }
      return f;
    }));

    const client = feedbacks.find(f => f.id === feedbackId)?.clientId || 'client-1';
    writeAuditLog('Agency Comment Replied', `Replied to client feedback and shifted status to resolved.`, client);
  };

  // Timeline events creator
  const handleAddTimelineEvent = (event: Omit<TimelineItem, 'id'>) => {
    const timelineRecord: TimelineItem = {
      ...event,
      id: `tl-${Date.now()}`
    };
    setTimeline(prev => [timelineRecord, ...prev]);

    const pName = projects.find(p => p.id === event.projectId)?.name || 'Project';
    writeAuditLog('Timeline Event Released', `Appended roadmap milestone "${event.title}" for project "${pName}"`, event.clientId);

    safeSupaInsert('timeline', {
      id: timelineRecord.id,
      project_id: timelineRecord.projectId || null,
      client_id: timelineRecord.clientId,
      date: timelineRecord.date,
      title: timelineRecord.title,
      description: timelineRecord.description,
      type: timelineRecord.type
    });
  };

  // Compile billing invoice
  const handleAddInvoice = (newInv: Omit<Invoice, 'id' | 'invoiceNo' | 'status'>) => {
    const indexSeq = invoices.length + 1;
    const invoiceNo = `INV-2026-${indexSeq < 10 ? '00' : '0'}${indexSeq}`;
    
    const invoiceRecord: Invoice = {
      ...newInv,
      id: `inv-${Date.now()}`,
      invoiceNo,
      status: 'pending'
    };
    setInvoices(prev => [...prev, invoiceRecord]);

    // Timeline item
    const timelineRecord: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: '',
      clientId: invoiceRecord.clientId,
      date: invoiceRecord.issuedAt,
      title: 'Ledger Invoice Issued',
      description: `Invoice sheet ${invoiceNo} compiled for outstanding amount: $${invoiceRecord.amount.toLocaleString()}`,
      type: 'invoice'
    };
    setTimeline(prev => [...prev, timelineRecord]);

    writeAuditLog('Invoicing Issued', `Dispatched ledger statement ${invoiceNo} for $${invoiceRecord.amount.toLocaleString()}`, invoiceRecord.clientId);

    safeSupaInsert('invoices', {
      id: invoiceRecord.id,
      invoice_no: invoiceRecord.invoiceNo,
      client_id: invoiceRecord.clientId,
      description: invoiceRecord.description,
      amount: invoiceRecord.amount,
      status: invoiceRecord.status,
      issued_at: invoiceRecord.issuedAt,
      due_date: invoiceRecord.dueDate,
      items: invoiceRecord.items
    });

    safeSupaInsert('timeline', {
      id: timelineRecord.id,
      project_id: timelineRecord.projectId || null,
      client_id: timelineRecord.clientId,
      date: timelineRecord.date,
      title: timelineRecord.title,
      description: timelineRecord.description,
      type: timelineRecord.type
    });
  };

  const handlePayInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        const updated = { ...i, status: 'paid' as const };
        safeSupaInsert('invoices', {
          id: updated.id,
          invoice_no: updated.invoiceNo,
          client_id: updated.clientId,
          description: updated.description,
          amount: updated.amount,
          status: updated.status,
          issued_at: updated.issuedAt,
          due_date: updated.dueDate,
          items: updated.items
        });
        return updated;
      }
      return i;
    }));
    
    const invNo = invoices.find(i => i.id === invoiceId)?.invoiceNo || 'INV';
    const invClient = invoices.find(i => i.id === invoiceId)?.clientId || 'client-1';
    
    // Add timeline audit on receipt
    const timelineRecord: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: '',
      clientId: invClient,
      date: new Date().toISOString().split('T')[0],
      title: 'Ledger Dues Discharged',
      description: `Invoice ${invNo} successfully settled via credit card authorization session. Receipts filed.`,
      type: 'invoice'
    };
    setTimeline(prev => [...prev, timelineRecord]);

    writeAuditLog('Invoice Settle Captured', `Captured credit card settling of invoice sheet ${invNo}`, invClient);

    safeSupaInsert('timeline', {
      id: timelineRecord.id,
      project_id: timelineRecord.projectId || null,
      client_id: timelineRecord.clientId,
      date: timelineRecord.date,
      title: timelineRecord.title,
      description: timelineRecord.description,
      type: timelineRecord.type
    });
  };

  // Walkthrough schedule creators
  const handleAddMeeting = (newMeet: Omit<Meeting, 'id' | 'status' | 'meetLink'>) => {
    const randS = Math.random().toString(36).substring(2,5) + '-' + Math.random().toString(36).substring(2,6) + '-' + Math.random().toString(36).substring(2,5);
    const meetRecord: Meeting = {
      ...newMeet,
      id: `meet-${Date.now()}`,
      meetLink: `https://meet.google.com/${randS}`,
      status: 'scheduled'
    };
    setMeetings(prev => [...prev, meetRecord]);

    // Timeline integration
    const timelineRecord: TimelineItem = {
      id: `tl-${Date.now()}`,
      projectId: '',
      clientId: meetRecord.clientId,
      date: meetRecord.datetime.split('T')[0],
      title: 'Walkthrough Scheduled',
      description: `Google Meet scheduled on ${meetRecord.datetime.replace('T', ' ')} with sponsor ${meetRecord.organizer}`,
      type: 'meeting'
    };
    setTimeline(prev => [...prev, timelineRecord]);

    writeAuditLog('Walkthrough Session Scheduled', `Created Google Meet calendar invitation: "${meetRecord.title}"`, meetRecord.clientId);

    safeSupaInsert('meetings', {
      id: meetRecord.id,
      title: meetRecord.title,
      description: meetRecord.description,
      datetime: meetRecord.datetime,
      client_id: meetRecord.clientId,
      meet_link: meetRecord.meetLink,
      organizer: meetRecord.organizer,
      notes: meetRecord.notes,
      status: meetRecord.status
    });

    safeSupaInsert('timeline', {
      id: timelineRecord.id,
      project_id: timelineRecord.projectId || null,
      client_id: timelineRecord.clientId,
      date: timelineRecord.date,
      title: timelineRecord.title,
      description: timelineRecord.description,
      type: timelineRecord.type
    });
  };

  const handleAddMeetingNote = (meetingId: string, noteText: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        const updated = { ...m, notes: [...m.notes, noteText] };
        safeSupaInsert('meetings', {
          id: updated.id,
          title: updated.title,
          description: updated.description,
          datetime: updated.datetime,
          client_id: updated.clientId,
          meet_link: updated.meetLink,
          organizer: updated.organizer,
          notes: updated.notes,
          status: updated.status
        });
        return updated;
      }
      return m;
    }));
    
    const title = meetings.find(m => m.id === meetingId)?.title || 'Walkthrough';
    const meetClient = meetings.find(m => m.id === meetingId)?.clientId || 'client-1';
    writeAuditLog('Consensus Notes Appended', `Added notes to walkthrough session titled "${title}"`, meetClient);
  };

  const handleCancelMeeting = (meetingId: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        const updated = { ...m, status: 'canceled' as const };
        safeSupaInsert('meetings', {
          id: updated.id,
          title: updated.title,
          description: updated.description,
          datetime: updated.datetime,
          client_id: updated.clientId,
          meet_link: updated.meetLink,
          organizer: updated.organizer,
          notes: updated.notes,
          status: updated.status
        });
        return updated;
      }
      return m;
    }));
    
    const title = meetings.find(m => m.id === meetingId)?.title || 'Walkthrough';
    const meetClient = meetings.find(m => m.id === meetingId)?.clientId || 'client-1';
    writeAuditLog('Walkthrough Room Cancelled', `Dismissed calendar session "${title}"`, meetClient);
  };

  // Notifications indicators
  const handleMarkNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, read: true };
        safeSupaInsert('notifications', {
          id: updated.id,
          client_id: updated.clientId || null,
          title: updated.title,
          text: updated.text,
          type: updated.type,
          created_at: updated.createdAt,
          read: updated.read
        });
        return updated;
      }
      return n;
    }));
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications(prev => {
      const updatedList = prev.map(n => ({ ...n, read: true }));
      updatedList.forEach(updated => {
        safeSupaInsert('notifications', {
          id: updated.id,
          client_id: updated.clientId || null,
          title: updated.title,
          text: updated.text,
          type: updated.type,
          created_at: updated.createdAt,
          read: updated.read
        });
      });
      return updatedList;
    });
  };

  const handleUpdateProfile = (updated: Omit<User, 'id' | 'role' | 'clientId' | 'companyName'>) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updated
    }));
    writeAuditLog('Profile Contact Altered', 'Updated accounts mail information and telecom preferences.');
  };

  // Secure logout action: allows safe and clean logout without wiping local/cloud database
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(defaultAdminUser);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // Clear login fields upon clean logout
    setLoginEmail('');
    setLoginPassword('');
  };

  // LOGIN INTERFACE CONTROLLERS
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setLoginError('Primary login credentials required.');
      return;
    }
    
    const emailOrIdNorm = loginEmail.trim().toLowerCase();
    let loggedUser: User;
    
    // 1. Super Admin authentication
    if (emailOrIdNorm === 'etaldigitals@gmail.com') {
      if (loginPassword !== 'etal1234567') {
        setLoginError('Authentication failed: Invalid password for ETAL Super Admin.');
        return;
      }
      loggedUser = defaultAdminUser;
    } 
    // 2. Client authentication matching exact registered email or Client ID
    else {
      const matchedClient = clients.find(c => 
        c.email.trim().toLowerCase() === emailOrIdNorm ||
        c.id.trim().toLowerCase() === emailOrIdNorm
      );
      if (!matchedClient) {
        setLoginError('Authentication failed: No registered client account found with this Client ID or Email. Access is generated by Super Admin.');
        return;
      }
      
      const expectedPassword = matchedClient.password || 'client123';
      if (loginPassword !== expectedPassword) {
        setLoginError(`Authentication failed: Invalid credentials for ${matchedClient.name}.`);
        return;
      }
      
      loggedUser = {
        id: `client-${matchedClient.id}-user`,
        email: matchedClient.email,
        name: `Contact Agent (${matchedClient.name})`,
        role: 'client',
        clientId: matchedClient.id,
        companyName: matchedClient.name,
        phone: matchedClient.phone
      };
    }

    setCurrentUser(loggedUser);
    setIsAuthenticated(true);
    setLoginError('');
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedUser));
    writeAuditLog('User Authenticated', `Secure authentication session initiated for ${loggedUser.role === 'admin' ? 'Super Admin' : loggedUser.companyName}`);
  };

  // Core visual tab layout dispatcher
  const renderCoreViewContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            currentUser={currentUser}
            clients={clients}
            projects={projects}
            files={files}
            feedbacks={feedbacks}
            invoices={invoices}
            meetings={meetings}
            auditLogs={auditLogs}
            onAddClient={handleAddClientCompany}
            onSelectClient={(cid) => handleSwitchUserSession('client', cid)}
            onUpdateClientCredentials={handleUpdateClientCredentials}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            currentUser={currentUser}
            clients={clients}
            projects={projects}
            onAddProject={handleAddProject}
            onUpdateProjectProgress={handleUpdateProjectProgress}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteProject={handleDeleteProject}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            currentUser={currentUser}
            clients={clients}
            projects={projects}
            timeline={timeline}
            onAddTimelineEvent={handleAddTimelineEvent}
          />
        );
      case 'files':
        return (
          <FilesView
            currentUser={currentUser}
            clients={clients}
            projects={projects}
            files={files}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onAddFileVersion={handleAddFileVersion}
          />
        );
      case 'feedback':
        return (
          <FeedbackView
            currentUser={currentUser}
            clients={clients}
            projects={projects}
            feedbacks={feedbacks}
            onSubmitFeedback={handleAddFeedback}
            onReplyFeedback={handleReplyFeedback}
          />
        );
      case 'reports':
        return (
          <ReportsView
            currentUser={currentUser}
            clients={clients}
            projects={projects}
            files={files}
            invoices={invoices}
          />
        );
      case 'invoices':
        return (
          <InvoicesView
            currentUser={currentUser}
            clients={clients}
            projects={projects}
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
            onPayInvoice={handlePayInvoice}
          />
        );
      case 'meetings':
        return (
          <MeetingsView
            currentUser={currentUser}
            clients={clients}
            projects={projects}
            meetings={meetings}
            onAddMeeting={handleAddMeeting}
            onAddMeetingNote={handleAddMeetingNote}
            onCancelMeeting={handleCancelMeeting}
          />
        );
      case 'profile':
        return (
          <ProfileView
            currentUser={currentUser}
            clients={clients}
            notifications={notifications}
            onUpdateProfile={handleUpdateProfile}
            onSwitchUserSession={handleSwitchUserSession}
            onMarkNotificationRead={handleMarkNotifRead}
            onMarkAllNotificationsRead={handleMarkAllNotifsRead}
          />
        );
      default:
        return <div className="text-center py-12">Tab under development.</div>;
    }
  };

  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600/10 selection:text-blue-600">
      
      {/* 1. LOGIN PROMPT SHELL SCREEN */}
      {!isAuthenticated ? (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="bg-slate-950/80 border border-slate-800 p-8 rounded-3xl w-full max-w-md relative z-10 space-y-6 shadow-2xl backdrop-blur-md">
            
            <div className="text-center space-y-2">
              <div className="inline-flex bg-blue-600 p-3 rounded-2xl font-bold text-lg text-white shadow-lg mb-1">ED</div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-none">ETAL Client Hub</h1>
              <p className="text-xs text-slate-400 font-medium">SaaS-style premium client portal & ledger manager</p>
            </div>

            {loginError && (
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-rose-400 text-xs flex gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5 uppercase tracking-wider text-[10px]">Client ID or Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    id="login-email"
                    type="text"
                    required
                    placeholder="e.g. client-acme or contact@acmesoftware.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5 uppercase tracking-wider text-[10px]">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium pt-1">
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                  <input type="checkbox" id="login-remember" defaultChecked className="rounded text-blue-600 focus:ring-0 cursor-pointer" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  id="forgot-pass-trigger"
                  onClick={() => alert('📨 Password reset link dispatched to client inbox.')}
                  className="text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl tracking-wide transition shadow-lg shadow-blue-500/20"
              >
                Launch Portal Session
              </button>
            </form>

          </div>
        </div>
      ) : (
        
        // 2. LOGGED-IN PORTAL INTERFACE SYSTEM
        <div className="flex min-h-screen">
          
          {/* Sided collapsible Navigation Drawer */}
          <Sidebar
            currentUser={currentUser}
            clients={clients}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            onLogout={handleLogout}
            onSwitchUser={() => setActiveTab('profile')}
            unreadNotificationsCount={unreadNotifs}
          />

          {/* Workbench canvas body */}
          <main className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-20 lg:pl-72'}`}>
            
            {/* Top Bar Navigation */}
            <header className="h-20 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 capitalize">
                  etaldigitals.com &bull; {activeTab}
                </span>
              </div>

              {/* Status indicators and quick switched role badge */}
              <div className="flex items-center gap-4">
                
                {/* Impersonated context helper badge */}
                <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold leading-none border border-slate-800">
                  {currentUser.role === 'admin' ? (
                    <>
                      <ShieldCheck size={13} className="text-blue-400" />
                      <span>Console: Super Admin Mode</span>
                    </>
                  ) : (
                    <>
                      <Building2 size={13} className="text-emerald-400" />
                      <span>Company Mode: {currentUser.companyName}</span>
                    </>
                  )}
                </span>

                <button
                  id="btn-top-quick-impersonate"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-1.5 px-3.5 py-1.8 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  <span>Role Switcher</span>
                </button>
              </div>
            </header>

            {/* View container */}
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              {renderCoreViewContent()}
            </div>

          </main>

        </div>
      )}

    </div>
  );
}
