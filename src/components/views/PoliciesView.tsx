import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { PolicyCheckCode } from '../../types';
import {
  CreditCard,
  Coffee,
  Check,
  X as XIcon,
  Download,
  Search,
  Sparkles,
  Edit2,
  BookOpen,
  Printer,
  ShieldCheck,
  Clock,
  Save,
  Edit3
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

export const PoliciesView: React.FC = () => {
  const {
    employees,
    idPolicyGrids,
    setIdPolicyGridCell,
    bulkSetIdPolicyDay,
    breakPolicyGrids,
    setBreakPolicyGridCell,
    bulkSetBreakPolicyDay,
    editEmployeeName,
    policies,
    updatePolicies
  } = useHRData();
  const { role } = useAuth();

  const [activeTab, setActiveTab] = useState<'id_checker' | 'break_checker' | 'docs'>('id_checker');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing employee name inline
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  // Policy text editing
  const [isEditingDocs, setIsEditingDocs] = useState(false);
  const [idTitle, setIdTitle] = useState(policies.idPolicy.title);
  const [idContent, setIdContent] = useState(policies.idPolicy.content);
  const [breakTitle, setBreakTitle] = useState(policies.breakPolicy.title);
  const [breakContent, setBreakContent] = useState(policies.breakPolicy.content);

  // Calculate days in the selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const currentIdGrid = idPolicyGrids[selectedMonth] || {};
  const currentBreakGrid = breakPolicyGrids[selectedMonth] || {};

  // Cycle: '' -> '✓' -> 'X' -> ''
  const cyclePolicyCode = (current: PolicyCheckCode): PolicyCheckCode => {
    if (current === '') return '✓';
    if (current === '✓') return 'X';
    return '';
  };

  const handleIdCellClick = (employeeId: string, day: number) => {
    const currentCode = currentIdGrid[employeeId]?.[day] || '';
    const next = cyclePolicyCode(currentCode);
    setIdPolicyGridCell(selectedMonth, employeeId, day, next);
  };

  const handleBreakCellClick = (employeeId: string, day: number) => {
    const currentCode = currentBreakGrid[employeeId]?.[day] || '';
    const next = cyclePolicyCode(currentCode);
    setBreakPolicyGridCell(selectedMonth, employeeId, day, next);
  };

  const handleSaveName = (empId: string) => {
    if (editingNameValue.trim()) {
      editEmployeeName(empId, editingNameValue.trim());
    }
    setEditingEmpId(null);
  };

  const handleQuickMarkTodayId = () => {
    const today = new Date().getDate();
    bulkSetIdPolicyDay(selectedMonth, today, '✓');
  };

  const handleQuickMarkTodayBreak = () => {
    const today = new Date().getDate();
    bulkSetBreakPolicyDay(selectedMonth, today, '✓');
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPolicyColorClass = (code: PolicyCheckCode) => {
    switch (code) {
      case '✓':
        return 'bg-emerald-500 text-white font-extrabold shadow-xs';
      case 'X':
        return 'bg-rose-500 text-white font-black shadow-xs';
      default:
        return 'bg-slate-50 text-slate-300 hover:bg-sky-50';
    }
  };

  const handleExportPolicyGrid = (type: 'ID_Policy' | 'Break_Policy') => {
    const grid = type === 'ID_Policy' ? currentIdGrid : currentBreakGrid;
    const rows = employees.map(emp => {
      const empGrid = grid[emp.employeeId] || {};
      const rowObj: Record<string, unknown> = {
        'Employee ID': emp.employeeId,
        'Employee Name': emp.name,
        'Department': emp.department
      };

      let compliantCount = 0;
      let violationCount = 0;

      daysArray.forEach(d => {
        const val = empGrid[d] || '--';
        rowObj[`Day ${d}`] = val;
        if (val === '✓') compliantCount++;
        if (val === 'X') violationCount++;
      });

      rowObj['Total Compliant (✓)'] = compliantCount;
      rowObj['Total Violations (X)'] = violationCount;

      return rowObj;
    });

    exportToCsv(`Pressa_${type}_Monthly_Checker_${selectedMonth}`, rows);
  };

  const handleSaveDocs = () => {
    updatePolicies({
      idPolicy: {
        ...policies.idPolicy,
        title: idTitle,
        content: idContent,
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      breakPolicy: {
        ...policies.breakPolicy,
        title: breakTitle,
        content: breakContent,
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    });
    setIsEditingDocs(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-600" />
            ID Policy &amp; Break Policy Monthly Checkers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Input <strong className="text-emerald-600 font-bold">✓ (Check / Compliant)</strong> and <strong className="text-rose-600 font-bold">X (Violation)</strong> for the whole month for all 20 employees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'id_checker' && (
            <button
              onClick={() => handleExportPolicyGrid('ID_Policy')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export ID Grid</span>
            </button>
          )}

          {activeTab === 'break_checker' && (
            <button
              onClick={() => handleExportPolicyGrid('Break_Policy')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Break Grid</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
        <button
          onClick={() => setActiveTab('id_checker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'id_checker'
              ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>ID Policy Monthly Checker</span>
        </button>

        <button
          onClick={() => setActiveTab('break_checker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'break_checker'
              ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Break Policy Monthly Checker</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'docs'
              ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Policy Guidelines Reference</span>
        </button>
      </div>

      {/* TAB 1: ID POLICY CHECKER */}
      {activeTab === 'id_checker' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden"
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Search Employee
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 w-48 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="self-end">
                <button
                  onClick={handleQuickMarkTodayId}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All Today ✓ (ID Worn)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Input Checker:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-xs">
                ✓ Check (Compliant / Wore ID)
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500 text-white font-black text-xs">
                X Cross (Violation / No ID)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs">
                -- Clear
              </span>
            </div>
          </div>

          {/* ID Checker Matrix Table */}
          <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead className="bg-sky-50/90 sticky top-0 z-20 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-sky-100">
                  <tr>
                    <th className="py-3 px-3 min-w-[200px] sticky left-0 z-30 bg-sky-50/95 border-r border-sky-200/80 shadow-xs">
                      Employee ({filteredEmployees.length})
                    </th>
                    {daysArray.map(day => (
                      <th
                        key={day}
                        className="py-3 px-1 text-center w-8 min-w-[32px] border-r border-slate-100 font-mono text-[11px]"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="py-3 px-2 text-center text-emerald-700 bg-emerald-50/70 border-l border-emerald-100 font-bold">
                      ✓ Compliant
                    </th>
                    <th className="py-3 px-2 text-center text-rose-700 bg-rose-50/70 border-l border-rose-100 font-bold">
                      X Violation
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp, empIdx) => {
                    const empGrid = currentIdGrid[emp.employeeId] || {};
                    let compliantCount = 0;
                    let violationCount = 0;

                    daysArray.forEach(d => {
                      const val = empGrid[d] || '';
                      if (val === '✓') compliantCount++;
                      if (val === 'X') violationCount++;
                    });

                    const isEditingThis = editingEmpId === emp.employeeId;

                    return (
                      <tr key={emp.employeeId} className="hover:bg-sky-50/30 transition-colors">
                        <td className="py-2.5 px-3 sticky left-0 z-10 bg-white group-hover:bg-sky-50 border-r border-sky-100 shadow-2xs">
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingNameValue}
                                onChange={e => setEditingNameValue(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveName(emp.employeeId);
                                  if (e.key === 'Escape') setEditingEmpId(null);
                                }}
                                autoFocus
                                className="w-full px-2 py-1 text-xs font-bold border border-sky-400 rounded-lg bg-sky-50 focus:outline-hidden"
                              />
                              <button
                                onClick={() => handleSaveName(emp.employeeId)}
                                className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group/name">
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  #{empIdx + 1}
                                </span>
                                <div>
                                  <p className="font-extrabold text-slate-800 text-xs truncate max-w-[140px]">
                                    {emp.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                    {emp.department}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setEditingEmpId(emp.employeeId);
                                  setEditingNameValue(emp.name);
                                }}
                                className="opacity-0 group-hover/name:opacity-100 p-1 text-slate-400 hover:text-sky-600 rounded-md transition-all shrink-0 ml-1"
                                title="Edit employee name"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {daysArray.map(day => {
                          const code = empGrid[day] || '';

                          return (
                            <td
                              key={day}
                              onClick={() => handleIdCellClick(emp.employeeId, day)}
                              className="p-0.5 text-center border-r border-slate-100 cursor-pointer"
                              title={`${emp.name} - Day ${day}: Click to toggle ✓ or X`}
                            >
                              <div
                                className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all ${getPolicyColorClass(
                                  code
                                )}`}
                              >
                                {code || ''}
                              </div>
                            </td>
                          );
                        })}

                        <td className="py-2 px-2 text-center font-bold text-emerald-700 bg-emerald-50/40 border-l border-emerald-100">
                          {compliantCount}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-rose-700 bg-rose-50/40 border-l border-rose-100">
                          {violationCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-sky-50/60 border-t border-sky-100 text-xs text-slate-500">
              Click any cell to toggle: <strong>✓ (Badge Worn) &rarr; X (Badge Violation) &rarr; Clear</strong>. Click pencil next to an employee name to edit it.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BREAK POLICY CHECKER */}
      {activeTab === 'break_checker' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden"
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Search Employee
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 w-48 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="self-end">
                <button
                  onClick={handleQuickMarkTodayBreak}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All Today ✓ (Break Complied)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Input Checker:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-xs">
                ✓ Check (On-time Break)
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500 text-white font-black text-xs">
                X Cross (Overbreak / Violation)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs">
                -- Clear
              </span>
            </div>
          </div>

          {/* Break Checker Matrix Table */}
          <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[70vh]">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead className="bg-sky-50/90 sticky top-0 z-20 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-sky-100">
                  <tr>
                    <th className="py-3 px-3 min-w-[200px] sticky left-0 z-30 bg-sky-50/95 border-r border-sky-200/80 shadow-xs">
                      Employee ({filteredEmployees.length})
                    </th>
                    {daysArray.map(day => (
                      <th
                        key={day}
                        className="py-3 px-1 text-center w-8 min-w-[32px] border-r border-slate-100 font-mono text-[11px]"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="py-3 px-2 text-center text-emerald-700 bg-emerald-50/70 border-l border-emerald-100 font-bold">
                      ✓ Compliant
                    </th>
                    <th className="py-3 px-2 text-center text-rose-700 bg-rose-50/70 border-l border-rose-100 font-bold">
                      X Violation
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp, empIdx) => {
                    const empGrid = currentBreakGrid[emp.employeeId] || {};
                    let compliantCount = 0;
                    let violationCount = 0;

                    daysArray.forEach(d => {
                      const val = empGrid[d] || '';
                      if (val === '✓') compliantCount++;
                      if (val === 'X') violationCount++;
                    });

                    const isEditingThis = editingEmpId === emp.employeeId;

                    return (
                      <tr key={emp.employeeId} className="hover:bg-sky-50/30 transition-colors">
                        <td className="py-2.5 px-3 sticky left-0 z-10 bg-white group-hover:bg-sky-50 border-r border-sky-100 shadow-2xs">
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingNameValue}
                                onChange={e => setEditingNameValue(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveName(emp.employeeId);
                                  if (e.key === 'Escape') setEditingEmpId(null);
                                }}
                                autoFocus
                                className="w-full px-2 py-1 text-xs font-bold border border-sky-400 rounded-lg bg-sky-50 focus:outline-hidden"
                              />
                              <button
                                onClick={() => handleSaveName(emp.employeeId)}
                                className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group/name">
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  #{empIdx + 1}
                                </span>
                                <div>
                                  <p className="font-extrabold text-slate-800 text-xs truncate max-w-[140px]">
                                    {emp.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                    {emp.department}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setEditingEmpId(emp.employeeId);
                                  setEditingNameValue(emp.name);
                                }}
                                className="opacity-0 group-hover/name:opacity-100 p-1 text-slate-400 hover:text-sky-600 rounded-md transition-all shrink-0 ml-1"
                                title="Edit employee name"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {daysArray.map(day => {
                          const code = empGrid[day] || '';

                          return (
                            <td
                              key={day}
                              onClick={() => handleBreakCellClick(emp.employeeId, day)}
                              className="p-0.5 text-center border-r border-slate-100 cursor-pointer"
                              title={`${emp.name} - Day ${day}: Click to toggle ✓ or X`}
                            >
                              <div
                                className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all ${getPolicyColorClass(
                                  code
                                )}`}
                              >
                                {code || ''}
                              </div>
                            </td>
                          );
                        })}

                        <td className="py-2 px-2 text-center font-bold text-emerald-700 bg-emerald-50/40 border-l border-emerald-100">
                          {compliantCount}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-rose-700 bg-rose-50/40 border-l border-rose-100">
                          {violationCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-sky-50/60 border-t border-sky-100 text-xs text-slate-500">
              Click any cell to toggle: <strong>✓ (On-time Rest Period) &rarr; X (Overbreak / Violation) &rarr; Clear</strong>. Click pencil next to an employee name to edit it.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POLICY TEXT REFERENCE */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">Official Workplace Guidelines</h3>
              <p className="text-xs text-slate-400 mt-0.5">Written ID &amp; Break policies for company reference</p>
            </div>
            {role === 'admin' && (
              <button
                onClick={() => {
                  if (isEditingDocs) handleSaveDocs();
                  else setIsEditingDocs(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs"
              >
                {isEditingDocs ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isEditingDocs ? 'Save Guidelines' : 'Edit Guidelines'}</span>
              </button>
            )}
          </div>

          {/* ID Policy Content */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              Identification (ID) Policy Rules
            </h4>
            {isEditingDocs ? (
              <textarea
                rows={3}
                value={idContent}
                onChange={e => setIdContent(e.target.value)}
                className="w-full p-3 border rounded-xl bg-slate-50 text-xs"
              />
            ) : (
              <p className="text-xs text-slate-700 bg-sky-50/40 p-4 rounded-xl border border-sky-100 leading-relaxed">
                {policies.idPolicy.content}
              </p>
            )}
          </div>

          {/* Break Policy Content */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Break &amp; Rest Period Policy Schedule
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                <span className="text-[10px] font-bold uppercase text-sky-700">Morning Break</span>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{policies.breakPolicy.morningBreak}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold uppercase text-emerald-700">Lunch Break</span>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{policies.breakPolicy.lunchBreak}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold uppercase text-blue-700">Afternoon Break</span>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{policies.breakPolicy.afternoonBreak}</p>
              </div>
            </div>
            {isEditingDocs ? (
              <textarea
                rows={3}
                value={breakContent}
                onChange={e => setBreakContent(e.target.value)}
                className="w-full p-3 border rounded-xl bg-slate-50 text-xs mt-2"
              />
            ) : (
              <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed mt-2">
                {policies.breakPolicy.content}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
