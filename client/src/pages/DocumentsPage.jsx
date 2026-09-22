import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, FileCode, CheckCircle2, Clock, X, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function DownloadToast({ fileName, status, onClose }) {
  useEffect(() => {
    if (status === 'done') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] min-w-[320px] max-w-[400px] rounded-2xl border border-slate-700/60 bg-[#0d1322]/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 overflow-hidden"
      style={{ animation: 'toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
          status === 'done'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : status === 'error'
            ? 'bg-red-500/20 border border-red-500/30 text-red-400'
            : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
        }`}>
          {status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : 
           status === 'error' ? <X className="w-4 h-4" /> :
           <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {status === 'done' ? 'Downloaded successfully' : 
             status === 'error' ? 'Download failed' : 
             'Downloading...'}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{fileName}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[3px] bg-slate-800 w-full">
        <div
          className={`h-full rounded-r-full transition-all ${
            status === 'done' ? 'bg-emerald-400 w-full duration-300' : 
            status === 'error' ? 'bg-red-400 w-full duration-300' :
            'bg-blue-400 w-3/4 duration-[2000ms] ease-out'
          }`}
        />
      </div>
    </div>
  );
}

export default function DocumentsPage({ documents = [] }) {
  const [toast, setToast] = useState(null);

  const handleDownload = useCallback(async (doc) => {
    setToast({ fileName: doc.name, status: 'downloading' });

    try {
      const response = await fetch(`${API_BASE}/documents/${doc.id}/download`);
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Use the Content-Disposition filename, or fallback to doc name as .pdf
      const contentDisposition = response.headers.get('Content-Disposition');
      const match = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      a.download = match ? match[1] : doc.name.replace(/\.[^.]+$/, '') + '.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToast({ fileName: doc.name, status: 'done' });
    } catch (err) {
      console.error('Download error:', err);
      setToast({ fileName: doc.name, status: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b0f19]">
      {/* Inline keyframes for toast animation */}
      <style>{`
        @keyframes toast-slide-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div>
        <h2 className="text-2xl font-bold text-white">Drawings &amp; Document Vault</h2>
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
                onClick={() => handleDownload(doc)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white transition-all"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toast notification */}
      {toast && <DownloadToast fileName={toast.fileName} status={toast.status} onClose={() => setToast(null)} />}
    </div>
  );
}
