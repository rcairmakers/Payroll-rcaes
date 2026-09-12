import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  ExternalLink,
  ShieldCheck,
  Building,
  HeartPulse,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  CutoffPeriod,
  DtrRecord,
  Employee,
  EmployeeCutoffPayroll,
  MonthlyEmployeeSalaryReport,
} from '../types';
import { exportPayrollToGoogleSheets, downloadPayrollCSV, ExportResult } from '../utils/googleSheets';
import { formatPHP } from '../utils/philippinesPayroll';

interface MonthlyReportViewProps {
  cutoffPeriod: CutoffPeriod;
  employees: Employee[];
  monthlyReports: MonthlyEmployeeSalaryReport[];
  cutoff1Payrolls: EmployeeCutoffPayroll[];
  cutoff2Payrolls: EmployeeCutoffPayroll[];
  allDtrRecords: DtrRecord[];
  isGoogleConnected: boolean;
  onConnectGoogle: () => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  cutoffPeriod,
  employees,
  monthlyReports,
  cutoff1Payrolls,
  cutoff2Payrolls,
  allDtrRecords,
  isGoogleConnected,
  onConnectGoogle,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[cutoffPeriod.month - 1];
  const fullMonthLabel = `${monthName} ${cutoffPeriod.year}`;

  // Grand Totals across all staff
  const sumBasic = monthlyReports.reduce((acc, r) => acc + r.monthlyBasic, 0);
  const sumGross = monthlyReports.reduce((acc, r) => acc + r.totalGrossPay, 0);
  const sumSssEE = monthlyReports.reduce((acc, r) => acc + r.monthlySSS_EE, 0);
  const sumSssER = monthlyReports.reduce((acc, r) => acc + r.monthlySSS_ER, 0);
  const sumPhEE = monthlyReports.reduce((acc, r) => acc + r.monthlyPhilHealth_EE, 0);
  const sumPhER = monthlyReports.reduce((acc, r) => acc + r.monthlyPhilHealth_ER, 0);
  const sumHdmfEE = monthlyReports.reduce((acc, r) => acc + r.monthlyPagIbig_EE, 0);
  const sumHdmfER = monthlyReports.reduce((acc, r) => acc + r.monthlyPagIbig_ER, 0);
  const sumTax = monthlyReports.reduce((acc, r) => acc + r.monthlyWithholdingTax, 0);
  const sumNet = monthlyReports.reduce((acc, r) => acc + r.totalMonthlyNetPay, 0);
  const sumErCost = monthlyReports.reduce((acc, r) => acc + r.totalEmployerCost, 0);

  // Government Remittance aggregates (EE + ER)
  const totalSssRemittance = sumSssEE + sumSssER;
  const totalPhilHealthRemittance = sumPhEE + sumPhER;
  const totalPagIbigRemittance = sumHdmfEE + sumHdmfER;
  const totalGovRemittance = totalSssRemittance + totalPhilHealthRemittance + totalPagIbigRemittance + sumTax;

