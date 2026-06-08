import { ClientCompany, Project, TimelineItem, FileRecord, FeedbackItem, Invoice, Meeting, NotificationItem, AuditLog } from '../types';

export const initialClients: ClientCompany[] = [
  {
    id: 'client-1',
    name: 'Acme Software',
    industry: 'Software & Technology',
    logo: 'A',
    email: 'contact@acmesoftware.com',
    phone: '+1 (555) 234-5678',
    address: '456 Innovation Way, Suite 100, San Francisco, CA 94107',
    status: 'active',
    joinedAt: '2025-01-15',
    password: 'client123'
  },
  {
    id: 'client-2',
    name: 'Apex BioLabs',
    industry: 'Healthcare & Biotech',
    logo: 'B',
    email: 'info@apexbio.com',
    phone: '+1 (555) 987-6543',
    address: '789 Science Blvd, Cambridge, MA 02139',
    status: 'active',
    joinedAt: '2025-03-22',
    password: 'apex123'
  },
  {
    id: 'client-3',
    name: 'Global Retailers',
    industry: 'Retail & E-commerce',
    logo: 'G',
    email: 'growth@globalretailers.com',
    phone: '+1 (555) 832-1920',
    address: '100 Broadway, 24th Floor, New York, NY 10005',
    status: 'active',
    joinedAt: '2025-05-10',
    password: 'global123'
  }
];

