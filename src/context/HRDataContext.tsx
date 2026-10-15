import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Employee,
  AttendanceRecord,
  TardinessRecord,
  LeaveRecord,
  DisciplinaryRecord,
  CompanyPolicies,
  ScoreboardEntry,
  AwardItem,
  HRDeadline,
  GoogleSheetSyncConfig,
  AttendanceCode,
  PolicyCheckCode,
  LeaveStatus
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_TARDINESS,
  INITIAL_LEAVES,
  INITIAL_DISCIPLINARY,
  INITIAL_POLICIES,
  INITIAL_SCOREBOARD,
  INITIAL_AWARDS,
  INITIAL_DEADLINES,
  generateInitialAttendanceGrid,
  generateInitialPolicyGrid
} from '../data/initialData';
import {
  getStoredWebAppUrl,
  saveStoredWebAppUrl,
  pushAllToGoogleSheet,
  fetchDataFromGoogleSheet,
  getOfflineQueue,
  SyncResult
} from '../services/googleSheetsSync';

interface HRDataContextType {
  employees: Employee[];
  attendance: AttendanceRecord[];
  tardiness: TardinessRecord[];
  leaves: LeaveRecord[];
  disciplinary: DisciplinaryRecord[];
  policies: CompanyPolicies;
  scoreboard: ScoreboardEntry[];
  awards: AwardItem[];
  deadlines: HRDeadline[];
  syncConfig: GoogleSheetSyncConfig;
  isOnline: boolean;

  // Monthly Attendance Matrix
  monthlyAttendanceGrids: Record<string, Record<string, Record<number, AttendanceCode>>>;
  setAttendanceGridCell: (month: string, employeeId: string, day: number, code: AttendanceCode) => void;
  bulkSetAttendanceGridDay: (month: string, day: number, code: AttendanceCode) => void;

  // Monthly ID & Break Policy Checkers (✓ and X)
  idPolicyGrids: Record<string, Record<string, Record<number, PolicyCheckCode>>>;
  setIdPolicyGridCell: (month: string, employeeId: string, day: number, code: PolicyCheckCode) => void;
  bulkSetIdPolicyDay: (month: string, day: number, code: PolicyCheckCode) => void;

  breakPolicyGrids: Record<string, Record<string, Record<number, PolicyCheckCode>>>;
  setBreakPolicyGridCell: (month: string, employeeId: string, day: number, code: PolicyCheckCode) => void;
  bulkSetBreakPolicyDay: (month: string, day: number, code: PolicyCheckCode) => void;

  // Employee Name Editing & Addition
  editEmployeeName: (employeeId: string, newName: string) => void;
  addEmployee: (name: string, department: string, role: string) => void;
  deleteEmployee: (employeeId: string) => void;

  // Daily Punch Actions
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'synced' | 'updatedAt'>) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  clockInEmployee: (employeeId: string, workMode: AttendanceRecord['workMode'], notes?: string) => void;
  clockOutEmployee: (employeeId: string) => void;

  // Tardiness
  addTardinessRecord: (record: Omit<TardinessRecord, 'id' | 'synced' | 'updatedAt'>) => void;
  updateTardinessStatus: (id: string, status: TardinessRecord['status'], actionTaken?: string) => void;

  // Leave: "Input Employee For Applying Leave"
  applyLeave: (record: Omit<LeaveRecord, 'id' | 'status' | 'appliedDate' | 'synced' | 'updatedAt'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, approvedBy?: string) => void;
  deleteLeaveRecord: (id: string) => void;

  // Disciplinary
  addDisciplinaryRecord: (record: Omit<DisciplinaryRecord, 'id' | 'synced' | 'updatedAt'>) => void;
  updateDisciplinaryRecord: (id: string, updates: Partial<DisciplinaryRecord>) => void;

  // Policies text
  updatePolicies: (updated: Partial<CompanyPolicies>) => void;

  // Scoreboard
  updateScoreboardKPI: (employeeId: string, metrics: Partial<ScoreboardEntry>) => void;
  addPerformanceNote: (employeeId: string, noteText: string, feedbackType: 'praise' | 'improvement' | '1on1' | 'goal', author: string, authorRole: string) => void;
  acknowledgePerformanceNote: (employeeId: string, noteId: string) => void;

  // Awards
  addAward: (award: Omit<AwardItem, 'id' | 'synced'>) => void;
  setEmployeeOfTheMonth: (award: Omit<AwardItem, 'id' | 'synced' | 'category'>) => void;

  // Deadlines
  addDeadline: (deadline: Omit<HRDeadline, 'id' | 'status'>) => void;
  toggleDeadlineStatus: (id: string) => void;

  // Google Sheet Sync
  setWebAppUrl: (url: string) => void;
  syncWithGoogleSheets: () => Promise<SyncResult>;
  pullFromGoogleSheet: () => Promise<{ success: boolean; message: string }>;
  resetToSampleData: () => void;
}

