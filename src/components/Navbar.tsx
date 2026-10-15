import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRData } from '../context/HRDataContext';
import { UserRole } from '../types';
import {
  Users,
  Clock,
  CalendarCheck,
  CalendarDays,
  ShieldAlert,
  BookOpen,
  Trophy,
  BarChart3,
  FileSpreadsheet,
  Lock,
  Unlock,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications
}) => {
  const { role, switchRole, logoutAdmin, openAdminPasswordModal, isAdminAuthenticated } = useAuth();
  const { syncConfig, isOnline, syncWithGoogleSheets, deadlines } = useHRData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const pendingDeadlinesCount = deadlines.filter(d => d.status !== 'completed').length;

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await syncWithGoogleSheets();
    setIsSyncing(false);
    setSyncToast(result.message);
    setTimeout(() => {
      setSyncToast(null);
    }, 4000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'tardiness', label: 'Tardiness', icon: Clock },
    { id: 'leaves', label: 'Leave Tracker', icon: CalendarDays },
    { id: 'disciplinary', label: 'Disciplinary', icon: ShieldAlert, adminOnly: true },
    { id: 'policies', label: 'ID & Breaks', icon: BookOpen },
    { id: 'scoreboard', label: 'Scoreboard', icon: TrendingUp },
    { id: 'awards', label: 'Awards & EOTM', icon: Trophy },
    { id: 'reports', label: 'Monthly Report', icon: Users },
    { id: 'googlesheets', label: 'Google Sheets', icon: FileSpreadsheet }
  ];

  const handleRoleSelect = (newRole: UserRole) => {
    setRoleDropdownOpen(false);
    if (newRole === 'admin' && !isAdminAuthenticated) {
      openAdminPasswordModal('admin');
    } else {
      switchRole(newRole);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setActiveTab('dashboard')}
                className="cursor-pointer flex items-center gap-2.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-sky-100" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
                      Pressa's Tool
                    </span>
                    <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                      HR Suite
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-none">Operations &amp; Performance</p>
                </div>
              </div>
            </div>

            {/* Middle Nav Desktop */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                // If adminOnly and role is employee, add subtle lock
                const isRestricted = item.adminOnly && role === 'employee';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isRestricted) {
                        openAdminPasswordModal('admin');
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
                        : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.adminOnly && role === 'employee' && (
                      <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {/* Online / Offline Status */}
              <div
                className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                }`}
                title={
                  isOnline
                    ? 'Connected to network. Cloud sync enabled.'
                    : `Offline mode: ${syncConfig.offlineQueueCount} pending changes will auto-sync when online.`
                }
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    <span className="font-medium text-[11px]">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    <span className="font-semibold text-[11px]">
                      Offline ({syncConfig.offlineQueueCount})
                    </span>
                  </>
                )}
              </div>

              {/* Sync Button */}
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                title={
                  syncConfig.webAppUrl
                    ? 'Sync now with connected Google Sheet'
                    : 'Configure Google Sheet Web App in Google Sheets tab'
                }
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100/80 text-sky-700 border border-sky-200 text-xs font-semibold transition-all active:scale-95 disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`}
                />
                <span className="hidden md:inline">
                  {isSyncing ? 'Syncing...' : 'Sync Sheet'}
                </span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200/80 transition-colors"
                title="Upcoming Deadlines & Alerts"
              >
                <Bell className="w-4 h-4" />
                {pendingDeadlinesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce">
                    {pendingDeadlinesCount}
                  </span>
                )}
              </button>

              {/* Role Selector / Password Auth */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                    role === 'admin'
                      ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white border-sky-600'
                      : role === 'supervisor'
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {role === 'admin' ? (
                    <Unlock className="w-3.5 h-3.5" />
                  ) : (
                    <Users className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">{role === 'admin' ? "Pressa (Admin)" : role}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-sky-100 py-1.5 z-50 text-xs animate-in fade-in-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-700">Role-Based Access</p>
                      <p className="text-[11px] text-slate-400">
                        Active: <strong className="text-sky-600 capitalize">{role}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-sky-50 text-slate-700 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-sky-600" />
                        <div>
                          <p className="font-semibold text-slate-800">Admin (Pressa)</p>
                          <p className="text-[10px] text-slate-400">Full control &amp; policies</p>
                        </div>
                      </div>
                      {role === 'admin' && <span className="text-sky-600 font-bold">&#10003;</span>}
                    </button>

                    <button
                      onClick={() => handleRoleSelect('supervisor')}
                      className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-sky-50 text-slate-700 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <div>
                          <p className="font-semibold text-slate-800">Supervisor / Lead</p>
                          <p className="text-[10px] text-slate-400">Team trackers &amp; reviews</p>
                        </div>
                      </div>
                      {role === 'supervisor' && <span className="text-sky-600 font-bold">&#10003;</span>}
                    </button>

                    <button
                      onClick={() => handleRoleSelect('employee')}
                      className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-sky-50 text-slate-700 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-800">Employee Portal</p>
                          <p className="text-[10px] text-slate-400">Clock in, leave, view awards</p>
                        </div>
                      </div>
                      {role === 'employee' && <span className="text-sky-600 font-bold">&#10003;</span>}
                    </button>

                    {role === 'admin' && (
                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            logoutAdmin();
                          }}
                          className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Lock Admin Session
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="bg-sky-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
            <RefreshCw className="w-3 h-3 text-sky-200 animate-spin" />
            <span>{syncToast}</span>
          </div>
        )}

        {/* Mobile Navigation Drawer / Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-sky-100 p-3 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between p-2 mb-2 bg-sky-50 rounded-xl">
              <span className="text-xs font-semibold text-sky-800">
                Network: {isOnline ? 'Online' : `Offline (${syncConfig.offlineQueueCount} queued)`}
              </span>
              <button
                onClick={handleManualSync}
                className="text-xs bg-sky-600 text-white px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Sync
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isRestricted = item.adminOnly && role === 'employee';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (isRestricted) {
                        openAdminPasswordModal('admin');
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                      isActive
                        ? 'bg-sky-500 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-sky-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.adminOnly && role === 'employee' && (
                      <Lock className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
