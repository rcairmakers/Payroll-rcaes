import React from 'react';
import { Calendar, Clock, FileSpreadsheet, BookOpen, Users, PhilippinePeso } from 'lucide-react';
import { CutoffPeriod } from '../types';

interface HeaderProps {
  currentTab: 'dtr' | 'payroll' | 'monthly';
  onSelectTab: (tab: 'dtr' | 'payroll' | 'monthly') => void;
  cutoffPeriod: CutoffPeriod;
  onCutoffChange: (year: number, month: number, cutoff: 'first' | 'second') => void;
  onOpenEmployees: () => void;
  onOpenLaborLaws: () => void;
  isGoogleConnected: boolean;
  onConnectGoogle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  cutoffPeriod,
  onCutoffChange,
  onOpenEmployees,
  onOpenLaborLaws,
  isGoogleConnected,
  onConnectGoogle,
}) => {
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <header id="main-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-4">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold text-lg">
              <PhilippinePeso className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Philippine Payroll & DTR System
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  TRAIN & 2025 SSS Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated statutory deductions (SSS, PhilHealth, Pag-IBIG, BIR Tax) with DTR In/Out
              </p>
            </div>
          </div>

          {/* Quick Actions & Workspace OAuth */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="header-btn-labor-law"
              onClick={onOpenLaborLaws}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/80 transition-colors"
              title="View Philippine Labor Code & Statutory Deduction Tables"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Labor Law & Tax Rates
            </button>

            <button
              id="header-btn-employees"
              onClick={onOpenEmployees}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/80 transition-colors"
            >
              <Users className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
              Staff Directory
            </button>

            <button
              id="header-btn-google-sheets"
              onClick={onConnectGoogle}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isGoogleConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/60'
                  : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/30'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              {isGoogleConnected ? 'Google Sheets Sync Active' : 'Connect Google Sheets'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Semi-Monthly Cutoff Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-1 pb-3 border-t border-slate-800/80 gap-3">
          {/* Main Module Tabs: DTR as primary landing page */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              id="nav-tab-dtr"
              onClick={() => onSelectTab('dtr')}
              className={`inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                currentTab === 'dtr'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 mr-1.5" />
              Daily Time Record (DTR)
            </button>

            <button
              id="nav-tab-payroll"
              onClick={() => onSelectTab('payroll')}
              className={`inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                currentTab === 'payroll'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PhilippinePeso className="w-4 h-4 mr-1.5" />
              Semi-Monthly Payroll
            </button>

            <button
              id="nav-tab-monthly"
              onClick={() => onSelectTab('monthly')}
              className={`inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                currentTab === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Monthly Salary Reports
            </button>
          </nav>

          {/* Semi-Monthly Cutoff Selector Controls */}
          <div className="flex flex-wrap items-center bg-slate-950/70 border border-slate-800 rounded-lg p-1 gap-2 text-xs">
            <div className="flex items-center px-2 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>Cutoff Period:</span>
            </div>

            {/* Month dropdown */}
            <select
              id="select-payroll-month"
              value={cutoffPeriod.month}
              onChange={(e) =>
                onCutoffChange(cutoffPeriod.year, parseInt(e.target.value, 10), cutoffPeriod.cutoff)
              }
              className="bg-slate-800 text-slate-200 text-xs rounded border border-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Year selector */}
            <select
              id="select-payroll-year"
              value={cutoffPeriod.year}
              onChange={(e) =>
                onCutoffChange(parseInt(e.target.value, 10), cutoffPeriod.month, cutoffPeriod.cutoff)
              }
              className="bg-slate-800 text-slate-200 text-xs rounded border border-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

            {/* Semi-Monthly Cutoff toggle: 1st (1-15) vs 2nd (16-End) */}
            <div className="inline-flex rounded-md p-0.5 bg-slate-800 border border-slate-700">
              <button
                id="btn-cutoff-first"
                type="button"
                onClick={() => onCutoffChange(cutoffPeriod.year, cutoffPeriod.month, 'first')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  cutoffPeriod.cutoff === 'first'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1st Cutoff (1st–15th)
              </button>
              <button
                id="btn-cutoff-second"
                type="button"
                onClick={() => onCutoffChange(cutoffPeriod.year, cutoffPeriod.month, 'second')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  cutoffPeriod.cutoff === 'second'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2nd Cutoff (16th–End)
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
