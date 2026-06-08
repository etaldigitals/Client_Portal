export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string; // defined if role === 'client'
  companyName?: string;
  phone?: string;
  avatar?: string;
  rememberMe?: boolean;
}

export interface ClientCompany {
  id: string;
  name: string;
  industry: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  password?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  progress: number; // 0-100
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  category: string;
  tasks: Task[];
}

export interface TimelineItem {
  id: string;
  projectId: string;
  clientId: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'update' | 'file' | 'meeting' | 'invoice';
}

export interface FileVersion {
  version: number;
  updatedAt: string;
  size: string;
  changedBy: string;
  description: string;
}

export interface FileRecord {
  id: string;
  name: string;
  size: string;
  category: 'design' | 'development' | 'report' | 'legal' | 'marketing';
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  clientId: string;
  projectId?: string;
  versions: FileVersion[];
}

export interface FeedbackReply {
  id: string;
  authorName: string;
  text: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  clientId: string;
  projectId?: string;
  authorName: string;
  text: string;
  rating: number; // 1-5
  status: 'pending' | 'resolved';
  createdAt: string;
  replies: FeedbackReply[];
}

export interface InvoiceLineItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issuedAt: string;
  dueDate: string;
  items: InvoiceLineItem[];
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  datetime: string;
  clientId: string;
  meetLink: string;
  organizer: string;
  notes: string[];
  status: 'scheduled' | 'completed' | 'canceled';
}

export interface NotificationItem {
  id: string;
  clientId?: string; // If undefined, applies to all or admin
  title: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  createdAt: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  clientId?: string;
}
