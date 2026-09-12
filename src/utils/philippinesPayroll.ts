import { CutoffPeriod, DtrRecord, Employee, EmployeeCutoffPayroll, StatutoryDeduction } from '../types';
import { PH_LABOR_STANDARDS } from '../config';

/**
 * Calculates SSS Monthly Contribution based on 2024/2025 SSS Contribution Table
 * Regular rate: 14% (EE: 4.5%, ER: 9.5%)
 * Minimum MSC: ₱4,000, Maximum MSC: ₱30,000 (₱20,000 Regular + ₱10,000 WISP)
 */
export function calculateMonthlySSS(monthlyBasic: number): StatutoryDeduction {
  // Determine Monthly Salary Credit (MSC)
  let msc = 4000;
  if (monthlyBasic <= 4249.99) {
    msc = 4000;
  } else if (monthlyBasic >= 29750) {
    msc = 30000;
  } else {
    // Brackets step by 500
    // 4,250 - 4,749.99 -> 4,500, etc.
    const steps = Math.floor((monthlyBasic - 4250) / 500) + 1;
    msc = 4000 + steps * 500;
    if (msc > 30000) msc = 30000;
  }

  // Regular MSC is capped at ₱20,000
  const regularMsc = Math.min(msc, 20000);
  const wispMsc = Math.max(0, msc - 20000);

  // Regular shares (EE: 4.5%, ER: 9.5%)
  const regularEE = regularMsc * 0.045;
  const regularER = regularMsc * 0.095;

  // WISP shares (EE: 4.5%, ER: 9.5%)
  const wispEE = wispMsc * 0.045;
  const wispER = wispMsc * 0.095;

  // EC (Employees' Compensation) fund paid by employer
  // MSC <= 14,500: ₱10; MSC > 14,500: ₱30
  const ec = regularMsc > 14500 ? 30 : 10;

  const totalEE = regularEE + wispEE;
  const totalER = regularER + wispER + ec;

  return {
    employeeShare: Math.round(totalEE * 100) / 100,
    employerShare: Math.round(totalER * 100) / 100,
    total: Math.round((totalEE + totalER) * 100) / 100,
    msc,
    ec,
    wispEmployee: Math.round(wispEE * 100) / 100,
    wispEmployer: Math.round(wispER * 100) / 100,
  };
}

/**
 * Calculates PhilHealth Monthly Contribution (2024/2025 5.0% Premium Rate)
 * Floor: ₱10,000 (Premium ₱500; EE: ₱250, ER: ₱250)
 * Ceiling: ₱100,000 (Premium ₱5,000; EE: ₱2,500, ER: ₱2,500)
 */
export function calculateMonthlyPhilHealth(monthlyBasic: number): StatutoryDeduction {
  const floor = 10000;
  const ceiling = 100000;
  const rate = 0.05; // 5% total

  let base = monthlyBasic;
  if (base < floor) base = floor;
  if (base > ceiling) base = ceiling;

  const totalPremium = base * rate;
  const employeeShare = totalPremium / 2;
  const employerShare = totalPremium / 2;

  return {
    employeeShare: Math.round(employeeShare * 100) / 100,
    employerShare: Math.round(employerShare * 100) / 100,
    total: Math.round(totalPremium * 100) / 100,
  };
}

/**
 * Calculates Pag-IBIG (HDMF) Monthly Contribution
 * Updated 2024 rule: Maximum monthly compensation cap increased to ₱10,000
 * Employee share: 2% up to max ₱200/month
 * Employer share: 2% up to max ₱200/month
 */
export function calculateMonthlyPagIbig(monthlyBasic: number): StatutoryDeduction {
  const cap = 10000;
  const base = Math.min(monthlyBasic, cap);

  // For monthly basic > ₱1,500, EE rate is 2%
  const eeRate = monthlyBasic > 1500 ? 0.02 : 0.01;
  const erRate = 0.02;

  const eeShare = Math.min(base * eeRate, 200);
  const erShare = Math.min(base * erRate, 200);

  return {
    employeeShare: Math.round(eeShare * 100) / 100,
    employerShare: Math.round(erShare * 100) / 100,
    total: Math.round((eeShare + erShare) * 100) / 100,
  };
}

