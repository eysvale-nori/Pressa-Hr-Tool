import React from 'react';
import { useHRData } from '../context/HRDataContext';
import { Bell, Calendar, Clock, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { deadlines, toggleDeadlineStatus } = useHRData();

  if (!isOpen) return null;

  const pendingDeadlines = deadlines.filter(d => d.status !== 'completed');
  const completedDeadlines = deadlines.filter(d => d.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-sky-100 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-sky-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">HR Deadlines &amp; Alerts</h3>
              <p className="text-xs text-slate-500">{pendingDeadlines.length} pending review milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-sky-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Pending &amp; Upcoming ({pendingDeadlines.length})
            </h4>

            {pendingDeadlines.length === 0 ? (
              <div className="p-6 text-center bg-sky-50/50 rounded-xl border border-dashed border-sky-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">No upcoming review deadlines right now.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingDeadlines.map(item => {
                  const isUrgent = item.status === 'urgent';
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isUrgent
                          ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/60'
                          : 'border-sky-100 bg-sky-50/20 hover:bg-sky-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {isUrgent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                Urgent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                                <Calendar className="w-3 h-3" />
                                Due {item.dueDate}
                              </span>
                            )}
                          </div>
                          <h5 className="font-semibold text-sm text-slate-800 mt-1.5">{item.title}</h5>
                          {item.employeeName && (
                            <p className="text-xs text-sky-700 font-medium mt-0.5">
                              Subject: {item.employeeName}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                        </div>

                        <button
                          onClick={() => toggleDeadlineStatus(item.id)}
                          className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 font-medium transition-colors"
                          title="Mark as completed"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {completedDeadlines.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Completed
              </h4>
              <div className="space-y-2 opacity-70">
                {completedDeadlines.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-medium text-slate-600 line-through">{item.title}</p>
                      <p className="text-[11px] text-slate-400">Due {item.dueDate}</p>
                    </div>
                    <button
                      onClick={() => toggleDeadlineStatus(item.id)}
                      className="text-[11px] text-sky-600 hover:underline"
                    >
                      Undo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
          Pressa's HR Management System &bull; Real-time Deadline Notifications
        </div>
      </div>
    </div>
  );
};
