import React, { useState } from 'react';
import { X, UserPlus, Users, Edit2, Trash2, Check, ShieldCheck } from 'lucide-react';
import { Employee } from '../types';
import { calculateDailyHourly } from '../utils/sampleData';
import { formatPHP } from '../utils/philippinesPayroll';

interface EmployeeModalProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onClose: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [monthlyBasicSalary, setMonthlyBasicSalary] = useState<number>(30000);
  const [tin, setTin] = useState('');
  const [sssNumber, setSssNumber] = useState('');
  const [philHealthNumber, setPhilHealthNumber] = useState('');
  const [pagIbigNumber, setPagIbigNumber] = useState('');
  const [shiftIn, setShiftIn] = useState('08:00');
  const [shiftOut, setShiftOut] = useState('17:00');

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setIsAddingNew(false);
    setName(emp.name);
    setEmployeeCode(emp.employeeCode);
    setPosition(emp.position);
    setDepartment(emp.department);
    setMonthlyBasicSalary(emp.monthlyBasicSalary);
    setTin(emp.tin);
    setSssNumber(emp.sssNumber);
    setPhilHealthNumber(emp.philHealthNumber);
    setPagIbigNumber(emp.pagIbigNumber);
    setShiftIn(emp.standardShift.in);
    setShiftOut(emp.standardShift.out);
  };

  const startAddNew = () => {
    setEditingId(null);
    setIsAddingNew(true);
    setName('');
    setEmployeeCode(`PH-${1000 + employees.length + 1}`);
    setPosition('');
    setDepartment('Operations');
    setMonthlyBasicSalary(25000);
    setTin('123-456-789-000');
    setSssNumber('01-2345678-9');
    setPhilHealthNumber('01-234567890-1');
    setPagIbigNumber('1234-5678-9012');
    setShiftIn('08:00');
    setShiftOut('17:00');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rates = calculateDailyHourly(monthlyBasicSalary);

    if (isAddingNew) {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        employeeCode: employeeCode || `PH-${Date.now().toString().slice(-4)}`,
        name,
        position,
        department,
        monthlyBasicSalary,
        ...rates,
        standardShift: { in: shiftIn, out: shiftOut, lunchMinutes: 60 },
        tin,
        sssNumber,
        philHealthNumber,
        pagIbigNumber,
        status: 'active',
      };
      onAddEmployee(newEmp);
    } else if (editingId) {
      const existing = employees.find((e) => e.id === editingId);
      if (existing) {
        const updated: Employee = {
          ...existing,
          employeeCode,
          name,
          position,
          department,
          monthlyBasicSalary,
          ...rates,
          standardShift: { in: shiftIn, out: shiftOut, lunchMinutes: 60 },
          tin,
          sssNumber,
          philHealthNumber,
          pagIbigNumber,
        };
        onUpdateEmployee(updated);
      }
    }

    setIsAddingNew(false);
    setEditingId(null);
  };

  return (
    <div
      id="employee-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="employee-modal-content"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold">Staff Directory & Salary Rates</h3>
              <p className="text-xs text-slate-400">
                Manage employees, basic salaries, shifts, and statutory IDs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Action bar */}
          {!isAddingNew && !editingId && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">
                {employees.length} Active Staff Registered
              </span>
              <button
                id="btn-add-staff-modal"
                onClick={startAddNew}
                className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                Add New Staff
              </button>
            </div>
          )}

          {/* Form when adding or editing */}
          {(isAddingNew || editingId) && (
            <form onSubmit={handleSave} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">
                  {isAddingNew ? 'Register New Staff Member' : 'Edit Staff & Compensation Details'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="e.g. PH-1001"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Position / Role</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Monthly Basic Salary (PHP)
                  </label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={500}
                    value={monthlyBasicSalary}
                    onChange={(e) => setMonthlyBasicSalary(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Standard Shift (IN - OUT)</label>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      value={shiftIn}
                      onChange={(e) => setShiftIn(e.target.value)}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 font-mono"
                    />
                    <input
                      type="time"
                      value={shiftOut}
                      onChange={(e) => setShiftOut(e.target.value)}
                      className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">TIN (Tax ID Number)</label>
                  <input
                    type="text"
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                    placeholder="000-000-000-000"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">SSS Number</label>
                  <input
                    type="text"
                    value={sssNumber}
                    onChange={(e) => setSssNumber(e.target.value)}
                    placeholder="00-0000000-0"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">PhilHealth Number</label>
                  <input
                    type="text"
                    value={philHealthNumber}
                    onChange={(e) => setPhilHealthNumber(e.target.value)}
                    placeholder="00-000000000-0"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Employee
                </button>
              </div>
            </form>
          )}

          {/* Employees Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-right">Monthly Basic</th>
                  <th className="p-3 text-right">Daily Rate</th>
                  <th className="p-3 text-right">Hourly Rate</th>
                  <th className="p-3 text-center">Shift</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {emp.employeeCode} · {emp.position}
                      </div>
                    </td>
                    <td className="p-3">{emp.department}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {formatPHP(emp.monthlyBasicSalary)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {formatPHP(emp.dailyRate)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {formatPHP(emp.hourlyRate)}
                    </td>
                    <td className="p-3 text-center font-mono text-[11px] text-slate-600">
                      {emp.standardShift.in} - {emp.standardShift.out}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => startEdit(emp)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit employee"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
