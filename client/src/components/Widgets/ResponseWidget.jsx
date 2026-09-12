import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  Folder, 
  ArrowUpRight, 
  FileText, 
  ShieldCheck, 
  Activity,
  Sparkles,
  Zap
} from 'lucide-react';

export default function ResponseWidget({ widgetType, data, onTaskUpdated, onNavigateTab }) {
  if (!data) return null;

  switch (widgetType) {
    case 'PROJECT_SUMMARY': {
      const { project, stats } = data;
      if (!project) return null;

      return (
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-900/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Project Metrics
              </span>
              <h4 className="text-base font-bold text-white mt-1">{project.name}</h4>
              <p className="text-xs text-slate-400">{project.client} • {project.location}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-blue-400">{stats.progress}%</div>
              <span className="text-[10px] text-slate-400">Completion Rate</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${stats.progress}%` }}
            />
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Active Tasks</span>
              <p className="text-sm font-bold text-white mt-0.5">{stats.pendingTasks}</p>
            </div>
            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/40">
              <span className="text-xs text-rose-300">Overdue</span>
              <p className="text-sm font-bold text-rose-400 mt-0.5">{stats.overdueCount}</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/40">
              <span className="text-xs text-amber-300">Pending Sign-offs</span>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>
      );
    }

    case 'TASK_LIST': {
      if (!Array.isArray(data) || data.length === 0) return null;

      return (
        <div className="mt-3 space-y-2">
          <div className="text-xs font-semibold text-slate-400 px-1 flex items-center justify-between">
            <span>DATABASE RECORDS ({data.length})</span>
            {onNavigateTab && (
              <button 
                onClick={() => onNavigateTab('tasks')} 
                className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                View full board <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {data.map((task) => {
              const isOverdue = task.status === 'Overdue' || (new Date(task.dueDate) < new Date() && task.status !== 'Completed');
              
              return (
                <div 
                  key={task.id} 
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3 shadow-md"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isOverdue 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : task.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {isOverdue ? 'Overdue' : task.status}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {task.project ? task.project.name : 'Project Alpha'}
                      </span>
                    </div>

                    <h5 className="text-sm font-semibold text-slate-100">{task.title}</h5>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-400" />
                        {task.assignedTo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {task.status !== 'Completed' && onTaskUpdated && (
                    <button
                      onClick={() => onTaskUpdated(task.id, 'Completed')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-medium transition-all shrink-0"
                    >
                      Complete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'APPROVAL_LIST': {
      if (!Array.isArray(data) || data.length === 0) return null;

      return (
        <div className="mt-3 space-y-2">
          <div className="text-xs font-semibold text-slate-400 px-1">PENDING SIGN-OFFS</div>
          <div className="grid gap-2">
            {data.map((app) => (
              <div key={app.id} className="p-3 rounded-xl bg-slate-900 border border-amber-900/40 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs font-bold text-white">{app.title}</h5>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Requested by {app.requestedBy} • {app.project ? app.project.name : 'Project Alpha'}
                  </p>
                </div>
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'ACTION_CONFIRMATION': {
      const { task, action, message } = data;

      return (
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/40 border border-emerald-500/40 shadow-xl flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded">
              Action Executed
            </span>
            <h5 className="text-sm font-bold text-white">{message || 'Database record created successfully'}</h5>
            {task && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <p className="text-slate-200 font-semibold">{task.title}</p>
                <p className="text-slate-400 text-[11px]">
                  Assigned to: <span className="text-blue-300">{task.assignedTo}</span> • Project: <span className="text-slate-200">{task.project ? task.project.name : 'Project Alpha'}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'TEAM_CARD': {
      const { user, tasks } = data;
      if (!user) return null;

      return (
        <div className="mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex items-center gap-4">
          <img 
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
            alt={user.name} 
            className="w-12 h-12 rounded-xl object-cover border border-blue-500/40"
          />
          <div>
            <h4 className="text-sm font-bold text-white">{user.name}</h4>
            <p className="text-xs text-blue-400 font-medium">{user.role}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{user.email} • {tasks ? tasks.length : 0} active tasks</p>
          </div>
        </div>
      );
    }

    case 'ACTIVITY_LIST': {
      if (!Array.isArray(data)) return null;

      return (
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
          {data.map((act) => (
            <div key={act.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs flex items-center gap-2.5">
              <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-300">{act.message}</span>
            </div>
          ))}
        </div>
      );
    }

    case 'DOCUMENT_LIST': {
      if (!Array.isArray(data)) return null;

      return (
        <div className="mt-3 space-y-2">
          {data.map((doc) => (
            <div key={doc.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-white font-medium">{doc.name}</p>
                  <span className="text-[10px] text-slate-400">{doc.type} • Uploaded by {doc.uploadedBy}</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
