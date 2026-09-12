import React from 'react';
import { X, Printer, ShieldCheck, PhilippinePeso, Building } from 'lucide-react';
import { EmployeeCutoffPayroll } from '../types';
import { formatPHP } from '../utils/philippinesPayroll';

interface PayslipModalProps {
  payroll: EmployeeCutoffPayroll | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payroll, onClose }) => {
  if (!payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="payslip-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="payslip-modal-content"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center space-x-2">
            <PhilippinePeso className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Official Employee Payslip</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Payslip
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Payslip Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 print:p-0">
          {/* Company & Period Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
              PAYSLIP / SALARY VOUCHER
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              Republic of the Philippines · DOLE Labor Standards Compliant
            </div>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-800">
              Pay Period: {payroll.cutoffPeriod.label}
            </div>
          </div>

          {/* Employee Profile Header Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-slate-500 block">Employee Name:</span>
              <strong className="text-slate-900 text-sm">{payroll.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Employee ID:</span>
              <strong className="text-slate-900 font-mono">{payroll.employeeCode}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Position / Role:</span>
              <strong className="text-slate-900">{payroll.position}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Department:</span>
              <strong className="text-slate-900">{payroll.department}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Monthly Basic Rate:</span>
              <strong className="text-slate-900 font-mono">{formatPHP(payroll.monthlyBasic)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Semi-Monthly Basic:</span>
              <strong className="text-slate-900 font-mono">{formatPHP(payroll.cutoffBasic)}</strong>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="flex flex-wrap items-center justify-between text-xs bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-indigo-950 font-medium">
            <span>
              Days Present: <strong>{payroll.daysPresent}</strong>
            </span>
            <span>·</span>
            <span>
              Absences: <strong>{payroll.daysAbsent} day(s)</strong>
            </span>
            <span>·</span>
            <span>
              Late Minutes: <strong>{payroll.totalLateMinutes} mins</strong>
            </span>
            <span>·</span>
            <span>
              Undertime: <strong>{payroll.totalUndertimeMinutes} mins</strong>
            </span>
            <span>·</span>
            <span>
              Overtime: <strong>{payroll.totalOvertimeHours} hrs</strong>
            </span>
          </div>

          {/* 2-Column Earnings & Deductions Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left: Earnings */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex justify-between">
                <span>EARNINGS</span>
                <span>AMOUNT (PHP)</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Pay (Semi-Monthly):</span>
                  <span className="font-mono font-medium">{formatPHP(payroll.cutoffBasic)}</span>
                </div>
                {payroll.overtimePay > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Overtime Pay (125%):</span>
                    <span className="font-mono font-semibold">+{formatPHP(payroll.overtimePay)}</span>
                  </div>
                )}
                {payroll.holidayPay > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Holiday Premium:</span>
                    <span className="font-mono font-semibold">+{formatPHP(payroll.holidayPay)}</span>
                  </div>
                )}
                {payroll.absentDeduction > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Absence Deduction:</span>
                    <span className="font-mono font-medium">-{formatPHP(payroll.absentDeduction)}</span>
                  </div>
                )}
                {payroll.lateDeduction > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Tardiness / Late Ded:</span>
                    <span className="font-mono font-medium">-{formatPHP(payroll.lateDeduction)}</span>
                  </div>
                )}
                {payroll.undertimeDeduction > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Undertime Deduction:</span>
                    <span className="font-mono font-medium">-{formatPHP(payroll.undertimeDeduction)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>GROSS PAY:</span>
                <span className="font-mono">{formatPHP(payroll.grossPay)}</span>
              </div>
            </div>

            {/* Right: Deductions */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex justify-between">
                <span>DEDUCTIONS</span>
                <span>AMOUNT (PHP)</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>SSS (Employee Share):</span>
                  <span className="font-mono font-medium">
                    {formatPHP(payroll.sss.employeeShare)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>PhilHealth (Employee Share):</span>
                  <span className="font-mono font-medium">
                    {formatPHP(payroll.philHealth.employeeShare)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Pag-IBIG / HDMF:</span>
                  <span className="font-mono font-medium">
                    {formatPHP(payroll.pagIbig.employeeShare)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-900 font-semibold bg-amber-50/60 p-1 rounded">
                  <span>BIR Withholding Tax (TRAIN):</span>
                  <span className="font-mono">{formatPHP(payroll.withholdingTax)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-sm text-rose-700">
                <span>TOTAL DEDUCTIONS:</span>
                <span className="font-mono">-{formatPHP(payroll.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* NET TAKE HOME PAY BOX */}
          <div className="bg-emerald-50 border-2 border-emerald-500/60 rounded-xl p-5 flex items-center justify-between text-emerald-950">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                NET TAKE-HOME PAY
              </span>
              <span className="text-xs text-emerald-700">
                Disbursed for {payroll.cutoffPeriod.label}
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-emerald-800">
              {formatPHP(payroll.netPay)}
            </div>
          </div>

          {/* Employer Statutory Contributions Reference (Transparency) */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-[11px] text-slate-600">
            <div className="font-bold text-slate-800 mb-1">
              Employer Statutory Contribution Share (Company Paid):
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                SSS Employer: <strong className="font-mono text-slate-900">{formatPHP(payroll.sss.employerShare)}</strong>
              </div>
              <div>
                PhilHealth Employer: <strong className="font-mono text-slate-900">{formatPHP(payroll.philHealth.employerShare)}</strong>
              </div>
              <div>
                Pag-IBIG Employer: <strong className="font-mono text-slate-900">{formatPHP(payroll.pagIbig.employerShare)}</strong>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs text-slate-600">
            <div className="border-t border-slate-400 pt-2">
              <span className="font-medium">Prepared by / Payroll Officer</span>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <span className="font-medium">Employee Signature / Acknowledged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