/**
 * Semi-Monthly BIR Withholding Tax Table (TRAIN Law - RA 10963)
 * Taxable income = Gross Semi-monthly compensation - statutory EE shares
 */
export function calculateSemiMonthlyWithholdingTax(taxableIncome: number): number {
  if (taxableIncome <= 10417) {
    return 0; // Tax Exempt (₱250k annual exemption equivalent)
  } else if (taxableIncome <= 16666) {
    return Math.round((taxableIncome - 10417) * 0.15 * 100) / 100;
  } else if (taxableIncome <= 33332) {
    return Math.round((937.5 + (taxableIncome - 16667) * 0.20) * 100) / 100;
  } else if (taxableIncome <= 83332) {
    return Math.round((4270.7 + (taxableIncome - 33333) * 0.25) * 100) / 100;
  } else if (taxableIncome <= 333332) {
    return Math.round((16770.7 + (taxableIncome - 83333) * 0.30) * 100) / 100;
  } else {
    return Math.round((91770.7 + (taxableIncome - 333332) * 0.35) * 100) / 100;
  }
}

/**
 * Monthly BIR Withholding Tax Table (TRAIN Law)
 */
export function calculateMonthlyWithholdingTax(monthlyTaxableIncome: number): number {
  if (monthlyTaxableIncome <= 20833) {
    return 0;
  } else if (monthlyTaxableIncome <= 33333) {
    return Math.round((monthlyTaxableIncome - 20833) * 0.15 * 100) / 100;
  } else if (monthlyTaxableIncome <= 66667) {
    return Math.round((1875 + (monthlyTaxableIncome - 33333) * 0.20) * 100) / 100;
  } else if (monthlyTaxableIncome <= 166667) {
    return Math.round((8541.67 + (monthlyTaxableIncome - 66667) * 0.25) * 100) / 100;
  } else if (monthlyTaxableIncome <= 666667) {
    return Math.round((33541.67 + (monthlyTaxableIncome - 166667) * 0.30) * 100) / 100;
  } else {
    return Math.round((183541.67 + (monthlyTaxableIncome - 666667) * 0.35) * 100) / 100;
  }
}

/**
 * Parses time string "HH:mm" into total minutes from 00:00
 */
export function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

/**
 * Formats minutes from 00:00 to "HH:mm"
 */
