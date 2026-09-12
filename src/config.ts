// Philippine Payroll & Google Workspace Config

export const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '225174314950-to7e0n0mm5bj6a69ibss9n2qo9csuj8i.apps.googleusercontent.com';

export const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// Philippine Labor Law Standards
export const PH_LABOR_STANDARDS = {
  DOLE_DAYS_FACTOR: 261, // 261 days per year standard for Monday to Friday regular workers
  STANDARD_WORK_HOURS_PER_DAY: 8,
  STANDARD_LUNCH_BREAK_MINS: 60,
  OVERTIME_REGULAR_RATE_MULTIPLIER: 1.25, // 125% of regular hourly rate
  REST_DAY_RATE_MULTIPLIER: 1.30, // 130%
  SPECIAL_HOLIDAY_RATE_MULTIPLIER: 1.30, // 130%
  REGULAR_HOLIDAY_RATE_MULTIPLIER: 2.00, // 200%
  DEFAULT_SHIFT_IN: '08:00',
  DEFAULT_SHIFT_OUT: '17:00',
};
