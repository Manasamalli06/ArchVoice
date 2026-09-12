import React from 'react';
import { 
  FolderKanban, 
  CheckSquare, 
  AlertTriangle, 
  FileCheck2, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Mic,
  Activity,
  Plus,
  Sparkles,
  User
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function DashboardPage({ 
  projects = [], 
  tasks = [], 
  approvals = [], 
  activities = [], 
  selectedProject, 
  onNavigateTab,
  onOpenVoice,
  onTaskUpdated
}) {
  // Filter tasks based on selectedProject
  const filteredTasks = selectedProject && selectedProject !== 'All Projects'
    ? tasks.filter(t => t.project && t.project.name === selectedProject)
    : tasks;

  const filteredProjects = selectedProject && selectedProject !== 'All Projects'
    ? projects.filter(p => p.name === selectedProject)
    : projects;

  const overdueTasks = filteredTasks.filter(
    t => t.status === 'Overdue' || (new Date(t.dueDate) < new Date() && t.status !== 'Completed')
  );

  const pendingApprovals = selectedProject && selectedProject !== 'All Projects'
    ? approvals.filter(a => a.project && a.project.name === selectedProject && a.status === 'Pending')
    : approvals.filter(a => a.status === 'Pending');

  // Chart data for project progress
  const chartData = projects.map(p => ({
    name: p.name.replace('Project ', ''),
    progress: p.progress,
    tasksCount: p.tasks ? p.tasks.length : 0
  }));

  const COLORS = ['#3b82f6', '#6366f1', '#10b981'];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b0f19]">
      {/* Top Banner - Interactive Voice Highlight */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Voice Conversational Assistant Ready</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Talk to {selectedProject === 'All Projects' ? 'your project' : selectedProject}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Query overdue tasks, pending approvals, team members, or create new project tasks instantly with voice commands.
          </p>
        </div>

        <button
          onClick={onOpenVoice}
          className="z-10 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-3 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 shrink-0 text-sm"
        >
          <Mic className="w-5 h-5 animate-pulse" />
          <span>Launch ArchVoice</span>
        </button>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800/90 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Projects</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{filteredProjects.length}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> 100% On Track
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Commercial, Residential & Retail</p>
        </div>

        {/* Card 2: Pending Tasks */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800/90 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{filteredTasks.length}</span>
            <span className="text-xs text-slate-400">In SQLite database</span>
          </div>
          <p className="text-[11px] text-slate-400">Across active AEC disciplines</p>
        </div>

        {/* Card 3: Overdue Tasks */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-rose-900/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-300">Overdue Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400">{overdueTasks.length}</span>
            <span className="text-xs font-semibold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
              Requires Action
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Electrical & HVAC drawings</p>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-amber-900/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300">Pending Approvals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400">{pendingApprovals.length}</span>
            <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Sign-offs
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Drawing & Procurement requests</p>
        </div>
      </div>

      {/* Main Section Grid: Charts & Overdue List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Project Progress Chart & Overdue Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Chart Card */}
          <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Project Completion Progress</h3>
                <p className="text-xs text-slate-400">Overall AEC construction phase milestone completion</p>
              </div>
              <button 
                onClick={() => onNavigateTab('projects')} 
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                View details <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="progress" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Urgent Overdue Tasks List */}
          <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Urgent Overdue Tasks</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('tasks')}
                className="text-xs text-blue-400 hover:underline font-medium flex items-center gap-1"
              >
                See all ({overdueTasks.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {overdueTasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id} 
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Overdue
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {task.project ? task.project.name : 'Project Alpha'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-400" /> {task.assignedTo}
                      </span>
                      <span className="text-rose-400 font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => onTaskUpdated(task.id, 'Completed')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all shrink-0"
                  >
                    Mark Done
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Live Activity Log Stream */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Recent Activity Stream</h3>
            </div>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {activities.map((act) => (
              <div key={act.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs space-y-1">
                <p className="text-slate-200 leading-relaxed">{act.message}</p>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-600" />
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
