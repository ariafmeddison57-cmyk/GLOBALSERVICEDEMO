import React from 'react';
import { Coffee, ReceiptText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';

export const StaffConsumptionView: React.FC = () => {
  const { staffConsumptionRecords, t, formatCurrency } = useApp();
  const totalCost = staffConsumptionRecords.reduce((sum, record) => sum + record.cost, 0);
  const totalItems = staffConsumptionRecords.reduce((sum, record) => sum + record.quantity, 0);

  return <div className="space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold">{t('Staff Consumption Records', 'سجل استهلاك الموظفين')}</h2>
        <p className="text-xs text-neutral-500 mt-1">{t('Items taken by employees from POS, kept separate from customer sales.', 'الأصناف التي يأخذها الموظفون من نقطة البيع، منفصلة عن مبيعات العملاء.')}</p>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30 px-3 py-2 text-xs font-semibold text-violet-800 dark:text-violet-200">
        <Coffee className="w-4 h-4" />{t('Internal staff use', 'استخدام داخلي للموظفين')}
      </div>
    </div>

    <div className="grid sm:grid-cols-3 gap-3">
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"><div className="text-xs text-neutral-500">{t('Consumption records', 'سجلات الاستهلاك')}</div><div className="text-2xl font-bold mt-1">{staffConsumptionRecords.length}</div></div>
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"><div className="text-xs text-neutral-500">{t('Items consumed', 'الأصناف المستهلكة')}</div><div className="text-2xl font-bold mt-1">{totalItems}</div></div>
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"><div className="text-xs text-neutral-500">{t('Internal cost', 'التكلفة الداخلية')}</div><div className="text-2xl font-bold mt-1">{formatCurrency(totalCost)}</div></div>
    </div>

    <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2"><ReceiptText className="w-4 h-4 text-violet-600" /><h3 className="text-sm font-bold">{t('Consumption history', 'سجل الاستهلاك')}</h3></div>
        <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200 text-[10px] font-bold">{staffConsumptionRecords.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 uppercase text-[10px]"><tr>
            <th className="p-3">{t('Employee', 'الموظف')}</th><th className="p-3">{t('Items', 'الأصناف')}</th><th className="p-3">{t('Quantity', 'الكمية')}</th><th className="p-3">{t('Branch', 'الفرع')}</th><th className="p-3">{t('Internal Cost', 'التكلفة الداخلية')}</th><th className="p-3">{t('Recorded by / time', 'المسجل / الوقت')}</th>
          </tr></thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {staffConsumptionRecords.length === 0 ? <tr><td colSpan={6} className="p-10 text-center"><Coffee className="w-8 h-8 mx-auto text-neutral-300 mb-2" /><div className="font-semibold text-neutral-600 dark:text-neutral-300">{t('No staff items recorded yet', 'لم يتم تسجيل أصناف للموظفين بعد')}</div><div className="text-neutral-400 mt-1">{t('Staff POS orders will appear here.', 'ستظهر هنا طلبات الموظفين المسجلة من نقطة البيع.')}</div></td></tr> : staffConsumptionRecords.map((record) => (
              <tr key={record.id}>
                <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100">{record.staffName}</td>
                <td className="p-3">{record.items.map((item) => `${item.product.name} ×${item.quantity}`).join(', ')}</td>
                <td className="p-3 font-mono">{record.quantity}</td>
                <td className="p-3">{BRANCHES.find((branch) => branch.id === record.branchId)?.name || record.branchId}</td>
                <td className="p-3 font-mono font-bold">{formatCurrency(record.cost)}</td>
                <td className="p-3"><span className="block">{record.loggedBy}</span><span className="text-neutral-500">{record.createdAt.toLocaleString()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>;
};
