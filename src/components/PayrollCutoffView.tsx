import React, { useState } from 'react';
import {
  PhilippinePeso,
  FileText,
  ShieldCheck,
  Building,
  HeartPulse,
  Home,
  Info,
  ChevronRight,
  Printer,
  Download,
} from 'lucide-react';
import { CutoffPeriod, EmployeeCutoffPayroll } from '../types';
import { formatPHP } from '../utils/philippinesPayroll';

interface PayrollCutoffViewProps {
  cutoffPeriod: CutoffPeriod;
  payrolls: EmployeeCutoffPayroll[];
  onOpenPayslip: (payroll: EmployeeCutoffPayroll) => void;
  onNavigateToMonthly: () => void;
  onNavigateToDtr: () => void;
}

export const PayrollCutoffView: React.FC<PayrollCutoffViewProps> = ({
  cutoffPeriod,
  payrolls,
  onOpenPayslip,
  onNavigateToMonthly,
  onNavigateToDtr,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Summary Totals
  const totalGross = payrolls.reduce((sum, p) => sum + p.grossPay, 0);
  const totalSssEE = payrolls.reduce((sum, p) => sum + p.sss.employeeShare, 0);
  const totalPhilHealthEE = payrolls.reduce((sum, p) => sum + p.philHealth.employeeShare, 0);
  const totalPagIbigEE = payrolls.reduce((sum, p) => sum + p.pagIbig.employeeShare, 0);
  const totalStatutoryEE = totalSssEE + totalPhilHealthEE + totalPagIbigEE;
  const totalTax = payrolls.reduce((sum, p) => sum + p.withholdingTax, 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalNetPay = payrolls.reduce((sum, p) => sum + p.netPay, 0);
  const totalEmployerCost = payrolls.reduce((sum, p) => sum + p.totalEmployerCost, 0);

  const filteredPayrolls = payrolls.filter(
    (p) =>
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="payroll-cutoff-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Automated Calculation
            </span>
            <span className="text-xs text-slate-500 font-medium">Philippines Labor Standards</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Semi-Monthly Payroll Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Cutoff: <strong className="text-slate-800">{cutoffPeriod.label}</strong> (Derived directly from Daily Time Record IN/OUT)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-nav-dtr-back"
            onClick={onNavigateToDtr}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            ← Back to DTR Clock
          </button>
          <button
            id="btn-nav-monthly-forward"
            onClick={onNavigateToMonthly}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-xs transition-colors"
          >
            View Monthly Report
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Gross Payroll</div>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 font-mono">
            {formatPHP(totalGross)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{payrolls.length} Active Staff</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Statutory EE Share
          </div>
          <div className="text-lg sm:text-xl font-black text-indigo-700 mt-1 font-mono">
            {formatPHP(totalStatutoryEE)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">SSS + PhilHealth + HDMF</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-amber-600" />
            BIR Tax (TRAIN)
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-700 mt-1 font-mono">
            {formatPHP(totalTax)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Semi-monthly withholding</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
            <PhilippinePeso className="w-3.5 h-3.5 text-emerald-600" />
            Net Take-Home Pay
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-700 mt-1 font-mono">
            {formatPHP(totalNetPay)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Net Disbursement</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Employer Cost</div>
          <div className="text-lg sm:text-xl font-black text-slate-800 mt-1 font-mono">
            {formatPHP(totalEmployerCost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Gross + ER Shares + EC</div>
        </div>
      </div>

      {/* Statutory Deductions Quick Reference Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200">
            Semi-Monthly Deduction Rules Applied:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <strong>SSS:</strong> 4.5% EE share (50% per cutoff, max ₱675/cutoff)
          </span>
          <span className="flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <strong>PhilHealth:</strong> 2.5% EE share (50% per cutoff)
          </span>
          <span className="flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <strong>Pag-IBIG:</strong> 2% EE share (₱100/cutoff max)
          </span>
          <span className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <strong>BIR Tax:</strong> Exempt if taxable ≤ ₱10,417
          </span>
        </div>
      </div>

      {/* Payroll Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-bold text-slate-900">
              Employee Payroll Breakdown
            </h3>
            <span className="text-xs bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              {filteredPayrolls.length} entries
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="payroll-search-input"
              placeholder="Search by name, code, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table id="payroll-register-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-2 text-right">Cutoff Basic</th>
                <th className="py-3 px-2 text-right">Lates / Under</th>
                <th className="py-3 px-2 text-right">Overtime</th>
                <th className="py-3 px-3 text-right bg-slate-200/60 font-black">Gross Pay</th>
                <th className="py-3 px-2 text-right text-indigo-900">SSS (EE)</th>
                <th className="py-3 px-2 text-right text-indigo-900">PhilHealth</th>
                <th className="py-3 px-2 text-right text-indigo-900">Pag-IBIG</th>
                <th className="py-3 px-2 text-right bg-amber-50 text-amber-900 font-bold">BIR Tax</th>
                <th className="py-3 px-2 text-right text-rose-700">Total Ded</th>
                <th className="py-3 px-3 text-right bg-emerald-50 text-emerald-950 font-black">
                  Net Pay
                </th>
                <th className="py-3 px-3 text-center">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredPayrolls.map((p) => {
                const totalLateUndertimeDed = p.lateDeduction + p.undertimeDeduction;

                return (
                  <tr key={p.employeeId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee Info */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{p.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.employeeCode} · {p.position}
                      </div>
                    </td>

                    {/* Cutoff Basic */}
                    <td className="py-3 px-2 text-right font-mono font-medium">
                      {formatPHP(p.cutoffBasic)}
                    </td>

                    {/* Lates / Undertime */}
                    <td className="py-3 px-2 text-right font-mono">
                      {totalLateUndertimeDed > 0 ? (
                        <span className="text-rose-600 font-semibold">
                          -{formatPHP(totalLateUndertimeDed)}
                        </span>
                      ) : (
                        <span className="text-slate-300">₱0.00</span>
                      )}
                    </td>

                    {/* Overtime Pay */}
                    <td className="py-3 px-2 text-right font-mono">
                      {p.overtimePay > 0 ? (
                        <span className="text-emerald-600 font-semibold">
                          +{formatPHP(p.overtimePay)}
                        </span>
                      ) : (
                        <span className="text-slate-300">₱0.00</span>
                      )}
                    </td>

                    {/* Gross Pay */}
                    <td className="py-3 px-3 text-right font-mono font-bold bg-slate-50 text-slate-900">
                      {formatPHP(p.grossPay)}
                    </td>

                    {/* SSS EE */}
                    <td className="py-3 px-2 text-right font-mono text-indigo-900">
                      {formatPHP(p.sss.employeeShare)}
                    </td>

                    {/* PhilHealth EE */}
                    <td className="py-3 px-2 text-right font-mono text-indigo-900">
                      {formatPHP(p.philHealth.employeeShare)}
                    </td>

                    {/* Pag-IBIG EE */}
                    <td className="py-3 px-2 text-right font-mono text-indigo-900">
                      {formatPHP(p.pagIbig.employeeShare)}
                    </td>

                    {/* Withholding Tax (BIR TRAIN) */}
                    <td className="py-3 px-2 text-right font-mono font-bold bg-amber-50/50 text-amber-900">
                      {p.withholdingTax > 0 ? (
                        formatPHP(p.withholdingTax)
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Exempt
                        </span>
                      )}
                    </td>

                    {/* Total Deductions */}
                    <td className="py-3 px-2 text-right font-mono text-rose-700 font-bold">
                      -{formatPHP(p.totalDeductions)}
                    </td>

                    {/* Net Pay */}
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/60 text-sm">
                      {formatPHP(p.netPay)}
                    </td>

                    {/* Payslip Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        id={`btn-view-payslip-${p.employeeId}`}
                        onClick={() => onOpenPayslip(p)}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-colors"
                        title="View and print official DOLE-compliant payslip"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Payslip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Footer */}
            <tfoot>
              <tr className="bg-slate-100 text-slate-900 font-bold text-xs border-t-2 border-slate-300">
                <td className="py-3 px-3">TOTALS</td>
                <td className="py-3 px-2 text-right font-mono">
                  {formatPHP(payrolls.reduce((sum, p) => sum + p.cutoffBasic, 0))}
                </td>
                <td className="py-3 px-2 text-right font-mono text-rose-700">
                  -{formatPHP(payrolls.reduce((sum, p) => sum + p.lateDeduction + p.undertimeDeduction, 0))}
                </td>
                <td className="py-3 px-2 text-right font-mono text-emerald-700">
                  +{formatPHP(payrolls.reduce((sum, p) => sum + p.overtimePay, 0))}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-950 font-black">
                  {formatPHP(totalGross)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-indigo-900">{formatPHP(totalSssEE)}</td>
                <td className="py-3 px-2 text-right font-mono text-indigo-900">{formatPHP(totalPhilHealthEE)}</td>
                <td className="py-3 px-2 text-right font-mono text-indigo-900">{formatPHP(totalPagIbigEE)}</td>
                <td className="py-3 px-2 text-right font-mono text-amber-900">{formatPHP(totalTax)}</td>
                <td className="py-3 px-2 text-right font-mono text-rose-700">-{formatPHP(totalDeductions)}</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 font-black text-sm">
                  {formatPHP(totalNetPay)}
                </td>
                <td className="py-3 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
