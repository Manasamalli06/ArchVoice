import React from 'react';
import { FileText, Download, FileCode, CheckCircle2, Clock } from 'lucide-react';

export default function DocumentsPage({ documents = [] }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b0f19]">
      <div>
        <h2 className="text-2xl font-bold text-white">Drawings & Document Vault</h2>
        <p className="text-xs text-slate-400 mt-1">BIM Revit models, DWG floor plans, structural single-line diagrams, and BOQ spreadsheets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white">{doc.name}</h3>
                <p className="text-[11px] text-slate-400">
                  {doc.type} • Uploaded by <span className="text-slate-300 font-medium">{doc.uploadedBy}</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Project: {doc.project ? doc.project.name : 'Project Alpha'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                doc.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {doc.status}
              </span>
              <button 
                onClick={() => alert(`Simulating download of ${doc.name}`)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white transition-all"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
