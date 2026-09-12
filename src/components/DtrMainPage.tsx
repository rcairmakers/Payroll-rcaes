import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';
import { CutoffPeriod, DtrRecord, Employee } from '../types';
import { computeDtrRowMetrics, formatPHP } from '../utils/philippinesPayroll';

interface DtrMainPageProps {
  cutoffPeriod: CutoffPeriod;
  employees: Employee[];
  dtrRecords: DtrRecord[];
  onUpdateDtrRecord: (recordId: string, updates: Partial<DtrRecord>) => void;
  onBatchUpdateDtr: (newRecords: DtrRecord[]) => void;
  onNavigateToPayroll: () => void;
}

export const DtrMainPage: React.FC<DtrMainPageProps> = ({
  cutoffPeriod,
  employees,
  dtrRecords,
  onUpdateDtrRecord,
  onBatchUpdateDtr,
  onNavigateToPayroll,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees[0]?.id || ''
  );
  const [kioskTimeMode, setKioskTimeMode] = useState<'current' | 'custom'>('current');
  const [customKioskTime, setCustomKioskTime] = useState<string>('08:00');
  const [punchFeedback, setPunchFeedback] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // Live Philippine Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [todayIsoDate, setTodayIsoDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-PH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString('en-PH', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setTodayIsoDate(`${year}-${month}-${day}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  // Filter DTR records for currently selected employee and active cutoff
  const employeeRecords = dtrRecords
    .filter((r) => r.employeeId === selectedEmployee?.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Find today's record if it falls in this cutoff
  const todayRecord = employeeRecords.find((r) => r.date === todayIsoDate);

  // Calculate totals for active employee in this cutoff
  const totalWorkedHours = employeeRecords.reduce((acc, r) => acc + r.hoursWorked, 0);
  const totalLateMins = employeeRecords.reduce((acc, r) => acc + r.lateMinutes, 0);
  const totalUndertimeMins = employeeRecords.reduce((acc, r) => acc + r.undertimeMinutes, 0);
  const totalOtHours = employeeRecords.reduce((acc, r) => acc + r.overtimeHours, 0);
  const presentCount = employeeRecords.filter((r) => r.hoursWorked > 0).length;
  const absentCount = employeeRecords.filter(
    (r) => r.dayType === 'regular' && (r.isAbsent || (!r.timeIn && !r.timeOut))
  ).length;

  // Handle Quick Kiosk Punch IN
  const handlePunchIn = () => {
    if (!selectedEmployee) return;

    let timeToPunch: string;
    if (kioskTimeMode === 'current') {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      timeToPunch = `${h}:${m}`;
    } else {
      timeToPunch = customKioskTime;
    }

    // Find the record for today, or default to the first incomplete weekday in this cutoff
    let targetRecord = todayRecord;
    if (!targetRecord) {
      targetRecord =
        employeeRecords.find((r) => r.dayType === 'regular' && !r.timeIn) || employeeRecords[0];
    }

    if (!targetRecord) {
      setPunchFeedback({
        type: 'warning',
        message: 'No active DTR record slot found in this cutoff period.',
      });
      return;
    }

    const updatedMetrics = computeDtrRowMetrics(
      timeToPunch,
      targetRecord.timeOut,
      targetRecord.dayType,
      selectedEmployee.standardShift.in,
      selectedEmployee.standardShift.out
    );

    onUpdateDtrRecord(targetRecord.id, {
      timeIn: timeToPunch,
      isAbsent: false,
      hoursWorked: updatedMetrics.hoursWorked,
      lateMinutes: updatedMetrics.lateMinutes,
      undertimeMinutes: updatedMetrics.undertimeMinutes,
      overtimeHours: updatedMetrics.overtimeHours,
    });

    const isLate = updatedMetrics.lateMinutes > 0;
    setPunchFeedback({
      type: isLate ? 'warning' : 'success',
      message: `${selectedEmployee.name} Timed IN at ${timeToPunch} for ${targetRecord.date} ${
        isLate ? `(${updatedMetrics.lateMinutes} mins late)` : '(On time)'
      }.`,
    });
  };

  // Handle Quick Kiosk Punch OUT
  const handlePunchOut = () => {
    if (!selectedEmployee) return;

    let timeToPunch: string;
    if (kioskTimeMode === 'current') {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      timeToPunch = `${h}:${m}`;
    } else {
      timeToPunch = customKioskTime;
    }

    let targetRecord = todayRecord;
    if (!targetRecord) {
      targetRecord =
        employeeRecords.find((r) => r.timeIn && !r.timeOut) ||
        employeeRecords.find((r) => r.dayType === 'regular') ||
        employeeRecords[0];
    }

    if (!targetRecord) {
      setPunchFeedback({
        type: 'warning',
        message: 'No active DTR record slot found in this cutoff period.',
      });
      return;
    }

    const updatedMetrics = computeDtrRowMetrics(
      targetRecord.timeIn,
      timeToPunch,
      targetRecord.dayType,
      selectedEmployee.standardShift.in,
      selectedEmployee.standardShift.out
    );

    onUpdateDtrRecord(targetRecord.id, {
      timeOut: timeToPunch,
      isAbsent: false,
      hoursWorked: updatedMetrics.hoursWorked,
      lateMinutes: updatedMetrics.lateMinutes,
      undertimeMinutes: updatedMetrics.undertimeMinutes,
      overtimeHours: updatedMetrics.overtimeHours,
    });

    setPunchFeedback({
      type: 'success',
      message: `${selectedEmployee.name} Timed OUT at ${timeToPunch} for ${targetRecord.date} (Total ${
        updatedMetrics.hoursWorked
      } hrs worked${
        updatedMetrics.overtimeHours > 0 ? `, ${updatedMetrics.overtimeHours} hrs OT` : ''
      }).`,
    });
  };

  // Handle cell edit of Time IN / Time OUT in table
  const handleCellTimeChange = (
    record: DtrRecord,
    field: 'timeIn' | 'timeOut',
    val: string
  ) => {
    const newIn = field === 'timeIn' ? (val.trim() === '' ? null : val) : record.timeIn;
    const newOut = field === 'timeOut' ? (val.trim() === '' ? null : val) : record.timeOut;

    const metrics = computeDtrRowMetrics(
      newIn,
      newOut,
      record.dayType,
      selectedEmployee.standardShift.in,
      selectedEmployee.standardShift.out
    );

    onUpdateDtrRecord(record.id, {
      [field]: val.trim() === '' ? null : val,
      isAbsent: record.dayType === 'regular' && !newIn && !newOut,
      hoursWorked: metrics.hoursWorked,
      lateMinutes: metrics.lateMinutes,
      undertimeMinutes: metrics.undertimeMinutes,
      overtimeHours: metrics.overtimeHours,
    });
  };

  // Quick action: Fill standard 8:00 AM - 5:00 PM for all weekdays in this cutoff
  const handleFillStandardWeekdays = () => {
    const updated = employeeRecords.map((r) => {
      if (r.dayType === 'rest_day') return r;
      const metrics = computeDtrRowMetrics(
        '08:00',
        '17:00',
        r.dayType,
        selectedEmployee.standardShift.in,
        selectedEmployee.standardShift.out
      );
      return {
        ...r,
        timeIn: '08:00',
        timeOut: '17:00',
        isAbsent: false,
        hoursWorked: metrics.hoursWorked,
        lateMinutes: metrics.lateMinutes,
        undertimeMinutes: metrics.undertimeMinutes,
        overtimeHours: metrics.overtimeHours,
      };
    });

    onBatchUpdateDtr(updated);
    setPunchFeedback({
      type: 'info',
      message: `Standard shift (08:00 - 17:00) populated for ${selectedEmployee.name} across ${cutoffPeriod.label}.`,
    });
  };

  // Quick action: Clear inputs
  const handleClearCutoffInputs = () => {
    const updated = employeeRecords.map((r) => ({
      ...r,
      timeIn: null,
      timeOut: null,
      hoursWorked: 0,
      lateMinutes: 0,
      undertimeMinutes: 0,
      overtimeHours: 0,
      isAbsent: r.dayType === 'regular',
    }));
    onBatchUpdateDtr(updated);
    setPunchFeedback({
      type: 'warning',
      message: `Cleared IN and OUT timestamps for ${selectedEmployee.name} in this cutoff.`,
    });
  };

  return (
    <div id="dtr-main-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Real-Time DTR Hub & Cutoff Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 border border-slate-700/60 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Primary Attendance Gate
              </span>
              <span className="text-xs text-slate-400">DOLE Article 83-87 Standard</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Daily Time Record (DTR)
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Active Semi-Monthly Cutoff: <strong className="text-amber-400">{cutoffPeriod.label}</strong>.
              Log employee daily attendance with simple <span className="underline decoration-emerald-500">TIME IN</span> and{' '}
              <span className="underline decoration-amber-500">TIME OUT</span> inputs to automate statutory deductions, overtime, and BIR tax.
            </p>
          </div>

          {/* Live Philippine Time & Date Badge */}
          <div className="flex items-center space-x-4 bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 shadow-inner">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Philippine Standard Time (PST)
              </div>
              <div className="text-2xl font-black text-white tracking-wider font-mono">
                {currentTimeStr || '18:00:00'}
              </div>
              <div className="text-xs text-slate-300 flex items-center mt-0.5">
                <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                {currentDateStr || 'Today'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Kiosk & Attendance Punch Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Fast Time IN / OUT Kiosk (Only IN and OUT inputs) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Attendance Time Clock</h3>
                  <p className="text-xs text-slate-500">Single-click IN / OUT recording</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                Standard: 08:00 - 17:00
              </span>
            </div>

            {/* Employee Selector */}
            <div className="mt-4 space-y-3">
              <label htmlFor="kiosk-employee-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Employee
              </label>
              <select
                id="kiosk-employee-select"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeCode} - {emp.name} ({emp.position} · {formatPHP(emp.monthlyBasicSalary)}/mo)
                  </option>
                ))}
              </select>

              {/* Employee Summary Chip */}
              {selectedEmployee && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-800">{selectedEmployee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hourly Rate:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatPHP(selectedEmployee.hourlyRate)} / hr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard Work Shift:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {selectedEmployee.standardShift.in} - {selectedEmployee.standardShift.out} (1h lunch)
                    </span>
                  </div>
                </div>
              )}

              {/* Input Mode Selector: Live Clock vs Manual Time Picker */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Timestamp Source:</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setKioskTimeMode('current')}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        kioskTimeMode === 'current'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Real-time PST
                    </button>
                    <button
                      type="button"
                      onClick={() => setKioskTimeMode('custom')}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        kioskTimeMode === 'custom'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Manual Time
                    </button>
                  </div>
                </div>

                {kioskTimeMode === 'custom' && (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="time"
                      id="kiosk-manual-time"
                      value={customKioskTime}
                      onChange={(e) => setCustomKioskTime(e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-3 py-1.5 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">
                      Set custom IN or OUT timestamp
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Punch IN and OUT Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* BIG TIME IN BUTTON */}
              <button
                id="btn-kiosk-time-in"
                onClick={handlePunchIn}
                className="group flex flex-col items-center justify-center p-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all transform active:scale-98 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/40 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <LogIn className="w-5 h-5" />
                </div>
                <span className="text-sm font-black uppercase tracking-wider">TIME IN</span>
                <span className="text-[11px] opacity-80 mt-0.5">
                  {kioskTimeMode === 'current' ? 'Log Now' : customKioskTime}
                </span>
              </button>

              {/* BIG TIME OUT BUTTON */}
              <button
                id="btn-kiosk-time-out"
                onClick={handlePunchOut}
                className="group flex flex-col items-center justify-center p-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 transition-all transform active:scale-98 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-rose-500/40 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-sm font-black uppercase tracking-wider">TIME OUT</span>
                <span className="text-[11px] opacity-80 mt-0.5">
                  {kioskTimeMode === 'current' ? 'Log Now' : customKioskTime}
                </span>
              </button>
            </div>

            {/* Punch Action Feedback Message */}
            {punchFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start space-x-2 border transition-all ${
                  punchFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : punchFeedback.type === 'warning'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {punchFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                )}
                <span className="font-medium">{punchFeedback.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cutoff KPI Summary & DTR Fast Actions */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Cutoff Attendance Metrics · {selectedEmployee?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Computed against DOLE 8-hr standard shift (08:00 - 17:00)
                </p>
              </div>

              {/* Batch Helper Actions */}
              <div className="flex items-center space-x-2">
                <button
                  id="btn-fill-standard-shift"
                  onClick={handleFillStandardWeekdays}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200/80 transition-colors"
                  title="Auto-fill 08:00 - 17:00 on all working days in this cutoff"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Auto-Fill Weekdays
                </button>
                <button
                  id="btn-clear-cutoff-dtr"
                  onClick={handleClearCutoffInputs}
                  className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                  title="Clear all IN and OUT stamps for this employee in this cutoff"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Hours Worked
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                  {totalWorkedHours.toFixed(1)} <span className="text-xs text-slate-500 font-normal">hrs</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  {presentCount} of {cutoffPeriod.workDaysInCutoff} workdays
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Tardiness (Late)
                </div>
                <div className={`text-xl font-bold mt-1 font-mono ${totalLateMins > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {totalLateMins} <span className="text-xs text-slate-500 font-normal">mins</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  -{formatPHP(totalLateMins * selectedEmployee.minuteRate)}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Undertime
                </div>
                <div className={`text-xl font-bold mt-1 font-mono ${totalUndertimeMins > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {totalUndertimeMins} <span className="text-xs text-slate-500 font-normal">mins</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  -{formatPHP(totalUndertimeMins * selectedEmployee.minuteRate)}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Overtime (125%)
                </div>
                <div className={`text-xl font-bold mt-1 font-mono ${totalOtHours > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {totalOtHours.toFixed(1)} <span className="text-xs text-slate-500 font-normal">hrs</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  +{formatPHP(totalOtHours * selectedEmployee.hourlyRate * 1.25)}
                </div>
              </div>
            </div>

            {/* Quick explanation banner */}
            <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900">
              <span className="font-bold">Labor Standards In Effect:</span> Standard 8-hr workday from 08:00 to 17:00 with 1 hour unpaid meal break. Arrivals after 08:00 are deducted as Late. Departures prior to 17:00 are Undertime. Work beyond 8 net hours yields +125% regular overtime premium.
            </div>
          </div>

          {/* Quick link to calculate payroll */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Cutoff: <strong>{cutoffPeriod.label}</strong>
            </span>
            <button
              id="btn-dtr-proceed-payroll"
              onClick={onNavigateToPayroll}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
            >
              Generate Semi-Monthly Payroll
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main DTR Grid: Only IN and OUT Inputs for the Semi-Monthly Cutoff */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Semi-Monthly Cutoff Attendance Sheet</span>
              <span className="text-xs font-normal text-slate-500">({cutoffPeriod.label})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Input only <strong>IN</strong> and <strong>OUT</strong> times. All hours, lates, undertime, and overtime are calculated automatically.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Active Staff:</span>
            <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {selectedEmployee?.name} ({selectedEmployee?.employeeCode})
            </span>
          </div>
        </div>

        {/* The DTR Table */}
        <div className="overflow-x-auto">
          <table id="dtr-records-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Day</th>
                <th className="py-3 px-3">Shift Type</th>
                <th className="py-3 px-4 text-center bg-emerald-50/70 text-emerald-900 border-x border-emerald-100 font-black">
                  TIME IN
                </th>
                <th className="py-3 px-4 text-center bg-rose-50/70 text-rose-900 border-r border-rose-100 font-black">
                  TIME OUT
                </th>
                <th className="py-3 px-3 text-right">Worked Hrs</th>
                <th className="py-3 px-3 text-right">Late (Min)</th>
                <th className="py-3 px-3 text-right">Undertime (Min)</th>
                <th className="py-3 px-3 text-right">Overtime (Hr)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {employeeRecords.map((record) => {
                const isRestDay = record.dayType === 'rest_day';
                const isToday = record.date === todayIsoDate;

                return (
                  <tr
                    key={record.id}
                    className={`transition-colors ${
                      isToday
                        ? 'bg-amber-50/40 font-semibold'
                        : isRestDay
                        ? 'bg-slate-50/40 text-slate-400'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Date */}
                    <td className="py-2.5 px-4 font-mono font-medium">
                      <div className="flex items-center space-x-1.5">
                        <span>{record.date}</span>
                        {isToday && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-bold">
                            Today
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Day of Week */}
                    <td className="py-2.5 px-3 font-medium">
                      <span
                        className={
                          record.dayOfWeek === 'Sat' || record.dayOfWeek === 'Sun'
                            ? 'text-rose-500 font-semibold'
                            : 'text-slate-700'
                        }
                      >
                        {record.dayOfWeek}
                      </span>
                    </td>

                    {/* Shift Type */}
                    <td className="py-2.5 px-3">
                      {isRestDay ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Rest Day
                        </span>
                      ) : record.dayType === 'regular_holiday' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">
                          Regular Holiday
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                          Regular (08-17)
                        </span>
                      )}
                    </td>

                    {/* ONLY IN INPUT (Editable directly) */}
                    <td className="py-2 px-3 text-center bg-emerald-50/30 border-x border-emerald-100/60">
                      <div className="inline-flex items-center justify-center">
                        <input
                          type="time"
                          id={`time-in-${record.id}`}
                          disabled={isRestDay}
                          value={record.timeIn || ''}
                          onChange={(e) => handleCellTimeChange(record, 'timeIn', e.target.value)}
                          className={`w-28 text-center text-xs font-mono font-bold rounded-lg border px-2 py-1 transition-all ${
                            isRestDay
                              ? 'bg-transparent border-transparent text-slate-400 cursor-not-allowed'
                              : record.timeIn
                              ? 'bg-white border-emerald-300 text-emerald-900 shadow-xs focus:ring-2 focus:ring-emerald-500'
                              : 'bg-white border-slate-300 text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          }`}
                        />
                      </div>
                    </td>

                    {/* ONLY OUT INPUT (Editable directly) */}
                    <td className="py-2 px-3 text-center bg-rose-50/30 border-r border-rose-100/60">
                      <div className="inline-flex items-center justify-center">
                        <input
                          type="time"
                          id={`time-out-${record.id}`}
                          disabled={isRestDay}
                          value={record.timeOut || ''}
                          onChange={(e) => handleCellTimeChange(record, 'timeOut', e.target.value)}
                          className={`w-28 text-center text-xs font-mono font-bold rounded-lg border px-2 py-1 transition-all ${
                            isRestDay
                              ? 'bg-transparent border-transparent text-slate-400 cursor-not-allowed'
                              : record.timeOut
                              ? 'bg-white border-rose-300 text-rose-900 shadow-xs focus:ring-2 focus:ring-rose-500'
                              : 'bg-white border-slate-300 text-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Calculated Worked Hours */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {record.hoursWorked > 0 ? (
                        <span>{record.hoursWorked.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>

                    {/* Calculated Late Minutes */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      {record.lateMinutes > 0 ? (
                        <span className="text-amber-600 font-bold">+{record.lateMinutes}m</span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    {/* Calculated Undertime Minutes */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      {record.undertimeMinutes > 0 ? (
                        <span className="text-rose-600 font-bold">+{record.undertimeMinutes}m</span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    {/* Calculated Overtime Hours */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      {record.overtimeHours > 0 ? (
                        <span className="text-emerald-600 font-bold">+{record.overtimeHours.toFixed(2)}h</span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    {/* Computed Status Badge */}
                    <td className="py-2.5 px-4 text-center">
                      {isRestDay ? (
                        <span className="text-slate-400 text-[10px]">--</span>
                      ) : record.isAbsent || (!record.timeIn && !record.timeOut) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Absent
                        </span>
                      ) : record.lateMinutes > 0 && record.overtimeHours > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Late + OT
                        </span>
                      ) : record.lateMinutes > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Late ({record.lateMinutes}m)
                        </span>
                      ) : record.undertimeMinutes > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                          Undertime
                        </span>
                      ) : record.overtimeHours > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Overtime (+{record.overtimeHours}h)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          <Check className="w-3 h-3 mr-0.5" /> Present
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary of Selected Employee */}
        <div className="bg-slate-50 p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center space-x-4">
            <span>
              Total Cutoff Hours: <strong className="text-slate-900">{totalWorkedHours.toFixed(2)} hrs</strong>
            </span>
            <span>·</span>
            <span>
              Lates: <strong className="text-amber-700">{totalLateMins} mins</strong>
            </span>
            <span>·</span>
            <span>
              Overtime: <strong className="text-emerald-700">{totalOtHours.toFixed(2)} hrs</strong>
            </span>
          </div>

          <div className="text-slate-500">
            Tip: Click directly on any <span className="font-semibold text-emerald-700">TIME IN</span> or{' '}
            <span className="font-semibold text-rose-700">TIME OUT</span> box to adjust hours.
          </div>
        </div>
      </div>
    </div>
  );
};