export function minutesToTime(totalMins: number): string {
  const hours = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculates worked hours, late minutes, undertime, and overtime from IN and OUT strings
 */
export function computeDtrRowMetrics(
  timeIn: string | null,
  timeOut: string | null,
  dayType: DtrRecord['dayType'] = 'regular',
  standardInStr: string = '08:00',
  standardOutStr: string = '17:00'
): {
  hoursWorked: number;
  lateMinutes: number;
  undertimeMinutes: number;
  overtimeHours: number;
  isAbsent: boolean;
} {
  if (!timeIn || !timeOut) {
    const isAbsent = dayType === 'regular';
    return {
      hoursWorked: 0,
      lateMinutes: 0,
      undertimeMinutes: 0,
      overtimeHours: 0,
      isAbsent,
    };
  }

  const inMins = timeToMinutes(timeIn);
  const outMins = timeToMinutes(timeOut);
  const stdInMins = timeToMinutes(standardInStr) ?? 8 * 60; // 08:00 = 480
  const stdOutMins = timeToMinutes(standardOutStr) ?? 17 * 60; // 17:00 = 1020

  if (inMins === null || outMins === null || outMins <= inMins) {
    return {
      hoursWorked: 0,
      lateMinutes: 0,
      undertimeMinutes: 0,
      overtimeHours: 0,
      isAbsent: false,
    };
  }

  // Late calculation: arrival after standard shift IN (08:00)
  let lateMinutes = 0;
  if (dayType === 'regular' && inMins > stdInMins) {
    lateMinutes = inMins - stdInMins;
  }

  // Undertime calculation: departure before standard shift OUT (17:00)
  let undertimeMinutes = 0;
  if (dayType === 'regular' && outMins < stdOutMins) {
    undertimeMinutes = stdOutMins - outMins;
  }

  // Elapsed gross minutes
  const elapsedMinutes = outMins - inMins;
  // 1 hour unpaid meal break if elapsed time > 5 hours
  const lunchBreakMinutes = elapsedMinutes >= 300 ? 60 : 0;
  const netWorkedMinutes = Math.max(0, elapsedMinutes - lunchBreakMinutes);
  const hoursWorked = Math.round((netWorkedMinutes / 60) * 100) / 100;

  // Overtime: hours worked in excess of 8 regular hours
  let overtimeHours = 0;
  if (hoursWorked > 8) {
    overtimeHours = Math.round((hoursWorked - 8) * 100) / 100;
  }

  return {
    hoursWorked,
    lateMinutes,
    undertimeMinutes,
    overtimeHours,
    isAbsent: false,
  };
}

/**
 * Calculates complete semi-monthly payroll breakdown for an employee based on their DTR logs
 */
export function calculateEmployeeCutoffPayroll(
  employee: Employee,
  dtrRecords: DtrRecord[],
  cutoffPeriod: CutoffPeriod
): EmployeeCutoffPayroll {
  const cutoffBasic = Math.round((employee.monthlyBasicSalary / 2) * 100) / 100;

  // DTR aggregations
  let daysPresent = 0;
  let daysAbsent = 0;
  let totalLateMinutes = 0;
  let totalUndertimeMinutes = 0;
  let totalOvertimeHours = 0;
  let holidayPremiumHours = 0;

  dtrRecords.forEach((rec) => {
    if (rec.dayType === 'regular') {
      if (rec.isAbsent || (!rec.timeIn && !rec.timeOut)) {
        daysAbsent += 1;
      } else if (rec.hoursWorked > 0) {
        daysPresent += 1;
        totalLateMinutes += rec.lateMinutes;
        totalUndertimeMinutes += rec.undertimeMinutes;
        totalOvertimeHours += rec.overtimeHours;
      }
    } else if (rec.hoursWorked > 0) {
      daysPresent += 1;
      totalOvertimeHours += rec.overtimeHours;
      if (rec.dayType === 'regular_holiday') {
        holidayPremiumHours += rec.hoursWorked;
      }
    }
  });

  // Financial deductions and premiums
  // Late & Undertime deductions: minuteRate = hourlyRate / 60
  const lateDeduction = Math.round(totalLateMinutes * employee.minuteRate * 100) / 100;
  const undertimeDeduction = Math.round(totalUndertimeMinutes * employee.minuteRate * 100) / 100;
  const absentDeduction = Math.round(daysAbsent * employee.dailyRate * 100) / 100;

  // Overtime Pay (Labor Code Art. 87: 125% regular overtime)
  const overtimePay = Math.round(
    totalOvertimeHours * employee.hourlyRate * PH_LABOR_STANDARDS.OVERTIME_REGULAR_RATE_MULTIPLIER * 100
  ) / 100;

  // Holiday Premium Pay (Regular Holiday worked: additional 100% of daily/hourly rate)
  const holidayPay = Math.round(holidayPremiumHours * employee.hourlyRate * 100) / 100;

  // Gross Pay calculation for semi-monthly cutoff
  const grossPayRaw =
    cutoffBasic - lateDeduction - undertimeDeduction - absentDeduction + overtimePay + holidayPay;
  const grossPay = Math.max(0, Math.round(grossPayRaw * 100) / 100);

  // Statutory Deductions: 50% split per semi-monthly cutoff
  const fullMonthlySSS = calculateMonthlySSS(employee.monthlyBasicSalary);
  const fullMonthlyPhilHealth = calculateMonthlyPhilHealth(employee.monthlyBasicSalary);
  const fullMonthlyPagIbig = calculateMonthlyPagIbig(employee.monthlyBasicSalary);

  const sssCutoff: StatutoryDeduction = {
    employeeShare: Math.round((fullMonthlySSS.employeeShare / 2) * 100) / 100,
    employerShare: Math.round((fullMonthlySSS.employerShare / 2) * 100) / 100,
    total: Math.round((fullMonthlySSS.total / 2) * 100) / 100,
    msc: fullMonthlySSS.msc,
    ec: Math.round(((fullMonthlySSS.ec ?? 0) / 2) * 100) / 100,
  };

  const philHealthCutoff: StatutoryDeduction = {
    employeeShare: Math.round((fullMonthlyPhilHealth.employeeShare / 2) * 100) / 100,
    employerShare: Math.round((fullMonthlyPhilHealth.employerShare / 2) * 100) / 100,
    total: Math.round((fullMonthlyPhilHealth.total / 2) * 100) / 100,
  };

  const pagIbigCutoff: StatutoryDeduction = {
    employeeShare: Math.round((fullMonthlyPagIbig.employeeShare / 2) * 100) / 100,
    employerShare: Math.round((fullMonthlyPagIbig.employerShare / 2) * 100) / 100,
    total: Math.round((fullMonthlyPagIbig.total / 2) * 100) / 100,
  };

  const totalStatutoryEmployee =
    Math.round((sssCutoff.employeeShare + philHealthCutoff.employeeShare + pagIbigCutoff.employeeShare) * 100) / 100;
  const totalStatutoryEmployer =
    Math.round((sssCutoff.employerShare + philHealthCutoff.employerShare + pagIbigCutoff.employerShare) * 100) / 100;

  // Taxable income = Gross Pay - Non-taxable Statutory Deductions
  const taxableIncome = Math.max(0, Math.round((grossPay - totalStatutoryEmployee) * 100) / 100);

  // BIR TRAIN Law Semi-Monthly Withholding Tax
  const withholdingTax = calculateSemiMonthlyWithholdingTax(taxableIncome);

  // Total Deductions & Net Pay
  const totalDeductions = Math.round((totalStatutoryEmployee + withholdingTax) * 100) / 100;
  const netPay = Math.max(0, Math.round((grossPay - totalDeductions) * 100) / 100);

  // Employer Total Cost (Gross Pay + Employer statutory share)
  const totalEmployerCost = Math.round((grossPay + totalStatutoryEmployer) * 100) / 100;

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    employeeCode: employee.employeeCode,
    position: employee.position,
    department: employee.department,
    cutoffPeriod,
    monthlyBasic: employee.monthlyBasicSalary,
    cutoffBasic,
    daysPresent,
    daysAbsent,
    totalLateMinutes,
    totalUndertimeMinutes,
    totalOvertimeHours,
    lateDeduction,
    undertimeDeduction,
    absentDeduction,
    overtimePay,
    holidayPay,
    grossPay,
    sss: sssCutoff,
    philHealth: philHealthCutoff,
    pagIbig: pagIbigCutoff,
    totalStatutoryEmployee,
    totalStatutoryEmployer,
    taxableIncome,
    withholdingTax,
    totalDeductions,
    netPay,
    totalEmployerCost,
  };
}

/**
 * Generates days array for a given cutoff period (e.g. 1-15 or 16-30/31)
 */
export function getDatesForCutoff(year: number, month: number, cutoff: 'first' | 'second'): string[] {
  const dates: string[] = [];
  const startDay = cutoff === 'first' ? 1 : 16;
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const endDay = cutoff === 'first' ? 15 : lastDayOfMonth;

  for (let day = startDay; day <= endDay; day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    dates.push(`${year}-${monthStr}-${dayStr}`);
  }

  return dates;
}

/**
 * Checks if a date string is Saturday or Sunday
 */
export function getDayOfWeekInfo(dateStr: string): { dayOfWeek: string; isWeekend: boolean } {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayIndex = d.getDay();
  return {
    dayOfWeek: days[dayIndex],
    isWeekend: dayIndex === 0 || dayIndex === 6,
  };
}

/**
 * Currency formatter for Philippine Peso (PHP / ₱)
 */
export function formatPHP(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