const HRDataContext = createContext<HRDataContextType | undefined>(undefined);

const LS_EMPLOYEES = 'pressa_employees';
const LS_ATTENDANCE = 'pressa_attendance';
const LS_TARDINESS = 'pressa_tardiness';
const LS_LEAVES = 'pressa_leaves';
const LS_DISCIPLINARY = 'pressa_disciplinary';
const LS_POLICIES = 'pressa_policies';
const LS_SCOREBOARD = 'pressa_scoreboard';
const LS_AWARDS = 'pressa_awards';
const LS_DEADLINES = 'pressa_deadlines';
const LS_AUTO_SYNC = 'pressa_auto_sync';
const LS_ATTENDANCE_GRIDS = 'pressa_attendance_grids';
const LS_ID_POLICY_GRIDS = 'pressa_id_policy_grids';
const LS_BREAK_POLICY_GRIDS = 'pressa_break_policy_grids';

export const HRDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const raw = localStorage.getItem(LS_EMPLOYEES);
    if (raw) {
      const parsed: Employee[] = JSON.parse(raw);
      // Ensure if user had previous smaller set, merge/guarantee full 20
      if (parsed.length < INITIAL_EMPLOYEES.length) {
        return INITIAL_EMPLOYEES;
      }
      return parsed;
    }
    return INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const raw = localStorage.getItem(LS_ATTENDANCE);
    return raw ? JSON.parse(raw) : INITIAL_ATTENDANCE;
  });

  // Monthly Attendance Grids: month -> employeeId -> day -> code (✓, X, L, PTO, VL)
  const [monthlyAttendanceGrids, setMonthlyAttendanceGrids] = useState<Record<string, Record<string, Record<number, AttendanceCode>>>>(() => {
    const raw = localStorage.getItem(LS_ATTENDANCE_GRIDS);
    if (raw) return JSON.parse(raw);
    return {
      '2026-10': generateInitialAttendanceGrid('2026-10')
    };
  });

  // Monthly ID Policy Checker Grids: month -> employeeId -> day -> code (✓, X)
  const [idPolicyGrids, setIdPolicyGrids] = useState<Record<string, Record<string, Record<number, PolicyCheckCode>>>>(() => {
    const raw = localStorage.getItem(LS_ID_POLICY_GRIDS);
    if (raw) return JSON.parse(raw);
    return {
      '2026-10': generateInitialPolicyGrid('2026-10', 'id')
    };
  });

  // Monthly Break Policy Checker Grids: month -> employeeId -> day -> code (✓, X)
  const [breakPolicyGrids, setBreakPolicyGrids] = useState<Record<string, Record<string, Record<number, PolicyCheckCode>>>>(() => {
    const raw = localStorage.getItem(LS_BREAK_POLICY_GRIDS);
    if (raw) return JSON.parse(raw);
    return {
      '2026-10': generateInitialPolicyGrid('2026-10', 'break')
    };
  });

  const [tardiness, setTardiness] = useState<TardinessRecord[]>(() => {
    const raw = localStorage.getItem(LS_TARDINESS);
    return raw ? JSON.parse(raw) : INITIAL_TARDINESS;
  });

  const [leaves, setLeaves] = useState<LeaveRecord[]>(() => {
    const raw = localStorage.getItem(LS_LEAVES);
    return raw ? JSON.parse(raw) : INITIAL_LEAVES;
  });

  const [disciplinary, setDisciplinary] = useState<DisciplinaryRecord[]>(() => {
    const raw = localStorage.getItem(LS_DISCIPLINARY);
    return raw ? JSON.parse(raw) : INITIAL_DISCIPLINARY;
  });

  const [policies, setPolicies] = useState<CompanyPolicies>(() => {
    const raw = localStorage.getItem(LS_POLICIES);
    return raw ? JSON.parse(raw) : INITIAL_POLICIES;
  });

  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>(() => {
    const raw = localStorage.getItem(LS_SCOREBOARD);
    return raw ? JSON.parse(raw) : INITIAL_SCOREBOARD;
  });

  const [awards, setAwards] = useState<AwardItem[]>(() => {
    const raw = localStorage.getItem(LS_AWARDS);
    return raw ? JSON.parse(raw) : INITIAL_AWARDS;
  });

  const [deadlines, setDeadlines] = useState<HRDeadline[]>(() => {
    const raw = localStorage.getItem(LS_DEADLINES);
    return raw ? JSON.parse(raw) : INITIAL_DEADLINES;
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [syncConfig, setSyncConfig] = useState<GoogleSheetSyncConfig>(() => ({
    webAppUrl: getStoredWebAppUrl(),
    autoSync: localStorage.getItem(LS_AUTO_SYNC) !== 'false',
    lastSyncedAt: localStorage.getItem('pressa_last_synced') || null,
    syncStatus: 'idle',
    offlineQueueCount: getOfflineQueue().length
  }));

  // LocalStorage Persist
  useEffect(() => {
    localStorage.setItem(LS_EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(LS_ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(LS_ATTENDANCE_GRIDS, JSON.stringify(monthlyAttendanceGrids));
  }, [monthlyAttendanceGrids]);

  useEffect(() => {
    localStorage.setItem(LS_ID_POLICY_GRIDS, JSON.stringify(idPolicyGrids));
  }, [idPolicyGrids]);

  useEffect(() => {
    localStorage.setItem(LS_BREAK_POLICY_GRIDS, JSON.stringify(breakPolicyGrids));
  }, [breakPolicyGrids]);

  useEffect(() => {
    localStorage.setItem(LS_TARDINESS, JSON.stringify(tardiness));
  }, [tardiness]);

  useEffect(() => {
    localStorage.setItem(LS_LEAVES, JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem(LS_DISCIPLINARY, JSON.stringify(disciplinary));
  }, [disciplinary]);

  useEffect(() => {
    localStorage.setItem(LS_POLICIES, JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem(LS_SCOREBOARD, JSON.stringify(scoreboard));
  }, [scoreboard]);

  useEffect(() => {
    localStorage.setItem(LS_AWARDS, JSON.stringify(awards));
  }, [awards]);

  useEffect(() => {
    localStorage.setItem(LS_DEADLINES, JSON.stringify(deadlines));
  }, [deadlines]);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncConfig(prev => ({ ...prev, syncStatus: 'idle', offlineQueueCount: getOfflineQueue().length }));
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncConfig(prev => ({ ...prev, syncStatus: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setWebAppUrl = (url: string) => {
    saveStoredWebAppUrl(url);
    setSyncConfig(prev => ({ ...prev, webAppUrl: url.trim() }));
  };

  // Edit Employee Name with immediate cascading update to all tables
  const editEmployeeName = (employeeId: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;

    // 1. Update Employee
    setEmployees(prev =>
      prev.map(emp => (emp.employeeId === employeeId ? { ...emp, name: cleanName } : emp))
    );

    // 2. Cascade to Attendance
    setAttendance(prev =>
      prev.map(a => (a.employeeId === employeeId ? { ...a, employeeName: cleanName } : a))
    );

    // 3. Cascade to Tardiness
    setTardiness(prev =>
      prev.map(t => (t.employeeId === employeeId ? { ...t, employeeName: cleanName } : t))
    );

    // 4. Cascade to Leaves
    setLeaves(prev =>
      prev.map(l => (l.employeeId === employeeId ? { ...l, employeeName: cleanName } : l))
    );

    // 5. Cascade to Disciplinary
    setDisciplinary(prev =>
      prev.map(d => (d.employeeId === employeeId ? { ...d, employeeName: cleanName } : d))
    );

    // 6. Cascade to Scoreboard
    setScoreboard(prev =>
      prev.map(s => (s.employeeId === employeeId ? { ...s, employeeName: cleanName } : s))
    );

    // 7. Cascade to Awards
    setAwards(prev =>
      prev.map(aw => (aw.recipientId === employeeId ? { ...aw, recipientName: cleanName } : aw))
    );
  };

  const addEmployee = (name: string, department: string, role: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const nextNum = employees.length + 1;
    const newEmpId = `EMP-${1000 + nextNum}`;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeId: newEmpId,
      name: cleanName,
      department: department || 'General Operations',
      role: role || 'Staff Associate',
      email: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@pressaservices.com`,
      phone: '+1 (555) 000-0000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setEmployees(prev => [...prev, newEmp]);
  };

  const deleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.employeeId !== employeeId));
  };

  // Monthly Attendance Matrix Cell Updater
  const setAttendanceGridCell = (month: string, employeeId: string, day: number, code: AttendanceCode) => {
    setMonthlyAttendanceGrids(prev => {
      const monthData = prev[month] || {};
      const empData = monthData[employeeId] || {};
      return {
        ...prev,
        [month]: {
          ...monthData,
          [employeeId]: {
            ...empData,
            [day]: code
          }
        }
      };
    });
  };

  const bulkSetAttendanceGridDay = (month: string, day: number, code: AttendanceCode) => {
    setMonthlyAttendanceGrids(prev => {
      const monthData = prev[month] || {};
      const updatedMonth = { ...monthData };
      employees.forEach(emp => {
        updatedMonth[emp.employeeId] = {
          ...(updatedMonth[emp.employeeId] || {}),
          [day]: code
        };
      });
      return {
        ...prev,
        [month]: updatedMonth
      };
    });
  };

  // ID Policy Monthly Grid (✓ and X)
  const setIdPolicyGridCell = (month: string, employeeId: string, day: number, code: PolicyCheckCode) => {
    setIdPolicyGrids(prev => {
      const monthData = prev[month] || {};
      const empData = monthData[employeeId] || {};
      return {
        ...prev,
        [month]: {
          ...monthData,
          [employeeId]: {
            ...empData,
            [day]: code
          }
        }
      };
    });
  };

  const bulkSetIdPolicyDay = (month: string, day: number, code: PolicyCheckCode) => {
    setIdPolicyGrids(prev => {
      const monthData = prev[month] || {};
      const updatedMonth = { ...monthData };
      employees.forEach(emp => {
        updatedMonth[emp.employeeId] = {
          ...(updatedMonth[emp.employeeId] || {}),
          [day]: code
        };
      });
      return {
        ...prev,
        [month]: updatedMonth
      };
    });
  };

  // Break Policy Monthly Grid (✓ and X)
  const setBreakPolicyGridCell = (month: string, employeeId: string, day: number, code: PolicyCheckCode) => {
    setBreakPolicyGrids(prev => {
      const monthData = prev[month] || {};
      const empData = monthData[employeeId] || {};
      return {
        ...prev,
        [month]: {
          ...monthData,
          [employeeId]: {
            ...empData,
            [day]: code
          }
        }
      };
    });
  };

  const bulkSetBreakPolicyDay = (month: string, day: number, code: PolicyCheckCode) => {
    setBreakPolicyGrids(prev => {
      const monthData = prev[month] || {};
      const updatedMonth = { ...monthData };
      employees.forEach(emp => {
        updatedMonth[emp.employeeId] = {
          ...(updatedMonth[emp.employeeId] || {}),
          [day]: code
        };
      });
      return {
        ...prev,
        [month]: updatedMonth
      };
    });
  };

  // Google Sheet Push
  const syncWithGoogleSheets = useCallback(async (): Promise<SyncResult> => {
    setSyncConfig(prev => ({ ...prev, syncStatus: 'syncing', errorMessage: undefined }));

    const payload = {
      attendance,
      tardiness,
      leaves,
      disciplinary,
      policies,
      scoreboard,
      awards,
      monthlyAttendanceGrids,
      idPolicyGrids,
      breakPolicyGrids
    };

    const result = await pushAllToGoogleSheet(syncConfig.webAppUrl, payload);

    if (result.success) {
      const now = new Date().toISOString();
      localStorage.setItem('pressa_last_synced', now);
      setSyncConfig(prev => ({
        ...prev,
        syncStatus: 'synced',
        lastSyncedAt: now,
        offlineQueueCount: 0
      }));
    } else {
      setSyncConfig(prev => ({
        ...prev,
        syncStatus: isOnline ? 'error' : 'offline',
        errorMessage: result.message,
        offlineQueueCount: getOfflineQueue().length
      }));
    }

    return result;
  }, [attendance, tardiness, leaves, disciplinary, policies, scoreboard, awards, monthlyAttendanceGrids, idPolicyGrids, breakPolicyGrids, syncConfig.webAppUrl, isOnline]);

  // Pull data from connected Google Sheet (GET)
  const pullFromGoogleSheet = async (): Promise<{ success: boolean; message: string }> => {
    if (!syncConfig.webAppUrl) {
      return { success: false, message: 'Please enter your Web App URL first.' };
    }
    const res = await fetchDataFromGoogleSheet(syncConfig.webAppUrl);
    if (!res.success || !res.data) {
      return { success: false, message: res.message };
    }

    const sheets = res.data;
    const checkerRows = sheets.Attendance_Checker || sheets.ID_Policy_Checker || sheets.Break_Policy_Checker || [];

    if (checkerRows.length > 0) {
      const importedEmployees: Employee[] = [];
      const newMonthlyAttGrids: Record<string, Record<string, Record<number, AttendanceCode>>> = { ...monthlyAttendanceGrids };
      const newIdGrids: Record<string, Record<string, Record<number, PolicyCheckCode>>> = { ...idPolicyGrids };
      const newBreakGrids: Record<string, Record<string, Record<number, PolicyCheckCode>>> = { ...breakPolicyGrids };

      checkerRows.forEach((row: any, idx: number) => {
        const empId = row['Employee ID'] || `EMP-${1001 + idx}`;
        const name = row['Employee Name'] || `Employee ${idx + 1}`;
        const dept = row['Department'] || 'General Operations';
        const rawMonth = row['Month'] ? row['Month'].toString() : '2026-10';
        const monthKey = rawMonth.slice(0, 7);

        importedEmployees.push({
          id: `emp-${idx + 1}`,
          employeeId: empId,
          name: name,
          department: dept,
          role: 'Staff Specialist',
          email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@pressaservices.com`,
          phone: '+1 (555) 000-0000',
          avatar: `https://images.unsplash.com/photo-${1534528741775 + idx * 100}?w=150&auto=format&fit=crop&q=80`,
          hireDate: '2024-01-01',
          status: 'active'
        });

        if (!newMonthlyAttGrids[monthKey]) newMonthlyAttGrids[monthKey] = {};
        if (!newMonthlyAttGrids[monthKey][empId]) newMonthlyAttGrids[monthKey][empId] = {};

        for (let d = 1; d <= 31; d++) {
          const val = row[`Day ${d}`];
          if (val !== undefined && val !== null) {
            newMonthlyAttGrids[monthKey][empId][d] = val as AttendanceCode;
          }
        }
      });

      if (importedEmployees.length > 0) {
        setEmployees(importedEmployees);
      }
      setMonthlyAttendanceGrids(newMonthlyAttGrids);

      // Parse ID checker
      if (sheets.ID_Policy_Checker && sheets.ID_Policy_Checker.length > 0) {
        sheets.ID_Policy_Checker.forEach((row: any) => {
          const empId = row['Employee ID'];
          const rawMonth = row['Month'] ? row['Month'].toString() : '2026-10';
          const monthKey = rawMonth.slice(0, 7);
          if (!newIdGrids[monthKey]) newIdGrids[monthKey] = {};
          if (!newIdGrids[monthKey][empId]) newIdGrids[monthKey][empId] = {};
          for (let d = 1; d <= 31; d++) {
            const val = row[`Day ${d}`];
            if (val !== undefined && val !== null) {
              newIdGrids[monthKey][empId][d] = val as PolicyCheckCode;
            }
          }
        });
        setIdPolicyGrids(newIdGrids);
      }

      // Parse Break checker
      if (sheets.Break_Policy_Checker && sheets.Break_Policy_Checker.length > 0) {
        sheets.Break_Policy_Checker.forEach((row: any) => {
          const empId = row['Employee ID'];
          const rawMonth = row['Month'] ? row['Month'].toString() : '2026-10';
          const monthKey = rawMonth.slice(0, 7);
          if (!newBreakGrids[monthKey]) newBreakGrids[monthKey] = {};
          if (!newBreakGrids[monthKey][empId]) newBreakGrids[monthKey][empId] = {};
          for (let d = 1; d <= 31; d++) {
            const val = row[`Day ${d}`];
            if (val !== undefined && val !== null) {
              newBreakGrids[monthKey][empId][d] = val as PolicyCheckCode;
            }
          }
        });
        setBreakPolicyGrids(newBreakGrids);
      }
    }

    const count = checkerRows.length || 0;
    return {
      success: true,
      message: `Successfully loaded ${count} employees and records directly from your Google Sheet!`
    };
  };

  // Daily Punch Actions
  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id' | 'synced' | 'updatedAt'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      synced: false,
      updatedAt: new Date().toISOString()
    };
    setAttendance(prev => [newRecord, ...prev]);
  };

  const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendance(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, synced: false, updatedAt: new Date().toISOString() } : r))
    );
  };

  const clockInEmployee = (employeeId: string, workMode: AttendanceRecord['workMode'], notes?: string) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    if (!emp) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 10);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      date: todayStr,
      checkIn: nowTime,
      checkOut: '',
      status: isLate ? 'late' : 'present',
      workMode,
      notes: notes || (isLate ? 'Late check-in via mobile clock-in' : 'Standard check-in'),
      synced: false,
      updatedAt: new Date().toISOString()
    };

    setAttendance(prev => [newRecord, ...prev]);

    // Also update monthly grid cell for today
    const currentMonth = todayStr.slice(0, 7);
    const currentDay = now.getDate();
    setAttendanceGridCell(currentMonth, emp.employeeId, currentDay, isLate ? 'L' : '✓');

    if (isLate) {
      const scheduledMinutes = 9 * 60;
      const actualMinutes = now.getHours() * 60 + now.getMinutes();
      const diff = Math.max(0, actualMinutes - scheduledMinutes);

      const newTardy: TardinessRecord = {
        id: `tar-${Date.now()}`,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        date: todayStr,
        scheduledTime: '09:00 AM',
        actualTime: nowTime,
        minutesLate: diff,
        reason: notes || 'Automated mobile punch-in delay',
        status: 'pending_review',
        synced: false,
        updatedAt: new Date().toISOString()
      };
      setTardiness(prev => [newTardy, ...prev]);
    }
  };

  const clockOutEmployee = (employeeId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    setAttendance(prev =>
      prev.map(r => {
        if (r.employeeId === employeeId && r.date === todayStr && !r.checkOut) {
          return {
            ...r,
            checkOut: nowTime,
            synced: false,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      })
    );
  };

  const addTardinessRecord = (record: Omit<TardinessRecord, 'id' | 'synced' | 'updatedAt'>) => {
    const newRecord: TardinessRecord = {
      ...record,
      id: `tar-${Date.now()}`,
      synced: false,
      updatedAt: new Date().toISOString()
    };
    setTardiness(prev => [newRecord, ...prev]);
  };

  const updateTardinessStatus = (id: string, status: TardinessRecord['status'], actionTaken?: string) => {
    setTardiness(prev =>
      prev.map(r => (r.id === id ? { ...r, status, actionTaken: actionTaken || r.actionTaken, synced: false, updatedAt: new Date().toISOString() } : r))
    );
  };

  // Leave: Input Employee for applying leave
  const applyLeave = (record: Omit<LeaveRecord, 'id' | 'status' | 'appliedDate' | 'synced' | 'updatedAt'>) => {
    const newRecord: LeaveRecord = {
      ...record,
      id: `lv-${Date.now()}`,
      status: 'pending_review',
      appliedDate: new Date().toISOString().split('T')[0],
      synced: false,
      updatedAt: new Date().toISOString()
    };
    setLeaves(prev => [newRecord, ...prev]);
  };

  // Simplified: only approved, pending_review, disapproved. No notes required.
  const updateLeaveStatus = (id: string, status: LeaveStatus, approvedBy: string = 'Pressa') => {
    setLeaves(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status,
              approvedBy,
              synced: false,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );
  };

  const deleteLeaveRecord = (id: string) => {
    setLeaves(prev => prev.filter(r => r.id !== id));
  };

  const addDisciplinaryRecord = (record: Omit<DisciplinaryRecord, 'id' | 'synced' | 'updatedAt'>) => {
    const newRecord: DisciplinaryRecord = {
      ...record,
      id: `disc-${Date.now()}`,
      synced: false,
      updatedAt: new Date().toISOString()
    };
    setDisciplinary(prev => [newRecord, ...prev]);
  };

  const updateDisciplinaryRecord = (id: string, updates: Partial<DisciplinaryRecord>) => {
    setDisciplinary(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, synced: false, updatedAt: new Date().toISOString() } : r))
    );
  };

  const updatePolicies = (updated: Partial<CompanyPolicies>) => {
    setPolicies(prev => ({ ...prev, ...updated }));
  };

  const updateScoreboardKPI = (employeeId: string, metrics: Partial<ScoreboardEntry>) => {
    setScoreboard(prev =>
      prev.map(entry => {
        if (entry.employeeId === employeeId) {
          const attendanceScore = metrics.attendanceScore ?? entry.attendanceScore;
          const qualityScore = metrics.qualityScore ?? entry.qualityScore;
          const productivityScore = metrics.productivityScore ?? entry.productivityScore;
          const teamworkScore = metrics.teamworkScore ?? entry.teamworkScore;
          const policyAdherenceScore = metrics.policyAdherenceScore ?? entry.policyAdherenceScore;

          const totalKpi = Math.round(((attendanceScore + qualityScore + productivityScore + teamworkScore + policyAdherenceScore) / 5) * 10) / 10;

          return {
            ...entry,
            ...metrics,
            attendanceScore,
            qualityScore,
            productivityScore,
            teamworkScore,
            policyAdherenceScore,
            totalKpi
          };
        }
        return entry;
      })
    );
  };

  const addPerformanceNote = (
    employeeId: string,
    noteText: string,
    feedbackType: 'praise' | 'improvement' | '1on1' | 'goal',
    author: string,
    authorRole: string
  ) => {
    const newNote = {
      id: `fn-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author,
      authorRole,
      feedbackType,
      note: noteText,
      employeeAcknowledged: false
    };

    setScoreboard(prev =>
      prev.map(entry => {
        if (entry.employeeId === employeeId) {
          return {
            ...entry,
            notes: [newNote, ...entry.notes]
          };
        }
        return entry;
      })
    );
  };

  const acknowledgePerformanceNote = (employeeId: string, noteId: string) => {
    setScoreboard(prev =>
      prev.map(entry => {
        if (entry.employeeId === employeeId) {
          return {
            ...entry,
            notes: entry.notes.map(n => (n.id === noteId ? { ...n, employeeAcknowledged: true } : n))
          };
        }
        return entry;
      })
    );
  };

  const addAward = (award: Omit<AwardItem, 'id' | 'synced'>) => {
    const newAward: AwardItem = {
      ...award,
      id: `awd-${Date.now()}`,
      synced: false
    };
    setAwards(prev => [newAward, ...prev]);
  };

  const setEmployeeOfTheMonth = (award: Omit<AwardItem, 'id' | 'synced' | 'category'>) => {
    const newEotm: AwardItem = {
      ...award,
      id: `awd-eotm-${Date.now()}`,
      category: 'employee_of_the_month',
      synced: false
    };
    setAwards(prev => [newEotm, ...prev]);
  };

  const addDeadline = (deadline: Omit<HRDeadline, 'id' | 'status'>) => {
    const newDeadline: HRDeadline = {
      ...deadline,
      id: `dl-${Date.now()}`,
      status: 'pending'
    };
    setDeadlines(prev => [newDeadline, ...prev]);
  };

  const toggleDeadlineStatus = (id: string) => {
    setDeadlines(prev =>
      prev.map(d => (d.id === id ? { ...d, status: d.status === 'completed' ? 'pending' : 'completed' } : d))
    );
  };

  const resetToSampleData = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setMonthlyAttendanceGrids({ '2026-10': generateInitialAttendanceGrid('2026-10') });
    setIdPolicyGrids({ '2026-10': generateInitialPolicyGrid('2026-10', 'id') });
    setBreakPolicyGrids({ '2026-10': generateInitialPolicyGrid('2026-10', 'break') });
    setTardiness(INITIAL_TARDINESS);
    setLeaves(INITIAL_LEAVES);
    setDisciplinary(INITIAL_DISCIPLINARY);
    setPolicies(INITIAL_POLICIES);
    setScoreboard(INITIAL_SCOREBOARD);
    setAwards(INITIAL_AWARDS);
    setDeadlines(INITIAL_DEADLINES);
    localStorage.removeItem('pressa_offline_queue');
    setSyncConfig(prev => ({ ...prev, offlineQueueCount: 0 }));
  };

  return (
    <HRDataContext.Provider
      value={{
        employees,
        attendance,
        tardiness,
        leaves,
        disciplinary,
        policies,
        scoreboard,
        awards,
        deadlines,
        syncConfig,
        isOnline,
        monthlyAttendanceGrids,
        setAttendanceGridCell,
        bulkSetAttendanceGridDay,
        idPolicyGrids,
        setIdPolicyGridCell,
        bulkSetIdPolicyDay,
        breakPolicyGrids,
        setBreakPolicyGridCell,
        bulkSetBreakPolicyDay,
        editEmployeeName,
        addEmployee,
        deleteEmployee,
        addAttendanceRecord,
        updateAttendanceRecord,
        clockInEmployee,
        clockOutEmployee,
        addTardinessRecord,
        updateTardinessStatus,
        applyLeave,
        updateLeaveStatus,
        deleteLeaveRecord,
        addDisciplinaryRecord,
        updateDisciplinaryRecord,
        updatePolicies,
        updateScoreboardKPI,
        addPerformanceNote,
        acknowledgePerformanceNote,
        addAward,
        setEmployeeOfTheMonth,
        addDeadline,
        toggleDeadlineStatus,
        setWebAppUrl,
        syncWithGoogleSheets,
        pullFromGoogleSheet,
        resetToSampleData
      }}
    >
      {children}
    </HRDataContext.Provider>
  );
};

export const useHRData = () => {
  const context = useContext(HRDataContext);
  if (!context) {
    throw new Error('useHRData must be used within an HRDataProvider');
  }
  return context;
};
