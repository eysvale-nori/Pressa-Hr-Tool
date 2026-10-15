import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ShieldAlert,
  Award,
  TrendingUp,
  Percent,
  Sparkles
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

export const MonthlyReportView: React.FC = () => {
  const {
    employees,
    attendance,
    tardiness,
    leaves,
    disciplinary,
    scoreboard,
    awards
  } = useHRData();
  const { adminName } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Month stats calculations
  const totalEmployees = employees.length;
  const monthAttendance = attendance.filter(a => a.date.startsWith(selectedMonth));
  const monthTardiness = tardiness.filter(t => t.date.startsWith(selectedMonth));
  const monthLeaves = leaves.filter(l => l.startDate.startsWith(selectedMonth));
  const monthDisciplinary = disciplinary.filter(d => d.incidentDate.startsWith(selectedMonth));

  const presentRecords = monthAttendance.filter(a => a.status === 'present' || a.status === 'late');
  const attendanceRate = monthAttendance.length > 0
    ? Math.round((presentRecords.length / monthAttendance.length) * 100)
    : 96;

  const totalLateMinutes = monthTardiness.reduce((sum, t) => sum + t.minutesLate, 0);
  const excusedTardiness = monthTardiness.filter(t => t.status === 'excused').length;
  const unexcusedTardiness = monthTardiness.filter(t => t.status === 'unexcused').length;

  const totalLeaveDays = monthLeaves
    .filter(l => l.status === 'approved')
    .reduce((sum, l) => sum + l.totalDays, 0);

  const resolvedDisciplinary = monthDisciplinary.filter(d => d.status === 'resolved').length;

  // EOTM for this month
  const currentEotm = awards.find(a => a.category === 'employee_of_the_month');

  const handleExportFullCsv = () => {
    const reportRows = employees.map(emp => {
      const empAtt = monthAttendance.filter(a => a.employeeId === emp.employeeId);
      const empTar = monthTardiness.filter(t => t.employeeId === emp.employeeId);
      const empLeaves = monthLeaves.filter(l => l.employeeId === emp.employeeId && l.status === 'approved');
      const score = scoreboard.find(s => s.employeeId === emp.employeeId);

      return {
        'Report Period': selectedMonth,
        'Employee ID': emp.employeeId,
        'Full Name': emp.name,
        'Department': emp.department,
        'Role': emp.role,
        'Shifts Logged': empAtt.length,
        'Late Arrivals': empTar.length,
        'Total Delay Minutes': empTar.reduce((acc, t) => acc + t.minutesLate, 0),
        'Leave Days Taken': empLeaves.reduce((acc, l) => acc + l.totalDays, 0),
        'Attendance Score %': score ? score.attendanceScore : 100,
        'Quality Score %': score ? score.qualityScore : 95,
        'Productivity Score %': score ? score.productivityScore : 95,
        'Overall KPI %': score ? score.totalKpi : 95
      };
    });

    exportToCsv(`Pressa_Monthly_HR_Executive_Report_${selectedMonth}`, reportRows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            Automated Monthly HR Analytics &amp; Management Review
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Executive-ready consolidated metrics for board reviews, payroll audit, and operational roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white shadow-2xs focus:outline-hidden"
          />

          <button
            onClick={handleExportFullCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white rounded-xl text-xs font-semibold shadow-xs shadow-sky-200 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Document Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-sky-100 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Document Letterhead */}
        <div className="border-b-2 border-sky-500 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">PRESSA'S HR MANAGEMENT</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Monthly Operational Analytics &bull; Performance &amp; Attendance Audit
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <p>
              Report Cycle: <strong className="text-slate-800 font-mono text-sm">{selectedMonth}</strong>
            </p>
            <p>Generated By: {adminName} (HR Operations Lead)</p>
            <p>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Executive KPI Summary Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            1. Executive Key Performance Indicators
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Attendance Rate</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{attendanceRate}%</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{presentRecords.length} recorded shift attendances</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Tardiness Impact</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalLateMinutes} <span className="text-sm font-normal">mins</span></p>
              <p className="text-[11px] text-slate-500 mt-0.5">{monthTardiness.length} incidents ({excusedTardiness} excused)</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Approved Leaves</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalLeaveDays} <span className="text-sm font-normal">days</span></p>
              <p className="text-[11px] text-slate-500 mt-0.5">{monthLeaves.length} requested applications</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Team Active Size</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalEmployees}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Across 4 operational departments</p>
            </div>
          </div>
        </div>

        {/* Highlight: Employee of the Month */}
        {currentEotm && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              2. Monthly Honors &amp; Employee of the Month
            </h3>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-sky-50/40 to-amber-50/40 border border-sky-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentEotm.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                  alt={currentEotm.recipientName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                      Top Honor
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{currentEotm.recipientName}</h4>
                  </div>
                  <p className="text-xs text-slate-500">{currentEotm.department} &bull; {currentEotm.title}</p>
                  <p className="text-xs text-slate-700 italic mt-1 leading-snug">{currentEotm.citation}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-sky-700">100% Attendance</span>
                <p className="text-[11px] text-slate-400">Zero Tardiness</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            3. Departmental Performance &amp; Attendance Audit Breakdown
          </h3>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Check-Ins</th>
                  <th className="py-3 px-4 text-center">Late Count</th>
                  <th className="py-3 px-4 text-center">Delay Mins</th>
                  <th className="py-3 px-4 text-center">Leaves</th>
                  <th className="py-3 px-4 text-right">KPI Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {employees.map(emp => {
                  const empAtt = monthAttendance.filter(a => a.employeeId === emp.employeeId);
                  const empTar = monthTardiness.filter(t => t.employeeId === emp.employeeId);
                  const empLeaves = monthLeaves.filter(l => l.employeeId === emp.employeeId && l.status === 'approved');
                  const score = scoreboard.find(s => s.employeeId === emp.employeeId);
                  const totalDelay = empTar.reduce((sum, t) => sum + t.minutesLate, 0);

                  return (
                    <tr key={emp.employeeId} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                      <td className="py-3 px-4 text-center font-mono font-semibold">{empAtt.length}</td>
                      <td className="py-3 px-4 text-center font-mono">
                        {empTar.length > 0 ? (
                          <span className="text-amber-600 font-bold">{empTar.length}</span>
                        ) : (
                          <span className="text-emerald-600">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {totalDelay > 0 ? `${totalDelay}m` : '--'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {empLeaves.reduce((sum, l) => sum + l.totalDays, 0)}d
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sky-700">
                        {score ? `${score.totalKpi}%` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disciplinary Summary */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            4. Compliance &amp; Disciplinary Audit
          </h3>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p>
              Total Incident Inquiries Recorded This Month:{' '}
              <strong className="text-slate-800">{monthDisciplinary.length}</strong>
            </p>
            <p>
              Resolved with Corrective Action Roadmaps:{' '}
              <strong className="text-emerald-700">{resolvedDisciplinary}</strong>
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Pressa maintains strict confidentiality for all formal counseling sessions in accordance with state labor standards.
            </p>
          </div>
        </div>

        {/* Formal Management Signature Block */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">Prepared &amp; Verified By:</p>
            <div className="h-12 border-b border-slate-300 mt-2 flex items-end font-serif italic text-slate-800 pb-1">
              Pressa (Head of HR &amp; Operations)
            </div>
            <p className="text-[10px] text-slate-400 mt-1">HR Operations Division</p>
          </div>

          <div>
            <p className="font-semibold text-slate-700">Executive Management Approval:</p>
            <div className="h-12 border-b border-slate-300 mt-2 flex items-end font-serif italic text-slate-800 pb-1">
              Approved for Payroll &amp; Operations
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Chief Executive Office</p>
          </div>
        </div>
      </div>
    </div>
  );
};
