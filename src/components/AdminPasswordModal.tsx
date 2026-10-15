import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, KeyRound, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';

export const AdminPasswordModal: React.FC = () => {
  const {
    showAdminPasswordModal,
    closeAdminPasswordModal,
    loginAsAdmin,
    role
  } = useAuth();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!showAdminPasswordModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError(true);
      setErrorMessage('Please enter the administrator password.');
      return;
    }

    const success = loginAsAdmin(password);
    if (success) {
      setError(false);
      setPassword('');
      setErrorMessage('');
    } else {
      setError(true);
      setErrorMessage('Incorrect password. Please verify and try again.');
    }
  };

  const handleQuickDemoFill = () => {
    setPassword('pressa2026');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-sky-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Admin Access Required</h3>
          <p className="text-xs text-sky-100 mt-1">
            Enter administrator password to access Pressa's sensitive HR controls &amp; configurations.
          </p>

          {role !== 'admin' && (
            <button
              onClick={closeAdminPasswordModal}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Admin Password / PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-sky-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password..."
                autoFocus
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm font-medium focus:outline-hidden transition-all ${
                  error
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-300'
                    : 'border-slate-200 bg-sky-50/30 text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1.5 animate-in slide-in-from-top-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {errorMessage}
              </p>
            )}
          </div>

          <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Default password: <span className="font-mono font-semibold text-sky-700">pressa2026</span>
            </span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-sky-600 font-semibold hover:text-sky-800 underline transition-colors"
            >
              Auto-fill
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            {role !== 'admin' && (
              <button
                type="button"
                onClick={closeAdminPasswordModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-md shadow-sky-200 hover:shadow-lg transition-all"
            >
              Unlock Admin Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
