import React from 'react';
import { Mail, CheckSquare, AlertTriangle, UserCheck } from 'lucide-react';

export default function TeamPage({ team = [] }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b0f19]">
      <div>
        <h2 className="text-2xl font-bold text-white">AEC Project Directory</h2>
        <p className="text-xs text-slate-400 mt-1">Cross-functional team members, engineers, principal architects, and site supervisors.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {team.map((member) => (
          <div key={member.id} className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 hover:border-blue-900/60 shadow-xl space-y-4 text-center">
            <img
              src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={member.name}
              className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-blue-500/40 shadow-lg shadow-blue-500/10"
            />
            <div>
              <h3 className="text-base font-bold text-white">{member.name}</h3>
              <span className="text-xs font-semibold text-blue-400 block mt-0.5">{member.role}</span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Mail className="w-3 h-3" /> {member.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">Total Tasks</span>
                <p className="font-bold text-white mt-0.5">{member.totalTasks || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-900/30">
                <span className="text-[10px] text-rose-300">Overdue</span>
                <p className="font-bold text-rose-400 mt-0.5">{member.overdueTasks || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
