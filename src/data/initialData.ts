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
  AttendanceCode,
  PolicyCheckCode
} from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'EMP-1001',
    name: 'Elena Rostova',
    department: 'Customer Operations',
    role: 'Senior Team Lead',
    email: 'elena.r@pressaservices.com',
    phone: '+1 (555) 234-8891',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-03-15',
    status: 'active'
  },
  {
    id: 'emp-2',
    employeeId: 'EMP-1002',
    name: 'Marcus Vance',
    department: 'Quality Assurance',
    role: 'QA Specialist',
    email: 'marcus.v@pressaservices.com',
    phone: '+1 (555) 345-9922',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-08-01',
    status: 'active'
  },
  {
    id: 'emp-3',
    employeeId: 'EMP-1003',
    name: 'Sophia Chen',
    department: 'Customer Operations',
    role: 'Tier 2 Support Specialist',
    email: 'sophia.c@pressaservices.com',
    phone: '+1 (555) 456-1133',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    hireDate: '2024-01-10',
    status: 'active'
  },
  {
    id: 'emp-4',
    employeeId: 'EMP-1004',
    name: 'David O\'Connor',
    department: 'Logistics & Dispatch',
    role: 'Logistics Coordinator',
    email: 'david.o@pressaservices.com',
    phone: '+1 (555) 567-2244',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    hireDate: '2022-11-20',
    status: 'active'
  },
  {
    id: 'emp-5',
    employeeId: 'EMP-1005',
    name: 'Amara Okafor',
    department: 'Technical Support',
    role: 'Systems Engineer',
    email: 'amara.o@pressaservices.com',
    phone: '+1 (555) 678-3355',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-06-12',
    status: 'active'
  },
  {
    id: 'emp-6',
    employeeId: 'EMP-1006',
    name: 'Lucas Morales',
    department: 'Customer Operations',
    role: 'Support Associate',
    email: 'lucas.m@pressaservices.com',
    phone: '+1 (555) 789-4466',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    hireDate: '2024-04-18',
    status: 'active'
  },
  {
    id: 'emp-7',
    employeeId: 'EMP-1007',
    name: 'Chloe Dubois',
    department: 'Quality Assurance',
    role: 'Audit Officer',
    email: 'chloe.d@pressaservices.com',
    phone: '+1 (555) 890-5577',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    hireDate: '2024-07-01',
    status: 'probationary'
  },
  {
    id: 'emp-8',
    employeeId: 'EMP-1008',
    name: 'Tariq Al-Mansoor',
    department: 'Logistics & Dispatch',
    role: 'Inventory Specialist',
    email: 'tariq.a@pressaservices.com',
    phone: '+1 (555) 901-6688',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-09-05',
    status: 'active'
  },
  {
    id: 'emp-9',
    employeeId: 'EMP-1009',
    name: 'Samantha Reed',
    department: 'Customer Operations',
    role: 'Client Success Rep',
    email: 'samantha.r@pressaservices.com',
    phone: '+1 (555) 112-2233',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    hireDate: '2024-02-01',
    status: 'active'
  },
  {
    id: 'emp-10',
    employeeId: 'EMP-1010',
    name: 'Kevin Miller',
    department: 'Technical Support',
    role: 'Helpdesk Technician',
    email: 'kevin.m@pressaservices.com',
    phone: '+1 (555) 223-3344',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-11-15',
    status: 'active'
  },
  {
    id: 'emp-11',
    employeeId: 'EMP-1011',
    name: 'Beatrice Wong',
    department: 'Customer Operations',
    role: 'Support Specialist',
    email: 'beatrice.w@pressaservices.com',
    phone: '+1 (555) 334-4455',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    hireDate: '2024-05-10',
    status: 'active'
  },
  {
    id: 'emp-12',
    employeeId: 'EMP-1012',
    name: 'Carlos Mendez',
    department: 'Logistics & Dispatch',
    role: 'Fleet Dispatcher',
    email: 'carlos.m@pressaservices.com',
    phone: '+1 (555) 445-5566',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-04-20',
    status: 'active'
  },
  {
    id: 'emp-13',
    employeeId: 'EMP-1013',
    name: 'Hannah Wright',
    department: 'Quality Assurance',
    role: 'Junior Auditor',
    email: 'hannah.w@pressaservices.com',
    phone: '+1 (555) 556-6677',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    hireDate: '2024-08-01',
    status: 'probationary'
  },
  {
    id: 'emp-14',
    employeeId: 'EMP-1014',
    name: 'Ethan Brooks',
    department: 'Customer Operations',
    role: 'Escalations Lead',
    email: 'ethan.b@pressaservices.com',
    phone: '+1 (555) 667-7788',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-01-15',
    status: 'active'
  },
  {
    id: 'emp-15',
    employeeId: 'EMP-1015',
    name: 'Jasmine Patel',
    department: 'Technical Support',
    role: 'Cloud Operations Rep',
    email: 'jasmine.p@pressaservices.com',
    phone: '+1 (555) 778-8899',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-10-01',
    status: 'active'
  },
  {
    id: 'emp-16',
    employeeId: 'EMP-1016',
    name: 'Liam Johnson',
    department: 'Logistics & Dispatch',
    role: 'Warehouse Supervisor',
    email: 'liam.j@pressaservices.com',
    phone: '+1 (555) 889-9900',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    hireDate: '2022-09-10',
    status: 'active'
  },
  {
    id: 'emp-17',
    employeeId: 'EMP-1017',
    name: 'Natalie Gomez',
    department: 'Customer Operations',
    role: 'Support Specialist',
    email: 'natalie.g@pressaservices.com',
    phone: '+1 (555) 990-0011',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    hireDate: '2024-03-12',
    status: 'active'
  },
  {
    id: 'emp-18',
    employeeId: 'EMP-1018',
    name: 'Oliver Smith',
    department: 'Quality Assurance',
    role: 'QA Automation Engineer',
    email: 'oliver.s@pressaservices.com',
    phone: '+1 (555) 101-2020',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-07-22',
    status: 'active'
  },
  {
    id: 'emp-19',
    employeeId: 'EMP-1019',
    name: 'Patricia Taylor',
    department: 'Customer Operations',
    role: 'Tier 1 Support Agent',
    email: 'patricia.t@pressaservices.com',
    phone: '+1 (555) 202-3030',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    hireDate: '2024-06-15',
    status: 'probationary'
  },
  {
    id: 'emp-20',
    employeeId: 'EMP-1020',
    name: 'Daniel Kim',
    department: 'Technical Support',
    role: 'Database Support Admin',
    email: 'daniel.k@pressaservices.com',
    phone: '+1 (555) 303-4040',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    hireDate: '2023-02-18',
    status: 'active'
  }
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'EMP-1001',
    employeeName: 'Elena Rostova',
    date: today,
    checkIn: '08:48 AM',
    checkOut: '05:05 PM',
    status: 'present',
    workMode: 'on-site',
    notes: 'Floor supervisor shift opened on time.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'att-2',
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Vance',
    date: today,
    checkIn: '08:55 AM',
    checkOut: '05:00 PM',
    status: 'present',
    workMode: 'remote',
    notes: 'Remote QA pipeline testing.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'att-3',
    employeeId: 'EMP-1003',
    employeeName: 'Sophia Chen',
    date: today,
    checkIn: '08:50 AM',
    checkOut: '',
    status: 'present',
    workMode: 'on-site',
    notes: 'Client escalation duty.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'att-4',
    employeeId: 'EMP-1004',
    employeeName: 'David O\'Connor',
    date: today,
    checkIn: '09:35 AM',
    checkOut: '',
    status: 'late',
    workMode: 'field',
    notes: 'Delayed due to delivery dock road blockage.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'att-5',
    employeeId: 'EMP-1005',
    employeeName: 'Amara Okafor',
    date: today,
    checkIn: '08:52 AM',
    checkOut: '',
    status: 'present',
    workMode: 'remote',
    notes: 'Server patch deployment.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'att-6',
    employeeId: 'EMP-1006',
    employeeName: 'Lucas Morales',
    date: today,
    checkIn: '09:22 AM',
    checkOut: '',
    status: 'late',
    workMode: 'on-site',
    notes: 'Subway delay line 4.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'att-7',
    employeeId: 'EMP-1007',
    employeeName: 'Chloe Dubois',
    date: today,
    checkIn: '--',
    checkOut: '--',
    status: 'excused',
    workMode: 'on-site',
    notes: 'Approved Medical check-up leave.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'att-8',
    employeeId: 'EMP-1008',
    employeeName: 'Tariq Al-Mansoor',
    date: today,
    checkIn: '08:58 AM',
    checkOut: '',
    status: 'present',
    workMode: 'on-site',
    notes: 'Morning inventory cycle count.',
    synced: true,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_TARDINESS: TardinessRecord[] = [
  {
    id: 'tar-1',
    employeeId: 'EMP-1004',
    employeeName: 'David O\'Connor',
    date: today,
    scheduledTime: '09:00 AM',
    actualTime: '09:35 AM',
    minutesLate: 35,
    reason: 'Dock delivery highway road closure due to morning accident',
    status: 'excused',
    actionTaken: 'Traffic report verified; time adjusted.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tar-2',
    employeeId: 'EMP-1006',
    employeeName: 'Lucas Morales',
    date: today,
    scheduledTime: '09:00 AM',
    actualTime: '09:22 AM',
    minutesLate: 22,
    reason: 'Transit card issue & train delay at Central Station',
    status: 'pending_review',
    actionTaken: 'First incident this cycle. Friendly reminder sent.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tar-3',
    employeeId: 'EMP-1006',
    employeeName: 'Lucas Morales',
    date: '2026-10-09',
    scheduledTime: '09:00 AM',
    actualTime: '09:18 AM',
    minutesLate: 18,
    reason: 'Overslept due to shift change',
    status: 'unexcused',
    actionTaken: 'Verbal reminder on scheduled shift alarms.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tar-4',
    employeeId: 'EMP-1008',
    employeeName: 'Tariq Al-Mansoor',
    date: '2026-10-03',
    scheduledTime: '09:00 AM',
    actualTime: '09:12 AM',
    minutesLate: 12,
    reason: 'Bad weather / heavy rain delay',
    status: 'excused',
    actionTaken: 'Company-wide grace period invoked.',
    synced: true,
    updatedAt: new Date().toISOString()
  }
];

