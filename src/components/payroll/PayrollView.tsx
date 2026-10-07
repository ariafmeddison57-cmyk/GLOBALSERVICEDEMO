import React, { useState } from 'react';
import {
  WalletCards,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Clock,
  ShieldCheck,
  FileCode,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PAYROLL_RECORDS } from '../../data/mockData';
import { PayrollRecord } from '../../types';

export const PayrollView: React.FC = () => {
  const { formatCurrency, t, language, isRTL, playSound } = useApp();

  const [records, setRecords] = useState<PayrollRecord[]>(PAYROLL_RECORDS);
  const [isSifModalOpen, setIsSifModalOpen] = useState(false);
  const [payrollStatus, setPayrollStatus] = useState<'pending' | 'processed'>('pending');

  const totalBasic = records.reduce((sum, r) => sum + r.basicSalary, 0);
  const totalAllowances = records.reduce((sum, r) => sum + r.allowances, 0);
  const totalSalaries = totalBasic + totalAllowances;
  const totalOtCost = records.reduce((sum, r) => sum + r.overtimePay, 0);
  const totalPayrollDue = records.reduce((sum, r) => sum + r.netPay, 0);

  const handleProcessPayroll = () => {
    playSound('success');
    setPayrollStatus('processed');
    setRecords((prev) => prev.map((r) => ({ ...r, wpsStatus: 'Processed' })));
  };

  // Generate realistic Qatar Central Bank WPS SIF file content
  const sifContent = [
    `HDR,K-OS_HOSPITALITY_GROUP_QATAR,CR104928,${new Date().toISOString().slice(0, 10).replace(/-/g, '')},${records.length},${totalPayrollDue.toFixed(2)},QAR,QNB`,
    ...records.map(
      (r, i) =>
        `DTR,${(i + 1).toString().padStart(4, '0')},${r.employeeName.toUpperCase()},${r.bankIban},${r.netPay.toFixed(2)},${r.basicSalary.toFixed(2)},${(r.allowances + r.overtimePay).toFixed(2)},0.00,SALARY_OCT_2026`
    ),
  ].join('\n');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('Payroll & Qatar WPS Compliance', 'مسير الرواتب ونظام حماية الأجور (WPS)')}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t(
              'Automated salary computation, biometric overtime integration, and Ministry of Labour SIF file generation.',
              'احتساب تلقائي للرواتب وساعات الإضافي واستخراج ملف نظام حماية الأجور لوزارة العمل القطرية.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSifModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-2 border border-neutral-200 dark:border-neutral-700"
          >
            <FileCode className="w-4 h-4 text-amber-600" />
            <span>{t('View WPS .SIF File', 'معاينة ملف SIF البنكي')}</span>
          </button>

          <button
            onClick={handleProcessPayroll}
            disabled={payrollStatus === 'processed'}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-400 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {payrollStatus === 'processed'
                ? t('Payroll Dispatched to QNB', 'تم إرسال المسير للبنك')
                : t('Approve & Run Payroll', 'اعتماد وصرف الرواتب')}
            </span>
          </button>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Payroll Due (Net Payable)', 'صافي مسير الرواتب المستحق')}</span>
            <WalletCards className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatCurrency(totalPayrollDue)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('100% Qatar WPS Validated', 'مطابق لمعايير مصرف قطر المركزي')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Total Base Salaries & Allowances', 'إجمالي الرواتب الأساسية والبدلات')}</span>
            <Building2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatCurrency(totalSalaries)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {records.length} {t('Active employee contracts', 'عقود موظفين سارية')}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Overtime Cost (OT)', 'تكلفة العمل الإضافي (OT)')}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {formatCurrency(totalOtCost)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {records.reduce((s, r) => s + r.overtimeHours, 0)} {t('Hours across 5 branches', 'ساعة في الفروع الخمسة')}
          </div>
        </div>
      </div>

      {/* Main Payroll Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4">{t('Employee', 'الموظف')}</th>
                <th className="py-3 px-4">{t('Role & Designation', 'المسمى')}</th>
                <th className="py-3 px-3 text-right">{t('Basic Salary', 'الأساسي')}</th>
                <th className="py-3 px-3 text-right">{t('Allowances', 'البدلات')}</th>
                <th className="py-3 px-3 text-right">{t('OT Hours & Pay', 'الإضافي')}</th>
                <th className="py-3 px-3 text-right">{t('Net Pay', 'صافي الراتب')}</th>
                <th className="py-3 px-4 text-center">{t('WPS Bank Status', 'حالة حماية الأجور')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {records.map((rec) => (
                <tr key={rec.employeeId} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">{rec.employeeName}</div>
                    <div className="text-[10px] font-mono text-neutral-400 mt-0.5">{rec.bankIban}</div>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                    {rec.role}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                    {formatCurrency(rec.basicSalary)}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-medium tabular-nums text-neutral-600 dark:text-neutral-400">
                    {formatCurrency(rec.allowances)}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                      {formatCurrency(rec.overtimePay)}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {rec.overtimeHours} hrs logged
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {formatCurrency(rec.netPay)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        rec.wpsStatus === 'Processed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : rec.wpsStatus === 'Ready'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}
                    >
                      {rec.wpsStatus === 'Processed' && <CheckCircle2 className="w-3 h-3" />}
                      {rec.wpsStatus === 'Ready' && <ShieldCheck className="w-3 h-3" />}
                      {rec.wpsStatus === 'Flagged' && <AlertTriangle className="w-3 h-3" />}
                      <span>{rec.wpsStatus}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIF File Modal */}
      {isSifModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border dark:border-neutral-800">
            <div className="flex items-center justify-between border-b dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-600" />
                  <span>{t('Qatar Wage Protection SIF File Export', 'ملف نظام حماية الأجور (SIF)')}</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Qatar Central Bank (QCB) & Ministry of Administrative Development, Labour and Social Affairs compliant.
                </p>
              </div>
              <button onClick={() => setIsSifModalOpen(false)}>
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <div className="bg-neutral-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-64 space-y-1">
              <pre className="whitespace-pre">{sifContent}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500">
                Filename: <code className="font-mono font-bold">KOS_WPS_202610_SIF.csv</code>
              </span>
              <button
                onClick={() => {
                  playSound('beep');
                  setIsSifModalOpen(false);
                }}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('Download SIF File', 'تنزيل الملف')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
