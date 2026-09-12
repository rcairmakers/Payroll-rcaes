import React from 'react';
import { X, BookOpen, ShieldCheck, HeartPulse, Home, Building, FileCheck } from 'lucide-react';

interface LaborLawReferenceModalProps {
  onClose: () => void;
}

export const LaborLawReferenceModal: React.FC<LaborLawReferenceModalProps> = ({ onClose }) => {
  return (
    <div
      id="labor-law-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="labor-law-modal-content"
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold">Philippine Labor Laws & Statutory Tables</h3>
              <p className="text-xs text-slate-400">Rules applied in automatic payroll computations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          {/* SSS Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">
                1. SSS Contributions (Republic Act No. 11199)
              </h4>
            </div>
            <p className="text-slate-600">
              Under the Social Security Act of 2018 (RA 11199), the contribution rate is <strong>14%</strong> (Employee: <strong>4.5%</strong>, Employer: <strong>9.5%</strong>).
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong>Minimum Monthly Salary Credit (MSC):</strong> ₱4,000 (Min Employee share: ₱180.00 / month).
              </li>
              <li>
                <strong>Regular MSC Ceiling:</strong> ₱20,000 (Regular Employee share: ₱900.00 / month).
              </li>
              <li>
                <strong>WISP (Worker's Investment and Savings Program):</strong> Covers MSC from ₱20,000 up to ₱30,000 (Max Employee share: ₱450.00 / month).
              </li>
              <li>
                <strong>Maximum Combined SSS + WISP (EE):</strong> ₱1,350.00 / month (₱675.00 semi-monthly).
              </li>
              <li>
                <strong>EC (Employees' Compensation):</strong> ₱10 for MSC ≤ ₱14,500; ₱30 for MSC &gt; ₱14,500 (100% Employer paid).
              </li>
            </ul>
          </div>

          {/* PhilHealth Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center space-x-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-bold text-slate-900">
                2. PhilHealth Premiums (Republic Act No. 11223)
              </h4>
            </div>
            <p className="text-slate-600">
              Universal Health Care Act (UHC) mandates a <strong>5.0%</strong> monthly premium rate, shared equally between Employee (<strong>2.5%</strong>) and Employer (<strong>2.5%</strong>).
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong>Income Floor:</strong> ₱10,000 (Minimum monthly premium ₱500; Employee share ₱250.00).
              </li>
              <li>
                <strong>Income Ceiling:</strong> ₱100,000 (Maximum monthly premium ₱5,000; Employee share ₱2,500.00).
              </li>
              <li>
                <strong>Semi-Monthly Deduction:</strong> 50% split per cutoff (e.g., ₱125.00 min to ₱1,250.00 max).
              </li>
            </ul>
          </div>

          {/* Pag-IBIG Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center space-x-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">
                3. Pag-IBIG / HDMF Contributions (Republic Act No. 9679)
              </h4>
            </div>
            <p className="text-slate-600">
              Effective February 2024, the maximum monthly compensation base was increased from ₱5,000 to <strong>₱10,000</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong>Employee Share:</strong> 2% of basic salary capped at ₱10,000 = <strong>₱200.00 / month</strong> (₱100.00 per semi-monthly cutoff).
              </li>
              <li>
                <strong>Employer Share:</strong> 2% capped at ₱10,000 = <strong>₱200.00 / month</strong>.
              </li>
            </ul>
          </div>

          {/* BIR TRAIN Withholding Tax Table */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">
                4. BIR Withholding Tax on Compensation (TRAIN Law - RA 10963)
              </h4>
            </div>
            <p className="text-slate-600">
              Applied on <strong>Taxable Compensation</strong> (Gross Pay minus SSS, PhilHealth, and Pag-IBIG employee shares).
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                <thead>
                  <tr className="bg-slate-200/80 text-slate-800 font-bold">
                    <th className="p-2 border border-slate-300">Semi-Monthly Taxable Income</th>
                    <th className="p-2 border border-slate-300">Prescribed Withholding Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">Up to ₱10,417</td>
                    <td className="p-2 border border-slate-300 font-bold text-emerald-700">
                      ₱0.00 (Tax Exempt - ₱250k Annual Exemption)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">₱10,417 – ₱16,666</td>
                    <td className="p-2 border border-slate-300 font-mono">
                      15% in excess over ₱10,417
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">₱16,667 – ₱33,332</td>
                    <td className="p-2 border border-slate-300 font-mono">
                      ₱937.50 + 20% in excess over ₱16,667
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">₱33,333 – ₱83,332</td>
                    <td className="p-2 border border-slate-300 font-mono">
                      ₱4,270.70 + 25% in excess over ₱33,333
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">₱83,333 – ₱333,332</td>
                    <td className="p-2 border border-slate-300 font-mono">
                      ₱16,770.70 + 30% in excess over ₱83,333
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">Over ₱333,332</td>
                    <td className="p-2 border border-slate-300 font-mono">
                      ₱91,770.70 + 35% in excess over ₱333,332
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* DOLE Hours of Work & Overtime */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                5. Hours of Work & Overtime (Labor Code PD 442, Art. 83–87)
              </h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong>Standard Workday:</strong> 8 hours per day exclusive of 1 hour unpaid meal break.
              </li>
              <li>
                <strong>Regular Overtime (Art. 87):</strong> Work performed beyond 8 regular hours is paid at the regular hourly rate plus at least <strong>25%</strong> (1.25x).
              </li>
              <li>
                <strong>Daily / Hourly Factor (DOLE):</strong> Monthly Basic × 12 months / 261 days factor (for Monday to Friday staff) = Daily Rate. Hourly Rate = Daily Rate / 8.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
