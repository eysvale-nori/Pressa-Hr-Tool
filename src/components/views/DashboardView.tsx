import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  Clock,
  CalendarDays,
  ShieldAlert,
  Users,
  Trophy,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Download,
  AlertCircle,
  Award,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuickClock: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickClock }) => {
  const {
    employees,
    attendance,
    tardiness,
    leaves,
    disciplinary,
    scoreboard,
    awards,
    deadlines
  } = useHRData();
  const { role } = useAuth();

  const [activeChartMetric, setActiveChartMetric] = useState<'attendance' | 'tardiness'>('attendance');

  // Trigger confetti for celebration
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#38bdf8', '#fbbf24', '#f59e0b', '#10b981']
    });
  };

  // Calculations for Today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const totalEmployeesCount = employees.length;
  
  const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = totalEmployeesCount > 0 ? Math.round((presentCount / totalEmployeesCount) * 100) : 0;
  
  const todayTardiness = tardiness.filter(t => t.date === todayStr);
  const totalLateMinutes = todayTardiness.reduce((sum, item) => sum + item.minutesLate, 0);

  const activeLeavesToday = leaves.filter(l => {
    return l.status === 'approved' && l.startDate <= todayStr && l.endDate >= todayStr;
  });

  const openDisciplinary = disciplinary.filter(d => d.status === 'open' || d.status === 'under_review');

  // Find Employee of the Month
  const eotm = awards.find(a => a.category === 'employee_of_the_month') || awards[0];

  // 5 Special Awards
  const specialAwards = awards.filter(a => a.category === 'special_award');

  // Average KPI
  const avgKpi = scoreboard.length > 0
    ? (scoreboard.reduce((acc, curr) => acc + curr.totalKpi, 0) / scoreboard.length).toFixed(1)
    : '0';

  // Last 7 days trend data mock/calculation
  const daysTrend = [
    { label: 'Mon', date: '10-09', present: 8, late: 1, attendanceRate: 100 },
    { label: 'Tue', date: '10-10', present: 7, late: 2, attendanceRate: 88 },
    { label: 'Wed', date: '10-11', present: 8, late: 0, attendanceRate: 100 },
    { label: 'Thu', date: '10-12', present: 8, late: 1, attendanceRate: 100 },
    { label: 'Fri', date: '10-13', present: 7, late: 1, attendanceRate: 88 },
    { label: 'Mon', date: '10-14', present: 8, late: 0, attendanceRate: 100 },
    { label: 'Today', date: todayStr.slice(5), present: presentCount, late: todayTardiness.length, attendanceRate }
  ];

  // Leave breakdown
  const leaveDistribution = [
    { type: 'VL (Vacation Leave)', count: leaves.filter(l => l.leaveType === 'VL' || l.leaveType === 'vacation').length, color: '#0284c7' },
    { type: 'PTO', count: leaves.filter(l => l.leaveType === 'PTO').length, color: '#38bdf8' },
    { type: 'Sick Leave', count: leaves.filter(l => l.leaveType === 'sick').length, color: '#f59e0b' },
    { type: 'Emergency & Others', count: leaves.filter(l => l.leaveType === 'emergency' || l.leaveType === 'maternity_paternity' || l.leaveType === 'bereavement' || l.leaveType === 'unpaid').length, color: '#8b5cf6' }
  ];

  const handleExportQuickSummary = () => {
    const summaryRows = employees.map(emp => {
      const empAtt = attendance.filter(a => a.employeeId === emp.employeeId);
      const empTar = tardiness.filter(t => t.employeeId === emp.employeeId);
      const score = scoreboard.find(s => s.employeeId === emp.employeeId);
      return {
        'Employee ID': emp.employeeId,
        'Name': emp.name,
        'Department': emp.department,
        'Role': emp.role,
        'Total Check-Ins': empAtt.length,
        'Tardiness Occurrences': empTar.length,
        'Total Late Minutes': empTar.reduce((acc, t) => acc + t.minutesLate, 0),
        'Overall KPI Score %': score ? score.totalKpi : 'N/A'
      };
    });
    exportToCsv(`Pressa_HR_Daily_Executive_Summary_${todayStr}`, summaryRows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-50 via-white to-sky-100/60 p-5 rounded-2xl border border-sky-200/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
              Pressa's Operations Hub
            </span>
            <span className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
            Workforce Overview &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of attendance, punctuality, employee milestones, and Google Sheets cloud sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenQuickClock}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-sky-200 transition-all active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Clock In / Out</span>
          </button>

          <button
            onClick={handleExportQuickSummary}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-sky-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="cursor-pointer bg-white p-4 rounded-2xl border border-sky-100 shadow-xs hover:border-sky-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{attendanceRate}%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                {presentCount}/{totalEmployeesCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Present or remote today</p>
          </div>
        </div>

        {/* Card 2: Tardiness */}
        <div
          onClick={() => onNavigate('tardiness')}
          className="cursor-pointer bg-white p-4 rounded-2xl border border-sky-100 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Late Arrivals</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{todayTardiness.length}</span>
              <span className="text-xs font-semibold text-amber-600">
                {totalLateMinutes} mins total
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Recorded today</p>
          </div>
        </div>

        {/* Card 3: Leaves */}
        <div
          onClick={() => onNavigate('leaves')}
          className="cursor-pointer bg-white p-4 rounded-2xl border border-sky-100 shadow-xs hover:border-sky-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">On Leave</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{activeLeavesToday.length}</span>
              <span className="text-xs font-semibold text-slate-500">Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Approved time-off today</p>
          </div>
        </div>

        {/* Card 4: Disciplinary */}
        <div
          onClick={() => onNavigate('disciplinary')}
          className="cursor-pointer bg-white p-4 rounded-2xl border border-sky-100 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Disciplinary</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">
                {role === 'employee' ? 'Private' : openDisciplinary.length}
              </span>
              {role !== 'employee' && (
                <span className="text-xs font-semibold text-rose-600">Open</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Policy &amp; conduct reviews</p>
          </div>
        </div>

        {/* Card 5: Performance Score */}
        <div
          onClick={() => onNavigate('scoreboard')}
          className="col-span-2 sm:col-span-1 cursor-pointer bg-white p-4 rounded-2xl border border-sky-100 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Team KPI Avg</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{avgKpi}%</span>
              <span className="text-xs font-semibold text-blue-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                Scoreboard
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Productivity &amp; Quality index</p>
          </div>
        </div>
      </div>

      {/* Spotlight Banner: Employee of the Month */}
      {eotm && (
        <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-sky-400/30">
          {/* Subtle background decoration */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-2 right-4 text-white/10 select-none pointer-events-none">
            <Trophy className="w-48 h-48 opacity-20 -rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={eotm.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                  alt={eotm.recipientName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md ring-4 ring-white/20"
                />
                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Employee of the Month &bull; {eotm.period}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {eotm.recipientName}
                </h2>
                <p className="text-xs sm:text-sm text-sky-100 font-medium">
                  {eotm.department}
                </p>
                <p className="text-xs text-sky-200/90 italic mt-2 max-w-xl line-clamp-2">
                  {eotm.citation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <button
                onClick={triggerCelebration}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Celebrate &bull; Launch Confetti</span>
              </button>

              <button
                onClick={() => onNavigate('awards')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs border border-white/20 backdrop-blur-xs transition-colors"
              >
                <span>View All Awards</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5 Special Awards Preview Strip */}
      <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">5 Special Recognition Honors</h3>
              <p className="text-[11px] text-slate-500">Exemplary attendance, team pillars, innovation &amp; client champions</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('awards')}
            className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>View Full Honors &amp; Nominate</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {specialAwards.slice(0, 5).map(award => (
            <div
              key={award.id}
              className="p-3.5 rounded-xl bg-sky-50/40 border border-sky-100/80 hover:bg-sky-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md inline-block mb-1.5">
                  Special Award
                </span>
                <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-1">{award.title}</h4>
                <p className="text-[11px] font-semibold text-sky-700 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{award.recipientName}</span>
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 truncate">{award.department}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Visualization Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: 7-Day Attendance & Tardiness Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                Workforce Punctuality &amp; Attendance Trend
              </h3>
              <p className="text-xs text-slate-400">Daily attendance percentages and late arrivals</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
              <button
                onClick={() => setActiveChartMetric('attendance')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeChartMetric === 'attendance'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Attendance Rate (%)
              </button>
              <button
                onClick={() => setActiveChartMetric('tardiness')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeChartMetric === 'tardiness'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Late Arrivals (Count)
              </button>
            </div>
          </div>

          {/* SVG Chart visualization */}
          <div className="flex-1 flex flex-col justify-end pt-4 pb-2">
            <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100">
              {daysTrend.map((day, idx) => {
                const value = activeChartMetric === 'attendance' ? day.attendanceRate : day.late * 30;
                const barHeightPercent = activeChartMetric === 'attendance' ? Math.max(20, day.attendanceRate) : Math.max(10, day.late * 40);
                const barColor =
                  activeChartMetric === 'attendance'
                    ? day.attendanceRate >= 95
                      ? 'bg-sky-500'
                      : 'bg-sky-400'
                    : day.late > 0
                    ? 'bg-amber-400'
                    : 'bg-slate-200';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] font-medium py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20">
                      {day.label}: {activeChartMetric === 'attendance' ? `${day.attendanceRate}% present` : `${day.late} late arrivals`}
                    </div>

                    <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                      {activeChartMetric === 'attendance' ? `${day.attendanceRate}%` : `${day.late}`}
                    </div>

                    <div
                      style={{ height: `${barHeightPercent}%` }}
                      className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 group-hover:brightness-95 ${barColor}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 pt-2 text-[11px] font-medium text-slate-400">
              {daysTrend.map((day, idx) => (
                <div key={idx} className="flex-1 text-center truncate">
                  <span className="font-semibold text-slate-600">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Normal Target: &gt;95% Attendance
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Grace Period: 10 mins
            </span>
          </div>
        </div>

        {/* Chart 2: Leave Types Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sky-600" />
              Leave Category Distribution
            </h3>
            <p className="text-xs text-slate-400">Approved time-off requests this cycle</p>

            <div className="mt-5 space-y-3">
              {leaveDistribution.map((item, index) => {
                const totalLeavesCount = leaves.length || 1;
                const percent = Math.round((item.count / totalLeavesCount) * 100);

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.type}
                      </span>
                      <span className="text-slate-500 font-mono">{item.count} days ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('leaves')}
              className="w-full text-center text-xs text-sky-600 font-semibold hover:text-sky-800 hover:underline flex items-center justify-center gap-1"
            >
              <span>Manage Leave Applications</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Department KPI Leaderboard & Upcoming HR Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Scoreboard Preview */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Performance Scoreboard Highlights
              </h3>
              <p className="text-xs text-slate-400">Top ranked employees by operational KPI</p>
            </div>
            <button
              onClick={() => onNavigate('scoreboard')}
              className="text-xs text-sky-600 font-semibold hover:underline"
            >
              Full Leaderboard &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {scoreboard.slice(0, 4).map((entry, index) => (
              <div
                key={entry.employeeId}
                className="flex items-center justify-between p-3 rounded-xl bg-sky-50/30 border border-sky-100/60 hover:bg-sky-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    index === 0
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : index === 1
                      ? 'bg-slate-300 text-slate-800'
                      : index === 2
                      ? 'bg-amber-700/20 text-amber-900'
                      : 'bg-sky-100 text-sky-700'
                  }`}>
                    {index + 1}
                  </span>
                  <img
                    src={entry.avatar}
                    alt={entry.employeeName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{entry.employeeName}</h4>
                    <p className="text-[11px] text-slate-400">{entry.department} &bull; {entry.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-sky-700">{entry.totalKpi}%</div>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                    Tier 1
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HR Review Deadlines & Policy Sign-offs */}
        <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Upcoming HR Review Deadlines
                </h3>
                <p className="text-xs text-slate-400">Quarterly evaluations, probation checkpoints, and sign-offs</p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                {deadlines.filter(d => d.status !== 'completed').length} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {deadlines.slice(0, 3).map(deadline => {
                const isUrgent = deadline.status === 'urgent';
                return (
                  <div
                    key={deadline.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isUrgent
                        ? 'border-rose-200 bg-rose-50/40'
                        : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                          }`}>
                            Due {deadline.dueDate}
                          </span>
                          {deadline.employeeName && (
                            <span className="text-xs font-semibold text-slate-700">
                              {deadline.employeeName}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{deadline.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{deadline.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Automatic alert reminders synced</span>
            <button
              onClick={() => onNavigate('policies')}
              className="text-xs text-sky-600 font-semibold hover:underline"
            >
              View Company Policies &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