export const initialProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Enterprise App Redesign',
    description: 'Complete UI/UX overhaul of the web platform, transitioning to an elegant React/Tailwind frontend architecture with responsive support and high compliance.',
    clientId: 'client-1',
    progress: 74,
    status: 'in-progress',
    startDate: '2026-04-01',
    endDate: '2026-07-15',
    budget: 45000,
    category: 'Development',
    tasks: [
      {
        id: 'p1t-1',
        title: 'Complete User Persona Research',
        description: 'Interview 15 stakeholders and prepare behavioral user diagrams for the portal.',
        status: 'completed',
        assignedTo: 'Lead UX Researcher',
        dueDate: '2026-04-15',
        priority: 'medium'
      },
      {
        id: 'p1t-2',
        title: 'Figma Hi-Fi Wireframes Approval',
        description: 'Present the updated design files to the Acme executive panel.',
        status: 'completed',
        assignedTo: 'Product Designer',
        dueDate: '2026-05-10',
        priority: 'high'
      },
      {
        id: 'p1t-3',
        title: 'Implement Core Authentications',
        description: 'Set up JWT middleware routes, signups, multi-factor logins, and token expiry cycles.',
        status: 'in-progress',
        assignedTo: 'Backend Engineer',
        dueDate: '2026-06-20',
        priority: 'high'
      },
      {
        id: 'p1t-4',
        title: 'Build Interactive Dashboard Panels',
        description: 'Integrate SVG micro-indicator charts and sidebar responsive state structures.',
        status: 'todo',
        assignedTo: 'Frontend Engineer',
        dueDate: '2026-07-01',
        priority: 'medium'
      },
      {
        id: 'p1t-5',
        title: 'End-to-End Cypress Integration Tests',
        description: 'Write regression scripts verifying client-specific data isolation logic and query safety.',
        status: 'todo',
        assignedTo: 'QA Specialist',
        dueDate: '2026-07-10',
        priority: 'low'
      }
    ]
  },
  {
    id: 'project-2',
    name: 'Growth SEO & Content Campaign',
    description: 'A comprehensive organic brand expansion program. Includes keyword engineering, technical content clusters, page speed scaling, and high-domain backlinks profile building.',
    clientId: 'client-1',
    progress: 35,
    status: 'planning',
    startDate: '2026-05-15',
    endDate: '2026-10-30',
    budget: 18000,
    category: 'Marketing',
    tasks: [
      {
        id: 'p2t-1',
        title: 'Benchmark Analytics Audit',
        description: 'Review current search console clicks, impressions, crawl budget errors, speed limits.',
        status: 'completed',
        assignedTo: 'SEO Architect',
        dueDate: '2026-05-25',
        priority: 'high'
      },
      {
        id: 'p2t-2',
        title: 'Generate Content Calendar Q3',
        description: 'Map out 15 core authoritative educational guides targeting high-intent developer keywords.',
        status: 'in-progress',
        assignedTo: 'Content Director',
        dueDate: '2026-06-15',
        priority: 'medium'
      },
      {
        id: 'p2t-3',
        title: 'Backend Site Speed Optimization',
        description: 'Implement static generation, image webp compressions, and server response cachers.',
        status: 'todo',
        assignedTo: 'DevOps Engineer',
        dueDate: '2026-07-15',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'project-3',
    name: 'Biotech Landing Portal',
    description: 'Developing an informational cloud gateway for researchers to collaborate, access HIPAA-compliant telemetry data logs, and request clinical samples securely.',
    clientId: 'client-2',
    progress: 92,
    status: 'review',
    startDate: '2026-03-10',
    endDate: '2026-06-25',
    budget: 62000,
    category: 'Development',
    tasks: [
      {
        id: 'p3t-1',
        title: 'Database Architecture Definition',
        description: 'Setup Postgres schema designs, secure tables configurations, SSL certificates.',
        status: 'completed',
        assignedTo: 'System Architect',
        dueDate: '2026-03-30',
        priority: 'high'
      },
      {
        id: 'p3t-2',
        title: 'Clinical Data HIPAA Audit',
        description: 'Verify field-level encryption hashes for clinical records matching health policies.',
        status: 'completed',
        assignedTo: 'Compliance Officer',
        dueDate: '2026-04-20',
        priority: 'high'
      },
      {
        id: 'p3t-3',
        title: 'UI Integration & Lab APIs Connection',
        description: 'Construct real-time streaming pipelines presenting laboratory telemetry outputs.',
        status: 'completed',
        assignedTo: 'Frontend Specialist',
        dueDate: '2026-05-15',
        priority: 'high'
      },
      {
        id: 'p3t-4',
        title: 'Client Stakeholder Review Session',
        description: 'Conduct interactive walkthrough with clinical division admins and apply edits.',
        status: 'in-progress',
        assignedTo: 'Product Manager',
        dueDate: '2026-06-12',
        priority: 'high'
      }
    ]
  },
  {
    id: 'project-4',
    name: 'E-commerce Black Friday Funnel',
    description: 'High-volume checkout funnel deployment and technical performance scaling. Optimized to prevent abandonment and process 5,000 requests/minute securely.',
    clientId: 'client-3',
    progress: 15,
    status: 'planning',
    startDate: '2026-05-01',
    endDate: '2026-11-15',
    budget: 35000,
    category: 'Marketing',
    tasks: [
      {
        id: 'p4t-1',
        title: 'Audit Current Magento API Speed',
        description: 'Identify lookup blockers and database locking indices causing slow cart retrievals.',
        status: 'completed',
        assignedTo: 'Backend Lead',
        dueDate: '2026-05-20',
        priority: 'high'
      },
      {
        id: 'p4t-2',
        title: 'Funnel Blueprint Drafting',
        description: 'Sketch a consolidated single-tap payment page with instant express checkouts.',
        status: 'in-progress',
        assignedTo: 'CRO Planner',
        dueDate: '2026-06-15',
        priority: 'high'
      }
    ]
  }
];

export const initialTimeline: TimelineItem[] = [
  {
    id: 'tl-1',
    projectId: 'project-1',
    clientId: 'client-1',
    date: '2026-04-01',
    title: 'Project Kickoff Meeting',
    description: 'Aligned design objectives, selected tech stacks, set project scope boundaries, and mapped user stories.',
    type: 'meeting'
  },
  {
    id: 'tl-2',
    projectId: 'project-1',
    clientId: 'client-1',
    date: '2026-04-18',
    title: 'Creative Brand Direction Approved',
    description: 'Acme design sponsors locked typography selections, color modes, and layout spacing systems.',
    type: 'milestone'
  },
  {
    id: 'tl-3',
    projectId: 'project-1',
    clientId: 'client-1',
    date: '2026-05-02',
    title: 'First Creative Invoice Issued',
    description: 'Invoiced 40% developmental initial milestone. Invoice #INV-2026-001 issued.',
    type: 'invoice'
  },
  {
    id: 'tl-4',
    projectId: 'project-1',
    clientId: 'client-1',
    date: '2026-05-12',
    title: 'Figma Prototype Mockups Delivered',
    description: 'Shared detailed high-fidelity desktop and mobile assets ready for frontend styling.',
    type: 'file'
  },
  {
    id: 'tl-5',
    projectId: 'project-3',
    clientId: 'client-2',
    date: '2026-03-12',
    title: 'BioLabs Discovery Workshop',
    description: 'Detailed HIPAA parameters, laboratory sensor systems, and external analytical data pipelines.',
    type: 'meeting'
  },
  {
    id: 'tl-6',
    projectId: 'project-3',
    clientId: 'client-2',
    date: '2026-05-01',
    title: 'Data Flow Encryption Blueprint Approved',
    description: 'Sec QA verified cryptography protocols shielding patient credentials across micro-nodes.',
    type: 'milestone'
  }
];

export const initialFiles: FileRecord[] = [
  {
    id: 'file-1',
    name: 'Brand_Identity_Guidelines_v2.pdf',
    size: '14.2 MB',
    category: 'design',
    uploadedBy: 'Product Designer',
    uploadedAt: '2026-04-20 14:32',
    version: 2,
    clientId: 'client-1',
    projectId: 'project-1',
    versions: [
      {
        version: 2,
        updatedAt: '2026-04-20 14:32',
        size: '14.2 MB',
        changedBy: 'Product Designer',
        description: 'Applied typography tracking updates requested in creative walkthrough.'
      },
      {
        version: 1,
        updatedAt: '2026-04-12 09:15',
        size: '12.8 MB',
        changedBy: 'Product Designer',
        description: 'First draft containing moodboard concepts and UI typography proposals.'
      }
    ]
  },
  {
    id: 'file-2',
    name: 'Technical_Spec_Architecture_v1.md',
    size: '425 KB',
    category: 'development',
    uploadedBy: 'Lead Developer',
    uploadedAt: '2026-05-02 11:10',
    version: 1,
    clientId: 'client-1',
    projectId: 'project-1',
    versions: [
      {
        version: 1,
        updatedAt: '2026-05-02 11:10',
        size: '425 KB',
        changedBy: 'Lead Developer',
        description: 'Initial architectural framework. Outlines standard React layout and isolated data routing scopes.'
      }
    ]
  },
  {
    id: 'file-3',
    name: 'Clinical_FDA_HIPAA_Compliance_Cert.pdf',
    size: '3.6 MB',
    category: 'legal',
    uploadedBy: 'Compliance Officer',
    uploadedAt: '2026-03-25 16:45',
    version: 1,
    clientId: 'client-2',
    projectId: 'project-3',
    versions: [
      {
        version: 1,
        updatedAt: '2026-03-25 16:45',
        size: '3.6 MB',
        changedBy: 'Compliance Officer',
        description: 'Authorized HIPAA legal compliance document for clinical data integration.'
      }
    ]
  },
  {
    id: 'file-4',
    name: 'Retail_Growth_Sellers_Audit_Summary.xlsx',
    size: '2.1 MB',
    category: 'report',
    uploadedBy: 'Marketing Analyst',
    uploadedAt: '2026-05-18 10:20',
    version: 1,
    clientId: 'client-3',
    projectId: 'project-4',
    versions: [
      {
        version: 1,
        updatedAt: '2026-05-18 10:20',
        size: '2.1 MB',
        changedBy: 'Marketing Analyst',
        description: 'Black Friday search behaviors audit and Magento store indexing metrics.'
      }
    ]
  }
];

export const initialFeedback: FeedbackItem[] = [
  {
    id: 'fb-1',
    clientId: 'client-1',
    projectId: 'project-1',
    authorName: 'Sarah Jenkins (VP Product, Acme)',
    text: "We absolutely love the wireframe designs presented! Could we increase the font weight of the metrics titles slightly to make it look a bit more bold on smaller viewport screens?",
    rating: 5,
    status: 'resolved',
    createdAt: '2026-04-18 11:00',
    replies: [
      {
        id: 'fbr-1',
        authorName: 'Sarah Jenkins (VP Product, Acme)',
        text: 'Let us know if this makes sense.',
        isAdmin: false,
        createdAt: '2026-04-18 11:02'
      },
      {
        id: 'fbr-2',
        authorName: 'Creative Director (ETAL Digital)',
        text: 'Hi Sarah, absolutely! We boosted the title font weights to Semibold and verified viewport layouts. I uploaded version 2 of the Brand Guidelines reflecting this.',
        isAdmin: true,
        createdAt: '2026-04-20 14:35'
      }
    ]
  },
  {
    id: 'fb-2',
    clientId: 'client-1',
    projectId: 'project-2',
    authorName: 'Sarah Jenkins (VP Product, Acme)',
    text: "Could we expedite the 'Generate Content Calendar Q3' task? We have a large board meeting on June 20th and I'd love to share the structured outline beforehand.",
    rating: 4,
    status: 'pending',
    createdAt: '2026-06-05 09:30',
    replies: []
  },
  {
    id: 'fb-3',
    clientId: 'client-2',
    projectId: 'project-3',
    authorName: 'Dr. Aaron Meyer (Medical Director, Apex)',
    text: 'The telemetry screen is looking fantastic. Please confirm if we will be scheduling our sandbox data deployment next Monday as discussed.',
    rating: 5,
    status: 'pending',
    createdAt: '2026-06-06 15:40',
    replies: []
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-2026-001',
    clientId: 'client-1',
    description: 'Enterprise Client Portal Redesign - Phase 1 Milestone',
    amount: 18000,
    status: 'paid',
    issuedAt: '2026-04-10',
    dueDate: '2026-04-25',
    items: [
      {
        description: 'UI/UX Discovery & Responsive Figma Asset Delivery',
        qty: 1,
        rate: 8000,
        amount: 8000
      },
      {
        description: 'Frontend Core Setup - Tailwind Config & Layout Wrapper',
        qty: 1,
        rate: 10000,
        amount: 10000
      }
    ]
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-2026-002',
    clientId: 'client-1',
    description: 'Enterprise Client Portal Redesign - Phase 2 Development Update',
    amount: 15000,
    status: 'pending',
    issuedAt: '2026-05-28',
    dueDate: '2026-06-28',
    items: [
      {
        description: 'Authentication logic, routing, middleware setup',
        qty: 1,
        rate: 7500,
        amount: 7500
      },
      {
        description: 'Interactive dashboard module (React & motion integration)',
        qty: 1,
        rate: 7500,
        amount: 7500
      }
    ]
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-2026-003',
    clientId: 'client-2',
    description: 'Biotech Lab Data Portal - Main Setup Scope',
    amount: 42000,
    status: 'paid',
    issuedAt: '2026-03-15',
    dueDate: '2026-03-30',
    items: [
      {
        description: 'Postgres HIPAA Encrypted DB Architecture Design',
        qty: 1,
        rate: 22000,
        amount: 22000
      },
      {
        description: 'Sensor Stream WebSocket Interface Setup',
        qty: 1,
        rate: 20000,
        amount: 20000
      }
    ]
  },
  {
    id: 'inv-4',
    invoiceNo: 'INV-2026-004',
    clientId: 'client-3',
    description: 'Holiday Shopping Performance Readiness Framework',
    amount: 12000,
    status: 'overdue',
    issuedAt: '2026-04-15',
    dueDate: '2026-04-30',
    items: [
      {
        description: 'Magento Database Query Speed Optimization Audit',
        qty: 1,
        rate: 12000,
        amount: 12000
      }
    ]
  }
];

export const initialMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Acme Q3 Planning & Dashboard Status Walkthrough',
    description: 'Checking wireframe alignments, final layout revisions, dashboard metrics mapping, and next task schedules.',
    datetime: '2026-06-12T10:00',
    clientId: 'client-1',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    organizer: 'Alex Rivera (Creative Director)',
    status: 'scheduled',
    notes: [
      'Sarah Jenkins requested semibold weights for mobile metrics display.',
      'JWT session duration should be restricted to 2 hours with silent refreshes.',
      'Need to provide the full file audit schedule prior to Phase 3 development.'
    ]
  },
  {
    id: 'meet-2',
    title: 'Apex BioLabs HIPAA Sensor Data Integration Audit',
    description: 'Reviewing clinical research data policies, backend cryptographic hashing, and mock data sensor outputs with security inspectors.',
    datetime: '2026-06-18T14:30',
    clientId: 'client-2',
    meetLink: 'https://meet.google.com/xyz-pqrs-tuv',
    organizer: 'Marcus Chen (Compliance Lead)',
    status: 'scheduled',
    notes: []
  },
  {
    id: 'meet-3',
    title: 'Kicfkoff: Global Retailers Black Friday Campaign Strategy',
    description: 'Setting technical milestones, performance speeds benchmarks, stress budgets, and SEO keyword priorities.',
    datetime: '2026-05-04T11:00',
    clientId: 'client-3',
    meetLink: 'https://meet.google.com/mno-rstu-wxy',
    organizer: 'Diana Cruz (Marketing Lead)',
    status: 'completed',
    notes: [
      'Magento store speed index must drop under 1.8 seconds.',
      'Content generation priority goes to high-volume generic shopping terms.',
      'Create standard marketing dashboard preview schemas by end of May.'
    ]
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    clientId: 'client-1',
    title: 'Invoices Issued',
    text: 'Invoice INV-2026-002 was successfully issued with 30-day payment timeline details.',
    type: 'info',
    createdAt: '2026-05-28 09:00',
    read: false
  },
  {
    id: 'notif-2',
    clientId: 'client-1',
    title: 'Feedback Resolved',
    text: 'Alex Rivera replied to your wireframes rating with version 2 application layouts.',
    type: 'success',
    createdAt: '2026-04-20 14:36',
    read: true
  },
  {
    id: 'notif-3',
    clientId: 'client-2',
    title: 'New Feedback Submitted',
    text: 'Medical Director Aaron Meyer posted immediate feedback updates targeting the telemetry sensor page.',
    type: 'warning',
    createdAt: '2026-06-06 15:42',
    read: false
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'admin-user',
    userName: 'Alex Rivera (ETAL Digital)',
    action: 'Client Created',
    details: 'Created Global Retailers profiles, assigning growth growth@globalretailers.com contact scopes.',
    timestamp: '2026-05-10 11:32',
    clientId: 'client-3'
  },
  {
    id: 'log-2',
    userId: 'admin-user',
    userName: 'Alex Rivera (ETAL Digital)',
    action: 'File Uploaded',
    details: 'Uploaded Brand_Identity_Guidelines_v2.pdf to project Acme Enterprise App Redesign.',
    timestamp: '2026-04-20 14:32',
    clientId: 'client-1'
  },
  {
    id: 'log-3',
    userId: 'client-1-user',
    userName: 'Sarah Jenkins (VP Product, Acme)',
    action: 'Feedback Created',
    details: 'Submitted high rating feedback requesting semibold adjustments on responsive wireframes.',
    timestamp: '2026-04-18 11:00',
    clientId: 'client-1'
  },
  {
    id: 'log-4',
    userId: 'admin-user',
    userName: 'Alex Rivera (ETAL Digital)',
    action: 'Meeting Scheduled',
    details: 'Scheduled Acme Q3 Planning & Dashboard Status Walkthrough with Sarah Jenkins on June 12th.',
    timestamp: '2026-06-01 10:15',
    clientId: 'client-1'
  }
];
