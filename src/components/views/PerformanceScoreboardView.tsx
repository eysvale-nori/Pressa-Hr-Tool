import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { ScoreboardEntry, PerformanceNote } from '../../types';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Plus,
  MessageSquare,
  Award,
  CheckCircle2,
  ThumbsUp,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

export const PerformanceScoreboardView: React.FC = () => {
  const {
    scoreboard,
    updateScoreboardKPI,
    addPerformanceNote,
    acknowledgePerformanceNote
  } = useHRData();
  const { role, adminName } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

  // Note feedback modal / state
  const [activeNoteEmployee, setActiveNoteEmployee] = useState<ScoreboardEntry | null>(null);
  const [noteType, setNoteType] = useState<PerformanceNote['feedbackType']>('praise');
  const [noteText, setNoteText] = useState('');

  // Edit KPI modal
  const [editingEntry, setEditingEntry] = useState<ScoreboardEntry | null>(null);
  const [kpiForm, setKpiForm] = useState({
    attendanceScore: 95,
    qualityScore: 95,
    productivityScore: 95,
    teamworkScore: 95,
    policyAdherenceScore: 95
  });

  const departments = Array.from(new Set(scoreboard.map(s => s.department)));

  const filtered = scoreboard.filter(entry => {
    const matchesSearch =
      entry.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || entry.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleExport = () => {
    const rows = filtered.map(s => ({
      'Employee ID': s.employeeId,
      'Employee Name': s.employeeName,
      'Department': s.department,
      'Role': s.role,
      'Attendance (0-100)': s.attendanceScore,
      'Quality (0-100)': s.qualityScore,
      'Productivity (0-100)': s.productivityScore,
      'Teamwork (0-100)': s.teamworkScore,
      'Policy Score (0-100)': s.policyAdherenceScore,
      'Overall KPI %': s.totalKpi,
      'Trend': s.trend.toUpperCase(),
      'Review Cycle': s.reviewCycle,
      'Total Feedback Notes': s.notes.length
    }));
    exportToCsv('Pressa_Performance_Scoreboard', rows);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteEmployee || !noteText.trim()) return;

    addPerformanceNote(
      activeNoteEmployee.employeeId,
      noteText.trim(),
      noteType,
      role === 'admin' ? `${adminName} (HR)` : 'Supervisor Lead',
      role === 'admin' ? 'HR Manager' : 'Team Lead'
    );

    setNoteText('');
    setActiveNoteEmployee(null);
  };

  const handleSaveKpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    updateScoreboardKPI(editingEntry.employeeId, kpiForm);
    setEditingEntry(null);
  };

  const getFeedbackBadge = (type: PerformanceNote['feedbackType']) => {
    switch (type) {
      case 'praise':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <ThumbsUp className="w-3 h-3 text-emerald-600" />
            Praise &amp; Recognition
          </span>
        );
      case 'improvement':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Area for Improvement
          </span>
        );
      case '1on1':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
            1-on-1 Alignment
          </span>
        );
      case 'goal':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            <Target className="w-3 h-3 text-purple-600" />
            Quarterly Goal
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
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Performance Scoreboard &amp; Feedback Loops
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic employee evaluation: Attendance, Quality, Productivity, Teamwork, and 1-on-1 review notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Scoreboard</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee name, role or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-blue-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-hidden focus:border-blue-400"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scoreboard Cards */}
      <div className="space-y-4">
        {filtered.map((entry, index) => {
          const isExpanded = expandedEmployeeId === entry.employeeId;

          return (
            <div
              key={entry.employeeId}
              className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden transition-all hover:border-sky-300"
            >
              {/* Main Summary Header Row */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-sky-50 text-sky-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-sky-100">
                    #{index + 1}
                  </span>
                  <img
                    src={entry.avatar}
                    alt={entry.employeeName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">{entry.employeeName}</h3>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {entry.employeeId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{entry.department} &bull; {entry.role}</p>
                    <p className="text-[10px] text-sky-700 font-semibold mt-0.5">Cycle: {entry.reviewCycle}</p>
                  </div>
                </div>

                {/* KPI Metrics Chips */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-sky-50/60 p-2 rounded-xl border border-sky-100/60">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Attendance</span>
                    <span className="font-extrabold text-slate-800">{entry.attendanceScore}%</span>
                  </div>
                  <div className="bg-sky-50/60 p-2 rounded-xl border border-sky-100/60">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Quality</span>
                    <span className="font-extrabold text-slate-800">{entry.qualityScore}%</span>
                  </div>
                  <div className="bg-sky-50/60 p-2 rounded-xl border border-sky-100/60">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Productivity</span>
                    <span className="font-extrabold text-slate-800">{entry.productivityScore}%</span>
                  </div>
                  <div className="bg-sky-50/60 p-2 rounded-xl border border-sky-100/60">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Teamwork</span>
                    <span className="font-extrabold text-slate-800">{entry.teamworkScore}%</span>
                  </div>
                  <div className="bg-sky-50/60 p-2 rounded-xl border border-sky-100/60">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Policy</span>
                    <span className="font-extrabold text-slate-800">{entry.policyAdherenceScore}%</span>
                  </div>
                </div>

                {/* Total KPI Badge & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall KPI</span>
                    <span className="text-xl font-black text-sky-700">{entry.totalKpi}%</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(role === 'admin' || role === 'supervisor') && (
                      <button
                        onClick={() => {
                          setEditingEntry(entry);
                          setKpiForm({
                            attendanceScore: entry.attendanceScore,
                            qualityScore: entry.qualityScore,
                            productivityScore: entry.productivityScore,
                            teamworkScore: entry.teamworkScore,
                            policyAdherenceScore: entry.policyAdherenceScore
                          });
                        }}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                        title="Edit KPI Metrics"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setActiveNoteEmployee(entry)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Note</span>
                    </button>

                    <button
                      onClick={() => setExpandedEmployeeId(isExpanded ? null : entry.employeeId)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                      title={isExpanded ? 'Hide Reviews' : 'Show Reviews'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Review & Feedback Loops */}
              {isExpanded && (
                <div className="bg-sky-50/30 p-5 border-t border-sky-100 space-y-4 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                      Personalized Performance Reviews &amp; Feedback History ({entry.notes.length})
                    </h4>
                    <button
                      onClick={() => setActiveNoteEmployee(entry)}
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      + Write New Review Note
                    </button>
                  </div>

                  {entry.notes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                      No review notes recorded yet for {entry.employeeName}. Click "Add Note" to document a 1-on-1 or milestone.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {entry.notes.map(note => (
                        <div
                          key={note.id}
                          className="bg-white p-3.5 rounded-xl border border-sky-100 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {getFeedbackBadge(note.feedbackType)}
                              <span className="font-semibold text-slate-700">{note.author}</span>
                              <span className="text-[11px] text-slate-400 font-mono">({note.date})</span>
                            </div>

                            <div>
                              {note.employeeAcknowledged ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Employee Acknowledged
                                </span>
                              ) : (
                                <button
                                  onClick={() => acknowledgePerformanceNote(entry.employeeId, note.id)}
                                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium border border-slate-200 transition-colors"
                                >
                                  Acknowledge Feedback
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                            {note.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Performance Note Modal */}
      {activeNoteEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-sky-100 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Review Feedback</h3>
                <p className="text-xs text-sky-100">{activeNoteEmployee.employeeName} &bull; {activeNoteEmployee.role}</p>
              </div>
              <button
                onClick={() => setActiveNoteEmployee(null)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Feedback Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['praise', 'improvement', '1on1', 'goal'] as PerformanceNote['feedbackType'][]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNoteType(t)}
                      className={`p-2 rounded-xl border text-center capitalize font-semibold transition-all ${
                        noteType === t
                          ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t === '1on1' ? '1-on-1 Meeting' : t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Notes &amp; Action Items</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Document specific achievements, coaching advice, or mutually agreed goals..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveNoteEmployee(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-200"
                >
                  Post Review Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit KPI Metrics Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-sky-100 overflow-hidden">
            <div className="bg-slate-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Edit Performance Scores</h3>
                <p className="text-xs text-slate-300">{editingEntry.employeeName} ({editingEntry.employeeId})</p>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveKpi} className="p-5 space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Attendance Score (0-100)</span>
                  <span>{kpiForm.attendanceScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={kpiForm.attendanceScore}
                  onChange={e => setKpiForm({ ...kpiForm, attendanceScore: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Quality Score (0-100)</span>
                  <span>{kpiForm.qualityScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={kpiForm.qualityScore}
                  onChange={e => setKpiForm({ ...kpiForm, qualityScore: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Productivity Score (0-100)</span>
                  <span>{kpiForm.productivityScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={kpiForm.productivityScore}
                  onChange={e => setKpiForm({ ...kpiForm, productivityScore: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Teamwork Score (0-100)</span>
                  <span>{kpiForm.teamworkScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={kpiForm.teamworkScore}
                  onChange={e => setKpiForm({ ...kpiForm, teamworkScore: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Policy Adherence Score (0-100)</span>
                  <span>{kpiForm.policyAdherenceScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={kpiForm.policyAdherenceScore}
                  onChange={e => setKpiForm({ ...kpiForm, policyAdherenceScore: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl text-center font-bold text-sky-800">
                New Calculated KPI Average:{' '}
                {Math.round(
                  ((kpiForm.attendanceScore +
                    kpiForm.qualityScore +
                    kpiForm.productivityScore +
                    kpiForm.teamworkScore +
                    kpiForm.policyAdherenceScore) /
                    5) *
                    10
                ) / 10}
                %
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold"
                >
                  Save KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
