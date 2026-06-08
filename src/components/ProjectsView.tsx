import React, { useState } from 'react';
import { 
  FolderPlus, 
  Plus, 
  Calendar, 
  DollarSign, 
  ClipboardList, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  Trash2, 
  User as UserIcon, 
  ChevronRight, 
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { User, ClientCompany, Project, Task } from '../types';

interface ProjectsViewProps {
  currentUser: User;
  clients: ClientCompany[];
  projects: Project[];
  onAddProject: (newProj: Omit<Project, 'id' | 'tasks'>) => void;
  onUpdateProjectProgress: (projectId: string, progress: number, status: Project['status']) => void;
  onAddTask: (projectId: string, task: Omit<Task, 'id'>) => void;
  onUpdateTaskStatus: (projectId: string, taskId: string, status: Task['status']) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function ProjectsView({
  currentUser,
  clients,
  projects,
  onAddProject,
  onUpdateProjectProgress,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteProject
}: ProjectsViewProps) {
  const isAdmin = currentUser.role === 'admin';
  const clientId = currentUser.clientId;

  // Selected state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? (isAdmin ? projects[0].id : (projects.find(p => p.clientId === clientId)?.id || null)) : null
  );

  // Form states - Create Project
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projClient, setProjClient] = useState('');
  const [projBudget, setProjBudget] = useState(10000);
  const [projCategory, setProjCategory] = useState('Development');
  const [projStart, setProjStart] = useState('2026-06-01');
  const [projEnd, setProjEnd] = useState('2026-09-01');

  // Form states - Create Task
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssigned, setTaskAssigned] = useState('');
  const [taskDue, setTaskDue] = useState('2026-07-01');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Interactive filtering variables
  const [clientFilter, setClientFilter] = useState('all');

  // Get matching projects list
  const scopedProjects = isAdmin 
    ? (clientFilter === 'all' ? projects : projects.filter(p => p.clientId === clientFilter))
    : projects.filter(p => p.clientId === clientId);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projClient) return;

    onAddProject({
      name: projName,
      description: projDesc,
      clientId: projClient,
      progress: 0,
      status: 'planning',
      startDate: projStart,
      endDate: projEnd,
      budget: Number(projBudget),
      category: projCategory
    });

    setProjName('');
    setProjDesc('');
    setProjClient('');
    setProjBudget(10000);
    setProjStart('2026-06-01');
    setProjEnd('2026-09-01');
    setShowAddProjectModal(false);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !taskTitle) return;

    onAddTask(selectedProjectId, {
      title: taskTitle,
      description: taskDesc,
      status: 'todo',
      assignedTo: taskAssigned || 'TBD Team Member',
      dueDate: taskDue,
      priority: taskPriority
    });

    setTaskTitle('');
    setTaskDesc('');
    setTaskAssigned('');
    setTaskDue('2026-07-01');
    setTaskPriority('medium');
    setShowAddTaskModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Project Directory & Admin Launcher Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Project Pipelines</h3>
              <p className="text-xs text-slate-500">List of ongoing scopes.</p>
            </div>
            {isAdmin && (
              <button
                id="btn-add-project-modal"
                onClick={() => {
                  if (clients.length > 0) setProjClient(clients[0].id);
                  setShowAddProjectModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl shadow-sm transition flex items-center justify-center"
                title="Create New Project"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {/* Admin dropdown client isolator filter */}
          {isAdmin && (
            <div className="relative mb-4">
              <Filter size={14} className="absolute left-3 top-3 text-slate-400" />
              <select
                id="project-client-filter"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg pl-9 pr-4 py-2 text-slate-700 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="all">⚡ All Companies (Global Views)</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>🏢 {c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Projects Pipeline Cards navigation */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {scopedProjects.map((p) => {
              const comp = clients.find(c => c.id === p.clientId);
              const isSelected = p.id === selectedProjectId;
              return (
                <div
                  id={`project-card-nav-${p.id}`}
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-101'
                      : 'bg-slate-50 hover:bg-slate-100/70 text-slate-800 border-slate-200/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1.5 font-bold uppercase tracking-wider">
                    <span className={isSelected ? 'text-blue-400' : 'text-blue-600'}>
                      {p.category}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-semibold ${
                      p.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                      p.status === 'review' ? 'bg-indigo-500/10 text-indigo-400' :
                      'bg-slate-400/15 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm truncate leading-tight mb-1">{p.name}</h4>
                  
                  {isAdmin && comp && (
                    <span className={`text-[10px] block font-medium truncate opacity-80 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      Company: {comp.name}
                    </span>
                  )}

                  {/* Progress Line */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1 bg-slate-100/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isSelected ? 'bg-blue-400' : 'bg-blue-600'}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold">{p.progress}%</span>
                  </div>
                </div>
              );
            })}

            {scopedProjects.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">No active projects matching the query scope.</div>
            )}
          </div>
        </div>

        {/* Selected Project Financial Ledger info pill */}
        {selectedProject && (
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800/80 shadow-md space-y-4">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#3B82F6] font-mono">
              Campaign Budget Matrix
            </h4>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Approved Budget</span>
              <span className="text-lg font-black font-mono text-[#22C55E]">${selectedProject.budget.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Completed Tasks</span>
              <span className="text-xs font-bold bg-slate-800 py-0.5 px-2 rounded-full">
                {selectedProject.tasks.filter(t => t.status === 'completed').length} / {selectedProject.tasks.length} Done
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1 font-medium">
              <div className="bg-slate-800/45 p-2 rounded-xl text-left border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">LAUNCH DATE</span>
                <span className="text-[11px] font-mono font-bold text-slate-100 block mt-1">{selectedProject.startDate}</span>
              </div>
              <div className="bg-slate-800/45 p-2 rounded-xl text-left border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">DUE TARGET</span>
                <span className="text-[11px] font-mono font-bold text-slate-100 block mt-1">{selectedProject.endDate}</span>
              </div>
            </div>

            {isAdmin && (
              <button
                id={`btn-delete-project-${selectedProject.id}`}
                onClick={() => {
                  if (confirm('Are you absolutely certain you want to tear down this project module? All tasks, timelines and folders will dissociate.')) {
                    onDeleteProject(selectedProject.id);
                    setSelectedProjectId(null);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 py-2 rounded-xl text-xs font-bold transition mt-2"
              >
                <Trash2 size={14} />
                <span>Dissociate Project Pipeline</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT WORKBENCH: Active Project Tasks, Progress Sliders, and Assignments (Column Span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {selectedProject ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm space-y-6">
            
            {/* Header with Project Title & Action Switch / Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
              <div>
                <span className="text-xs text-blue-600 bg-blue-50 font-bold px-2 py-0.5 rounded uppercase">
                  {selectedProject.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">{selectedProject.name}</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedProject.description}</p>
              </div>

              {/* Status capsule indicator & edit triggers (Admin Only) */}
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">STATUS & PIPELINE PROGRESS</span>
                    <div className="flex items-center gap-2 mt-1">
                      <select
                        id={`select-project-status-${selectedProject.id}`}
                        value={selectedProject.status}
                        onChange={(e) => onUpdateProjectProgress(selectedProject.id, selectedProject.progress, e.target.value as Project['status'])}
                        className="bg-white border border-slate-200 text-xs font-bold py-1 px-2 rounded-md outline-none"
                      >
                        <option value="planning">Planning Mode</option>
                        <option value="in-progress">In-Progress Mode</option>
                        <option value="review">Creative Review</option>
                        <option value="completed">Completed Stable</option>
                      </select>
                      
                      <input
                        id={`input-project-progress-num-${selectedProject.id}`}
                        type="number"
                        min="0"
                        max="100"
                        value={selectedProject.progress}
                        onChange={(e) => onUpdateProjectProgress(selectedProject.id, Number(e.target.value), selectedProject.status)}
                        className="w-12 bg-white border border-slate-200 rounded p-0.5 text-center font-bold"
                      />
                      <span>%</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block">PIPELINE STATUS</span>
                    <span className="text-sm font-extrabold text-blue-600 mt-1 block uppercase">
                      {selectedProject.status} ({selectedProject.progress}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Slider control representational widget */}
            {isAdmin && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 text-xs font-medium">
                <Sliders size={16} className="text-blue-600" />
                <div className="flex-1">
                  <div className="flex justify-between items-center font-bold mb-1">
                    <span>Increment Delivery Progress Meter</span>
                    <span className="font-mono text-blue-600">{selectedProject.progress}%</span>
                  </div>
                  <input
                    id={`input-project-progress-range-${selectedProject.id}`}
                    type="range"
                    min="0"
                    max="100"
                    value={selectedProject.progress}
                    onChange={(e) => onUpdateProjectProgress(selectedProject.id, Number(e.target.value), selectedProject.status)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            )}

            {/* TASKS COMPONENT SUB-HEADER WITH CRUDS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList size={16} className="text-blue-600" />
                  <span>Interactive Task Scopes</span>
                </h3>
                <button
                  id="btn-add-task-modal"
                  onClick={() => setShowAddTaskModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1 transition"
                >
                  <Plus size={13} />
                  <span>Assign Task</span>
                </button>
              </div>

              {/* Tasks listings Grid */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {selectedProject.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/50 hover:bg-slate-50/80 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox trigger allowing client or admin to set complete */}
                      <input
                        id={`checkbox-task-status-${task.id}`}
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={(e) => {
                          const status: Task['status'] = e.target.checked ? 'completed' : 'todo';
                          onUpdateTaskStatus(selectedProject.id, task.id, status);
                        }}
                        className="mt-1 w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <h4 className={`text-sm font-bold text-slate-800 leading-tight ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-sans uppercase ${
                            task.priority === 'high' ? 'bg-rose-50 text-rose-600' :
                            task.priority === 'medium' ? 'font-medium bg-amber-50 text-amber-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Due: {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end text-xs">
                      {/* Task Assignee Capsule */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                        <UserIcon size={12} className="text-slate-400" />
                        <span className="font-semibold text-slate-600 font-sans">{task.assignedTo}</span>
                      </div>

                      {/* Dropdown status toggler */}
                      <select
                        id={`select-task-status-${task.id}`}
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(selectedProject.id, task.id, e.target.value as Task['status'])}
                        className="bg-white border border-slate-250 font-bold px-2 py-1 text-[11px] rounded-lg tracking-tight select-none focus:outline-none"
                      >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="review">In Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}

                {selectedProject.tasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <AlertTriangle size={24} className="text-slate-300" />
                    <span>No interactive tasks assigned to this active pipeline folder. Use "Assign Task" above.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
            <ClipboardList size={40} className="text-slate-300" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Select Project Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Click on any project pipeline on the left sidebar directory to track tasks, review budget details, or manage delivery checklists.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FolderPlus size={20} className="text-blue-600" />
                <span>Onboard New Project Pipeline</span>
              </h3>
              <button 
                id="close-add-project-modal"
                onClick={() => setShowAddProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project Name *</label>
                <input
                  id="input-new-proj-name"
                  type="text"
                  required
                  placeholder="e.g. Acme Android Portal"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Deliverable Specs</label>
                <textarea
                  id="input-new-proj-desc"
                  rows={2}
                  placeholder="Summarize key features, architectures, and client boundaries."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Client Company *</label>
                  <select
                    id="select-new-proj-client"
                    required
                    value={projClient}
                    onChange={(e) => setProjClient(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Budget Allocation ($) *</label>
                  <input
                    id="input-new-proj-budget"
                    type="number"
                    required
                    min="1000"
                    value={projBudget}
                    onChange={(e) => setProjBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    id="select-new-proj-cat"
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium text-xs"
                  >
                    <option value="Development">Development</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Legal Consulting">Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Launch Date</label>
                  <input
                    id="input-new-proj-start"
                    type="date"
                    value={projStart}
                    onChange={(e) => setProjStart(e.target.value)}
                    className="w-full bg-slate-50 px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Due Target</label>
                  <input
                    id="input-new-proj-end"
                    type="date"
                    value={projEnd}
                    onChange={(e) => setProjEnd(e.target.value)}
                    className="w-full bg-slate-50 px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.1">
                <button
                  id="btn-cancel-project-create"
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-project-create"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Onboard Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ClipboardList className="text-blue-600" size={20} />
                <span>Assign Task Deliverable</span>
              </h3>
              <button 
                id="close-add-task-modal"
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Task Title *</label>
                <input
                  id="input-new-task-title"
                  type="text"
                  required
                  placeholder="e.g. Integrate SSL Certification"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Task Description / Instructions</label>
                <textarea
                  id="input-new-task-desc"
                  rows={2}
                  placeholder="Provide precise objectives for execution team members."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assignee Person Name</label>
                  <input
                    id="input-new-task-assigned"
                    type="text"
                    placeholder="e.g. Diana Cruz"
                    value={taskAssigned}
                    onChange={(e) => setTaskAssigned(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Task Level Priority</label>
                  <select
                    id="select-new-task-priority"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Due Date</label>
                <input
                  id="input-new-task-due"
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  id="btn-cancel-task-create"
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-task-create"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
