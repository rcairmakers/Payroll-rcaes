# Philippine Payroll & DTR Management System

A comprehensive, DOLE & BIR TRAIN compliant Philippine Payroll and Daily Time Record (DTR) web application built with React, TypeScript, and Tailwind CSS, featuring automated statutory deductions (SSS, PhilHealth, Pag-IBIG), withholding tax computation, printable employee payslips, and multi-tab Google Sheets salary report export.

---

## 🌟 Key Features

### 1. Daily Time Record (DTR) Main Landing Page
- **Real-Time Clock In / Out**: Instant one-click **TIME IN** and **TIME OUT** with Philippine Standard Time (PST) and optional manual adjustments.
- **Semi-Monthly Cutoff Attendance**: Standard DOLE semi-monthly periods (**1st Cutoff: 1st–15th** and **2nd Cutoff: 16th–End of Month**).
- **Direct Cell Editing & Fast Weekday Autofill**: Easily adjust employee timestamps; compute daily total hours, tardiness (late minutes), undertime, and overtime hours.
- **Attendance Status Badging**: Visual indicators for Present, Late, Absent, Rest Day, and Regular/Special Holidays.

### 2. Philippine Statutory Deductions Engine
- **SSS (Republic Act No. 11199)**: 14% contribution schedule (4.5% Employee / 9.5% Employer) based on the ₱4,000–₱30,000 Monthly Salary Credit (MSC), including the mandatory WISP (Worker's Investment and Savings Program) and Employer EC fund.
- **PhilHealth (Republic Act No. 11223 - UHC)**: 5.0% premium rate split equally (2.5% Employee / 2.5% Employer) between the statutory ₱10,000 floor and ₱100,000 ceiling.
- **Pag-IBIG / HDMF (Republic Act No. 9679)**: 2024 updated ₱10,000 monthly compensation cap (₱200/month maximum employee contribution, split across cutoffs).
- **BIR Withholding Tax (TRAIN Law - RA 10963)**: Graduated semi-monthly and monthly withholding tax tables applied against taxable compensation (Gross Pay minus SSS, PhilHealth, and Pag-IBIG employee shares), accounting for the ₱250,000 annual exemption.

### 3. Semi-Monthly Cutoff Payroll & Printable Payslips
- **Payroll Register**: Itemizes basic pay, late/undertime deductions, overtime earnings (125% rate), statutory contributions, tax withholding, and net salary.
- **Official Employee Payslips**: Clean, printable salary vouchers adhering to DOLE standards with company-paid employer contribution transparency.

### 4. Consolidated Monthly Reports & Google Sheets Export
- **Monthly Consolidation**: Aggregates 1st and 2nd semi-monthly cutoffs into a unified monthly summary with total government remittance liabilities (SSS, PhilHealth, Pag-IBIG, and BIR Form 1601-C).
- **Multi-Tab Google Sheets Export**: Direct Google OAuth export creating a structured Google Spreadsheet in Google Drive containing:
  - `Monthly Salary Report`
  - `1st Cutoff Register`
  - `2nd Cutoff Register`
  - `DTR Attendance Logs`
- **CSV Download**: One-click CSV export for offline spreadsheets and accounting software import.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/philippine-payroll-dtr.git

# Navigate into the project directory
cd philippine-payroll-dtr

# Install dependencies
npm install
```

### Environment Variables
Copy `.env.example` to `.env` (optional for Google Sheets OAuth client ID):
```bash
cp .env.example .env
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📋 Technology Stack
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Integration**: Google Sheets API & Google Drive API v3 (OAuth 2.0)

---

## ⚖️ Compliance & Statutory References
- **Labor Code of the Philippines (PD 442)**: Articles 83–87 (Normal Hours of Work, Overtime, Meal Periods)
- **Republic Act No. 11199**: Social Security Act of 2018
- **Republic Act No. 11223**: Universal Health Care Act (PhilHealth)
- **Republic Act No. 9679**: Home Development Mutual Fund Law of 2009 (Pag-IBIG)
- **Republic Act No. 10963**: Tax Reform for Acceleration and Inclusion (TRAIN Law)
