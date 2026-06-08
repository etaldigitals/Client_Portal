import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Star, 
  CheckCircle, 
  Clock, 
  Filter, 
  CornerDownRight, 
  AlertCircle,
  ThumbsUp,
  User as UserIcon
} from 'lucide-react';
import { User, ClientCompany, Project, FeedbackItem, FeedbackReply } from '../types';

interface FeedbackViewProps {
  currentUser: User;
  clients: ClientCompany[];
  projects: Project[];
  feedbacks: FeedbackItem[];
  onSubmitFeedback: (newFb: Omit<FeedbackItem, 'id' | 'createdAt' | 'replies'>) => void;
  onReplyFeedback: (feedbackId: string, replyText: string) => void;
}

export default function FeedbackView({
  currentUser,
  clients,
  projects,
  feedbacks,
  onSubmitFeedback,
  onReplyFeedback
}: FeedbackViewProps) {
  const isAdmin = currentUser.role === 'admin';
  const clientId = currentUser.clientId;

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  
  // Create feedback forms input
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackProj, setFeedbackProj] = useState('');

  // Inline replies states
  const [replyInputMap, setReplyInputMap] = useState<{[key: string]: string}>({});

  // Filter feedbacks
  const scopedFeedbacks = isAdmin
    ? feedbacks
    : feedbacks.filter(f => f.clientId === clientId);

  const filteredFeedbacks = scopedFeedbacks.filter(f => {
    if (activeFilter === 'all') return true;
    return f.status === activeFilter;
  }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const scopedProjects = isAdmin
    ? projects
    : projects.filter(p => p.clientId === clientId);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;

    onSubmitFeedback({
      clientId: clientId || 'client-1',
      projectId: feedbackProj || undefined,
      authorName: `${currentUser.name} (${currentUser.companyName || 'Client'})`,
      text: feedbackText,
      rating: feedbackRating,
      status: 'pending'
    });

    setFeedbackText('');
    setFeedbackRating(5);
    setFeedbackProj('');
  };

  const handleReplySubmit = (e: React.FormEvent, fbId: string) => {
    e.preventDefault();
    const replyText = replyInputMap[fbId];
    if (!replyText) return;

    onReplyFeedback(fbId, replyText);
    
    // Clear the map
    setReplyInputMap(prev => ({
      ...prev,
      [fbId]: ''
    }));
  };

  const handleRatingStarSelect = (rating: number) => {
    setFeedbackRating(rating);
  };

  // Render score breakdown average
  const totalScore = scopedFeedbacks.reduce((sum, f) => sum + f.rating, 0);
  const avgSatisfaction = scopedFeedbacks.length > 0 
    ? (totalScore / scopedFeedbacks.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Client Satisfaction Log</h2>
          <p className="text-xs text-slate-500 mt-1">Review ratings and address feedback loops instantly.</p>
        </div>

        <div className="bg-slate-50 border border-slate-150 px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">SATISFACTION RATING</span>
            <span className="text-sm font-extrabold font-mono text-blue-600 mt-1 block">{avgSatisfaction} / 5.0</span>
          </div>
          <div className="flex">
            {[1,2,3,4,5].map((star) => (
              <Star 
                key={star} 
                size={14} 
                className={`${star <= Math.round(Number(avgSatisfaction)) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CLIENT OPINION FORM / FILTER RAILS */}
        <div className="space-y-4">
          
          {/* CLIENT FORM COMPONENT */}
          {!isAdmin && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Submit Feedback Summary</h3>
              <p className="text-xs text-slate-400 mt-1">Your constructive feedback is logged securely directly to technical account leads.</p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Associate Deliverable (Optional)</label>
                  <select
                    id="feedback-assoc-project"
                    value={feedbackProj}
                    onChange={(e) => setFeedbackProj(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none"
                  >
                    <option value="">-- No specific project tag --</option>
                    {scopedProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Rating Score</label>
                  <div className="flex gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        id={`btn-star-select-${star}`}
                        type="button"
                        key={star}
                        onClick={() => handleRatingStarSelect(star)}
                        className="hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star 
                          size={24} 
                          className={`${
                            star <= feedbackRating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Feedback Message *</label>
                  <textarea
                    id="input-feedback-text"
                    required
                    rows={3}
                    placeholder="Describe adjustments, wireframes ratings, or campaign modifications..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  id="btn-feedback-submit"
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}

          {/* SYSTEM FILTER BOARD */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Feedbacks Ledger Status</h4>
            <div className="space-y-1.5 font-medium text-xs">
              {['all', 'pending', 'resolved'].map((filt) => (
                <button
                  id={`btn-filter-feedback-${filt}`}
                  key={filt}
                  onClick={() => setActiveFilter(filt as any)}
                  className={`w-full flex items-center justify-between text-left py-2 px-3 rounded-lg capitalize ${
                    activeFilter === filt
                      ? 'bg-blue-50 text-blue-600 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {filt === 'all' && <Filter size={13} />}
                    {filt === 'pending' && <Clock size={13} className="text-amber-500" />}
                    {filt === 'resolved' && <CheckCircle size={13} className="text-[#22C55E]" />}
                    {filt}
                  </span>
                  <span className="text-[10px] font-mono">
                    ({scopedFeedbacks.filter(f => filt === 'all' || f.status === filt).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FEEDBACK LOG ENTRIES (Col Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm space-y-6">
            <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider font-mono">
              Feedback Loop Activities ({filteredFeedbacks.length} logs)
            </h3>

            <div className="space-y-6 divide-y divide-slate-100">
              {filteredFeedbacks.map((fb, idx) => {
                const proj = projects.find(p => p.id === fb.projectId);
                return (
                  <div key={fb.id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''} space-y-3 font-medium`}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <UserIcon size={12} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800">{fb.authorName}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{fb.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Rating block */}
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <Star 
                              key={s} 
                              size={12} 
                              className={`${s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>

                        {/* Status capsule */}
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full uppercase ${
                          fb.status === 'resolved' 
                            ? 'bg-[#22C55E]/10 text-[#22C55E]' 
                            : 'bg-amber-50 text-[#F59E0B]'
                        }`}>
                          {fb.status}
                        </span>
                      </div>
                    </div>

                    {/* Feedback content text */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50 mt-2 text-xs text-slate-700 leading-relaxed font-sans">
                      {proj && (
                        <div className="text-[10px] text-blue-600 font-bold mb-1 uppercase tracking-wider">
                          Deliverable Tag: {proj.name}
                        </div>
                      )}
                      {fb.text}
                    </div>

                    {/* REPLY THREAD RECURSIONS */}
                    {fb.replies.length > 0 && (
                      <div className="space-y-3 pl-6 border-l border-slate-150 mt-3">
                        {fb.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2.5 text-xs">
                            <CornerDownRight size={14} className="text-slate-400 mt-1" />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-bold ${reply.isAdmin ? 'text-blue-600' : 'text-slate-700'}`}>
                                  {reply.authorName}
                                </span>
                                {reply.isAdmin && (
                                  <span className="text-[8px] bg-blue-50 text-blue-600 font-black px-1.5 py-0.1 select-none rounded uppercase">
                                    Admin sponsor
                                  </span>
                                )}
                                <span className="text-[9px] text-slate-400 font-mono">({reply.createdAt})</span>
                              </div>
                              <p className="text-slate-600 mt-0.8 leading-relaxed">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ADMIN REPLY FORM INPUT BAR */}
                    {isAdmin && (
                      <form 
                        onSubmit={(e) => handleReplySubmit(e, fb.id)}
                        className="pl-6 border-l border-slate-150 mt-3 pt-2"
                      >
                        <div className="flex gap-2">
                          <input
                            id={`input-reply-text-${fb.id}`}
                            type="text"
                            required
                            placeholder="Write an administrative reply and mark resolved..."
                            value={replyInputMap[fb.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReplyInputMap(prev => ({
                                ...prev,
                                [fb.id]: val
                              }));
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
                          />
                          <button
                            id={`btn-reply-send-${fb.id}`}
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition shrink-0"
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
                );
              })}

              {filteredFeedbacks.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs font-medium flex flex-col items-center justify-center gap-2">
                  <AlertCircle size={28} className="text-slate-300" />
                  <span>No client reviews found matching active filters.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
