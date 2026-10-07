import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Receipt,
  Building,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Building2,
  TrendingDown,
  X,
  PieChart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES, BRANDS } from '../../data/mockData';
import { ExpenseCategory, ExpenseRecord, BranchId, BrandId } from '../../types';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, totalExpenses, formatCurrency, t, language, setCurrentView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Form state for creating a new non-stock expense
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Utilities (Kahramaa)');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newBranch, setNewBranch] = useState<BranchId>('west-walk');
  const [newPaidTo, setNewPaidTo] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'card' | 'bank-transfer' | 'petty-cash'>('bank-transfer');
  const [newReceiptRef, setNewReceiptRef] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const categories: ExpenseCategory[] = [
    'Utilities (Kahramaa)',
    'Rent & Property',
    'Cleaning & Sanitation',
    'Maintenance & Repairs',
    'Marketing & Ads',
    'Stationery & POS Paper',
    'Transport & Delivery Fuel',
    'Staff Uniforms',
    'Licenses & Government',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.receiptRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesBranch = selectedBranch === 'all' || e.branchId === selectedBranch;
    return matchesSearch && matchesCategory && matchesBranch;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newAmount <= 0) return;

    addExpense({
      title: newTitle.trim(),
      titleAr: newTitle.trim(),
      category: newCategory,
      amount: newAmount,
      date: new Date().toISOString().slice(0, 10),
      branchId: newBranch,
      paidTo: newPaidTo.trim() || 'Direct Vendor',
      paymentMethod: newPaymentMethod,
      receiptRef: newReceiptRef.trim() || `RCP-${Math.floor(10000 + Math.random() * 90000)}`,
      loggedBy: 'Finance / Branch Lead',
      notes: newNotes.trim() || undefined,
    });

    setIsExpenseModalOpen(false);
    setNewTitle('');
    setNewAmount(0);
    setNewPaidTo('');
    setNewReceiptRef('');
    setNewNotes('');
  };

  // Category breakdown calculations
  const utilitiesTotal = expenses
    .filter((e) => e.category === 'Utilities (Kahramaa)')
    .reduce((sum, e) => sum + e.amount, 0);
  const maintenanceTotal = expenses
    .filter((e) => e.category === 'Maintenance & Repairs' || e.category === 'Cleaning & Sanitation')
    .reduce((sum, e) => sum + e.amount, 0);
  const marketingTotal = expenses
    .filter((e) => e.category === 'Marketing & Ads')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-[10px] font-bold tracking-wide uppercase">
              {t('Non-Stock OPEX & Overheads', 'المصروفات التشغيلية العامة')}
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs text-zinc-500 dark:text-neutral-400">
              {t('Independent from recipe/food stock costs', 'مستقلة عن تكلفة مشتريات المواد الغذائية')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('Operating Expenses & Overheads Ledger', 'سجل المصروفات العامة والنفقات التشغيلية')}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
            {t(
              'Track Kahramaa utilities, maintenance, marketing, POS paper, uniforms, and licenses across all branches.',
              'تسجيل ومتابعة فواتير كهرماء، الصيانة، التسويق، مستلزمات الفروع والتراخيص.'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('+ Record New Expense', '+ تسجيل مصروف جديد')}</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Total OPEX (MTD)', 'إجمالي المصروفات')}
          </span>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {expenses.length} {t('recorded non-stock vouchers', 'سندات مصروفات')}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Utilities (Kahramaa)', 'كهرماء (كهرباء وماء)')}
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(utilitiesTotal)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {t('All 5 locations active meter readings', 'قراءات العدادات لكافة الفروع')}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Marketing & Digital Ads', 'التسويق والإعلانات')}
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(marketingTotal)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {t('Foodie creators & social campaigns', 'حملات المشاهير ومنصات التواصل')}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Maintenance & Sanitation', 'الصيانة والنظافة')}
          </span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {formatCurrency(maintenanceTotal)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {t('Hood duct cleaning & espresso servicing', 'تنظيف المداخن وصيانة الماكينات')}
          </p>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search expense title, vendor, invoice #...', 'بحث في المصروفات، المورد، رقم الفاتورة...')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium"
          >
            <option value="all">{t('All Expense Categories', 'كافة التصنيفات')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium"
          >
            <option value="all">{t('All Locations', 'كافة الفروع')}</option>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Expenses Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-zinc-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-neutral-800/60 border-b border-zinc-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-4">{t('Voucher ID', 'رقم السند')}</th>
                <th className="py-3.5 px-4">{t('Description / Vendor', 'البيان / الجهة')}</th>
                <th className="py-3.5 px-3">{t('Category', 'التصنيف')}</th>
                <th className="py-3.5 px-3">{t('Branch', 'الفرع')}</th>
                <th className="py-3.5 px-3">{t('Method', 'طريقة الدفع')}</th>
                <th className="py-3.5 px-3 text-right">{t('Amount', 'المبلغ')}</th>
                <th className="py-3.5 px-4 text-right">{t('Date', 'التاريخ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 font-medium">
              {filteredExpenses.map((exp) => {
                const branch = BRANCHES.find((b) => b.id === exp.branchId);

                return (
                  <tr key={exp.id} className="hover:bg-zinc-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                      {exp.id}
                      <span className="block text-[10px] text-zinc-400 font-normal">{exp.receiptRef}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                        {language === 'ar' ? exp.titleAr : exp.title}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-neutral-400">
                        {t('Paid to:', 'الجهة المستفيدة:')} {exp.paidTo}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-zinc-600 dark:text-neutral-400">
                      {branch?.name}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase text-zinc-500">
                        <CreditCard className="w-3 h-3" />
                        <span>{exp.paymentMethod}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-sm text-neutral-900 dark:text-white font-mono">
                      {formatCurrency(exp.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-zinc-400 font-mono text-[11px]">
                      {exp.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. RECORD NEW EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('Record Operating Expense (Non-Stock)', 'تسجيل مصروف تشغيلي جديد')}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-neutral-400">
                  {t('Purchases like utilities, repairs, ads, uniforms or supplies', 'شراء مواد غير مخزنية كفواتير الخدمات والصيانة والإعلانات')}
                </p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-neutral-800 text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                  {t('Expense Title / Description', 'بيان المصروف')} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Kahramaa Electricity Bill / Espresso Descaling Service"
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Category', 'التصنيف')}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Amount (QAR)', 'المبلغ بالريال')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newAmount || ''}
                    onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1500"
                    className="w-full p-2.5 text-xs font-bold font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Branch Destination', 'الفرع المعني')}
                  </label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value as BranchId)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Paid To / Vendor', 'الجهة المدفوع لها')}
                  </label>
                  <input
                    type="text"
                    value={newPaidTo}
                    onChange={(e) => setNewPaidTo(e.target.value)}
                    placeholder="e.g. Kahramaa / Apex Media"
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Payment Method', 'طريقة الدفع')}
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as 'card' | 'bank-transfer' | 'petty-cash')}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="bank-transfer">Bank Transfer (تحويل بنكي)</option>
                    <option value="card">Company Card (بطاقة الشركة)</option>
                    <option value="petty-cash">Petty Cash (صندوق النثرية)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Receipt / Invoice #', 'رقم الفاتورة / الإيصال')}
                  </label>
                  <input
                    type="text"
                    value={newReceiptRef}
                    onChange={(e) => setNewReceiptRef(e.target.value)}
                    placeholder="e.g. INV-2026-99"
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                  {t('Notes & Justification', 'ملاحظات')}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional internal remarks for the auditing team..."
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900"
                >
                  {t('Save Expense', 'حفظ المصروف')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
