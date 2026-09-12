import { GOOGLE_CLIENT_ID, GOOGLE_SHEETS_SCOPES } from '../config';
import { EmployeeCutoffPayroll, MonthlyEmployeeSalaryReport, DtrRecord, Employee } from '../types';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: any }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

export function getStoredGoogleToken(): string | null {
  if (cachedAccessToken && Date.now() < tokenExpiryTime) {
    return cachedAccessToken;
  }
  const token = sessionStorage.getItem('google_sheets_token');
  const expiry = sessionStorage.getItem('google_sheets_token_expiry');
  if (token && expiry && Date.now() < parseInt(expiry, 10)) {
    cachedAccessToken = token;
    tokenExpiryTime = parseInt(expiry, 10);
    return token;
  }
  return null;
}

export function saveGoogleToken(token: string, expiresInSecs: number = 3500) {
  cachedAccessToken = token;
  tokenExpiryTime = Date.now() + expiresInSecs * 1000;
  sessionStorage.setItem('google_sheets_token', token);
  sessionStorage.setItem('google_sheets_token_expiry', tokenExpiryTime.toString());
}

export function clearGoogleToken() {
  cachedAccessToken = null;
  tokenExpiryTime = 0;
  sessionStorage.removeItem('google_sheets_token');
  sessionStorage.removeItem('google_sheets_token_expiry');
}

/**
 * Requests OAuth access token via Google Identity Services
 */
export async function authenticateWithGoogle(): Promise<string> {
  const existingToken = getStoredGoogleToken();
  if (existingToken) {
    return existingToken;
  }

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(
        new Error(
          'Google Identity Services client is not loaded yet. Please verify your connection or reload the page.'
        )
      );
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SHEETS_SCOPES.join(' '),
        callback: (response) => {
          if (response.error) {
            reject(new Error(`Google Authentication error: ${response.error}`));
            return;
          }
          if (response.access_token) {
            saveGoogleToken(response.access_token);
            resolve(response.access_token);
          } else {
            reject(new Error('No access token received from Google Identity.'));
          }
        },
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(err);
    }
  });
}

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Creates and formats a complete Philippine Payroll & DTR Spreadsheet in Google Sheets
 */
