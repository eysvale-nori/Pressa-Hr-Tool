import React, { useState } from 'react';
import { useHRData } from '../context/HRDataContext';
import { WorkMode } from '../types';
import { Clock, CheckCircle2, Building, Laptop, Truck, X } from 'lucide-react';

interface QuickClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickClockModal: React.FC<QuickClockModalProps> = ({ isOpen, onClose }) => {
  const { employees, attendance, clockInEmployee, clockOutEmployee } = useHRData();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.employeeId || '');
  const [workMode, setWorkMode] = useState<WorkMode>('on-site');
  const [notes, setNotes] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const activeRecord = attendance.find(
    a => a.employeeId === selectedEmpId && a.date === todayStr && !a.checkOut
  );

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    clockInEmployee(selectedEmpId, workMode, notes);
    const emp = employees.find(e => e.employeeId === selectedEmpId);
    setSuccessToast(`Clock-in recorded for ${emp?.name || 'employee'}!`);
    setNotes('');
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1200);
  };

  const handleClockOut = () => {
    clockOutEmployee(selectedEmpId);
    const emp = employees.find(e => e.employeeId === selectedEmpId);
    setSuccessToast(`Clock-out recorded for ${emp?.name || 'employee'}!`);
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-sky-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Mobile Timeclock Punch</h3>
              <p className="text-[11px] text-sky-100">Pressa's Daily Attendance Punch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Team Member
            </label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-xs focus:outline-hidden focus:border-sky-400"
            >
              {employees.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId}) &bull; {emp.department}
                </option>
              ))}
            </select>
          </div>

          {activeRecord ? (
            <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Active Shift Status:</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  Punched In at {activeRecord.checkIn}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Shift currently in progress ({activeRecord.workMode}). When your work shift finishes, click Clock Out below.
              </p>
              <button
                type="button"
                onClick={handleClockOut}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-extrabold rounded-xl shadow-md shadow-amber-200 text-xs transition-all active:scale-95"
              >
                Clock Out (End Shift)
              </button>
            </div>
          ) : (
            <form onSubmit={handleClockIn} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Work Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkMode('on-site')}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1 font-semibold text-[11px] transition-all ${
                      workMode === 'on-site'
                        ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>On-Site</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkMode('remote')}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1 font-semibold text-[11px] transition-all ${
                      workMode === 'remote'
                        ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Laptop className="w-4 h-4" />
                    <span>Remote WFH</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkMode('field')}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1 font-semibold text-[11px] transition-all ${
                      workMode === 'field'
                        ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Field / Dispatch</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Daily Notes / Arrival Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regular punch in, transit delay note..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-hidden focus:border-sky-400"
                />
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-[11px] text-sky-800 leading-relaxed">
                Scheduled shift start: <strong>9:00 AM</strong>. Automatic grace period of 10 minutes applies before tardiness flag.
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-200"
                >
                  Clock In Now
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
