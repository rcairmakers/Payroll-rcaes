export type CutoffType = 'first' | 'second'; // 'first' is 1-15, 'second' is 16-end

export interface CutoffPeriod {
  year: number;
  month: number; // 1-12
  cutoff: CutoffType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string; // e.g. "September 1 - 15, 2026 (1st Cutoff)"
  daysInCutoff: number;
  workDaysInCutoff: number;
}

export type DayType = 'regular' | 'rest_day' | 'special_holiday' | 'regular_holiday';

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  position: string;
  department: string;
  monthlyBasicSalary: number;
  dailyRate: number; // monthlyBasicSalary * 12 / 261 (DOLE standard factor)
  hourlyRate: number; // dailyRate / 8
  minuteRate: number; // hourlyRate / 60
  standardShift: {
    in: string; // "08:00"
    out: string; // "17:00"
    lunchMinutes: number; // 60
  };
  tin: string;
  sssNumber: string;
  philHealthNumber: string;
  pagIbigNumber: string;
  status: 'active' | 'on_leave' | 'resigned';
}

export interface DtrRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue, etc.
  dayType: DayType;
  timeIn: string | null; // "08:00"
  timeOut: string | null; // "17:00"
  hoursWorked: number;
  lateMinutes: number;
  undertimeMinutes: number;
  overtimeHours: number;
  isAbsent: boolean;
  notes?: string;
}

export interface StatutoryDeduction {
  employeeShare: number;
  employerShare: number;
  total: number;
  msc?: number; // For SSS Monthly Salary Credit
  ec?: number; // Employees' Compensation (employer paid)
  wispEmployee?: number;
  wispEmployer?: number;
}

export interface EmployeeCutoffPayroll {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  position: string;
  department: string;
  cutoffPeriod: CutoffPeriod;
  monthlyBasic: number;
  cutoffBasic: number; // monthlyBasic / 2
  
  // DTR stats
  daysPresent: number;
  daysAbsent: number;
  totalLateMinutes: number;
  totalUndertimeMinutes: number;
  totalOvertimeHours: number;
  
  // Adjustments & Earnings
  lateDeduction: number;
  undertimeDeduction: number;
  absentDeduction: number;
  overtimePay: number;
  holidayPay: number;
  
  grossPay: number; // cutoffBasic - late - undertime - absent + OT + Holiday
  
  // Statutory Deductions (Semi-Monthly share)
  sss: StatutoryDeduction;
  philHealth: StatutoryDeduction;
  pagIbig: StatutoryDeduction;
  totalStatutoryEmployee: number;
  totalStatutoryEmployer: number;
  
  // Tax
  taxableIncome: number; // Gross - statutory EE share
  withholdingTax: number;
  
  // Summary
  totalDeductions: number; // statutory EE + withholdingTax
  netPay: number; // grossPay - totalDeductions
  
  totalEmployerCost: number; // grossPay + statutory ER share + EC
}

export interface MonthlyEmployeeSalaryReport {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  position: string;
  department: string;
  monthlyBasic: number;
  
  // 1st Cutoff (1-15)
  cutoff1Gross: number;
  cutoff1Deductions: number;
  cutoff1Net: number;
  
  // 2nd Cutoff (16-end)
  cutoff2Gross: number;
  cutoff2Deductions: number;
  cutoff2Net: number;
  
  // Full Month Aggregates
  totalHoursWorked: number;
  totalLateMinutes: number;
  totalOvertimeHours: number;
  totalGrossPay: number;
  
  // Statutory Deductions
  monthlySSS_EE: number;
  monthlySSS_ER: number;
  monthlyPhilHealth_EE: number;
  monthlyPhilHealth_ER: number;
  monthlyPagIbig_EE: number;
  monthlyPagIbig_ER: number;
  totalMonthlyStatutory_EE: number;
  totalMonthlyStatutory_ER: number;
  
  monthlyWithholdingTax: number;
  totalMonthlyDeductions: number;
  totalMonthlyNetPay: number;
  totalEmployerCost: number;
}
