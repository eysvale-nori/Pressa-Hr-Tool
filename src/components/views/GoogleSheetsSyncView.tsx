import React, { useState } from 'react';
import { useHRData } from '../../context/HRDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Wifi,
  WifiOff,
  Download,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Code2,
  Zap,
  HardDrive,
  Globe
} from 'lucide-react';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  STEP_BY_STEP_TUTORIAL
} from '../../services/appsScriptCode';
import {
  testGoogleSheetConnection,
  exportToCsv,
  clearOfflineQueue
} from '../../services/googleSheetsSync';

export const GoogleSheetsSyncView: React.FC = () => {
  const {
    syncConfig,
    setWebAppUrl,
    syncWithGoogleSheets,
    pullFromGoogleSheet,
    isOnline,
    attendance,
    resetToSampleData
  } = useHRData();
  const { role } = useAuth();

  const [inputUrl, setInputUrl] = useState(syncConfig.webAppUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSaveUrl = () => {
    setWebAppUrl(inputUrl);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!inputUrl) {
      setTestResult({
        success: false,
        message: 'Please paste your Google Apps Script Web App URL first.'
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const result = await testGoogleSheetConnection(inputUrl);
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const result = await syncWithGoogleSheets();
    setIsSyncing(false);
    setSyncMessage(result.message);
  };

  const handlePullNow = async () => {
    setIsPulling(true);
    setSyncMessage(null);
    const result = await pullFromGoogleSheet();
    setIsPulling(false);
    setSyncMessage(result.message);
  };

  const handleDownloadAllTemplates = () => {
    // Generate sample attendance CSV
    const rows = attendance.map(a => ({
      'Record ID': a.id,
      'Employee ID': a.employeeId,
      'Employee Name': a.employeeName,
      'Date': a.date,
      'Check In': a.checkIn,
      'Check Out': a.checkOut,
      'Status': a.status,
      'Work Mode': a.workMode,
      'Notes': a.notes || ''
    }));
    exportToCsv('Pressa_Attendance_Master_Sheet', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Google Sheets Cloud Integration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-way automated cloud sync for Attendance, Tardiness, Leaves, Scoreboard &amp; Awards with offline queue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePullNow}
            disabled={isPulling}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
            title="Import real employees and checker marks directly from your Google Sheet"
          >
            <Download className={`w-3.5 h-3.5 text-sky-600 ${isPulling ? 'animate-bounce' : ''}`} />
            <span>{isPulling ? 'Importing...' : 'Pull / Load From Google Sheet'}</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-200 transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Push / Sync to Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status 1: Connection */}
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cloud Webhook</span>
            <div className={`w-2.5 h-2.5 rounded-full ${syncConfig.webAppUrl ? 'bg-emerald-500' : 'bg-amber-400 animate-ping'}`} />
          </div>
          <p className="text-sm font-black text-slate-800">
            {syncConfig.webAppUrl ? 'Configured & Active' : 'Not Connected'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {syncConfig.webAppUrl || 'Provide Apps Script Web App URL below'}
          </p>
        </div>

        {/* Status 2: Network & Offline Queue */}
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mobile Remote Mode</span>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <p className="text-sm font-black text-slate-800">
            {isOnline ? 'Online (Real-Time)' : 'Offline Queue Active'}
          </p>
          <p className="text-[11px] text-slate-500">
            {syncConfig.offlineQueueCount > 0
              ? `${syncConfig.offlineQueueCount} pending changes will auto-sync when online`
              : 'All local changes synchronized'}
          </p>
        </div>

        {/* Status 3: Last Synced */}
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Last Cloud Sync</span>
            <HardDrive className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-sm font-black text-slate-800">
            {syncConfig.lastSyncedAt
              ? new Date(syncConfig.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'Pending First Sync'}
          </p>
          <p className="text-[11px] text-slate-500">
            {syncConfig.lastSyncedAt
              ? new Date(syncConfig.lastSyncedAt).toLocaleDateString()
              : 'Local storage active'}
          </p>
        </div>
      </div>

      {/* Sync Clarification Banner */}
      <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-sky-950">
        <HelpCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sky-900 text-sm">
            Why do records stay in the app after syncing?
          </p>
          <p className="text-slate-600 leading-relaxed">
            <strong>Syncing backs up your records to Google Sheets—it does not delete or erase them from the app.</strong> All employee checkmarks, leaves, and records stay here so you can continue viewing daily statuses, monthly attendance grids, charts, and awards on your phone or desktop.
          </p>
          <div className="text-slate-500 text-[11px] pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-sky-200/60 mt-2">
            <div>
              <span className="font-bold text-sky-800">Push / Sync to Sheet:</span> Copies this app's records into your Google Sheet.
            </div>
            <div>
              <span className="font-bold text-sky-800">Pull From Sheet:</span> Imports edits made directly in your Google Sheet into this app.
            </div>
            <div>
              <span className="font-bold text-sky-800">Edit Name:</span> Click ✏️ next to any employee to rename.
            </div>
            <div>
              <span className="font-bold text-sky-800">Delete Employee:</span> Click 🗑️ next to any employee to remove them.
            </div>
          </div>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {syncMessage}
          </span>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Webhook URL Input Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Google Apps Script Web App URL</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deploy the script provided below in your Google Sheet, then paste your Web App endpoint here.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 focus:outline-hidden focus:border-sky-400"
            />
            <button
              onClick={handleSaveUrl}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Save URL
            </button>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Step-by-Step Tutorial & Apps Script Code Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Step-by-Step Instructions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Step-by-Step Google Sheets Setup Guide
            </h3>
            <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
              6 Minutes Setup
            </span>
          </div>

          <div className="space-y-4">
            {STEP_BY_STEP_TUTORIAL.map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  <p className="text-[11px] text-sky-700 bg-sky-50/70 px-2.5 py-1 rounded-lg border border-sky-100/60 font-medium">
                    Pro-tip: {item.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Open sheets.new in new tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleDownloadAllTemplates}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download CSV Sample</span>
            </button>
          </div>
        </div>

        {/* Right: Copyable Apps Script Backend Code */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Google Apps Script Code (Code.gs)</h3>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Complete Code'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              This ready-to-run script auto-creates 7 styled sheet tabs (Attendance, Tardiness, Leaves, Disciplinary, Performance, Awards, Policies) with light blue headers and handles both GET &amp; POST requests.
            </p>

            {/* Code preview block */}
            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[11px] text-sky-200/90 h-96 overflow-y-auto border border-slate-800 shadow-inner">
              <pre className="whitespace-pre-wrap">{GOOGLE_APPS_SCRIPT_CODE}</pre>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400">
            Paste into Google Sheets &gt; Extensions &gt; Apps Script &gt; Deploy as Web App
          </div>
        </div>
      </div>

      {/* Publishing to GitHub & Vercel Guide */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50/50 rounded-3xl p-6 border border-sky-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-800">Publishing to GitHub &amp; Vercel</h4>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            100% Compatible &amp; Cloud Ready
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Yes! When you publish this repository to GitHub and host it on Vercel, it will continue syncing to your Google Sheet without any issues.</strong> The app communicates with your Google Apps Script endpoint via secure HTTPS, whether accessed on <code className="bg-sky-100/80 text-sky-900 px-1.5 py-0.5 rounded font-mono text-[11px]">your-app.vercel.app</code> or your mobile phone.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-2xs">
            <p className="font-bold text-slate-800 mb-1">1. Push to GitHub</p>
            <p className="text-[11px] text-slate-500">Run <code className="font-mono text-slate-700 bg-slate-100 px-1 rounded">git push</code>. Vercel automatically detects the Vite framework and runs <code className="font-mono text-slate-700 bg-slate-100 px-1 rounded">npm run build</code>.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-2xs">
            <p className="font-bold text-slate-800 mb-1">2. Keep "Anyone" in Apps Script</p>
            <p className="text-[11px] text-slate-500">Ensure your Apps Script deployment is set to <em>"Who has access: Anyone"</em> so Vercel visitors can sync.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-2xs">
            <p className="font-bold text-slate-800 mb-1">3. Optional Vercel Env Var</p>
            <p className="text-[11px] text-slate-500">In Vercel Settings &gt; Environment Variables, set <code className="font-mono text-slate-700 bg-slate-100 px-1 rounded">VITE_GOOGLE_APPS_SCRIPT_URL</code> so all devices connect automatically.</p>
          </div>
        </div>
      </div>

      {/* Offline Architecture & Remote Teams Scalability Info */}
      <div className="bg-sky-50/60 rounded-3xl p-6 border border-sky-100 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-sky-600" />
          Offline Resilience &amp; Remote Scalability Architecture
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Pressa's Tool is engineered with an <strong>Offline-First Service Architecture</strong>. Remote team members and field operators can record check-ins, log tardiness reasons, or submit leaves without active Wi-Fi or cellular service. All mutation actions are safely persisted into high-performance local browser storage and an atomic synchronization queue. When the device reconnects, changes are seamlessly pushed to the Google Cloud Spreadsheet without data collisions or manual re-entry.
        </p>

        {role === 'admin' && (
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">Troubleshooting utilities:</span>
            <button
              onClick={() => {
                if (confirm('Reset application data to initial demo seed?')) {
                  resetToSampleData();
                }
              }}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Reset to Initial Sample Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
