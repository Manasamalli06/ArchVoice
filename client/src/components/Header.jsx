import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Mic, 
  Search, 
  Bell, 
  Sparkles,
  Zap,
  UserCheck,
  Mail,
  Briefcase,
  Calendar,
  LogOut,
  X,
  Shield
} from 'lucide-react';

export default function Header({ 
  selectedProject, 
  setSelectedProject, 
  onOpenVoice, 
  serverHealth,
  currentUser,
  onLogout
}) {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const projects = [
    { id: 'All Projects', name: 'All Active Projects' },
    { id: 'Project Alpha', name: 'Project Alpha — Commercial Office' },
    { id: 'Project Horizon', name: 'Project Horizon — Residential Tower' },
    { id: 'Project Nova', name: 'Project Nova — Retail Complex' },
  ];

  const isDemoMode = serverHealth ? serverHealth.demoMode : true;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left Context Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/70 rounded-xl px-3.5 py-1.5 shadow-inner">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-400 font-medium">Context:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer pr-1"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* AI System Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs border bg-slate-900/60 border-slate-800">
          <div className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'}`} />
          <span className="text-slate-300 font-medium flex items-center gap-1">
            {isDemoMode ? (
              <>
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300 font-semibold">Demo Mode</span> (Fallback Engine Active)
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Gemini AI Live</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Right Quick Tools & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Voice Assistant Launcher */}
        <button
          onClick={onOpenVoice}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <Mic className="w-4 h-4 animate-pulse" />
          <span className="hidden sm:inline">Talk to Project</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>
        </div>

        {/* User Profile Button & Dropdown */}
        <div className="relative pl-3 border-l border-slate-800" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
              alt={currentUser?.name || "User"}
              className={`w-8 h-8 rounded-full object-cover border-2 transition-colors ${showProfile ? 'border-blue-500' : 'border-blue-500/40'}`}
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{currentUser?.name || "User"}</p>
              <p className="text-[10px] text-slate-400 font-medium">{currentUser?.role || "Architect"}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Card */}
          {showProfile && (
            <div className="absolute right-0 top-14 w-80 bg-[#0d1322] border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* Profile Header Banner */}
              <div className="relative h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                <button
                  onClick={() => setShowProfile(false)}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Avatar overlapping the banner */}
              <div className="flex justify-center -mt-10">
                <img
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                  alt={currentUser?.name || "User"}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-[#0d1322] shadow-lg"
                />
              </div>

              {/* User Info */}
              <div className="text-center px-5 pt-3 pb-4 space-y-1">
                <h3 className="text-base font-bold text-white">{currentUser?.name || 'User'}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  <Shield className="w-3 h-3" />
                  {currentUser?.role || 'Team Member'}
                </span>
              </div>

              {/* Detail Rows */}
              <div className="px-5 pb-4 space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Email</span>
                    <span className="text-slate-200 font-medium">{currentUser?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">AEC Discipline</span>
                    <span className="text-slate-200 font-medium">{currentUser?.role || 'Team Member'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Member Since</span>
                    <span className="text-slate-200 font-medium">
                      {currentUser?.createdAt 
                        ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
                        : 'January 2026'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">User ID</span>
                    <span className="text-slate-200 font-medium font-mono text-[11px]">
                      {currentUser?.id ? currentUser.id.slice(0, 12) + '...' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              {onLogout && (
                <div className="px-5 pb-4">
                  <button
                    onClick={() => { setShowProfile(false); onLogout(); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
