import React, { useState } from 'react';
import { HardHat, ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@safeguard.industrial');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background industrial grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 shadow-inner">
            <HardHat className="w-7 h-7 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
            SafeGuard <span className="text-teal-400 font-mono text-sm">VISION</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Industrial Workplace Safety &amp; PPE Intelligence Platform
          </p>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-500">
            <span>YOLOv8 Inference Engine</span>
            <span>·</span>
            <span>OSHA Compliance</span>
            <span>·</span>
            <span>Power BI Ready</span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Authorized Email or Operator ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@safeguard.industrial"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              <>
                Sign In to Safety Portal
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Development Quick Role Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectDemo('admin@safeguard.industrial', 'admin123')}
              className="px-2.5 py-1.5 text-xs text-center rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemo('manager@safeguard.industrial', 'manager123')}
              className="px-2.5 py-1.5 text-xs text-center rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemo('inspector@safeguard.industrial', 'inspector123')}
              className="px-2.5 py-1.5 text-xs text-center rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Inspector
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          Industrial Grade Safety Telemetry · Powered by YOLOv8 Computer Vision
        </div>
      </div>
    </div>
  );
};
