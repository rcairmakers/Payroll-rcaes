import { CutoffPeriod, DtrRecord, Employee } from '../types';
import { computeDtrRowMetrics, getDatesForCutoff, getDayOfWeekInfo } from './philippinesPayroll';
import { PH_LABOR_STANDARDS } from '../config';

export function calculateDailyHourly(monthlyBasicSalary: number) {
  const dailyRate = Math.round(((monthlyBasicSalary * 12) / PH_LABOR_STANDARDS.DOLE_DAYS_FACTOR) * 100) / 100;
  const hourlyRate = Math.round((dailyRate / PH_LABOR_STANDARDS.STANDARD_WORK_HOURS_PER_DAY) * 100) / 100;
  const minuteRate = Math.round((hourlyRate / 60) * 1000) / 1000;
  return { dailyRate, hourlyRate, minuteRate };
}

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeCode: 'PH-1001',
    name: 'Juan Dela Cruz',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    monthlyBasicSalary: 65000,
    ...calculateDailyHourly(65000),
    standardShift: { in: '08:00', out: '17:00', lunchMinutes: 60 },
    tin: '234-567-890-000',
    sssNumber: '34-5678901-2',
    philHealthNumber: '12-345678901-2',
    pagIbigNumber: '1212-3456-7890',
    status: 'active',
  },
  {
    id: 'emp-2',
    employeeCode: 'PH-1002',
    name: 'Maria Santos',
    position: 'HR & Payroll Specialist',
    department: 'Human Resources',
    monthlyBasicSalary: 32000,
    ...calculateDailyHourly(32000),
    standardShift: { in: '08:00', out: '17:00', lunchMinutes: 60 },
    tin: '345-678-901-000',
    sssNumber: '04-1234567-8',
    philHealthNumber: '09-876543210-1',
    pagIbigNumber: '1234-5678-9012',
    status: 'active',
  },
  {
    id: 'emp-3',
    employeeCode: 'PH-1003',
    name: 'Carlos Reyes',
    position: 'Customer Support Lead',
    department: 'Operations',
    monthlyBasicSalary: 24000,
    ...calculateDailyHourly(24000),
    standardShift: { in: '08:00', out: '17:00', lunchMinutes: 60 },
    tin: '456-789-012-000',
    sssNumber: '06-9876543-1',
    philHealthNumber: '11-223344556-7',
    pagIbigNumber: '2345-6789-0123',
    status: 'active',
  },
  {
    id: 'emp-4',
    employeeCode: 'PH-1004',
    name: 'Liza Macaraeg',
    position: 'Junior QA Tester',
    department: 'Quality Assurance',
    monthlyBasicSalary: 18500,
    ...calculateDailyHourly(18500),
    standardShift: { in: '08:00', out: '17:00', lunchMinutes: 60 },
    tin: '567-890-123-000',
    sssNumber: '09-1122334-5',
    philHealthNumber: '22-334455667-8',
    pagIbigNumber: '3456-7890-1234',
    status: 'active',
  },
  {
    id: 'emp-5',
    employeeCode: 'PH-1005',
    name: 'Rodrigo Tan',
    position: 'Operations Director',
    department: 'Executive Management',
    monthlyBasicSalary: 110000,
    ...calculateDailyHourly(110000),
    standardShift: { in: '08:00', out: '17:00', lunchMinutes: 60 },
    tin: '123-456-789-000',
    sssNumber: '01-2345678-9',
    philHealthNumber: '01-234567890-1',
    pagIbigNumber: '4567-8901-2345',
    status: 'active',
  },
];

/**
 * Creates a CutoffPeriod object
 */
export function createCutoffPeriod(year: number, month: number, cutoff: 'first' | 'second'): CutoffPeriod {
  const dates = getDatesForCutoff(year, month, cutoff);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[month - 1];
  const label = `${monthName} ${cutoff === 'first' ? '1 - 15' : '16 - ' + new Date(year, month, 0).getDate()}, ${year} (${cutoff === 'first' ? '1st' : '2nd'} Cutoff)`;

  let workDays = 0;
  dates.forEach((d) => {
    const { isWeekend } = getDayOfWeekInfo(d);
    if (!isWeekend) workDays++;
  });

  return {
    year,
    month,
    cutoff,
    startDate,
    endDate,
    label,
    daysInCutoff: dates.length,
    workDaysInCutoff: workDays,
  };
}

/**
 * Generates realistic initial DTR logs for an employee across a given cutoff
 */
export function generateInitialDtrForCutoff(
  employee: Employee,
  year: number,
  month: number,
  cutoff: 'first' | 'second'
): DtrRecord[] {
  const dates = getDatesForCutoff(year, month, cutoff);
  const records: DtrRecord[] = [];

  dates.forEach((dateStr, index) => {
    const { dayOfWeek, isWeekend } = getDayOfWeekInfo(dateStr);

    if (isWeekend) {
      records.push({
        id: `dtr-${employee.id}-${dateStr}`,
        employeeId: employee.id,
        date: dateStr,
        dayOfWeek,
        dayType: 'rest_day',
        timeIn: null,
        timeOut: null,
        hoursWorked: 0,
        lateMinutes: 0,
        undertimeMinutes: 0,
        overtimeHours: 0,
        isAbsent: false,
      });
      return;
    }

    // Realistic patterns for weekdays:
    // Regular shift is 08:00 to 17:00
    let timeIn: string | null = '08:00';
    let timeOut: string | null = '17:00';
    let isAbsent = false;

    // Add some realistic variations per employee
    if (employee.id === 'emp-1') {
      // Juan is senior dev - occasional overtime
      if (index === 2 || index === 8) {
        timeIn = '07:55';
        timeOut = '19:00'; // 2 hours OT
      } else if (index === 4) {
        timeIn = '08:18'; // 18 mins late
        timeOut = '17:00';
      }
    } else if (employee.id === 'emp-2') {
      // Maria HR - punctual
      if (index === 3) {
        timeIn = '08:07'; // 7 mins late
        timeOut = '17:00';
      } else if (index === 9) {
        timeIn = '08:00';
        timeOut = '16:30'; // 30 mins undertime
      }
    } else if (employee.id === 'emp-3') {
      // Carlos - 1 day absent
      if (index === 5 && cutoff === 'first') {
        timeIn = null;
        timeOut = null;
        isAbsent = true;
      } else if (index === 7) {
        timeIn = '08:25'; // 25 mins late
        timeOut = '17:30';
      }
    } else if (employee.id === 'emp-4') {
      // Liza - Junior QA
      if (index === 1) {
        timeIn = '08:12';
        timeOut = '17:00';
      } else if (index === 6) {
        timeIn = '08:00';
        timeOut = '18:00'; // 1 hr OT
      }
    }

    const metrics = computeDtrRowMetrics(
      timeIn,
      timeOut,
      'regular',
      employee.standardShift.in,
      employee.standardShift.out
    );

    records.push({
      id: `dtr-${employee.id}-${dateStr}`,
      employeeId: employee.id,
      date: dateStr,
      dayOfWeek,
      dayType: 'regular',
      timeIn,
      timeOut,
      hoursWorked: metrics.hoursWorked,
      lateMinutes: metrics.lateMinutes,
      undertimeMinutes: metrics.undertimeMinutes,
      overtimeHours: metrics.overtimeHours,
      isAbsent: isAbsent || metrics.isAbsent,
    });
  });

  return records;
}
