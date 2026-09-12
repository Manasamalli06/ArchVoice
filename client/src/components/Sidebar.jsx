import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  FileCheck2, 
  Users, 
  FileText, 
  Bot, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts = {} }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, badge: 'Voice AI', highlight: true },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: counts.overdueTasks ? `${counts.overdueTasks} overdue` : null, countColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'approvals', label: 'Approvals', icon: FileCheck2, count: counts.pendingApprovals || null, countColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse-subtle" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              ArchVoice
              <span className="text-[10px] font-semibold tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase">
                AEC
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Talk To Your Project</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : item.highlight
                    ? 'bg-blue-950/40 text-blue-300 border border-blue-800/40 hover:bg-blue-900/50 hover:text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? (item.highlight ? 'text-white' : 'text-blue-400') : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {item.badge}
                    </span>
                  )}

                  {item.count && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.countColor}`}>
                      {item.count}
                    </span>
                  )}

                  {isActive && !item.badge && !item.count && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-900 to-blue-950/50 border border-blue-900/40 text-xs text-slate-300">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-white">ArchScale Hackathon MVP</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Problem AS-03: Natural language AEC voice workspace assistant.
        </p>
      </div>
    </aside>
  );
}
