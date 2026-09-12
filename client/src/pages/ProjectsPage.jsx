import React from 'react';
import { Building2, Calendar, CheckSquare, FileCheck2, FileText, MapPin, Users } from 'lucide-react';

export default function ProjectsPage({ projects = [] }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b0f19]">
      <div>
        <h2 className="text-2xl font-bold text-white">AEC Projects Catalog</h2>
        <p className="text-xs text-slate-400 mt-1">Active architectural developments, client specifications, and progress milestones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 hover:border-blue-900/60 shadow-xl space-y-5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                  {p.status}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{p.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" /> {p.client}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-blue-400">{p.progress}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Phase Progress</span>
                <span className="font-semibold text-white">{p.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-300 space-y-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{p.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Target Completion: {new Date(p.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Tasks</span>
                <p className="font-bold text-white mt-0.5">{p.tasks ? p.tasks.length : 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Approvals</span>
                <p className="font-bold text-amber-400 mt-0.5">{p.approvals ? p.approvals.length : 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400">Docs</span>
                <p className="font-bold text-blue-400 mt-0.5">{p.documents ? p.documents.length : 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
