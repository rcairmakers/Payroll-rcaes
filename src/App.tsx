import React, { useState, useMemo, useEffect } from 'react';
import { CutoffPeriod, DtrRecord, Employee, EmployeeCutoffPayroll, MonthlyEmployeeSalaryReport } from './types';
import {
  INITIAL_EMPLOYEES,
  createCutoffPeriod,
  generateInitialDtrForCutoff,
} from './utils/sampleData';
import {
  calculateEmployeeCutoffPayroll,
  calculateMonthlySSS,
  calculateMonthlyPhilHealth,
  calculateMonthlyPagIbig,
  calculateMonthlyWithholdingTax,
} from './utils/philippinesPayroll';
import { Header } from './components/Header';
import { DtrMainPage } from './components/DtrMainPage';
import { PayrollCutoffView } from './components/PayrollCutoffView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { PayslipModal } from './components/PayslipModal';
import { LaborLawReferenceModal } from './components/LaborLawReferenceModal';
import { EmployeeModal } from './components/EmployeeModal';
import { authenticateWithGoogle, getStoredGoogleToken } from './utils/googleSheets';

export default function App() {
  // Navigation: DTR as main page
  const [currentTab, setCurrentTab] = useState<'dtr' | 'payroll' | 'monthly'>('dtr');

  // Active Cutoff Period: Default to September 2026, 1st Cutoff
  const [cutoffPeriod, setCutoffPeriod] = useState<CutoffPeriod>(() =>
    createCutoffPeriod(2026, 9, 'first')
  );

  // Employees State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('ph_payroll_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved employees:', e);
      }
    }
    return INITIAL_EMPLOYEES;
  });

  // DTR Records State
  const [dtrRecords, setDtrRecords] = useState<DtrRecord[]>(() => {
    const saved = localStorage.getItem('ph_payroll_dtr_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved DTR:', e);
      }
    }
    // Generate initial sample DTR records for both 1st and 2nd cutoff of September 2026
    let initialRecords: DtrRecord[] = [];
    INITIAL_EMPLOYEES.forEach((emp) => {
      const c1 = generateInitialDtrForCutoff(emp, 2026, 9, 'first');
      const c2 = generateInitialDtrForCutoff(emp, 2026, 9, 'second');
      initialRecords = [...initialRecords, ...c1, ...c2];
    });
    return initialRecords;
  });

  // Modals
  const [selectedPayrollForPayslip, setSelectedPayrollForPayslip] =
    useState<EmployeeCutoffPayroll | null>(null);
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);
  const [isLaborLawsModalOpen, setIsLaborLawsModalOpen] = useState(false);

  // Google Sheets OAuth state
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(() => !!getStoredGoogleToken());

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ph_payroll_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('ph_payroll_dtr_records', JSON.stringify(dtrRecords));
  }, [dtrRecords]);

  // Handle Cutoff Period Switch
  const handleCutoffChange = (year: number, month: number, cutoff: 'first' | 'second') => {
    const newCutoff = createCutoffPeriod(year, month, cutoff);
    setCutoffPeriod(newCutoff);

    // Ensure DTR records exist for this cutoff
    setDtrRecords((prev) => {
      let updated = [...prev];
      employees.forEach((emp) => {
        const hasRecords = updated.some(
          (r) =>
            r.employeeId === emp.id &&
            r.date >= newCutoff.startDate &&
            r.date <= newCutoff.endDate
        );
        if (!hasRecords) {
          const generated = generateInitialDtrForCutoff(emp, year, month, cutoff);
          updated = [...updated, ...generated];
        }
      });
      return updated;
    });
  };

  // Update a single DTR Record
  const handleUpdateDtrRecord = (recordId: string, updates: Partial<DtrRecord>) => {
    setDtrRecords((prev) =>
      prev.map((rec) => (rec.id === recordId ? { ...rec, ...updates } : rec))
    );
  };

  // Batch Update DTR Records
  const handleBatchUpdateDtr = (newRecords: DtrRecord[]) => {
    setDtrRecords((prev) => {
      const idMap = new Map(newRecords.map((r) => [r.id, r]));
      return prev.map((r) => (idMap.has(r.id) ? idMap.get(r.id)! : r));
    });
  };

  // Employee management
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [...prev, newEmp]);
    // Generate initial DTR for this employee for active cutoffs
    const c1 = generateInitialDtrForCutoff(newEmp, cutoffPeriod.year, cutoffPeriod.month, 'first');
    const c2 = generateInitialDtrForCutoff(newEmp, cutoffPeriod.year, cutoffPeriod.month, 'second');
    setDtrRecords((prev) => [...prev, ...c1, ...c2]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
  };

  // Google OAuth connect
  const handleConnectGoogle = async () => {
    try {
      await authenticateWithGoogle();
      setIsGoogleConnected(true);
    } catch (err: any) {
      console.error('Google auth error:', err);
    }
  };

  // 1. Calculate Active Cutoff Payrolls
  const activeCutoffPayrolls = useMemo(() => {
    return employees.map((emp) => {
      const empDtr = dtrRecords.filter(
        (r) =>
          r.employeeId === emp.id &&
          r.date >= cutoffPeriod.startDate &&
          r.date <= cutoffPeriod.endDate
      );
      return calculateEmployeeCutoffPayroll(emp, empDtr, cutoffPeriod);
    });
  }, [employees, dtrRecords, cutoffPeriod]);

  // 2. Calculate 1st Cutoff Payrolls of active month
  const cutoff1Period = useMemo(
    () => createCutoffPeriod(cutoffPeriod.year, cutoffPeriod.month, 'first'),
    [cutoffPeriod.year, cutoffPeriod.month]
  );
  const cutoff1Payrolls = useMemo(() => {
    return employees.map((emp) => {
      const empDtr = dtrRecords.filter(
        (r) =>
          r.employeeId === emp.id &&
          r.date >= cutoff1Period.startDate &&
          r.date <= cutoff1Period.endDate
      );
      return calculateEmployeeCutoffPayroll(emp, empDtr, cutoff1Period);
    });
  }, [employees, dtrRecords, cutoff1Period]);

  // 3. Calculate 2nd Cutoff Payrolls of active month
  const cutoff2Period = useMemo(
    () => createCutoffPeriod(cutoffPeriod.year, cutoffPeriod.month, 'second'),
    [cutoffPeriod.year, cutoffPeriod.month]
  );
  const cutoff2Payrolls = useMemo(() => {
    return employees.map((emp) => {
      const empDtr = dtrRecords.filter(
        (r) =>
          r.employeeId === emp.id &&
          r.date >= cutoff2Period.startDate &&
          r.date <= cutoff2Period.endDate
      );
      return calculateEmployeeCutoffPayroll(emp, empDtr, cutoff2Period);
    });
  }, [employees, dtrRecords, cutoff2Period]);

  // 4. Calculate Consolidated Monthly Salary Reports
  const monthlyReports: MonthlyEmployeeSalaryReport[] = useMemo(() => {
    const c1Map = new Map<string, EmployeeCutoffPayroll>(
      cutoff1Payrolls.map((p) => [p.employeeId, p])
    );
    const c2Map = new Map<string, EmployeeCutoffPayroll>(
      cutoff2Payrolls.map((p) => [p.employeeId, p])
    );

    return employees.map((emp) => {
      const p1 = c1Map.get(emp.id);
      const p2 = c2Map.get(emp.id);

      const cutoff1Gross = p1 ? p1.grossPay : 0;
      const cutoff1Deductions = p1 ? p1.totalDeductions : 0;
      const cutoff1Net = p1 ? p1.netPay : 0;

      const cutoff2Gross = p2 ? p2.grossPay : 0;
      const cutoff2Deductions = p2 ? p2.totalDeductions : 0;
      const cutoff2Net = p2 ? p2.netPay : 0;

      const totalGrossPay = Math.round((cutoff1Gross + cutoff2Gross) * 100) / 100;

      // Full Month Statutory Calculations
      const monthlySSS = calculateMonthlySSS(emp.monthlyBasicSalary);
      const monthlyPhilHealth = calculateMonthlyPhilHealth(emp.monthlyBasicSalary);
      const monthlyPagIbig = calculateMonthlyPagIbig(emp.monthlyBasicSalary);

      const totalMonthlyStatutory_EE =
        Math.round(
          (monthlySSS.employeeShare + monthlyPhilHealth.employeeShare + monthlyPagIbig.employeeShare) * 100
        ) / 100;
      const totalMonthlyStatutory_ER =
        Math.round(
          (monthlySSS.employerShare + monthlyPhilHealth.employerShare + monthlyPagIbig.employerShare) * 100
        ) / 100;

      // Monthly Taxable Income & BIR TRAIN Withholding Tax
      const monthlyTaxableIncome = Math.max(0, totalGrossPay - totalMonthlyStatutory_EE);
      const monthlyWithholdingTax = calculateMonthlyWithholdingTax(monthlyTaxableIncome);

      const totalMonthlyDeductions = Math.round((totalMonthlyStatutory_EE + monthlyWithholdingTax) * 100) / 100;
      const totalMonthlyNetPay = Math.max(0, Math.round((totalGrossPay - totalMonthlyDeductions) * 100) / 100);
      const totalEmployerCost = Math.round((totalGrossPay + totalMonthlyStatutory_ER) * 100) / 100;

      // Total hours and lates across month
      const totalHoursWorked = (p1?.daysPresent ?? 0) * 8 + (p2?.daysPresent ?? 0) * 8;
      const totalLateMinutes = (p1?.totalLateMinutes ?? 0) + (p2?.totalLateMinutes ?? 0);
      const totalOvertimeHours = (p1?.totalOvertimeHours ?? 0) + (p2?.totalOvertimeHours ?? 0);

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        employeeCode: emp.employeeCode,
        position: emp.position,
        department: emp.department,
        monthlyBasic: emp.monthlyBasicSalary,
        cutoff1Gross,
        cutoff1Deductions,
        cutoff1Net,
        cutoff2Gross,
        cutoff2Deductions,
        cutoff2Net,
        totalHoursWorked,
        totalLateMinutes,
        totalOvertimeHours,
        totalGrossPay,
        monthlySSS_EE: monthlySSS.employeeShare,
        monthlySSS_ER: monthlySSS.employerShare,
        monthlyPhilHealth_EE: monthlyPhilHealth.employeeShare,
        monthlyPhilHealth_ER: monthlyPhilHealth.employerShare,
        monthlyPagIbig_EE: monthlyPagIbig.employeeShare,
        monthlyPagIbig_ER: monthlyPagIbig.employerShare,
        totalMonthlyStatutory_EE,
        totalMonthlyStatutory_ER,
        monthlyWithholdingTax,
        totalMonthlyDeductions,
        totalMonthlyNetPay,
        totalEmployerCost,
      };
    });
  }, [employees, cutoff1Payrolls, cutoff2Payrolls]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Sticky Global Header with Cutoff Controls */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        cutoffPeriod={cutoffPeriod}
        onCutoffChange={handleCutoffChange}
        onOpenEmployees={() => setIsEmployeesModalOpen(true)}
        onOpenLaborLaws={() => setIsLaborLawsModalOpen(true)}
        isGoogleConnected={isGoogleConnected}
        onConnectGoogle={handleConnectGoogle}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'dtr' && (
          <DtrMainPage
            cutoffPeriod={cutoffPeriod}
            employees={employees}
            dtrRecords={dtrRecords}
            onUpdateDtrRecord={handleUpdateDtrRecord}
            onBatchUpdateDtr={handleBatchUpdateDtr}
            onNavigateToPayroll={() => setCurrentTab('payroll')}
          />
        )}

        {currentTab === 'payroll' && (
          <PayrollCutoffView
            cutoffPeriod={cutoffPeriod}
            payrolls={activeCutoffPayrolls}
            onOpenPayslip={(payroll) => setSelectedPayrollForPayslip(payroll)}
            onNavigateToMonthly={() => setCurrentTab('monthly')}
            onNavigateToDtr={() => setCurrentTab('dtr')}
          />
        )}

        {currentTab === 'monthly' && (
          <MonthlyReportView
            cutoffPeriod={cutoffPeriod}
            employees={employees}
            monthlyReports={monthlyReports}
            cutoff1Payrolls={cutoff1Payrolls}
            cutoff2Payrolls={cutoff2Payrolls}
            allDtrRecords={dtrRecords}
            isGoogleConnected={isGoogleConnected}
            onConnectGoogle={handleConnectGoogle}
          />
        )}
      </main>

      {/* Modals */}
      <PayslipModal
        payroll={selectedPayrollForPayslip}
        onClose={() => setSelectedPayrollForPayslip(null)}
      />

      {isLaborLawsModalOpen && (
        <LaborLawReferenceModal onClose={() => setIsLaborLawsModalOpen(false)} />
      )}

      {isEmployeesModalOpen && (
        <EmployeeModal
          employees={employees}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onClose={() => setIsEmployeesModalOpen(false)}
        />
      )}
    </div>
  );
}
