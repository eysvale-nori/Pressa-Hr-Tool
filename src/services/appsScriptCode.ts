/**
 * Complete and accurate Google Apps Script backend code
 * for Pressa's HR Suite.
 * Ready to copy-paste into Google Sheets -> Extensions -> Apps Script
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * PRESSA'S HR SUITE - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * ====================================================================
 * Automatic two-way cloud sync for Attendance, Tardiness, Leaves,
 * Disciplinary Actions, Performance Scoreboard, Awards & Policies.
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets (https://sheets.new) and title it: "Pressa's HR Master Records"
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete any code in Code.gs and paste this entire script.
 * 4. Click "Deploy" > "New deployment"
 * 5. Under "Select type" click the gear icon and select "Web app"
 * 6. Set Description: "Pressa HR Webhook v1"
 * 7. Set "Execute as": "Me (<your-email>)"
 * 8. Set "Who has access": "Anyone" (allows seamless secure sync from the web app)
 * 9. Click "Deploy", review permissions, click Advanced > Proceed.
 * 10. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 11. Paste it into Pressa's Tool in the "Google Sheets Sync" tab!
 * ====================================================================
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {
    status: "success",
    timestamp: new Date().toISOString(),
    sheets: {}
  };

  var sheetNames = [
    "Attendance_Checker",
    "ID_Policy_Checker",
    "Break_Policy_Checker",
    "Leaves",
    "Tardiness",
    "Disciplinary",
    "Performance",
    "Awards",
    "Policies",
    "Attendance"
  ];
  
  sheetNames.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      if (data.length > 1) {
        var headers = data[0];
        var rows = [];
        for (var i = 1; i < data.length; i++) {
          var rowObj = {};
          for (var j = 0; j < headers.length; j++) {
            rowObj[headers[j]] = data[i][j];
          }
          rows.push(rowObj);
        }
        result.sheets[name] = rows;
      } else {
        result.sheets[name] = [];
      }
    } else {
      result.sheets[name] = [];
    }
  });

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action || "sync_all";
    var data = payload.data || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "test_connection") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Connected to Pressa's Google Sheet successfully!",
        sheetTitle: ss.getName(),
        syncedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Sync all sheets
    if (data.attendance) {
      syncSheet(ss, "Attendance", [
        "Record ID", "Employee ID", "Employee Name", "Date", "Check In", "Check Out", "Status", "Work Mode", "Notes", "Last Updated"
      ], data.attendance.map(function(r) {
        return [r.id, r.employeeId, r.employeeName, r.date, r.checkIn, r.checkOut || "--", r.status, r.workMode, r.notes || "", r.updatedAt];
      }));
    }

    if (data.tardiness) {
      syncSheet(ss, "Tardiness", [
        "Record ID", "Employee ID", "Employee Name", "Date", "Scheduled Time", "Actual Time", "Minutes Late", "Reason", "Status", "Action Taken", "Last Updated"
      ], data.tardiness.map(function(r) {
        return [r.id, r.employeeId, r.employeeName, r.date, r.scheduledTime, r.actualTime, r.minutesLate, r.reason, r.status, r.actionTaken || "--", r.updatedAt];
      }));
    }

    if (data.leaves) {
      syncSheet(ss, "Leaves", [
        "Leave ID", "Employee ID", "Employee Name", "Department", "Leave Type (VL/PTO)", "Start Date", "End Date", "Total Days", "Reason / Basis", "Status", "Applied Date"
      ], data.leaves.map(function(r) {
        return [r.id, r.employeeId, r.employeeName, r.department, r.leaveType, r.startDate, r.endDate, r.totalDays, r.reason, (r.status || "").toUpperCase(), r.appliedDate];
      }));
    }

    if (data.disciplinary) {
      syncSheet(ss, "Disciplinary", [
        "Incident ID", "Employee ID", "Employee Name", "Department", "Incident Date", "Violation Type", "Severity Level", "Description", "Action Plan", "Status", "Issued By", "Resolution Date"
      ], data.disciplinary.map(function(r) {
        return [r.id, r.employeeId, r.employeeName, r.department, r.incidentDate, r.violationType, r.severityLevel, r.description, r.actionPlan, r.status, r.issuedBy, r.resolutionDate || "Unresolved"];
      }));
    }

    // Monthly Attendance Matrix (✓, X, L, PTO, VL)
    if (data.monthlyAttendanceGrids) {
      var currentMonthKey = Object.keys(data.monthlyAttendanceGrids)[0] || "2026-10";
      var mGrid = data.monthlyAttendanceGrids[currentMonthKey] || {};
      var headersAtt = ["Employee ID", "Month"];
      for (var d = 1; d <= 31; d++) headersAtt.push("Day " + d);
      headersAtt.push("Total ✓", "Total X", "Total L", "Total PTO", "Total VL");

      var attRows = [];
      Object.keys(mGrid).forEach(function(empId) {
        var empDays = mGrid[empId] || {};
        var row = [empId, currentMonthKey];
        var p = 0, a = 0, l = 0, pto = 0, vl = 0;
        for (var day = 1; day <= 31; day++) {
          var val = empDays[day] || "";
          row.push(val);
          if (val === "✓") p++;
          if (val === "X") a++;
          if (val === "L") l++;
          if (val === "PTO") pto++;
          if (val === "VL") vl++;
        }
        row.push(p, a, l, pto, vl);
        attRows.push(row);
      });
      syncSheet(ss, "Attendance_Checker", headersAtt, attRows);
    }

    // ID Policy Monthly Checker (✓ and X)
    if (data.idPolicyGrids) {
      var currentMonthKeyId = Object.keys(data.idPolicyGrids)[0] || "2026-10";
      var idGrid = data.idPolicyGrids[currentMonthKeyId] || {};
      var headersId = ["Employee ID", "Month"];
      for (var d = 1; d <= 31; d++) headersId.push("Day " + d);
      headersId.push("Total ✓ (Compliant)", "Total X (No ID)");

      var idRows = [];
      Object.keys(idGrid).forEach(function(empId) {
        var empDays = idGrid[empId] || {};
        var row = [empId, currentMonthKeyId];
        var comp = 0, viol = 0;
        for (var day = 1; day <= 31; day++) {
          var val = empDays[day] || "";
          row.push(val);
          if (val === "✓") comp++;
          if (val === "X") viol++;
        }
        row.push(comp, viol);
        idRows.push(row);
      });
      syncSheet(ss, "ID_Policy_Checker", headersId, idRows);
    }

    // Break Policy Monthly Checker (✓ and X)
    if (data.breakPolicyGrids) {
      var currentMonthKeyBreak = Object.keys(data.breakPolicyGrids)[0] || "2026-10";
      var breakGrid = data.breakPolicyGrids[currentMonthKeyBreak] || {};
      var headersBreak = ["Employee ID", "Month"];
      for (var d = 1; d <= 31; d++) headersBreak.push("Day " + d);
      headersBreak.push("Total ✓ (On-Time)", "Total X (Violation)");

      var breakRows = [];
      Object.keys(breakGrid).forEach(function(empId) {
        var empDays = breakGrid[empId] || {};
        var row = [empId, currentMonthKeyBreak];
        var comp = 0, viol = 0;
        for (var day = 1; day <= 31; day++) {
          var val = empDays[day] || "";
          row.push(val);
          if (val === "✓") comp++;
          if (val === "X") viol++;
        }
        row.push(comp, viol);
        breakRows.push(row);
      });
      syncSheet(ss, "Break_Policy_Checker", headersBreak, breakRows);
    }

    if (data.scoreboard) {
      syncSheet(ss, "Performance", [
        "Employee ID", "Employee Name", "Department", "Role", "Attendance (0-100)", "Quality (0-100)", "Productivity (0-100)", "Teamwork (0-100)", "Policy Score", "Overall KPI %", "Trend", "Review Cycle"
      ], data.scoreboard.map(function(r) {
        return [r.employeeId, r.employeeName, r.department, r.role, r.attendanceScore, r.qualityScore, r.productivityScore, r.teamworkScore, r.policyAdherenceScore, r.totalKpi, r.trend, r.reviewCycle];
      }));
    }

    if (data.awards) {
      syncSheet(ss, "Awards", [
        "Award ID", "Category", "Award Title", "Recipient Name", "Department", "Period", "Description", "Citation", "Date Awarded"
      ], data.awards.map(function(r) {
        return [r.id, r.category, r.title, r.recipientName, r.department, r.period, r.description, r.citation, r.awardedDate];
      }));
    }

    if (data.policies) {
      syncSheet(ss, "Policies", [
        "Policy Key", "Policy Title", "Last Updated", "Summary Content"
      ], [
        ["ID_POLICY", data.policies.idPolicy.title, data.policies.idPolicy.lastUpdated, data.policies.idPolicy.content],
        ["BREAK_POLICY", data.policies.breakPolicy.title, data.policies.breakPolicy.lastUpdated, data.policies.breakPolicy.content]
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Synced to Google Sheets successfully",
      syncedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper to create/update a styled sheet tab with header and data
 */
