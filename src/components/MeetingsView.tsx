import React, { useState } from 'react';
import { 
  Calendar, 
  Video, 
  Plus, 
  ExternalLink, 
  User as UserIcon, 
  Clock, 
  CheckCircle,
  FileText,
  CornerDownRight,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { User, ClientCompany, Project, Meeting } from '../types';

interface MeetingsViewProps {
  currentUser: User;
  clients: ClientCompany[];
  projects: Project[];
  meetings: Meeting[];
  onAddMeeting: (newMeet: Omit<Meeting, 'id' | 'status' | 'meetLink'>) => void;
  onAddMeetingNote: (meetingId: string, noteText: string) => void;
  onCancelMeeting: (meetingId: string) => void;
}

export default function MeetingsView({
  currentUser,
  clients,
  projects,
  meetings,
  onAddMeeting,
  onAddMeetingNote,
  onCancelMeeting
}: MeetingsViewProps) {
  const isAdmin = currentUser.role === 'admin';
  const clientId = currentUser.clientId;

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(
    meetings.length > 0 ? (isAdmin ? meetings[0] : (meetings.filter(m => m.clientId === clientId)[0] || null)) : null
  );

  // Form states - Create Meeting
  const [showAddForm, setShowAddForm] = useState(false);
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetDateTime, setMeetDateTime] = useState('2026-06-12T10:00');
  const [meetOrganizer, setMeetOrganizer] = useState(currentUser.name);
  const [meetClient, setMeetClient] = useState('');

  // Form states - Append meeting note
  const [newNote, setNewNote] = useState('');

  // Filter meetings
  const scopedMeetings = isAdmin
    ? meetings
    : meetings.filter(m => m.clientId === clientId);

  const upcomingMeetings = scopedMeetings
    .filter(m => m.status === 'scheduled')
    .sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const completedMeetings = scopedMeetings
    .filter(m => m.status === 'completed' || m.status === 'canceled')
    .sort((a,b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  const handleCreateMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle || !meetClient) return;

    onAddMeeting({
      title: meetTitle,
      description: meetDesc,
      datetime: meetDateTime,
      clientId: meetClient,
      organizer: meetOrganizer,
      notes: []
    });

    setMeetTitle('');
    setMeetDesc('');
    setShowAddForm(false);
  };

  const handleAddNoteSubmit = (e: React.FormEvent, meetId: string) => {
    e.preventDefault();
    if (!newNote) return;

    onAddMeetingNote(meetId, newNote);
    
    // Update selected meeting locale
    setSelectedMeeting(prev => {
      if (prev && prev.id === meetId) {
        return { ...prev, notes: [...prev.notes, newNote] };
      }
      return prev;
    });

    setNewNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Walkthrough Sessions & Calendars</h2>
          <p className="text-xs text-slate-500 mt-1">Review active agendas, read consensus notes, or launch Google Meet video links.</p>
        </div>

        {isAdmin && (
          <button
            id="btn-meetings-add-toggle"
            onClick={() => {
              if (clients.length > 0) setMeetClient(clients[0].id);
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition"
          >
            <Plus size={14} />
            <span>Schedule Walkthrough Session</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT INDEX: MEETINGS LISTINGS PANEL */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm space-y-4">
            
            <div className="border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Scheduled Walkthroughs</h3>
            </div>

            {/* Upcoming items segments */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Upcoming calendar</span>
              {upcomingMeetings.map((meet) => {
                const isSelected = selectedMeeting?.id === meet.id;
                const client = clients.find(c => c.id === meet.clientId);

                return (
                  <div
                    id={`meeting-row-nav-${meet.id}`}
                    key={meet.id}
                    onClick={() => setSelectedMeeting(meet)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-101'
                        : 'bg-slate-50 hover:bg-slate-100/50 text-slate-800 border-slate-200/55'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1.5 font-bold uppercase tracking-wider font-mono">
                      <span className="text-blue-500 font-extrabold flex items-center gap-1">
                        <Clock size={11} />
                        <span>Scheduled</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm truncate leading-tight">{meet.title}</h4>
                    {client && (
                      <span className={`text-[10px] block mt-1 ${isSelected ? 'text-slate-350' : 'text-slate-500'}`}>
                        For: {client.name}
                      </span>
                    )}

                    <div className="mt-3 text-[10px] font-bold border-t border-slate-100/10 pt-1.5 text-blue-500">
                      {new Date(meet.datetime).toLocaleDateString()} at {new Date(meet.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                );
              })}

              {upcomingMeetings.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-xs">No upcoming walkthroughs scheduled.</div>
              )}
            </div>

            {/* Historic meetings */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mb-1">Pass histories</span>
              {completedMeetings.map((meet) => {
                const isSelected = selectedMeeting?.id === meet.id;
                return (
                  <div
                    id={`meeting-row-nav-${meet.id}`}
                    key={meet.id}
                    onClick={() => setSelectedMeeting(meet)}
                    className={`p-2.5 rounded-xl text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100/40 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <h5 className="font-bold text-xs truncate">{meet.title}</h5>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Status: {meet.status}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* RIGHT INDEX: SELECTED MEETING WORKSPACE NOTES & MEET GOOGLE LINKS (Col Span 2) */}
        <div className="lg:col-span-2">
          {selectedMeeting ? (
            <div id="meeting-details-sheet" className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-md space-y-6 relative border-t-4 border-t-[#22C55E]">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block block">
                    WALKTHROUGH DETAIL REVIEW PANEL
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedMeeting.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedMeeting.description}</p>
                </div>

                {selectedMeeting.status === 'scheduled' && (
                  <a
                    href={selectedMeeting.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition scale-100 hover:scale-102 active:scale-98 shrink-0"
                  >
                    <Video size={14} className="fill-white" />
                    <span>Launch Google Meet</span>
                    <ExternalLink size={12} className="opacity-80" />
                  </a>
                )}
              </div>

              {/* Organizers and structural references info cards */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">ORGANIZER HOST</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">{selectedMeeting.organizer}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">SCHEDULE TIME</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">
                    {new Date(selectedMeeting.datetime).toLocaleDateString()} at {new Date(selectedMeeting.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>

              {/* DETAILED WALKTROUGH CONCENSUS NOTES BLOCK */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-1 font-mono flex items-center gap-1">
                  <FileText size={13} className="text-[#22C55E]" />
                  <span>Interactive Walkthrough Notes</span>
                </h4>

                <div className="space-y-3 font-medium">
                  {selectedMeeting.notes?.map((note, index) => (
                    <div key={index} className="flex gap-2 text-xs text-slate-700">
                      <CornerDownRight size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/20 flex-1">{note}</p>
                    </div>
                  ))}

                  {(!selectedMeeting.notes || selectedMeeting.notes.length === 0) && (
                    <div className="text-center py-6 text-[11px] text-slate-400">
                      No consensus logs saved yet. Submit a brief outline in the comment field below.
                    </div>
                  )}
                </div>

                {/* Form to submit meeting notes (Both can submit but mainly Admins) */}
                <form onSubmit={(e) => handleAddNoteSubmit(e, selectedMeeting.id)} className="pt-4 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Add Consensus Note</span>
                  <div className="flex gap-2">
                    <input
                      id={`input-meeting-note-${selectedMeeting.id}`}
                      type="text"
                      required
                      placeholder="Comment consensus details (e.g. Acme VP Sarah locked phase 2 layouts)..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 bg-slate-50 px-3 py-1.8 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                    <button
                      id={`btn-meeting-note-submit-${selectedMeeting.id}`}
                      type="submit"
                      className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>

              {/* Cancel session option (Admin only) */}
              {isAdmin && selectedMeeting.status === 'scheduled' && (
                <div className="pt-2">
                  <button
                    id={`btn-cancel-meeting-${selectedMeeting.id}`}
                    onClick={() => {
                      if (confirm('Cancel this walkthrough session? It will dismiss reminders across client calendars.')) {
                        onCancelMeeting(selectedMeeting.id);
                        setSelectedMeeting(null);
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold transition flex items-center gap-1.5 border border-rose-100 hover:border-transparent py-1.5 px-3 rounded-lg"
                  >
                    Cancel Walkthrough Session
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
              <Calendar size={40} className="text-slate-300" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Walkthrough Dashboard</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Click on any scheduled walkthrough segment on the left index list to review agendas, write minutes, or launch unique video links.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CREATE MEETING SCHEDULER DIALOG (Admin Only) */}
      {showAddForm && isAdmin && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                <span>Schedule Walkthrough Session</span>
              </h3>
              <button 
                id="close-add-meeting-modal"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateMeetingSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Session Title *</label>
                <input
                  id="input-new-meet-title"
                  type="text"
                  required
                  placeholder="e.g. Apex Biotech Clinical Review Walkthrough"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Outline Target Agenda Description</label>
                <textarea
                  id="input-new-meet-desc"
                  rows={2}
                  placeholder="Outline key questions, deliverables to review, and consensus items."
                  value={meetDesc}
                  onChange={(e) => setMeetDesc(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Client Association *</label>
                  <select
                    id="select-new-meet-client"
                    required
                    value={meetClient}
                    onChange={(e) => setMeetClient(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">-- Choose Client Company --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Organizer host name</label>
                  <input
                    id="input-new-meet-organizer"
                    type="text"
                    required
                    value={meetOrganizer}
                    onChange={(e) => setMeetOrganizer(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Meeting Date & Time *</label>
                <input
                  id="input-new-meet-datetime"
                  type="datetime-local"
                  required
                  value={meetDateTime}
                  onChange={(e) => setMeetDateTime(e.target.value)}
                  className="w-full bg-slate-50 px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  id="btn-meetings-cancel"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-meetings-confirm"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Schedule Invite
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