export async function exportPayrollToGoogleSheets(
  monthLabel: string,
  monthlyReports: MonthlyEmployeeSalaryReport[],
  cutoff1Payrolls: EmployeeCutoffPayroll[],
  cutoff2Payrolls: EmployeeCutoffPayroll[],
  dtrRecords: DtrRecord[],
  employees: Employee[]
): Promise<ExportResult> {
  const token = await authenticateWithGoogle();

  const title = `Philippine Payroll & DTR Report - ${monthLabel}`;

  // 1. Create Spreadsheet with custom sheets
  const createResp = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Monthly Salary Report', gridProperties: { frozenRowCount: 4 } } },
        { properties: { title: '1st Cutoff (1-15)', gridProperties: { frozenRowCount: 4 } } },
        { properties: { title: '2nd Cutoff (16-End)', gridProperties: { frozenRowCount: 4 } } },
        { properties: { title: 'Daily Time Records (DTR)', gridProperties: { frozenRowCount: 3 } } },
      ],
    }),
  });

  if (!createResp.ok) {
    const errorText = await createResp.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errorText}`);
  }

  const spreadsheetData = await createResp.json();
  const spreadsheetId = spreadsheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Data for Sheet 1: Monthly Salary Report
  const monthlyRows: any[][] = [
    [`REPUBLIC OF THE PHILIPPINES - MONTHLY CONSOLIDATED PAYROLL REPORT`],
    [`Period: ${monthLabel}`, `Generated: ${new Date().toLocaleString('en-PH')}`],
    [],
    [
      'Employee Code',
      'Employee Name',
      'Position',
      'Department',
      'Monthly Basic (PHP)',
      '1st Cutoff Gross (PHP)',
      '2nd Cutoff Gross (PHP)',
      'Total Monthly Gross (PHP)',
      'SSS (EE Share)',
      'SSS (ER Share)',
      'PhilHealth (EE Share)',
      'PhilHealth (ER Share)',
      'Pag-IBIG (EE Share)',
      'Pag-IBIG (ER Share)',
      'Total Statutory EE',
      'BIR TRAIN Tax Withheld',
      'Total Monthly Deductions',
      'Monthly Net Pay (PHP)',
      'Total Employer Cost (PHP)',
    ],
  ];

  let sumBasic = 0;
  let sumGross = 0;
  let sumSssEE = 0;
  let sumSssER = 0;
  let sumPhEE = 0;
  let sumPhER = 0;
  let sumHdmfEE = 0;
  let sumHdmfER = 0;
  let sumTax = 0;
  let sumDed = 0;
  let sumNet = 0;
  let sumErCost = 0;

  monthlyReports.forEach((r) => {
    sumBasic += r.monthlyBasic;
    sumGross += r.totalGrossPay;
    sumSssEE += r.monthlySSS_EE;
    sumSssER += r.monthlySSS_ER;
    sumPhEE += r.monthlyPhilHealth_EE;
    sumPhER += r.monthlyPhilHealth_ER;
    sumHdmfEE += r.monthlyPagIbig_EE;
    sumHdmfER += r.monthlyPagIbig_ER;
    sumTax += r.monthlyWithholdingTax;
    sumDed += r.totalMonthlyDeductions;
    sumNet += r.totalMonthlyNetPay;
    sumErCost += r.totalEmployerCost;

    monthlyRows.push([
      r.employeeCode,
      r.employeeName,
      r.position,
      r.department,
      r.monthlyBasic,
      r.cutoff1Gross,
      r.cutoff2Gross,
      r.totalGrossPay,
      r.monthlySSS_EE,
      r.monthlySSS_ER,
      r.monthlyPhilHealth_EE,
      r.monthlyPhilHealth_ER,
      r.monthlyPagIbig_EE,
      r.monthlyPagIbig_ER,
      r.totalMonthlyStatutory_EE,
      r.monthlyWithholdingTax,
      r.totalMonthlyDeductions,
      r.totalMonthlyNetPay,
      r.totalEmployerCost,
    ]);
  });

  // Grand Total Row
  monthlyRows.push([
    'TOTALS',
    `${monthlyReports.length} Employees`,
    '',
    '',
    sumBasic,
    '',
    '',
    sumGross,
    sumSssEE,
    sumSssER,
    sumPhEE,
    sumPhER,
    sumHdmfEE,
    sumHdmfER,
    sumSssEE + sumPhEE + sumHdmfEE,
    sumTax,
    sumDed,
    sumNet,
    sumErCost,
  ]);

  // 3. Prepare Data for Cutoff 1 & 2
  const buildCutoffRows = (cutoffName: string, items: EmployeeCutoffPayroll[]) => {
    const rows: any[][] = [
      [`SEMI-MONTHLY PAYROLL REGISTER - ${cutoffName.toUpperCase()}`],
      [`Period: ${monthLabel}`, `Generated: ${new Date().toLocaleString('en-PH')}`],
      [],
      [
        'Code',
        'Employee Name',
        'Position',
        'Department',
        'Cutoff Basic (PHP)',
        'Present Days',
        'Late Mins',
        'Late Ded (PHP)',
        'Undertime Mins',
        'Undertime Ded (PHP)',
        'OT Hours',
        'OT Pay (PHP)',
        'Gross Pay (PHP)',
        'SSS (EE)',
        'PhilHealth (EE)',
        'Pag-IBIG (EE)',
        'Total Statutory (EE)',
        'BIR Withholding Tax (PHP)',
        'Total Deductions (PHP)',
        'Net Pay (Take-Home PHP)',
        'Total Employer Cost (PHP)',
      ],
    ];

    items.forEach((c) => {
      rows.push([
        c.employeeCode,
        c.employeeName,
        c.position,
        c.department,
        c.cutoffBasic,
        c.daysPresent,
        c.totalLateMinutes,
        c.lateDeduction,
        c.totalUndertimeMinutes,
        c.undertimeDeduction,
        c.totalOvertimeHours,
        c.overtimePay,
        c.grossPay,
        c.sss.employeeShare,
        c.philHealth.employeeShare,
        c.pagIbig.employeeShare,
        c.totalStatutoryEmployee,
        c.withholdingTax,
        c.totalDeductions,
        c.netPay,
        c.totalEmployerCost,
      ]);
    });
    return rows;
  };

  const cutoff1Rows = buildCutoffRows('1st Cutoff (1st to 15th)', cutoff1Payrolls);
  const cutoff2Rows = buildCutoffRows('2nd Cutoff (16th to End)', cutoff2Payrolls);

  // 4. Prepare Data for DTR Attendance Logs
  const empMap = new Map(employees.map((e) => [e.id, e]));
  const dtrRows: any[][] = [
    [`DAILY TIME RECORD (DTR) LOGS - ${monthLabel.toUpperCase()}`],
    [`Generated: ${new Date().toLocaleString('en-PH')}`],
    [
      'Date',
      'Day',
      'Employee Code',
      'Employee Name',
      'Shift Type',
      'Time IN',
      'Time OUT',
      'Hours Worked',
      'Late (Mins)',
      'Undertime (Mins)',
      'Overtime (Hrs)',
      'Status',
    ],
  ];

  dtrRecords.forEach((d) => {
    const emp = empMap.get(d.employeeId);
    let status = 'Regular';
    if (d.dayType === 'rest_day') status = 'Rest Day';
    else if (d.isAbsent || (!d.timeIn && !d.timeOut)) status = 'Absent';
    else if (d.lateMinutes > 0 && d.overtimeHours > 0) status = 'Late + OT';
    else if (d.lateMinutes > 0) status = 'Tardy/Late';
    else if (d.overtimeHours > 0) status = 'Overtime';
    else if (d.undertimeMinutes > 0) status = 'Undertime';
    else if (d.timeIn) status = 'On-Time Present';

    dtrRows.push([
      d.date,
      d.dayOfWeek,
      emp?.employeeCode ?? '',
      emp?.name ?? 'Unknown',
      d.dayType,
      d.timeIn ?? '--:--',
      d.timeOut ?? '--:--',
      d.hoursWorked,
      d.lateMinutes,
      d.undertimeMinutes,
      d.overtimeHours,
      status,
    ]);
  });

  // 5. Batch Update values to all sheets
  const updateResp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: `'Monthly Salary Report'!A1`, values: monthlyRows },
          { range: `'1st Cutoff (1-15)'!A1`, values: cutoff1Rows },
          { range: `'2nd Cutoff (16-End)'!A1`, values: cutoff2Rows },
          { range: `'Daily Time Records (DTR)'!A1`, values: dtrRows },
        ],
      }),
    }
  );

  if (!updateResp.ok) {
    const errText = await updateResp.text();
    console.error('Failed to populate Google Sheets data:', errText);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

/**
 * Generates and downloads a CSV export as quick alternative
 */
export function downloadPayrollCSV(
  filename: string,
  monthlyReports: MonthlyEmployeeSalaryReport[]
) {
  const headers = [
    'Employee Code',
    'Employee Name',
    'Position',
    'Department',
    'Monthly Basic',
    '1st Cutoff Gross',
    '2nd Cutoff Gross',
    'Total Monthly Gross',
    'SSS EE',
    'SSS ER',
    'PhilHealth EE',
    'PhilHealth ER',
    'Pag-IBIG EE',
    'Pag-IBIG ER',
    'Total Statutory EE',
    'BIR TRAIN Tax Withheld',
    'Total Monthly Deductions',
    'Monthly Net Pay',
    'Total Employer Cost',
  ];

  const rows = monthlyReports.map((r) => [
    `"${r.employeeCode}"`,
    `"${r.employeeName}"`,
    `"${r.position}"`,
    `"${r.department}"`,
    r.monthlyBasic,
    r.cutoff1Gross,
    r.cutoff2Gross,
    r.totalGrossPay,
    r.monthlySSS_EE,
    r.monthlySSS_ER,
    r.monthlyPhilHealth_EE,
    r.monthlyPhilHealth_ER,
    r.monthlyPagIbig_EE,
    r.monthlyPagIbig_ER,
    r.totalMonthlyStatutory_EE,
    r.monthlyWithholdingTax,
    r.totalMonthlyDeductions,
    r.totalMonthlyNetPay,
    r.totalEmployerCost,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
