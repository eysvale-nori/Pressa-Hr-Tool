import {
  AttendanceRecord,
  TardinessRecord,
  LeaveRecord,
  DisciplinaryRecord,
  CompanyPolicies,
  ScoreboardEntry,
  AwardItem
} from '../types';

export interface SyncPayload {
  action: 'sync_all' | 'test_connection';
  data?: {
    attendance?: AttendanceRecord[];
    tardiness?: TardinessRecord[];
    leaves?: LeaveRecord[];
    disciplinary?: DisciplinaryRecord[];
    policies?: CompanyPolicies;
    scoreboard?: ScoreboardEntry[];
    awards?: AwardItem[];
    monthlyAttendanceGrids?: Record<string, Record<string, Record<number, string>>>;
    idPolicyGrids?: Record<string, Record<string, Record<number, string>>>;
    breakPolicyGrids?: Record<string, Record<string, Record<number, string>>>;
  };
}

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  details?: unknown;
}

const STORAGE_KEY_WEBAPP_URL = 'pressa_webapp_url';
const STORAGE_KEY_OFFLINE_QUEUE = 'pressa_offline_queue';

export function getStoredWebAppUrl(): string {
  const stored = localStorage.getItem(STORAGE_KEY_WEBAPP_URL);
  if (stored && stored.trim()) {
    return stored.trim();
  }
  // Fallback to Vite environment variable (ideal for Vercel / Netlify / production hosting)
  try {
    const envUrl = (import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      return envUrl.trim();
    }
  } catch {
    // Ignore environment lookup error
  }
  return '';
}

export function saveStoredWebAppUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_WEBAPP_URL, url.trim());
}

export function getOfflineQueue(): unknown[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(item: unknown): void {
  const queue = getOfflineQueue();
  queue.push({
    item,
    queuedAt: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
}

/**
 * Pings Google Apps Script to test if the URL is valid and responding
 */
export async function testGoogleSheetConnection(webAppUrl: string): Promise<SyncResult> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return {
      success: false,
      message: 'Invalid Google Apps Script Web App URL. It must begin with https://script.google.com/...',
      timestamp: new Date().toISOString()
    };
  }

  if (!navigator.onLine) {
    return {
      success: false,
      message: 'Your device is currently offline. Please reconnect to test.',
      timestamp: new Date().toISOString()
    };
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // avoids preflight issues with Google Apps Script
      },
      body: JSON.stringify({ action: 'test_connection' })
    });

    const result = await response.json();
    return {
      success: result.status === 'success',
      message: result.message || 'Connected to Google Sheets successfully!',
      timestamp: new Date().toISOString(),
      details: result
    };
  } catch (error) {
    // If CORS or network error, provide helpful diagnostics
    return {
      success: false,
      message: `Failed to connect: ${(error as Error).message}. Ensure the Web App is deployed with 'Who has access: Anyone'.`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Push all datasets to the connected Google Spreadsheet
 */
export async function pushAllToGoogleSheet(
  webAppUrl: string,
  payloadData: NonNullable<SyncPayload['data']>
): Promise<SyncResult> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return {
      success: false,
      message: 'No Google Apps Script Web App URL configured. Please set it in Google Sheets Setup.',
      timestamp: new Date().toISOString()
    };
  }

  if (!navigator.onLine) {
    addToOfflineQueue(payloadData);
    return {
      success: false,
      message: 'Device is offline. Changes queued locally and will sync when reconnected.',
      timestamp: new Date().toISOString()
    };
  }

  try {
    const payload: SyncPayload = {
      action: 'sync_all',
      data: payloadData
    };

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 'success') {
      clearOfflineQueue();
      return {
        success: true,
        message: result.message || 'All records successfully synchronized to Google Sheets!',
        timestamp: new Date().toISOString(),
        details: result
      };
    } else {
      return {
        success: false,
        message: result.message || 'Apps script returned an error.',
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    addToOfflineQueue(payloadData);
    return {
      success: false,
      message: `Sync failed: ${(error as Error).message}. Data saved locally and added to offline queue.`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Fetch all sheets data from the Google Apps Script Web App (GET request)
 */
export async function fetchDataFromGoogleSheet(webAppUrl: string): Promise<{ success: boolean; data?: Record<string, any[]>; message: string }> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return {
      success: false,
      message: 'Invalid Web App URL.'
    };
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'GET'
    });
    const result = await response.json();
    if (result.status === 'success' && result.sheets) {
      return {
        success: true,
        data: result.sheets,
        message: 'Successfully pulled latest records from Google Sheets!'
      };
    }
    return {
      success: false,
      message: 'Unexpected response from Google Apps Script.'
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch from Google Sheets: ${(error as Error).message}`
    };
  }
}

/**
 * Utility to convert an array of objects to a downloadable CSV string
 */
export function exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cellVal: string = '';
            const rawCell = row[k];
            if (rawCell === null || rawCell === undefined) {
              cellVal = '';
            } else if (rawCell instanceof Date) {
              cellVal = rawCell.toLocaleString();
            } else if (typeof rawCell === 'object') {
              cellVal = JSON.stringify(rawCell);
            } else {
              cellVal = String(rawCell).replace(/"/g, '""');
            }

            if (cellVal.search(/("|,|\n)/g) >= 0) {
              cellVal = `"${cellVal}"`;
            }
            return cellVal;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
