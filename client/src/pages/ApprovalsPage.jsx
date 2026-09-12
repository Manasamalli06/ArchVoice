import React from 'react';
import { ShieldCheck, Check, X, Clock, User, Building2 } from 'lucide-react';

export default function ApprovalsPage({ approvals = [], onApprovalAction }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b0f19]">
      <div>
        <h2 className="text-2xl font-bold text-white">Drawing & Specification Approvals</h2>
        <p className="text-xs text-slate-400 mt-1">Official sign-off workflow for architectural submittals, MEP calculations, and procurement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvals.map((app) => (
          <div key={app.id} className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-xl flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${app.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  app.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {app.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{app.title}</h3>

              <div className="text-xs text-slate-400 space-y-0.5">
                <p>Requested by: <span className="text-blue-300 font-medium">{app.requestedBy}</span></p>
                <p>Project: <span className="text-slate-200">{app.project ? app.project.name : 'Project Alpha'}</span></p>
                <p className="text-[11px] text-slate-500">Target Date: {new Date(app.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            {app.status === 'Pending' && onApprovalAction && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onApprovalAction(app.id, 'Approved')}
                  className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all"
                  title="Approve Sign-off"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onApprovalAction(app.id, 'Rejected')}
                  className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                  title="Reject Submittal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
