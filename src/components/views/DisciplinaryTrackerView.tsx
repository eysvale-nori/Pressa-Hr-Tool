import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  DisciplinaryRecord,
  ViolationType,
  SeverityLevel,
  DisciplinaryStatus
} from '../../types';
import {
  ShieldAlert,
  Lock,
  Plus,
  Download,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

export const DisciplinaryTrackerView: React.FC = () => {
  const { disciplinary, employees, addDisciplinaryRecord, updateDisciplinaryRecord } = useHRData();
  const { role, openAdminPasswordModal } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Resolution modal
  const [resolvingRecord, setResolvingRecord] = useState<DisciplinaryRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionPlanUpdate, setActionPlanUpdate] = useState('');

  const [form, setForm] = useState({
    employeeId: employees[0]?.employeeId || '',
    incidentDate: new Date().toISOString().split('T')[0],
    violationType: 'attendance' as ViolationType,
    severityLevel: 'verbal_warning' as SeverityLevel,
    description: '',
    actionPlan: '',
    hrNotes: ''
  });

  // If user is employee role, protect sensitive confidential records!
  if (role === 'employee') {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-sky-100 shadow-sm max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100 shadow-inner">
          <Lock className="w-8 h-8 text-sky-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Confidential HR Records Protected</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          In strict compliance with HR data privacy and Role-Based Access Control (RBAC), formal employee disciplinary actions and counseling files are restricted to authorized HR Administrators.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAdminPasswordModal('admin')}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Enter Admin Password to Unlock</span>
          </button>
        </div>
      </div>
    );
  }

  const filtered = disciplinary.filter(record => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || record.severityLevel === severityFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleExport = () => {
    const rows = filtered.map(r => ({
      'Incident ID': r.id,
      'Employee ID': r.employeeId,
      'Employee Name': r.employeeName,
      'Department': r.department,
      'Incident Date': r.incidentDate,
      'Violation Type': r.violationType.toUpperCase(),
      'Severity Level': r.severityLevel.toUpperCase(),
      'Description': r.description,
      'Action Plan': r.actionPlan,
      'Status': r.status.toUpperCase(),
      'Issued By': r.issuedBy,
      'Resolution Date': r.resolutionDate || 'Unresolved',
      'HR Notes': r.hrNotes || ''
    }));
    exportToCsv('Pressa_Disciplinary_Records', rows);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.employeeId === form.employeeId);
    if (!emp) return;

    addDisciplinaryRecord({
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      incidentDate: form.incidentDate,
      violationType: form.violationType,
      severityLevel: form.severityLevel,
      description: form.description,
      actionPlan: form.actionPlan,
      status: 'open',
      issuedBy: 'Pressa (HR Admin)',
      hrNotes: form.hrNotes
    });

    setShowAddModal(false);
    setForm({
      employeeId: employees[0]?.employeeId || '',
      incidentDate: new Date().toISOString().split('T')[0],
      violationType: 'attendance',
      severityLevel: 'verbal_warning',
      description: '',
      actionPlan: '',
      hrNotes: ''
    });
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingRecord) return;

    updateDisciplinaryRecord(resolvingRecord.id, {
      status: 'resolved',
      resolutionDate: new Date().toISOString().split('T')[0],
      actionPlan: actionPlanUpdate || resolvingRecord.actionPlan,
      hrNotes: resolutionNotes || resolvingRecord.hrNotes
    });

    setResolvingRecord(null);
    setResolutionNotes('');
  };

  const getSeverityBadge = (level: SeverityLevel) => {
    switch (level) {
      case 'verbal_warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            Verbal Warning
          </span>
        );
      case 'written_warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800">
            Written Warning
          </span>
        );
      case 'final_warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            Final Warning
          </span>
        );
      case 'suspension':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-200 text-rose-900 border border-rose-300">
            Suspension
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">
            {level}
          </span>
        );
    }
  };

  const getStatusBadge = (status: DisciplinaryStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Open Incident
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            Under Review
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Resolved
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
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Disciplinary Action &amp; Compliance Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Document policy violations, verbal/written warnings, corrective action roadmaps, and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs shadow-rose-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Incident</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee, violation, or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-rose-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-rose-400"
          >
            <option value="all">All Severities</option>
            <option value="verbal_warning">Verbal Warning</option>
            <option value="written_warning">Written Warning</option>
            <option value="final_warning">Final Warning</option>
            <option value="suspension">Suspension</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-rose-400"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Disciplinary Records List */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active disciplinary records found</p>
            <p className="text-xs text-slate-400 mt-0.5">High organizational conduct compliance!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(record => {
              const emp = employees.find(e => e.employeeId === record.employeeId);
              const isResolved = record.status === 'resolved';

              return (
                <div key={record.id} className="p-4 sm:p-5 hover:bg-sky-50/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={record.employeeName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                            {record.employeeName}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {record.department}
                          </span>
                          {getSeverityBadge(record.severityLevel)}
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Type: {record.violationType.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">
                          Incident Date:{' '}
                          <strong className="text-slate-700">{record.incidentDate}</strong> &bull; Recorded By: {record.issuedBy}
                        </p>

                        <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/70 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-rose-900 block mb-0.5">Violation Details:</strong>
                          {record.description}
                        </div>

                        <div className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-100/70 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-sky-900 block mb-0.5">Corrective Action Plan:</strong>
                          {record.actionPlan}
                        </div>

                        {record.hrNotes && (
                          <p className="text-[11px] text-slate-500 italic">
                            HR Follow-up Notes: {record.hrNotes}
                          </p>
                        )}

                        {isResolved && (
                          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Resolved on {record.resolutionDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div>{getStatusBadge(record.status)}</div>

                      {!isResolved && role === 'admin' && (
                        <button
                          onClick={() => {
                            setResolvingRecord(record);
                            setResolutionNotes(record.hrNotes || '');
                            setActionPlanUpdate(record.actionPlan);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-sky-100 overflow-hidden">
            <div className="bg-rose-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Record Disciplinary Action</h3>
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
                  <label className="block font-bold text-slate-700 mb-1">Incident Date</label>
                  <input
                    type="date"
                    required
                    value={form.incidentDate}
                    onChange={e => setForm({ ...form, incidentDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={form.severityLevel}
                    onChange={e => setForm({ ...form, severityLevel: e.target.value as SeverityLevel })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold capitalize"
                  >
                    <option value="verbal_warning">Verbal Warning</option>
                    <option value="written_warning">Written Warning</option>
                    <option value="final_warning">Final Warning</option>
                    <option value="suspension">Suspension</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Violation Category</label>
                <select
                  value={form.violationType}
                  onChange={e => setForm({ ...form, violationType: e.target.value as ViolationType })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold capitalize"
                >
                  <option value="attendance">Attendance &amp; Tardiness Breach</option>
                  <option value="policy_breach">Company Policy Violation (ID, Breaks)</option>
                  <option value="code_of_conduct">Code of Conduct &amp; Ethics</option>
                  <option value="performance">Substandard Performance / SLA Breach</option>
                  <option value="insubordination">Insubordination</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description of Incident</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specific facts, dates, witness accounts or SLA statistics..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corrective Action Plan &amp; Roadmap</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Expected improvements, timeline, follow-up meeting date..."
                  value={form.actionPlan}
                  onChange={e => setForm({ ...form, actionPlan: e.target.value })}
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
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200"
                >
                  Save Formal Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-sky-100 overflow-hidden">
            <div className="bg-emerald-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Resolve Disciplinary Incident</h3>
              <button
                onClick={() => setResolvingRecord(null)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900">
                <p className="font-bold">{resolvingRecord.employeeName}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{resolvingRecord.description}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Final Resolution Notes &amp; Outcome</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Document improvement observed, coaching completion, and formal resolution..."
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingRecord(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
