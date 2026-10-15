import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { TardinessRecord } from '../../types';
import {
  Clock,
  AlertTriangle,
  Search,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

export const TardinessTrackerView: React.FC = () => {
  const { tardiness, employees, addTardinessRecord, updateTardinessStatus } = useHRData();
  const { role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    employeeId: employees[0]?.employeeId || '',
    date: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00 AM',
    actualTime: '09:25 AM',
    minutesLate: 25,
    reason: '',
    status: 'pending_review' as TardinessRecord['status'],
    actionTaken: ''
  });

  // Calculate occurrences per employee to detect habitual tardiness
  const tardinessCountsByEmployee = tardiness.reduce((acc, curr) => {
    acc[curr.employeeId] = (acc[curr.employeeId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = tardiness.filter(record => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const rows = filtered.map(r => ({
      'Record ID': r.id,
      'Employee ID': r.employeeId,
      'Employee Name': r.employeeName,
      'Date': r.date,
      'Scheduled Time': r.scheduledTime,
      'Actual Time': r.actualTime,
      'Minutes Late': r.minutesLate,
      'Reason': r.reason,
      'Status': r.status.toUpperCase(),
      'Action Taken': r.actionTaken || 'None',
      'Updated At': r.updatedAt
    }));
    exportToCsv('Pressa_Tardiness_Log', rows);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.employeeId === form.employeeId);
    if (!emp) return;

    addTardinessRecord({
      employeeId: emp.employeeId,
      employeeName: emp.name,
      date: form.date,
      scheduledTime: form.scheduledTime,
      actualTime: form.actualTime,
      minutesLate: Number(form.minutesLate),
      reason: form.reason || 'Unspecified delay',
      status: form.status,
      actionTaken: form.actionTaken
    });

    setShowAddModal(false);
    setForm({
      employeeId: employees[0]?.employeeId || '',
      date: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00 AM',
      actualTime: '09:25 AM',
      minutesLate: 25,
      reason: '',
      status: 'pending_review',
      actionTaken: ''
    });
  };

  const getStatusBadge = (status: TardinessRecord['status']) => {
    switch (status) {
      case 'excused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Excused
          </span>
        );
      case 'unexcused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            Unexcused
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Tardiness &amp; Punctuality Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor late arrivals, track cumulative delay minutes, and enforce fair escalation thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(role === 'admin' || role === 'supervisor') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-amber-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Late Arrival</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Habitual Tardiness Advisory Banner */}
      {Object.entries(tardinessCountsByEmployee).some(([, count]) => count >= 2) && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-900">Habitual Punctuality Alert</h4>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Employees with 2 or more late arrivals within this cycle are highlighted below. In accordance with Pressa's Attendance Policy, a third unexcused occurrence will initiate an HR verbal counseling session.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by employee, reason or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-amber-400"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="excused">Excused</option>
            <option value="unexcused">Unexcused</option>
          </select>
        </div>
      </div>

      {/* Tardiness Records List */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No tardiness incidents recorded</p>
            <p className="text-xs text-slate-400 mt-0.5">Everyone is on schedule or matched filters returned zero results.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(record => {
              const emp = employees.find(e => e.employeeId === record.employeeId);
              const totalOccurrences = tardinessCountsByEmployee[record.employeeId] || 1;
              const isHabitual = totalOccurrences >= 2;

              return (
                <div key={record.id} className="p-4 sm:p-5 hover:bg-sky-50/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Employee Profile & Details */}
                    <div className="flex items-start gap-3">
                      <img
                        src={emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={record.employeeName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                            {record.employeeName}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {record.employeeId}
                          </span>
                          {isHabitual && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              {totalOccurrences}x Late in cycle
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          Date: <strong className="text-slate-700">{record.date}</strong> &bull; Scheduled:{' '}
                          <span className="font-mono">{record.scheduledTime}</span> &rarr; Arrived:{' '}
                          <span className="font-mono font-bold text-amber-700">{record.actualTime}</span>
                        </p>

                        <p className="text-xs text-slate-600 mt-1 bg-amber-50/50 p-2 rounded-lg border border-amber-100/60 leading-relaxed">
                          <strong className="text-slate-700">Reason:</strong> {record.reason}
                        </p>

                        {record.actionTaken && (
                          <p className="text-[11px] text-sky-800 font-medium mt-1">
                            HR Action: {record.actionTaken}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delay Metric & Status */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-base sm:text-lg font-black text-rose-600">
                          +{record.minutesLate} mins
                        </span>
                        <div className="mt-0.5">{getStatusBadge(record.status)}</div>
                      </div>

                      {/* Admin / Supervisor quick actions */}
                      {(role === 'admin' || role === 'supervisor') && (
                        <div className="flex items-center gap-1 pt-1">
                          {record.status !== 'excused' && (
                            <button
                              onClick={() => updateTardinessStatus(record.id, 'excused', 'Excused by management')}
                              className="px-2 py-1 text-[10px] rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold transition-colors"
                            >
                              Excuse
                            </button>
                          )}
                          {record.status !== 'unexcused' && (
                            <button
                              onClick={() => updateTardinessStatus(record.id, 'unexcused', 'Unexcused violation recorded')}
                              className="px-2 py-1 text-[10px] rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold transition-colors"
                            >
                              Mark Unexcused
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Late Arrival Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-sky-100 overflow-hidden">
            <div className="bg-amber-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Record Tardiness Incident</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee</label>
                <select
                  value={form.employeeId}
                  onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minutes Late</label>
                  <input
                    type="number"
                    min="1"
                    value={form.minutesLate}
                    onChange={e => setForm({ ...form, minutesLate: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={form.scheduledTime}
                    onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actual Arrival</label>
                  <input
                    type="text"
                    value={form.actualTime}
                    onChange={e => setForm({ ...form, actualTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason Stated by Employee</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Mechanical breakdown of transit bus..."
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action / Resolution Taken</label>
                <input
                  type="text"
                  placeholder="e.g. Verbal warning, grace period granted..."
                  value={form.actionTaken}
                  onChange={e => setForm({ ...form, actionTaken: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-200"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