// Simplified Leaves with only approved, pending_review, disapproved as requested
export const INITIAL_LEAVES: LeaveRecord[] = [
  {
    id: 'lv-1',
    employeeId: 'EMP-1007',
    employeeName: 'Chloe Dubois',
    department: 'Quality Assurance',
    leaveType: 'VL',
    startDate: today,
    endDate: today,
    totalDays: 1,
    reason: 'Vacation Leave applied for personal family matter',
    status: 'approved',
    appliedDate: '2026-10-14',
    approvedBy: 'Pressa',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lv-2',
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Vance',
    department: 'Quality Assurance',
    leaveType: 'PTO',
    startDate: '2026-10-24',
    endDate: '2026-10-28',
    totalDays: 5,
    reason: 'Paid Time Off annual recharge',
    status: 'approved',
    appliedDate: '2026-10-02',
    approvedBy: 'Pressa',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lv-3',
    employeeId: 'EMP-1003',
    employeeName: 'Sophia Chen',
    department: 'Customer Operations',
    leaveType: 'emergency',
    startDate: '2026-10-20',
    endDate: '2026-10-21',
    totalDays: 2,
    reason: 'Emergency home repair',
    status: 'pending_review',
    appliedDate: '2026-10-14',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lv-4',
    employeeId: 'EMP-1011',
    employeeName: 'Beatrice Wong',
    department: 'Customer Operations',
    leaveType: 'VL',
    startDate: '2026-10-18',
    endDate: '2026-10-19',
    totalDays: 2,
    reason: 'Vacation Leave for weekend travel',
    status: 'disapproved',
    appliedDate: '2026-10-10',
    approvedBy: 'Pressa',
    synced: true,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_DISCIPLINARY: DisciplinaryRecord[] = [
  {
    id: 'disc-1',
    employeeId: 'EMP-1006',
    employeeName: 'Lucas Morales',
    department: 'Customer Operations',
    incidentDate: '2026-10-10',
    violationType: 'attendance',
    severityLevel: 'verbal_warning',
    description: 'Accumulated three unexcused tardiness occurrences within a 14-day rolling window.',
    actionPlan: 'Employee will set phone alarms 30 mins earlier and notify supervisor at least 30 minutes before 9:00 AM if transit issues arise.',
    status: 'under_review',
    issuedBy: 'Pressa (HR Admin)',
    hrNotes: 'Good attitude during 1-on-1 counseling session. Agreed to punctuality roadmap.',
    synced: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'disc-2',
    employeeId: 'EMP-1004',
    employeeName: 'David O\'Connor',
    department: 'Logistics & Dispatch',
    incidentDate: '2026-09-18',
    violationType: 'policy_breach',
    severityLevel: 'verbal_warning',
    description: 'Failed to display company identification badge within the secure inventory dock zone.',
    actionPlan: 'Provided replacement badge lanyard and reviewed safety protocol handbook.',
    status: 'resolved',
    resolutionDate: '2026-09-25',
    issuedBy: 'Pressa (HR Admin)',
    hrNotes: 'Full compliance observed throughout subsequent safety audits.',
    synced: true,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_POLICIES: CompanyPolicies = {
  idPolicy: {
    title: 'Company Identification & Security Badge Policy',
    content: 'All team members, contractors, and visitors are required to wear their official company-issued photo ID badge visibly at all times while on company premises or representing Pressa at client sites.',
    badgeRequiredAreas: [
      'Main entrance security turnstiles & reception',
      'Operations floor & workstations',
      'Server & IT technical rooms (restricted access)',
      'Logistics delivery docks & warehouse zones'
    ],
    lostBadgeProcess: 'Report lost badges immediately to HR within 2 hours. A temporary visitor tag will be issued for 24 hours. Replacement badges cost $10 for subsequent re-issues.',
    lastUpdated: '2026-10-01',
    complianceRules: [
      'Badges must be worn between chest and waist level facing forward.',
      'Lending or borrowing ID cards is strictly prohibited (Code of Conduct violation).',
      'Remote staff visiting offices must check in at security with valid government ID.'
    ]
  },
  breakPolicy: {
    title: 'Official Daily Break & Rest Period Policy',
    content: 'Pressa maintains a healthy, productive working environment that guarantees restorative rest intervals while maintaining uninterrupted customer service coverage.',
    morningBreak: '15 Minutes (10:30 AM - 10:45 AM or staggered between 10:15 - 11:00 AM)',
    lunchBreak: '60 Minutes (12:00 PM - 1:00 PM or 1:00 PM - 2:00 PM staggered)',
    afternoonBreak: '15 Minutes (3:30 PM - 3:45 PM or staggered between 3:15 - 4:00 PM)',
    overtimeBreakRules: 'Shifts exceeding 10 consecutive hours receive an additional mandatory paid 30-minute meal break.',
    coverageGuidelines: 'At least 50% of the customer support desk must remain staffed during all peak operational hours.',
    lastUpdated: '2026-10-01'
  },
  generalCode: 'Pressa values mutual respect, prompt accountability, open communication, and high ethical standards.'
};

export const INITIAL_SCOREBOARD: ScoreboardEntry[] = [
  {
    employeeId: 'EMP-1001',
    employeeName: 'Elena Rostova',
    department: 'Customer Operations',
    role: 'Senior Team Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    attendanceScore: 100,
    qualityScore: 98,
    productivityScore: 96,
    teamworkScore: 99,
    policyAdherenceScore: 100,
    totalKpi: 98.6,
    trend: 'up',
    reviewCycle: 'Q4 2026',
    notes: [
      {
        id: 'n-1',
        date: '2026-10-12',
        author: 'Pressa (HR)',
        authorRole: 'HR Manager',
        feedbackType: 'praise',
        note: 'Exceptional leadership in onboarding our junior support staff.',
        employeeAcknowledged: true
      }
    ]
  },
  {
    employeeId: 'EMP-1003',
    employeeName: 'Sophia Chen',
    department: 'Customer Operations',
    role: 'Tier 2 Support Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    attendanceScore: 97,
    qualityScore: 99,
    productivityScore: 95,
    teamworkScore: 94,
    policyAdherenceScore: 98,
    totalKpi: 96.6,
    trend: 'up',
    reviewCycle: 'Q4 2026',
    notes: []
  },
  {
    employeeId: 'EMP-1005',
    employeeName: 'Amara Okafor',
    department: 'Technical Support',
    role: 'Systems Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    attendanceScore: 98,
    qualityScore: 95,
    productivityScore: 98,
    teamworkScore: 96,
    policyAdherenceScore: 95,
    totalKpi: 96.4,
    trend: 'up',
    reviewCycle: 'Q4 2026',
    notes: []
  },
  {
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Vance',
    department: 'Quality Assurance',
    role: 'QA Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    attendanceScore: 96,
    qualityScore: 96,
    productivityScore: 92,
    teamworkScore: 95,
    policyAdherenceScore: 98,
    totalKpi: 95.4,
    trend: 'steady',
    reviewCycle: 'Q4 2026',
    notes: []
  }
];

export const INITIAL_AWARDS: AwardItem[] = [
  {
    id: 'award-eotm',
    category: 'employee_of_the_month',
    title: 'Employee of the Month (October 2026)',
    recipientName: 'Elena Rostova',
    recipientId: 'EMP-1001',
    department: 'Customer Operations',
    period: 'October 2026',
    description: 'Awarded for extraordinary leadership, 100% punctual attendance, zero escalations, and mentoring new team members.',
    citation: '"Elena embodies Pressa’s highest standards of dedication, empathy, and operational excellence."',
    awardedDate: '2026-10-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    synced: true
  },
  {
    id: 'award-special-1',
    category: 'special_award',
    specialAwardType: 'attendance_star',
    title: 'Steadfast Attendance Star',
    recipientName: 'Elena Rostova',
    recipientId: 'EMP-1001',
    department: 'Customer Operations',
    period: 'Q3 - Q4 2026',
    description: 'Perfect 100% attendance rate with zero tardiness minutes over 180 consecutive operational days.',
    citation: '"Unfailing reliability and devotion to our daily roster."',
    awardedDate: '2026-10-05',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    synced: true
  },
  {
    id: 'award-special-2',
    category: 'special_award',
    specialAwardType: 'teamwork_pillar',
    title: 'Pillar of Teamwork',
    recipientName: 'Marcus Vance',
    recipientId: 'EMP-1002',
    department: 'Quality Assurance',
    period: 'October 2026',
    description: 'Consistently steps up to support peer ticket reviews and cross-departmental documentation.',
    citation: '"The silent champion who elevates every project he touches."',
    awardedDate: '2026-10-08',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    synced: true
  },
  {
    id: 'award-special-3',
    category: 'special_award',
    specialAwardType: 'innovation_impact',
    title: 'Innovation & Impact Award',
    recipientName: 'Amara Okafor',
    recipientId: 'EMP-1005',
    department: 'Technical Support',
    period: 'Q3 2026',
    description: 'Engineered an automated server health audit script reducing downtime risks by 99%.',
    citation: '"Transforming technical challenges into effortless workflows."',
    awardedDate: '2026-09-30',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    synced: true
  },
  {
    id: 'award-special-4',
    category: 'special_award',
    specialAwardType: 'customer_champion',
    title: 'Customer & Client Champion',
    recipientName: 'Sophia Chen',
    recipientId: 'EMP-1003',
    department: 'Customer Operations',
    period: 'October 2026',
    description: 'Achieved an unprecedented 99.4% customer satisfaction score across 210 resolved complex tickets.',
    citation: '"A voice of calm clarity and genuine empathy for every client."',
    awardedDate: '2026-10-12',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    synced: true
  },
  {
    id: 'award-special-5',
    category: 'special_award',
    specialAwardType: 'rising_star',
    title: 'Rising Star & Growth Catalyst',
    recipientName: 'Chloe Dubois',
    recipientId: 'EMP-1007',
    department: 'Quality Assurance',
    period: 'October 2026',
    description: 'Fastest skill development curve and exceptional audit precision during onboarding.',
    citation: '"Tremendous velocity, enthusiasm, and a bright future at Pressa."',
    awardedDate: '2026-10-14',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    synced: true
  },
  {
    id: 'award-team-1',
    category: 'team_award',
    title: 'Highest Engagement Team of the Quarter',
    recipientName: 'Customer Operations Squad',
    department: 'Customer Operations',
    period: 'Q3 2026',
    description: '100% participation in employee feedback surveys and zero customer SLA infractions.',
    citation: '"Collaborative excellence under pressure."',
    awardedDate: '2026-10-01',
    synced: true
  }
];

export const INITIAL_DEADLINES: HRDeadline[] = [
  {
    id: 'dl-1',
    title: 'Q4 1-on-1 Performance Reviews Deadline',
    dueDate: '2026-10-25',
    type: 'performance_review',
    employeeName: 'Customer Support Team (Elena, Sophia, Lucas)',
    status: 'urgent',
    description: 'Conduct final 30-minute quarterly alignment reviews and lock scoreboard ratings.'
  },
  {
    id: 'dl-2',
    title: 'Probationary 90-Day Evaluation Review',
    dueDate: '2026-10-28',
    type: 'probation_eval',
    employeeId: 'EMP-1007',
    employeeName: 'Chloe Dubois',
    status: 'pending',
    description: 'Complete formal evaluation matrix for permanent tenure confirmation.'
  },
  {
    id: 'dl-3',
    title: 'November 2026 Employee of the Month Nominations',
    dueDate: '2026-10-30',
    type: 'eotm_nomination',
    status: 'pending',
    description: 'Collect supervisor nominations and review tardiness metrics before announcement.'
  },
  {
    id: 'dl-4',
    title: 'Annual Security Badge & ID Policy Re-Signoff',
    dueDate: '2026-11-05',
    type: 'policy_signoff',
    status: 'pending',
    description: 'Verify all 20 employees have acknowledged updated ID & break rules.'
  }
];

// Helper to generate initial checker grid for a month for 20 employees
export function generateInitialAttendanceGrid(month: string = '2026-10'): Record<string, Record<number, AttendanceCode>> {
  const result: Record<string, Record<number, AttendanceCode>> = {};
  
  INITIAL_EMPLOYEES.forEach((emp, index) => {
    result[emp.employeeId] = {};
    for (let day = 1; day <= 31; day++) {
      // Deterministic realistic seeding:
      // Sundays (e.g. day 4, 11, 18, 25 in Oct 2026) are rest days
      if (day % 7 === 4) {
        result[emp.employeeId][day] = '';
      } else if (day > 15) {
        // Future days start empty
        result[emp.employeeId][day] = '';
      } else if (day === 7 && index === 6) {
        result[emp.employeeId][day] = 'VL';
      } else if (day === 10 && index === 5) {
        result[emp.employeeId][day] = 'L';
      } else if (day === 4 && index === 3) {
        result[emp.employeeId][day] = 'L';
      } else if (day === 12 && index === 1) {
        result[emp.employeeId][day] = 'PTO';
      } else if (day === 8 && index === 11) {
        result[emp.employeeId][day] = 'X';
      } else {
        result[emp.employeeId][day] = '✓';
      }
    }
  });

  return result;
}

// Generate initial ID Policy & Break Policy checkers for 20 employees (✓ for compliant, X for violation)
export function generateInitialPolicyGrid(month: string = '2026-10', type: 'id' | 'break'): Record<string, Record<number, PolicyCheckCode>> {
  const result: Record<string, Record<number, PolicyCheckCode>> = {};

  INITIAL_EMPLOYEES.forEach((emp, index) => {
    result[emp.employeeId] = {};
    for (let day = 1; day <= 31; day++) {
      if (day % 7 === 4 || day > 15) {
        result[emp.employeeId][day] = '';
      } else if (type === 'id' && ((day === 3 && index === 3) || (day === 9 && index === 5))) {
        result[emp.employeeId][day] = 'X'; // No ID / violation
      } else if (type === 'break' && ((day === 5 && index === 5) || (day === 11 && index === 7))) {
        result[emp.employeeId][day] = 'X'; // Overbreak / break violation
      } else {
        result[emp.employeeId][day] = '✓'; // Compliant
      }
    }
  });

  return result;
}
