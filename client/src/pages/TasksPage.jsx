import React, { useState } from 'react';
import { CheckSquare, Plus, Search, Filter, AlertTriangle, CheckCircle2, Clock, User, Building2 } from 'lucide-react';

export default function TasksPage({ tasks = [], projects = [], onTaskUpdated, onTaskCreated }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('Rahul Sharma');
  const [newProject, setNewProject] = useState(projects[0]?.id || '');
  const [newPriority, setNewPriority] = useState('High');

  const filtered = tasks.filter((t) => {
    if (filterStatus !== 'all') {
      if (filterStatus === 'overdue' && !(t.status === 'Overdue' || (new Date(t.dueDate) < new Date() && t.status !== 'Completed'))) return false;
      if (filterStatus !== 'overdue' && t.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    }
    if (filterPriority !== 'all' && t.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onTaskCreated({
      title: newTitle,
      assignedTo: newAssignee,
      projectId: newProject || (projects[0]?.id),
      priority: newPriority,
      dueDate: new Date(Date.now() + 5 * 86400000)
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b0f19]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Tasks Directory</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time SQLite database tasks across electrical, HVAC, structural, and civil disciplines.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Task
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0d1322] border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task title or team member..."
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="overdue">Overdue Only</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            Priority:
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-900 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="rounded-2xl bg-[#0d1322] border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase font-semibold">
            <tr>
              <th className="p-4">Task Title</th>
              <th className="p-4">Project</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {filtered.map((t) => {
              const isOverdue = t.status === 'Overdue' || (new Date(t.dueDate) < new Date() && t.status !== 'Completed');

              return (
                <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-semibold text-white max-w-xs">{t.title}</td>
                  <td className="p-4 text-slate-400">{t.project ? t.project.name : 'Project Alpha'}</td>
                  <td className="p-4 font-medium text-blue-300 flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {t.assignedTo}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      t.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      t.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(t.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isOverdue ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      t.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {isOverdue ? 'Overdue' : t.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {t.status !== 'Completed' ? (
                      <button
                        onClick={() => onTaskUpdated(t.id, 'Completed')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-medium transition-all"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">Done ✓</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Task</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Finish electrical layout drawing"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assignee</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Project</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
