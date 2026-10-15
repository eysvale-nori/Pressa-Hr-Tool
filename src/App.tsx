/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HRDataProvider } from './context/HRDataContext';
import { Navbar } from './components/Navbar';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { QuickClockModal } from './components/QuickClockModal';

import { DashboardView } from './components/views/DashboardView';
import { AttendanceTrackerView } from './components/views/AttendanceTrackerView';
import { TardinessTrackerView } from './components/views/TardinessTrackerView';
import { LeaveTrackerView } from './components/views/LeaveTrackerView';
import { DisciplinaryTrackerView } from './components/views/DisciplinaryTrackerView';
import { PoliciesView } from './components/views/PoliciesView';
import { PerformanceScoreboardView } from './components/views/PerformanceScoreboardView';
import { AwardsView } from './components/views/AwardsView';
import { MonthlyReportView } from './components/views/MonthlyReportView';
import { GoogleSheetsSyncView } from './components/views/GoogleSheetsSyncView';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [quickClockOpen, setQuickClockOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-sky-50/50 flex flex-col text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={tab => setActiveTab(tab)}
            onOpenQuickClock={() => setQuickClockOpen(true)}
          />
        )}
        {activeTab === 'attendance' && <AttendanceTrackerView />}
        {activeTab === 'tardiness' && <TardinessTrackerView />}
        {activeTab === 'leaves' && <LeaveTrackerView />}
        {activeTab === 'disciplinary' && <DisciplinaryTrackerView />}
        {activeTab === 'policies' && <PoliciesView />}
        {activeTab === 'scoreboard' && <PerformanceScoreboardView />}
        {activeTab === 'awards' && <AwardsView />}
        {activeTab === 'reports' && <MonthlyReportView />}
        {activeTab === 'googlesheets' && <GoogleSheetsSyncView />}
      </main>

      {/* Admin Password Gate Modal */}
      <AdminPasswordModal />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Quick Clock Modal */}
      <QuickClockModal
        isOpen={quickClockOpen}
        onClose={() => setQuickClockOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-sky-100 bg-white/80 py-4 px-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Pressa's Tool &bull; HR Operations, Performance Scoreboard &amp; Cloud Google Sheets Sync
          </span>
          <span className="text-[11px] text-slate-400">
            Offline-Ready &bull; PWA Responsive Mobile Compatible
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HRDataProvider>
        <MainAppContent />
      </HRDataProvider>
    </AuthProvider>
  );
}
