import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Lead Architect');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const rolesList = [
    'Lead Architect',
    'Electrical Engineer',
    'HVAC & MEP Lead',
    'Structural Engineer',
    'Project Manager',
    'Site Supervisor',
    'BIM Coordinator'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { name, email, password, role } 
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed. Please check credentials.');
        return;
      }

      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error connecting to backend API.');
    }
  };

  // Demo 1-click Auto Login Helper
  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: demoEmail, password: 'password123' })
    })
      .then(r => r.json())
      .then(data => {
        if (data.user) onLoginSuccess(data.user);
      });
  };

  return (
    <div className="min-h-screen w-screen bg-[#070a13] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Ambient background architectural grid & glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Auth Card */}
      <div className="max-w-md w-full bg-[#0d1322]/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">ArchVoice</h1>
          <p className="text-xs text-slate-400">AI Conversational Project Assistant for AEC</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              !isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Full Name</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required={isRegister}
                  className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Email Address</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 focus-within:border-blue-500">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul.sharma@archscale.com"
                required
                className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Password</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 focus-within:border-blue-500">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">AEC Discipline / Role</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-full cursor-pointer"
                >
                  {rolesList.map(r => (
                    <option key={r} value={r} className="bg-slate-900 text-slate-200">{r}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Quick Demo Logins (1-Click)
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => handleQuickLogin('rahul.sharma@archscale.com')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-left text-slate-300 hover:text-white flex items-center justify-between transition-all"
            >
              <span>Rahul Sharma (Electrical Engineer)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            </button>
            <button
              onClick={() => handleQuickLogin('priya.nair@archscale.com')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-left text-slate-300 hover:text-white flex items-center justify-between transition-all"
            >
              <span>Priya Nair (HVAC & MEP Lead)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
