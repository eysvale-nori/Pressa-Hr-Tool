import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { LeaveRecord, LeaveType, LeaveStatus } from '../../types';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
  Filter,
  Check,
  X as XIcon,
  HelpCircle,
  Users,
  Trash2
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

export const LeaveTrackerView: React.FC = () => {
  const { leaves, employees, applyLeave, updateLeaveStatus, deleteLeaveRecord } = useHRData();
  const { role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInputModal, setShowInputModal] = useState(false);

  const [form, setForm] = useState({
    employeeId: employees[0]?.employeeId || '',
    leaveType: 'VL' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    totalDays: 1,
    reason: ''
  });

  const handleDatesChange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.max(0, e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setForm(prev => ({
      ...prev,
      startDate: start,
      endDate: end,
      totalDays: isNaN(diffDays) || diffDays < 1 ? 1 : diffDays
    }));
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.employeeId === form.employeeId);
    if (!emp) return;

    applyLeave({
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays: Number(form.totalDays),
      reason: form.reason || 'General leave request'
    });

    setShowInputModal(false);
    setForm({
      employeeId: employees[0]?.employeeId || '',
      leaveType: 'VL',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totalDays: 1,
      reason: ''
    });
  };

  const filtered = leaves.filter(record => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || record.leaveType === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExport = () => {
    const rows = filtered.map(r => ({
      'Leave ID': r.id,
      'Employee ID': r.employeeId,
      'Employee Name': r.employeeName,
      'Department': r.department,
      'Leave Type': r.leaveType,
      'Start Date': r.startDate,
      'End Date': r.endDate,
      'Total Days': r.totalDays,
      'Reason': r.reason,
      'Status': r.status.toUpperCase(),
      'Applied Date': r.appliedDate,
      'Approved By': r.approvedBy || '--'
    }));
    exportToCsv('Pressa_Leave_Basis_Records', rows);
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'disapproved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
            <XIcon className="w-3.5 h-3.5 text-rose-600" />
            Disapproved
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
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
            <CalendarDays className="w-5 h-5 text-sky-600" />
            Leave Basis &amp; Application Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Input employees applying for leave. Direct status tracking: <strong className="text-emerald-600">Approved</strong>, <strong className="text-amber-600">Pending Review</strong>, or <strong className="text-rose-600">Disapproved</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInputModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-sky-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Input Employee for Applying Leave</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Counts Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Approved</span>
            <p className="text-2xl font-black text-emerald-950">
              {leaves.filter(l => l.status === 'approved').length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pending Review</span>
            <p className="text-2xl font-black text-amber-950">
              {leaves.filter(l => l.status === 'pending_review').length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Disapproved</span>
            <p className="text-2xl font-black text-rose-950">
              {leaves.filter(l => l.status === 'disapproved').length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
            <XIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee or basis..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-sky-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-sky-400"
          >
            <option value="all">All Categories</option>
            <option value="VL">VL (Vacation)</option>
            <option value="PTO">PTO</option>
            <option value="sick">Sick</option>
            <option value="emergency">Emergency</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-sky-400"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending_review">Pending Review</option>
            <option value="disapproved">Disapproved</option>
          </select>
        </div>
      </div>

      {/* Leaves Basis Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <CalendarDays className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No leave records found</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Input Employee for Applying Leave" above to record one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 text-sky-900 border-b border-sky-100 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Dates / Duration</th>
                  <th className="py-3 px-4">Reason / Basis</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Set Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map(leave => (
                  <tr key={leave.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{leave.employeeName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{leave.employeeId} &bull; {leave.department}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span>{leave.startDate} to {leave.endDate}</span>
                      <span className="block text-[10px] text-slate-400 font-sans font-bold">
                        ({leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'})
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600">
                      {leave.reason || '--'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {/* Direct 1-tap Status Buttons - no notes required */}
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateLeaveStatus(leave.id, 'approved')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            leave.status === 'approved'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateLeaveStatus(leave.id, 'pending_review')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            leave.status === 'pending_review'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          Pending
                        </button>

                        <button
                          onClick={() => updateLeaveStatus(leave.id, 'disapproved')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            leave.status === 'disapproved'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          Disapprove
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete leave entry for ${leave.employeeName}?`)) {
                              deleteLeaveRecord(leave.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                          title="Delete leave record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Input Employee for Applying Leave Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-sky-100 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Input Employee for Applying Leave</h3>
                <p className="text-xs text-sky-100">Record submitted leave application</p>
              </div>
              <button
                onClick={() => setShowInputModal(false)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleInputSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Employee</label>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={form.leaveType}
                  onChange={e => setForm({ ...form, leaveType: e.target.value as LeaveType })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  <option value="VL">VL (Vacation Leave)</option>
                  <option value="PTO">PTO (Paid Time Off)</option>
                  <option value="sick">Sick Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="maternity_paternity">Parental Leave</option>
                  <option value="bereavement">Bereavement</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={e => handleDatesChange(e.target.value, form.endDate)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={e => handleDatesChange(form.startDate, e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-sky-50 rounded-xl text-sky-800 font-semibold flex items-center justify-between">
                <span>Calculated Days:</span>
                <span className="text-sm font-black">{form.totalDays} Days</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Basis</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Reason for leave basis..."
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInputModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-200"
                >
                  Record Leave Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
