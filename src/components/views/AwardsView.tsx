import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import { AwardItem, SpecialAwardType } from '../../types';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Sparkles,
  Users,
  Plus,
  Star,
  CheckCircle,
  Clock,
  HeartHandshake,
  Lightbulb,
  Headphones,
  TrendingUp,
  Download
} from 'lucide-react';
import { exportToCsv } from '../../services/googleSheetsSync';

export const AwardsView: React.FC = () => {
  const { awards, employees, addAward, setEmployeeOfTheMonth } = useHRData();
  const { role } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'eotm' | 'special' | 'team'>('all');
  const [showNominateModal, setShowNominateModal] = useState(false);

  const [form, setForm] = useState({
    category: 'special_award' as AwardItem['category'],
    specialAwardType: 'attendance_star' as SpecialAwardType,
    title: 'Steadfast Attendance Star',
    recipientName: employees[0]?.name || '',
    recipientId: employees[0]?.employeeId || '',
    department: employees[0]?.department || '',
    period: 'October 2026',
    description: '',
    citation: '',
    avatar: employees[0]?.avatar || ''
  });

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#38bdf8', '#fbbf24', '#f59e0b', '#10b981']
    });
  };

  const eotm = awards.find(a => a.category === 'employee_of_the_month') || awards[0];
  const specialAwards = awards.filter(a => a.category === 'special_award');
  const teamAwards = awards.filter(a => a.category === 'team_award');

  const filteredAwards = awards.filter(a => {
    if (activeTab === 'eotm') return a.category === 'employee_of_the_month';
    if (activeTab === 'special') return a.category === 'special_award';
    if (activeTab === 'team') return a.category === 'team_award';
    return true;
  });

  const handleExport = () => {
    const rows = filteredAwards.map(a => ({
      'Award ID': a.id,
      'Category': a.category.toUpperCase(),
      'Award Title': a.title,
      'Recipient Name': a.recipientName,
      'Department': a.department,
      'Period': a.period,
      'Description': a.description,
      'Citation': a.citation,
      'Awarded Date': a.awardedDate
    }));
    exportToCsv('Pressa_Awards_Honors', rows);
  };

  const handleNominateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.category === 'employee_of_the_month') {
      setEmployeeOfTheMonth({
        title: `Employee of the Month (${form.period})`,
        recipientName: form.recipientName,
        recipientId: form.recipientId,
        department: form.department,
        period: form.period,
        description: form.description || 'Awarded for exceptional overall contributions to Pressa.',
        citation: form.citation ? `"${form.citation}"` : '"Exemplary devotion and consistent performance."',
        awardedDate: new Date().toISOString().split('T')[0],
        avatar: form.avatar
      });
    } else {
      addAward({
        category: form.category,
        specialAwardType: form.specialAwardType,
        title: form.title,
        recipientName: form.recipientName,
        recipientId: form.recipientId,
        department: form.department,
        period: form.period,
        description: form.description,
        citation: form.citation ? `"${form.citation}"` : '',
        awardedDate: new Date().toISOString().split('T')[0],
        avatar: form.avatar
      });
    }

    setShowNominateModal(false);
    triggerConfetti();
  };

  const getSpecialIcon = (type?: SpecialAwardType) => {
    switch (type) {
      case 'attendance_star':
        return <Star className="w-5 h-5 text-amber-500" />;
      case 'teamwork_pillar':
        return <HeartHandshake className="w-5 h-5 text-sky-500" />;
      case 'innovation_impact':
        return <Lightbulb className="w-5 h-5 text-emerald-500" />;
      case 'customer_champion':
        return <Headphones className="w-5 h-5 text-blue-500" />;
      case 'rising_star':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Award className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Awards, Honors &amp; Milestones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Recognizing individual and team engagement, 5 special honors, and the Employee of the Month.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(role === 'admin' || role === 'supervisor') && (
            <button
              onClick={() => setShowNominateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs shadow-amber-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Confer New Award</span>
            </button>
          )}

          <button
            onClick={triggerConfetti}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Celebrate!</span>
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

      {/* Featured: Employee of the Month Spotlight */}
      {eotm && (
        <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-sky-400/40">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative shrink-0">
              <img
                src={eotm.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200'}
                alt={eotm.recipientName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-amber-300 shadow-2xl ring-4 ring-white/20"
              />
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-2 rounded-2xl shadow-lg animate-bounce">
                <Trophy className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/25 text-amber-200 border border-amber-300/30 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Featured Distinction &bull; {eotm.period}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {eotm.recipientName}
              </h3>
              <p className="text-sm text-sky-100 font-semibold">{eotm.department}</p>
              <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed max-w-2xl">
                {eotm.description}
              </p>
              {eotm.citation && (
                <p className="text-xs italic text-amber-200 bg-white/10 p-3 rounded-xl border border-white/15 max-w-2xl">
                  {eotm.citation}
                </p>
              )}
            </div>

            <div className="shrink-0 flex flex-col gap-2">
              <button
                onClick={triggerConfetti}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-xs shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Confetti!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          All Honors ({awards.length})
        </button>
        <button
          onClick={() => setActiveTab('special')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'special'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          5 Special Awards ({specialAwards.length})
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'team'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          Team Engagement ({teamAwards.length})
        </button>
      </div>

      {/* Awards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAwards.map(item => {
          const isTeam = item.category === 'team_award';
          const isEotm = item.category === 'employee_of_the_month';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                isEotm
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : 'border-sky-100 hover:border-sky-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                      {isTeam ? <Users className="w-5 h-5 text-sky-600" /> : getSpecialIcon(item.specialAwardType)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.period}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">{item.title}</h4>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {!isTeam && item.avatar && (
                    <img
                      src={item.avatar}
                      alt={item.recipientName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                  )}
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">{item.recipientName}</p>
                    <p className="text-[11px] text-slate-500">{item.department}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-sky-50/40 p-3 rounded-xl border border-sky-100/60">
                  {item.description}
                </p>

                {item.citation && (
                  <p className="text-[11px] italic text-sky-800 font-medium">
                    {item.citation}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Awarded: {item.awardedDate}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Conferred
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confer Award Modal */}
      {showNominateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-sky-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Confer Award or Honor</h3>
              <button
                onClick={() => setShowNominateModal(false)}
                className="text-white/80 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleNominateSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Award Category</label>
                <select
                  value={form.category}
                  onChange={e => {
                    const cat = e.target.value as AwardItem['category'];
                    setForm({
                      ...form,
                      category: cat,
                      title:
                        cat === 'employee_of_the_month'
                          ? `Employee of the Month (${form.period})`
                          : cat === 'team_award'
                          ? 'Engagement Team Award'
                          : 'Steadfast Attendance Star'
                    });
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  <option value="special_award">5 Special Honors (Individual)</option>
                  <option value="employee_of_the_month">Employee of the Month (EOTM)</option>
                  <option value="team_award">Engagement Team of the Cycle</option>
                </select>
              </div>

              {form.category === 'special_award' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Special Award Type</label>
                  <select
                    value={form.specialAwardType}
                    onChange={e => {
                      const t = e.target.value as SpecialAwardType;
                      const titles: Record<SpecialAwardType, string> = {
                        attendance_star: 'Steadfast Attendance Star',
                        teamwork_pillar: 'Pillar of Teamwork',
                        innovation_impact: 'Innovation & Impact Award',
                        customer_champion: 'Customer & Client Champion',
                        rising_star: 'Rising Star & Growth Catalyst'
                      };
                      setForm({ ...form, specialAwardType: t, title: titles[t] });
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value="attendance_star">1. Steadfast Attendance Star</option>
                    <option value="teamwork_pillar">2. Pillar of Teamwork</option>
                    <option value="innovation_impact">3. Innovation &amp; Impact</option>
                    <option value="customer_champion">4. Customer &amp; Client Champion</option>
                    <option value="rising_star">5. Rising Star &amp; Growth Catalyst</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recipient Name (or Team Name)
                </label>
                {form.category === 'team_award' ? (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Customer Operations Squad"
                    value={form.recipientName}
                    onChange={e => setForm({ ...form, recipientName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                ) : (
                  <select
                    value={form.recipientId}
                    onChange={e => {
                      const emp = employees.find(x => x.employeeId === e.target.value);
                      if (emp) {
                        setForm({
                          ...form,
                          recipientId: emp.employeeId,
                          recipientName: emp.name,
                          department: emp.department,
                          avatar: emp.avatar
                        });
                      }
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                  >
                    {employees.map(emp => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.name} ({emp.employeeId}) &bull; {emp.department}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Period</label>
                  <input
                    type="text"
                    value={form.period}
                    onChange={e => setForm({ ...form, period: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason &amp; Accomplishment</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the notable contribution..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Formal Citation Quote</label>
                <input
                  type="text"
                  placeholder='e.g. "Consistently sets the standard for excellence."'
                  value={form.citation}
                  onChange={e => setForm({ ...form, citation: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNominateModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-200"
                >
                  Confer Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