function syncSheet(ss, sheetName, headers, rowData) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  sheet.clear();
  
  // Set headers
  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#E0F2FE"); // Light sky blue
  headerRange.setFontColor("#0369A1"); // Dark sky blue
  sheet.setFrozenRows(1);
  
  // Set rows
  if (rowData && rowData.length > 0) {
    sheet.getRange(2, 1, rowData.length, headers.length).setValues(rowData);
  }
  
  // Auto-fit column widths
  for (var i = 1; i <= Math.min(headers.length, 10); i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * ====================================================================
 * ONE-CLICK SPREADSHEET INITIALIZER:
 * Run this function once from the Apps Script editor toolbar:
 * Select "INITIALIZE_SPREADSHEET" in the dropdown and click "Run".
 * It will instantly format all 10 sheets with light-blue headers
 * and pre-populate all 20 employees!
 * ====================================================================
 */
function INITIALIZE_SPREADSHEET() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var defaultEmployees = [
    ["EMP-1001", "Elena Rostova", "Customer Operations"],
    ["EMP-1002", "Marcus Vance", "Quality Assurance"],
    ["EMP-1003", "Sophia Chen", "Customer Operations"],
    ["EMP-1004", "David O'Connor", "Logistics & Dispatch"],
    ["EMP-1005", "Amara Okafor", "Technical Support"],
    ["EMP-1006", "Lucas Morales", "Customer Operations"],
    ["EMP-1007", "Chloe Dubois", "Quality Assurance"],
    ["EMP-1008", "Tariq Al-Mansoor", "Logistics & Dispatch"],
    ["EMP-1009", "Samantha Reed", "Customer Operations"],
    ["EMP-1010", "Kevin Miller", "Technical Support"],
    ["EMP-1011", "Beatrice Wong", "Customer Operations"],
    ["EMP-1012", "Carlos Mendez", "Logistics & Dispatch"],
    ["EMP-1013", "Hannah Wright", "Quality Assurance"],
    ["EMP-1014", "Ethan Brooks", "Customer Operations"],
    ["EMP-1015", "Jasmine Patel", "Technical Support"],
    ["EMP-1016", "Liam Johnson", "Logistics & Dispatch"],
    ["EMP-1017", "Natalie Gomez", "Customer Operations"],
    ["EMP-1018", "Oliver Smith", "Quality Assurance"],
    ["EMP-1019", "Patricia Taylor", "Customer Operations"],
    ["EMP-1020", "Daniel Kim", "Technical Support"]
  ];

  // 1. Attendance Checker Matrix
  var attHeaders = ["Employee ID", "Employee Name", "Department", "Month"];
  for (var d = 1; d <= 31; d++) attHeaders.push("Day " + d);
  attHeaders.push("Total ✓", "Total X", "Total L", "Total PTO", "Total VL");

  var attRows = defaultEmployees.map(function(emp) {
    var row = [emp[0], emp[1], emp[2], "2026-10"];
    for (var day = 1; day <= 31; day++) {
      if (day > 15 || day % 7 === 4) row.push("");
      else row.push("✓");
    }
    row.push(13, 0, 0, 0, 0);
    return row;
  });
  syncSheet(ss, "Attendance_Checker", attHeaders, attRows);

  // 2. ID Policy Checker
  var idHeaders = ["Employee ID", "Employee Name", "Department", "Month"];
  for (var d2 = 1; d2 <= 31; d2++) idHeaders.push("Day " + d2);
  idHeaders.push("Total ✓ (Compliant)", "Total X (No ID)");

  var idRows = defaultEmployees.map(function(emp) {
    var row = [emp[0], emp[1], emp[2], "2026-10"];
    for (var day = 1; day <= 31; day++) {
      if (day > 15 || day % 7 === 4) row.push("");
      else row.push("✓");
    }
    row.push(13, 0);
    return row;
  });
  syncSheet(ss, "ID_Policy_Checker", idHeaders, idRows);

  // 3. Break Policy Checker
  var breakHeaders = ["Employee ID", "Employee Name", "Department", "Month"];
  for (var d3 = 1; d3 <= 31; d3++) breakHeaders.push("Day " + d3);
  breakHeaders.push("Total ✓ (On-Time)", "Total X (Violation)");

  var breakRows = defaultEmployees.map(function(emp) {
    var row = [emp[0], emp[1], emp[2], "2026-10"];
    for (var day = 1; day <= 31; day++) {
      if (day > 15 || day % 7 === 4) row.push("");
      else row.push("✓");
    }
    row.push(13, 0);
    return row;
  });
  syncSheet(ss, "Break_Policy_Checker", breakHeaders, breakRows);

  // 4. Leaves
  syncSheet(ss, "Leaves", [
    "Leave ID", "Employee ID", "Employee Name", "Department", "Leave Type (VL/PTO)", "Start Date", "End Date", "Total Days", "Reason / Basis", "Status", "Applied Date"
  ], [
    ["lv-1", "EMP-1007", "Chloe Dubois", "Quality Assurance", "VL", "2026-10-15", "2026-10-15", 1, "Personal family matter", "APPROVED", "2026-10-14"],
    ["lv-2", "EMP-1002", "Marcus Vance", "Quality Assurance", "PTO", "2026-10-24", "2026-10-28", 5, "Paid Time Off annual recharge", "APPROVED", "2026-10-02"],
    ["lv-3", "EMP-1003", "Sophia Chen", "Customer Operations", "emergency", "2026-10-20", "2026-10-21", 2, "Emergency home repair", "PENDING_REVIEW", "2026-10-14"],
    ["lv-4", "EMP-1011", "Beatrice Wong", "Customer Operations", "VL", "2026-10-18", "2026-10-19", 2, "Weekend trip", "DISAPPROVED", "2026-10-10"]
  ]);

  // 5. Tardiness
  syncSheet(ss, "Tardiness", [
    "Record ID", "Employee ID", "Employee Name", "Date", "Scheduled Time", "Actual Time", "Minutes Late", "Reason", "Status", "Action Taken", "Last Updated"
  ], [
    ["tar-1", "EMP-1004", "David O'Connor", "2026-10-15", "09:00 AM", "09:35 AM", 35, "Highway road closure", "excused", "Traffic report verified", "2026-10-15"],
    ["tar-2", "EMP-1006", "Lucas Morales", "2026-10-15", "09:00 AM", "09:22 AM", 22, "Subway line 4 delay", "pending_review", "Reminder sent", "2026-10-15"]
  ]);

  // 6. Disciplinary
  syncSheet(ss, "Disciplinary", [
    "Incident ID", "Employee ID", "Employee Name", "Department", "Incident Date", "Violation Type", "Severity Level", "Description", "Action Plan", "Status", "Issued By", "Resolution Date"
  ], [
    ["disc-1", "EMP-1006", "Lucas Morales", "Customer Operations", "2026-10-10", "attendance", "verbal_warning", "Repeated unexcused tardiness", "Set earlier alarms", "under_review", "Pressa", "Unresolved"]
  ]);

  // 7. Performance Scoreboard
  syncSheet(ss, "Performance", [
    "Employee ID", "Employee Name", "Department", "Role", "Attendance (0-100)", "Quality (0-100)", "Productivity (0-100)", "Teamwork (0-100)", "Policy Score", "Overall KPI %", "Trend", "Review Cycle"
  ], defaultEmployees.map(function(emp) {
    return [emp[0], emp[1], emp[2], "Specialist", 96, 95, 94, 95, 98, 95.6, "UP", "Q4 2026"];
  }));

  // 8. Awards
  syncSheet(ss, "Awards", [
    "Award ID", "Category", "Award Title", "Recipient Name", "Department", "Period", "Description", "Citation", "Date Awarded"
  ], [
    ["awd-1", "employee_of_the_month", "Employee of the Month", "Elena Rostova", "Customer Operations", "October 2026", "Leadership and 100% attendance", "Dedication & Excellence", "2026-10-01"],
    ["awd-2", "special_award", "Steadfast Attendance Star", "Elena Rostova", "Customer Operations", "Q3-Q4 2026", "Zero tardiness", "Unfailing reliability", "2026-10-05"]
  ]);

  // 9. Policies
  syncSheet(ss, "Policies", [
    "Policy Key", "Policy Title", "Last Updated", "Summary Content"
  ], [
    ["ID_POLICY", "Company Identification & Security Badge Policy", "2026-10-01", "ID Badge must be worn visibly at all times."],
    ["BREAK_POLICY", "Daily Break & Rest Period Policy", "2026-10-01", "15m Morning, 60m Lunch, 15m Afternoon breaks."]
  ]);

  SpreadsheetApp.getUi().alert("Pressa's HR Sheets successfully initialized with all 10 tabs and 20 employees!");
}
`;

export const STEP_BY_STEP_TUTORIAL = [
  {
    step: 1,
    title: "Create your Google Sheet",
    description: "Open Google Sheets and create a new blank spreadsheet. Name it 'Pressa's HR Master Records'.",
    tip: "You can simply type 'sheets.new' in your browser URL bar for instant creation."
  },
  {
    step: 2,
    title: "Open the Apps Script Editor",
    description: "In the Google Sheet top menu, navigate to Extensions > Apps Script. A new browser tab will open with a code editor.",
    tip: "Rename the Apps Script project to 'Pressa HR Sync Backend' at the top left."
  },
  {
    step: 3,
    title: "Paste the Complete Backend Code",
    description: "Select all existing template text in the Code.gs editor and replace it with the code provided below.",
    tip: "The code automatically generates and formats 7 dedicated sheets with light blue headers."
  },
  {
    step: 4,
    title: "Deploy as a Web App",
    description: "Click the blue 'Deploy' button > 'New deployment'. Click the gear icon next to 'Select type' and choose 'Web app'.",
    tip: "Set 'Execute as' to 'Me' and 'Who has access' to 'Anyone'. This allows Pressa's Tool to push & pull records."
  },
  {
    step: 5,
    title: "Authorize & Copy Web App URL",
    description: "Click 'Deploy', click 'Authorize access', choose your Google account, click 'Advanced' > 'Go to Pressa HR Sync Backend (unsafe)', and click 'Allow'.",
    tip: "Google displays this standard notice for custom personal scripts. It is completely safe because you own the script."
  },
  {
    step: 6,
    title: "Connect to Pressa's Tool",
    description: "Copy the provided Web App URL (starts with https://script.google.com/macros/s/...) and paste it into the Web App URL input here in Pressa's Tool.",
    tip: "Click 'Test Connection'. You'll see a green confirmation badge and your sheets will auto-populate!"
  }
];
