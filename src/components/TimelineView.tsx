import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Tag, 
  Sliders, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Flag,
  FileText,
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { User, ClientCompany, Project, TimelineItem } from '../types';

interface TimelineViewProps {
  currentUser: User;
  clients: ClientCompany[];
  projects: Project[];
  timeline: TimelineItem[];
  onAddTimelineEvent: (event: Omit<TimelineItem, 'id'>) => void;
}

export default function TimelineView({
  currentUser,
  clients,
  projects,
  timeline,
  onAddTimelineEvent
}: TimelineViewProps) {
  const isAdmin = currentUser.role === 'admin';
  const clientId = currentUser.clientId;

  const [filterType, setFilterType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  // Event modal state
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('2026-06-07');
  const [eventType, setEventType] = useState<'milestone' | 'update' | 'file' | 'meeting' | 'invoice'>('milestone');
  const [eventProj, setEventProj] = useState('');

  // Scoped timeline
  const scopedTimeline = isAdmin 
    ? timeline 
    : timeline.filter(t => t.clientId === clientId);

  const filteredTimeline = scopedTimeline.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesProject = filterProject === 'all' || item.projectId === filterProject;
    return matchesType && matchesProject;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const scopedProjects = isAdmin 
    ? projects 
    : projects.filter(p => p.clientId === clientId);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventProj || !eventTitle) return;

    const matchedProj = projects.find(p => p.id === eventProj);
    if (!matchedProj) return;

    onAddTimelineEvent({
      projectId: eventProj,
      clientId: matchedProj.clientId,
      date: eventDate,
      title: eventTitle,
      description: eventDesc,
      type: eventType
    });

    setEventTitle('');
    setEventDesc('');
    setShowAddEvent(false);
  };

  const getIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'milestone': return <Flag className="text-[#EF4444]" size={16} />;
      case 'update': return <CheckCircle2 className="text-blue-500" size={16} />;
      case 'file': return <FileText className="text-violet-500" size={16} />;
      case 'meeting': return <Calendar className="text-[#22C55E]" size={16} />;
      case 'invoice': return <Bookmark className="text-[#F59E0B]" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Interactive Milestone Roadmap</h2>
          <p className="text-xs text-slate-500 mt-1">Chronological summary of development deliveries and invoices.</p>
        </div>

        {isAdmin && (
          <button
            id="btn-timeline-add-event-toggle"
            onClick={() => {
              if (scopedProjects.length > 0) setEventProj(scopedProjects[0].id);
              setShowAddEvent(!showAddEvent);
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Record Release Entry</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLLATERAL FORM OR FILTER PANEL */}
        <div className="space-y-4">
          
          {/* Timeline Filter capsule */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4 text-xs font-medium">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Filter Roadmap</h3>
            
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Milestone Type</label>
              <select
                id="timeline-filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none"
              >
                <option value="all">⚡ All Milestones (Broad View)</option>
                <option value="milestone">🚩 Major Release / Milestone</option>
                <option value="update">🔧 Development Update</option>
                <option value="file">📁 Document & Figma Assets</option>
                <option value="meeting">👥 Meeting Walkthrough</option>
                <option value="invoice">💳 Invoice Issued</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Project Scope</label>
              <select
                id="timeline-filter-project"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none"
              >
                <option value="all">📁 All Active Projects</option>
                {scopedProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 text-xs text-slate-500">
            <h4 className="font-bold text-slate-800 mb-1">Tracking Release Logs</h4>
            <p className="leading-relaxed">
              Every timeline item lists development, files, and invoice histories, so you don't miss key agency communication milestones.
            </p>
          </div>
        </div>

        {/* DELIVERABLES TIMELINE FLOW CANVAS */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
          
          {/* Inline Action block for Create Release */}
          {showAddEvent && isAdmin && (
            <div id="add-timeline-event-segment" className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Record Timeline Event Release</h3>
              
              <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Event Title *</label>
                  <input
                    id="input-timeline-event-title"
                    type="text"
                    required
                    placeholder="e.g. Beta Version 1.0 Release"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Project Portfolio *</label>
                  <select
                    id="select-timeline-event-project"
                    required
                    value={eventProj}
                    onChange={(e) => setEventProj(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    {scopedProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Chronological Summary Description</label>
                  <textarea
                    id="input-timeline-event-desc"
                    rows={2}
                    placeholder="Provide details about specs delivered, files, or payment expectations."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Release Date Time</label>
                  <input
                    id="input-timeline-event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Event Marker Icon</label>
                  <select
                    id="select-timeline-event-type"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="milestone">Major Milestone (Red Flag)</option>
                    <option value="update">🔧 Development Update</option>
                    <option value="file">📁 Design File Delivery</option>
                    <option value="meeting">👥 Walkthrough Meeting</option>
                    <option value="invoice">💳 Invoice Ledger</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    id="btn-timeline-cancel-create"
                    type="button"
                    onClick={() => setShowAddEvent(false)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-timeline-confirm-create"
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition"
                  >
                    Record Event
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Vertical Milestone Lane */}
          <div className="relative border-l-2 border-slate-150 pl-6 ml-4 space-y-8 py-2">
            {filteredTimeline.map((item) => {
              const proj = projects.find(p => p.id === item.projectId);
              const comp = clients.find(c => c.id === item.clientId);

              return (
                <div key={item.id} className="relative group/time">
                  {/* Glowing vertical point icon */}
                  <span className="absolute -left-[35px] top-1.5 w-[18px] h-[18px] rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-sm group-hover/time:border-blue-500 transition-colors">
                    {getIcon(item.type)}
                  </span>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block tracking-widest mt-0.5">
                      {item.date} {comp ? `| ${comp.name}` : ''}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-800 mt-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">{item.description}</p>
                    
                    {proj && (
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span className="text-[10px] bg-slate-50 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                          Project: {proj.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredTimeline.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No chronological events recorded matching this scope filters.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