  const handleExportGoogleSheets = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const result = await exportPayrollToGoogleSheets(
        fullMonthLabel,
        monthlyReports,
        cutoff1Payrolls,
        cutoff2Payrolls,
        allDtrRecords,
        employees
      );
      setExportResult(result);
    } catch (err: any) {
      console.error('Google Sheets export failed:', err);
      setExportError(err.message || 'Failed to export to Google Sheets.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCSV = () => {
    downloadPayrollCSV(`Philippines_Payroll_Report_${monthName}_${cutoffPeriod.year}`, monthlyReports);
  };

  return (
    <div id="monthly-salary-report-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Google Sheets Integration Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 border border-slate-700/60 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1st + 2nd Cutoff Consolidated
              </span>
              <span className="text-xs text-slate-400">DOLE & BIR TRAIN Certified</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">
              Monthly Salary & Benefits Report · {fullMonthLabel}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Consolidated monthly payroll combining both semi-monthly cutoffs (1st–15th and 16th–End).
              Automates Philippine statutory benefits contributions and monthly BIR TRAIN tax compliance.
            </p>
          </div>

          {/* Export Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-export-google-sheets"
              onClick={handleExportGoogleSheets}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-950" />
                  Generating Google Sheet...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Google Sheets
                </>
              )}
            </button>

            <button
              id="btn-download-csv-report"
              onClick={handleDownloadCSV}
              className="inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 mr-1.5 text-slate-400" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Live Export Success Notification Banner */}
        {exportResult && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">
                  Spreadsheet Successfully Created in Google Drive!
                </div>
                <div className="text-[11px] text-emerald-200">
                  Tabs generated: Monthly Salary Report, 1st Cutoff Register, 2nd Cutoff Register, and DTR Logs.
                </div>
              </div>
            </div>

            <a
              id="link-open-google-sheet"
              href={exportResult.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Open in Google Sheets
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        )}

        {/* Export Error Alert */}
        {exportError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Monthly Gross Pay
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatPHP(sumGross)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Cutoff 1: {formatPHP(cutoff1Payrolls.reduce((s, p) => s + p.grossPay, 0))} · Cutoff 2:{' '}
            {formatPHP(cutoff2Payrolls.reduce((s, p) => s + p.grossPay, 0))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Statutory Remittance
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1 font-mono">
            {formatPHP(totalSssRemittance + totalPhilHealthRemittance + totalPagIbigRemittance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Combined Employee & Employer Share
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            BIR Tax Remittance (1601-C)
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
            {formatPHP(sumTax)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total Monthly TRAIN Tax Withheld
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Total Net Take-Home Pay
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {formatPHP(sumNet)}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Total Net Salaries Disbursed
          </div>
        </div>
      </div>

      {/* Statutory Agency Monthly Breakdown Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SSS */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-900">SSS Contribution</span>
            </div>
            <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-semibold">
              14% + EC
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Employee Share (4.5%):</span>
              <span className="font-mono font-bold text-slate-800">{formatPHP(sumSssEE)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Employer Share (9.5% + EC):</span>
              <span className="font-mono font-bold text-slate-800">{formatPHP(sumSssER)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-sky-900">
              <span>Total SSS Remittance:</span>
              <span className="font-mono">{formatPHP(totalSssRemittance)}</span>
            </div>
          </div>
        </div>

        {/* PhilHealth */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-slate-900">PhilHealth (5.0%)</span>
            </div>
            <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-semibold">
              2.5% / 2.5%
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Employee Share (2.5%):</span>
              <span className="font-mono font-bold text-slate-800">{formatPHP(sumPhEE)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Employer Share (2.5%):</span>
              <span className="font-mono font-bold text-slate-800">{formatPHP(sumPhER)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-rose-900">
              <span>Total PhilHealth:</span>
              <span className="font-mono">{formatPHP(totalPhilHealthRemittance)}</span>
            </div>
          </div>
        </div>

        {/* Pag-IBIG */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Pag-IBIG / HDMF</span>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
              ₱10k Cap (2%)
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Employee Share (2%):</span>
              <span className="font-mono font-bold text-slate-800">{formatPHP(sumHdmfEE)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Employer Share (2%):</span>
              <span className="font-mono font-bold text-slate-800">{formatPHP(sumHdmfER)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-emerald-900">
              <span>Total Pag-IBIG:</span>
              <span className="font-mono">{formatPHP(totalPagIbigRemittance)}</span>
            </div>
          </div>
        </div>

        {/* BIR Tax */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-900">BIR Tax Withholding</span>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold">
              RA 10963
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Form 1601-C Tax:</span>
              <span className="font-mono font-bold text-amber-800">{formatPHP(sumTax)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Annualized Exemption:</span>
              <span className="font-mono text-slate-600">₱250,000</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-amber-950">
              <span>Total Tax Remittance:</span>
              <span className="font-mono">{formatPHP(sumTax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Consolidated Monthly Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Consolidated Monthly Employee Salary Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes 1st Cutoff Gross, 2nd Cutoff Gross, Full Month SSS, PhilHealth, Pag-IBIG, BIR Tax, and Net Pay.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
              Grand Employer Cost: <span className="font-mono font-bold text-slate-900">{formatPHP(sumErCost)}</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table id="monthly-report-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-2 text-right">Basic (Mo)</th>
                <th className="py-3 px-2 text-right">Cutoff 1 Gross</th>
                <th className="py-3 px-2 text-right">Cutoff 2 Gross</th>
                <th className="py-3 px-3 text-right bg-slate-200/60 font-black">Total Mo Gross</th>
                <th className="py-3 px-2 text-right text-indigo-900">SSS (EE)</th>
                <th className="py-3 px-2 text-right text-indigo-900">PhilHealth</th>
                <th className="py-3 px-2 text-right text-indigo-900">Pag-IBIG</th>
                <th className="py-3 px-2 text-right bg-amber-50 text-amber-900 font-bold">BIR Tax</th>
                <th className="py-3 px-2 text-right text-rose-700">Total Ded</th>
                <th className="py-3 px-3 text-right bg-emerald-50 text-emerald-950 font-black">
                  Monthly Net Pay
                </th>
                <th className="py-3 px-3 text-right text-slate-600">Total ER Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {monthlyReports.map((r) => (
                <tr key={r.employeeId} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name & Dept */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{r.employeeName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {r.employeeCode} · {r.position}
                    </div>
                  </td>

                  {/* Monthly Basic */}
                  <td className="py-3 px-2 text-right font-mono font-medium">
                    {formatPHP(r.monthlyBasic)}
                  </td>

                  {/* Cutoff 1 Gross */}
                  <td className="py-3 px-2 text-right font-mono text-slate-600">
                    {formatPHP(r.cutoff1Gross)}
                  </td>

                  {/* Cutoff 2 Gross */}
                  <td className="py-3 px-2 text-right font-mono text-slate-600">
                    {formatPHP(r.cutoff2Gross)}
                  </td>

                  {/* Total Monthly Gross */}
                  <td className="py-3 px-3 text-right font-mono font-bold bg-slate-50 text-slate-900">
                    {formatPHP(r.totalGrossPay)}
                  </td>

                  {/* SSS EE */}
                  <td className="py-3 px-2 text-right font-mono text-indigo-900">
                    {formatPHP(r.monthlySSS_EE)}
                  </td>

                  {/* PhilHealth EE */}
                  <td className="py-3 px-2 text-right font-mono text-indigo-900">
                    {formatPHP(r.monthlyPhilHealth_EE)}
                  </td>

                  {/* Pag-IBIG EE */}
                  <td className="py-3 px-2 text-right font-mono text-indigo-900">
                    {formatPHP(r.monthlyPagIbig_EE)}
                  </td>

                  {/* BIR TRAIN Tax */}
                  <td className="py-3 px-2 text-right font-mono font-bold bg-amber-50/50 text-amber-900">
                    {r.monthlyWithholdingTax > 0 ? (
                      formatPHP(r.monthlyWithholdingTax)
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Exempt
                      </span>
                    )}
                  </td>

                  {/* Total Deductions */}
                  <td className="py-3 px-2 text-right font-mono text-rose-700 font-bold">
                    -{formatPHP(r.totalMonthlyDeductions)}
                  </td>

                  {/* Net Pay */}
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/60 text-sm">
                    {formatPHP(r.totalMonthlyNetPay)}
                  </td>

                  {/* ER Cost */}
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {formatPHP(r.totalEmployerCost)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals */}
            <tfoot>
              <tr className="bg-slate-100 text-slate-900 font-bold text-xs border-t-2 border-slate-300">
                <td className="py-3 px-3">TOTALS</td>
                <td className="py-3 px-2 text-right font-mono">{formatPHP(sumBasic)}</td>
                <td className="py-3 px-2 text-right font-mono">
                  {formatPHP(monthlyReports.reduce((s, r) => s + r.cutoff1Gross, 0))}
                </td>
                <td className="py-3 px-2 text-right font-mono">
                  {formatPHP(monthlyReports.reduce((s, r) => s + r.cutoff2Gross, 0))}
                </td>
                <td className="py-3 px-3 text-right font-mono font-black">{formatPHP(sumGross)}</td>
                <td className="py-3 px-2 text-right font-mono text-indigo-900">{formatPHP(sumSssEE)}</td>
                <td className="py-3 px-2 text-right font-mono text-indigo-900">{formatPHP(sumPhEE)}</td>
                <td className="py-3 px-2 text-right font-mono text-indigo-900">{formatPHP(sumHdmfEE)}</td>
                <td className="py-3 px-2 text-right font-mono text-amber-900">{formatPHP(sumTax)}</td>
                <td className="py-3 px-2 text-right font-mono text-rose-700">
                  -{formatPHP(monthlyReports.reduce((s, r) => s + r.totalMonthlyDeductions, 0))}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 font-black text-sm">
                  {formatPHP(sumNet)}
                </td>
                <td className="py-3 px-3 text-right font-mono">{formatPHP(sumErCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
