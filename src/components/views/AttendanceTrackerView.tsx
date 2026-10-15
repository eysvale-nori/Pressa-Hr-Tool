import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { AttendanceCode, WorkMode } from '../../types';
import {
  CalendarCheck,
  Search,
  Download,
  Plus,
  Clock,
  Laptop,
  Building,
  Truck,
  Edit2,
  Check,
  X as XIcon,
  HelpCircle,
  Users,
  Grid3X3,
  List,
  Sparkles,
  Trash2
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

export const AttendanceTrackerView: React.FC = () => {
  const {
    employees,
    monthlyAttendanceGrids,
    setAttendanceGridCell,
    bulkSetAttendanceGridDay,
    editEmployeeName,
    addEmployee,
    deleteEmployee,
    attendance,
    clockInEmployee,
    clockOutEmployee
  } = useHRData();
  const { role } = useAuth();

  const [activeMode, setActiveMode] = useState<'matrix' | 'daily'>('matrix');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing employee name state
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeDept, setNewEmployeeDept] = useState('Customer Operations');
  const [newEmployeeRole, setNewEmployeeRole] = useState('Support Associate');

  // Daily punch modal
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockEmployeeId, setClockEmployeeId] = useState(employees[0]?.employeeId || '');
  const [clockWorkMode, setClockWorkMode] = useState<WorkMode>('on-site');
  const [clockNotes, setClockNotes] = useState('');

  // Calculate days in the selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Month grid data
  const currentMonthGrid = monthlyAttendanceGrids[selectedMonth] || {};

  // Code cycler: '' -> '✓' -> 'X' -> 'L' -> 'PTO' -> 'VL' -> ''
  const cycleCode = (current: AttendanceCode): AttendanceCode => {
    switch (current) {
      case '':
        return '✓';
      case '✓':
        return 'X';
      case 'X':
        return 'L';
      case 'L':
        return 'PTO';
      case 'PTO':
        return 'VL';
      case 'VL':
        return '';
      default:
        return '✓';
    }
  };

  const handleCellClick = (employeeId: string, day: number) => {
    const currentCode = currentMonthGrid[employeeId]?.[day] || '';
    const next = cycleCode(currentCode);
    setAttendanceGridCell(selectedMonth, employeeId, day, next);
  };

  const handleStartEditName = (empId: string, currentName: string) => {
    setEditingEmpId(empId);
    setEditingNameValue(currentName);
  };

  const handleSaveName = (empId: string) => {
    if (editingNameValue.trim()) {
      editEmployeeName(empId, editingNameValue.trim());
    }
    setEditingEmpId(null);
  };

  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;
    addEmployee(newEmployeeName.trim(), newEmployeeDept, newEmployeeRole);
    setNewEmployeeName('');
    setShowRosterModal(false);
  };

  const handleQuickMarkTodayPresent = () => {
    const today = new Date();
    const todayDay = today.getDate();
    bulkSetAttendanceGridDay(selectedMonth, todayDay, '✓');
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCodeColorClass = (code: AttendanceCode) => {
    switch (code) {
      case '✓':
        return 'bg-emerald-500 text-white font-extrabold shadow-xs';
      case 'X':
        return 'bg-rose-500 text-white font-black shadow-xs';
      case 'L':
        return 'bg-amber-400 text-amber-950 font-black shadow-xs';
      case 'PTO':
        return 'bg-sky-500 text-white font-black text-[10px] shadow-xs';
      case 'VL':
        return 'bg-purple-600 text-white font-black text-[10px] shadow-xs';
      default:
        return 'bg-slate-50 text-slate-300 hover:bg-sky-50 hover:text-slate-400';
    }
  };

  const handleExportMonthGrid = () => {
    const rows = employees.map(emp => {
      const empGrid = currentMonthGrid[emp.employeeId] || {};
      const rowObj: Record<string, unknown> = {
        'Employee ID': emp.employeeId,
        'Employee Name': emp.name,
        'Department': emp.department
      };

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let ptoCount = 0;
      let vlCount = 0;

      daysArray.forEach(d => {
        const val = empGrid[d] || '--';
        rowObj[`Day ${d}`] = val;
        if (val === '✓') presentCount++;
        if (val === 'X') absentCount++;
        if (val === 'L') lateCount++;
        if (val === 'PTO') ptoCount++;
        if (val === 'VL') vlCount++;
      });

      rowObj['Total Present (✓)'] = presentCount;
      rowObj['Total Absent (X)'] = absentCount;
      rowObj['Total Late (L)'] = lateCount;
      rowObj['Total PTO'] = ptoCount;
      rowObj['Total VL'] = vlCount;

      return rowObj;
    });

    exportToCsv(`Pressa_Attendance_Monthly_Checker_${selectedMonth}`, rows);
  };

  const handleClockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clockInEmployee(clockEmployeeId, clockWorkMode, clockNotes);
    setClockNotes('');
    setShowClockModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-sky-600" />
            Monthly Attendance Checker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-click checker for the whole month: <strong className="text-emerald-600">✓ Present</strong>, <strong className="text-rose-600">X Absent</strong>, <strong className="text-amber-600">L Late</strong>, <strong className="text-sky-600">PTO</strong>, and <strong className="text-purple-600">VL</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Switch Mode: Matrix vs Daily logs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setActiveMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeMode === 'matrix' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Monthly Checker</span>
            </button>
            <button
              onClick={() => setActiveMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeMode === 'daily' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Punch Log</span>
            </button>
          </div>

          <button
            onClick={() => setShowRosterModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>Edit Employee Names ({employees.length})</span>
          </button>

          <button
            onClick={() => setShowClockModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Clock In/Out</span>
          </button>

          <button
            onClick={handleExportMonthGrid}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {activeMode === 'matrix' ? (
        /* Monthly Checker Matrix */
        <div className="space-y-4">
          {/* Controls & Legend Bar */}
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
                  onClick={handleQuickMarkTodayPresent}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Marks all employees present for today"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All Today ✓</span>
                </button>
              </div>
            </div>

            {/* Click legend */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Click Cell to Cycle:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-xs">
                ✓ Present
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white font-black text-xs">
                X Absent
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 font-black text-xs">
                L Late
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 text-white font-black text-xs">
                PTO
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white font-black text-xs">
                VL
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs">
                -- Clear
              </span>
            </div>
          </div>

          {/* Matrix Table */}
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
                    <th className="py-3 px-2 text-center text-emerald-700 bg-emerald-50/70 border-l border-emerald-100">
                      ✓ Pres
                    </th>
                    <th className="py-3 px-2 text-center text-rose-700 bg-rose-50/70 border-l border-rose-100">
                      X Abs
                    </th>
                    <th className="py-3 px-2 text-center text-amber-700 bg-amber-50/70 border-l border-amber-100">
                      L Late
                    </th>
                    <th className="py-3 px-2 text-center text-sky-700 bg-sky-50/70 border-l border-sky-100">
                      PTO
                    </th>
                    <th className="py-3 px-2 text-center text-purple-700 bg-purple-50/70 border-l border-purple-100">
                      VL
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp, empIdx) => {
                    const empGrid = currentMonthGrid[emp.employeeId] || {};

                    let presentCount = 0;
                    let absentCount = 0;
                    let lateCount = 0;
                    let ptoCount = 0;
                    let vlCount = 0;

                    daysArray.forEach(d => {
                      const val = empGrid[d] || '';
                      if (val === '✓') presentCount++;
                      if (val === 'X') absentCount++;
                      if (val === 'L') lateCount++;
                      if (val === 'PTO') ptoCount++;
                      if (val === 'VL') vlCount++;
                    });

                    const isEditingThis = editingEmpId === emp.employeeId;

                    return (
                      <tr key={emp.employeeId} className="hover:bg-sky-50/30 transition-colors">
                        {/* Sticky Name Column */}
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
                                title="Save Name"
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

                              <div className="flex items-center gap-0.5 opacity-0 group-hover/name:opacity-100 transition-all shrink-0 ml-1">
                                <button
                                  onClick={() => handleStartEditName(emp.employeeId, emp.name)}
                                  className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded-md transition-all"
                                  title="Edit employee name"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Remove employee "${emp.name}" from tracker?`)) {
                                      deleteEmployee(emp.employeeId);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-all"
                                  title="Remove employee"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Month Days Cells */}
                        {daysArray.map(day => {
                          const code = empGrid[day] || '';

                          return (
                            <td
                              key={day}
                              onClick={() => handleCellClick(emp.employeeId, day)}
                              className="p-0.5 text-center border-r border-slate-100 cursor-pointer"
                              title={`${emp.name} - Day ${day}: Click to toggle status`}
                            >
                              <div
                                className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all ${getCodeColorClass(
                                  code
                                )}`}
                              >
                                {code || ''}
                              </div>
                            </td>
                          );
                        })}

                        {/* Monthly Summary Counts */}
                        <td className="py-2 px-2 text-center font-bold text-emerald-700 bg-emerald-50/40 border-l border-emerald-100">
                          {presentCount}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-rose-700 bg-rose-50/40 border-l border-rose-100">
                          {absentCount}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-amber-700 bg-amber-50/40 border-l border-amber-100">
                          {lateCount}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-sky-700 bg-sky-50/40 border-l border-sky-100">
                          {ptoCount}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-purple-700 bg-purple-50/40 border-l border-purple-100">
                          {vlCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-sky-50/60 border-t border-sky-100 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                Tip: Click any cell to cycle status: <strong>✓ &rarr; X &rarr; L &rarr; PTO &rarr; VL &rarr; Clear</strong>.
              </span>
              <span>
                Click the pencil icon next to any employee name to edit it directly.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Daily Punch Log View */
        <div className="bg-white rounded-2xl border border-sky-100 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Today's Detailed Mobile Punch-Ins</h3>
            <span className="text-xs text-slate-400">Real-time daily records</span>
          </div>

          <div className="divide-y divide-slate-100">
            {attendance.map(r => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{r.employeeName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{r.employeeId} &bull; {r.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-700">In: {r.checkIn}</p>
                  <p className="text-[11px] text-slate-500">Out: {r.checkOut || 'Active'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit / Manage Employee Roster Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-sky-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">Employee Roster &amp; Name Editor</h3>
                <p className="text-xs text-sky-100">{employees.length} active team members</p>
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Add New Employee */}
              <form onSubmit={handleAddNewEmployee} className="p-3 bg-sky-50 rounded-xl border border-sky-100 space-y-2">
                <span className="font-bold text-slate-800 block">Add New Team Member:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name..."
                    value={newEmployeeName}
                    onChange={e => setNewEmployeeName(e.target.value)}
                    className="p-2 border rounded-lg bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Department..."
                    value={newEmployeeDept}
                    onChange={e => setNewEmployeeDept(e.target.value)}
                    className="p-2 border rounded-lg bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Role..."
                    value={newEmployeeRole}
                    onChange={e => setNewEmployeeRole(e.target.value)}
                    className="p-2 border rounded-lg bg-white text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs"
                >
                  + Add Employee to System
                </button>
              </form>

              {/* Existing list with inline edit */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Current Employees (Click name to edit):
                </span>
                <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                  {employees.map((emp, i) => (
                    <div key={emp.employeeId} className="p-2.5 flex items-center justify-between hover:bg-slate-50 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono w-6">#{i + 1}</span>
                        <input
                          type="text"
                          defaultValue={emp.name}
                          onBlur={e => editEmployeeName(emp.employeeId, e.target.value)}
                          className="px-2 py-1 font-bold text-slate-800 border-b border-transparent hover:border-sky-300 focus:border-sky-500 focus:outline-hidden bg-transparent rounded"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{emp.employeeId} &bull; {emp.department}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete ${emp.name}?`)) {
                              deleteEmployee(emp.employeeId);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowRosterModal(false)}
                className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clock In / Out Modal */}
      {showClockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-sky-100 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Punch-In / Out</h3>
              </div>
              <button
                onClick={() => setShowClockModal(false)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleClockSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Employee
                </label>
                <select
                  value={clockEmployeeId}
                  onChange={e => setClockEmployeeId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:border-sky-400 text-xs font-semibold"
                >
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['on-site', 'remote', 'field'] as WorkMode[]).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setClockWorkMode(mode)}
                      className={`py-2 px-3 rounded-xl border text-center capitalize font-semibold transition-all ${
                        clockWorkMode === mode
                          ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traffic on Highway 4, Client early visit..."
                  value={clockNotes}
                  onChange={e => setClockNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:border-sky-400 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClockModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white rounded-xl font-bold shadow-md shadow-sky-200"
                >
                  Confirm Punch In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
