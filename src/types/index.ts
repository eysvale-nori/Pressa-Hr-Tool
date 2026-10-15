export type UserRole = 'admin' | 'supervisor' | 'employee';

export interface Employee {
  id: string;
  employeeId: string; // e.g. "EMP-1001"
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  hireDate: string;
  status: 'active' | 'on_leave' | 'probationary';
}

// Attendance Matrix Codes: ✓ (Present), X (Absent), L (Late), PTO (Paid Time Off), VL (Vacation Leave)
export type AttendanceCode = '✓' | 'X' | 'L' | 'PTO' | 'VL' | '';

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'excused' | 'absent';
export type WorkMode = 'on-site' | 'remote' | 'field';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM
  checkOut: string; // HH:MM or empty
  status: AttendanceStatus;
  workMode: WorkMode;
  notes?: string;
  synced: boolean;
  updatedAt: string;
}

export interface MonthlyAttendanceGrid {
  month: string; // YYYY-MM (e.g. "2026-10")
  // employeeId -> day (1-31) -> code
  grid: Record<string, Record<number, AttendanceCode>>;
}

// Policy Compliance Codes: ✓ (Compliant / Wore ID / On-time Break), X (Violation), '' (Off/Empty)
export type PolicyCheckCode = '✓' | 'X' | '';

export interface MonthlyPolicyCheckGrid {
  month: string; // YYYY-MM
  // employeeId -> day (1-31) -> PolicyCheckCode
  grid: Record<string, Record<number, PolicyCheckCode>>;
}

export interface TardinessRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  scheduledTime: string;
  actualTime: string;
  minutesLate: number;
  reason: string;
  status: 'excused' | 'unexcused' | 'pending_review';
  actionTaken?: string;
  synced: boolean;
  updatedAt: string;
}

export type LeaveType = 'VL' | 'PTO' | 'sick' | 'vacation' | 'emergency' | 'maternity_paternity' | 'bereavement' | 'unpaid';

// Strictly: Approved, Pending Review, Disapproved as requested
export type LeaveStatus = 'approved' | 'pending_review' | 'disapproved';

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  synced: boolean;
  updatedAt: string;
}

export type ViolationType = 'attendance' | 'policy_breach' | 'code_of_conduct' | 'performance' | 'insubordination';
export type SeverityLevel = 'verbal_warning' | 'written_warning' | 'final_warning' | 'suspension' | 'investigation';
export type DisciplinaryStatus = 'open' | 'under_review' | 'resolved';

export interface DisciplinaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  incidentDate: string;
  violationType: ViolationType;
  severityLevel: SeverityLevel;
  description: string;
  actionPlan: string;
  status: DisciplinaryStatus;
  resolutionDate?: string;
  hrNotes?: string;
  issuedBy: string;
  synced: boolean;
  updatedAt: string;
}

export interface CompanyPolicies {
  idPolicy: {
    title: string;
    content: string;
    badgeRequiredAreas: string[];
    lostBadgeProcess: string;
    lastUpdated: string;
    complianceRules: string[];
  };
  breakPolicy: {
    title: string;
    content: string;
    morningBreak: string;
    lunchBreak: string;
    afternoonBreak: string;
    overtimeBreakRules: string;
    coverageGuidelines: string;
    lastUpdated: string;
  };
  generalCode: string;
}

export interface PerformanceNote {
  id: string;
  date: string;
  author: string;
  authorRole: string;
  feedbackType: 'praise' | 'improvement' | '1on1' | 'goal';
  note: string;
  employeeAcknowledged: boolean;
}

export interface ScoreboardEntry {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  avatar: string;
  attendanceScore: number;
  qualityScore: number;
  productivityScore: number;
  teamworkScore: number;
  policyAdherenceScore: number;
  totalKpi: number;
  trend: 'up' | 'down' | 'steady';
  reviewCycle: string;
  notes: PerformanceNote[];
}

export type SpecialAwardType =
  | 'attendance_star'
  | 'teamwork_pillar'
  | 'innovation_impact'
  | 'customer_champion'
  | 'rising_star';

export interface AwardItem {
  id: string;
  category: 'employee_of_the_month' | 'special_award' | 'team_award';
  specialAwardType?: SpecialAwardType;
  title: string;
  recipientName: string;
  recipientId?: string;
  department: string;
  period: string;
  description: string;
  citation: string;
  awardedDate: string;
  avatar?: string;
  synced: boolean;
}

export interface HRDeadline {
  id: string;
  title: string;
  dueDate: string;
  type: 'performance_review' | 'probation_eval' | 'policy_signoff' | 'eotm_nomination';
  employeeId?: string;
  employeeName?: string;
  status: 'pending' | 'completed' | 'urgent';
  description: string;
}

export interface GoogleSheetSyncConfig {
  webAppUrl: string;
  sheetId?: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  errorMessage?: string;
  offlineQueueCount: number;
}
