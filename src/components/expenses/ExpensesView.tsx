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
  Fuel,
  Wrench,
  ShoppingBag,
  Boxes,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES, BRANDS } from '../../data/mockData';
import { ExpenseCategory, ExpenseRecord, BranchId, BrandId } from '../../types';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, totalExpenses, formatCurrency, t, language, setCurrentView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'with-invoice' | 'no-invoice'>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Form state for creating a new operating expense
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Transport & Delivery Fuel');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newBranch, setNewBranch] = useState<BranchId>('west-walk');
  const [newPaidTo, setNewPaidTo] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'card' | 'bank-transfer' | 'petty-cash'>('petty-cash');
  const [newHasInvoice, setNewHasInvoice] = useState<boolean>(false);
  const [newReceiptRef, setNewReceiptRef] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const categories: ExpenseCategory[] = [
    'Transport & Delivery Fuel',
    'Machine & Equipment Repairs',
    'Purchases Without Invoice (Cash)',
    'Small Things & Daily Supplies',
    'Utilities (Kahramaa)',
    'Cleaning & Sanitation',
    'Maintenance & Repairs',
    'Stationery & POS Paper',
    'Marketing & Ads',
    'Rent & Property',
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
    const matchesInvoice =
      invoiceFilter === 'all' ||
      (invoiceFilter === 'with-invoice' && e.hasInvoice !== false) ||
      (invoiceFilter === 'no-invoice' && (e.hasInvoice === false || e.category === 'Purchases Without Invoice (Cash)'));
    return matchesSearch && matchesCategory && matchesBranch && matchesInvoice;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newAmount <= 0) return;

    const fallbackRef = newHasInvoice
      ? `INV-${Math.floor(10000 + Math.random() * 90000)}`
      : `NO-INV-CASH-${Math.floor(100 + Math.random() * 900)}`;

    addExpense({
      title: newTitle.trim(),
      titleAr: newTitle.trim(),
      category: newCategory,
      amount: newAmount,
      date: new Date().toISOString().slice(0, 10),
      branchId: newBranch,
      paidTo: newPaidTo.trim() || (newHasInvoice ? 'Direct Vendor' : 'Local Cash Market / Supermarket'),
      paymentMethod: newPaymentMethod,
      receiptRef: newReceiptRef.trim() || fallbackRef,
      loggedBy: 'Branch Supervisor / Cashier',
      hasInvoice: newHasInvoice,
      notes: newNotes.trim() || undefined,
    });

    setIsExpenseModalOpen(false);
    setNewTitle('');
    setNewAmount(0);
    setNewPaidTo('');
    setNewReceiptRef('');
    setNewNotes('');
    setNewHasInvoice(false);
  };

  // Category totals
  const fuelTotal = expenses
    .filter((e) => e.category === 'Transport & Delivery Fuel')
    .reduce((sum, e) => sum + e.amount, 0);

  const machineRepairsTotal = expenses
    .filter((e) => e.category === 'Machine & Equipment Repairs')
    .reduce((sum, e) => sum + e.amount, 0);

  const noInvoiceAndSmallPurchasesTotal = expenses
    .filter(
      (e) =>
        e.category === 'Purchases Without Invoice (Cash)' ||
        e.category === 'Small Things & Daily Supplies' ||
        e.hasInvoice === false
    )
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold tracking-wide uppercase">
              {t('Operational Expenses (OPEX)', 'المصروفات التشغيلية الميدانية')}
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs text-zinc-500 dark:text-neutral-400">
              {t('Fuel, Machine Repairs, Cash Buys without invoice & Small Supplies', 'الوقود، صيانة الماكينات، مشتريات نقدية بدون فاتورة ونثريات')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('Operating Expenses & Cash Disbursements', 'سجل المصروفات التشغيلية والمشتريات النقدية')}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
            {t(
              'Track routine operational costs outside supplier purchases: delivery fuel, urgent machine repairs, cash market runs with no invoice, and small branch supplies.',
              'تسجيل النفقات اليومية خارج فواتير الموردين: وقود السيارات، تصليح ماكينات القهوة والقلايات، المشتريات النقدية بدون فاتورة والنثريات.'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setNewCategory('Transport & Delivery Fuel');
            setNewPaymentMethod('petty-cash');
            setNewHasInvoice(false);
            setIsExpenseModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('+ Record Operating Cost / Cash Buy', '+ تسجيل مصروف / مشترى نقدي')}</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total OPEX */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('Total OPEX Logged', 'إجمالي المصروفات')}</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {expenses.length} {t('operational entries recorded', 'سند وقيد تشغيلي مسجل')}
          </p>
        </div>

        {/* Card 2: Transport & Delivery Fuel */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-blue-200 dark:border-blue-900/50 shadow-xs bg-blue-50/20 dark:bg-blue-950/10">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('Fuel & Transport', 'وقود وبترول')}</span>
            <Fuel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-900 dark:text-blue-200 mt-1 tabular-nums">
            {formatCurrency(fuelTotal)}
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">
            {t('WOQOD petrol for delivery fleet & vans', 'بترول وقود لسيارات ودراجات التوصيل')}
          </p>
        </div>

        {/* Card 3: Machine & Equipment Repairs */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/50 shadow-xs bg-amber-50/20 dark:bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('Machine Repairs', 'تصليح الماكينات')}</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 dark:text-amber-200 mt-1 tabular-nums">
            {formatCurrency(machineRepairsTotal)}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
            {t('Espresso pumps, fryers, grinders & chillers', 'ماكينات القهوة، القلايات، المطاحن والثلاجات')}
          </p>
        </div>

        {/* Card 4: Purchases Without Invoice & Small Things */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/50 shadow-xs bg-rose-50/20 dark:bg-rose-950/10">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('No-Invoice & Small Buys', 'مشتريات نقدية ونثريات')}</span>
            <ShoppingBag className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-900 dark:text-rose-200 mt-1 tabular-nums">
            {formatCurrency(noInvoiceAndSmallPurchasesTotal)}
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
            {t('Emergency ice, local cash runs & tools', 'ثلج طارئ، مشتريات السوق كاش ومستلزمات فورية')}
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
            placeholder={t('Search expense title, fuel, machine repair, cash items...', 'بحث في الوقود، تصليح الماكينات، المشتريات النقدية...')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Invoice status filter */}
          <select
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold"
          >
            <option value="all">{t('All Document Types', 'كافة السندات')}</option>
            <option value="no-invoice">{t('⚡ Cash / No Invoice Only', '⚡ مشتريات بدون فاتورة فقط')}</option>
            <option value="with-invoice">{t('📄 Official Invoice Attached', '📄 بفاتورة رسمية')}</option>
          </select>

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
                <th className="py-3.5 px-4">{t('Voucher & Invoice Ref', 'رقم السند والفاتورة')}</th>
                <th className="py-3.5 px-4">{t('Description / Vendor', 'البيان والجهة')}</th>
                <th className="py-3.5 px-3">{t('Category', 'التصنيف')}</th>
                <th className="py-3.5 px-3">{t('Branch', 'الفرع')}</th>
                <th className="py-3.5 px-3">{t('Payment Method', 'طريقة الدفع')}</th>
                <th className="py-3.5 px-3 text-right">{t('Amount', 'المبلغ')}</th>
                <th className="py-3.5 px-4 text-right">{t('Date', 'التاريخ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 font-medium">
              {filteredExpenses.map((exp) => {
                const branch = BRANCHES.find((b) => b.id === exp.branchId);
                const isNoInvoice = exp.hasInvoice === false || exp.category === 'Purchases Without Invoice (Cash)';

                return (
                  <tr key={exp.id} className="hover:bg-zinc-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 block">
                        {exp.id}
                      </span>
                      {isNoInvoice ? (
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                          {t('⚡ No Invoice (Cash Run)', '⚡ بدون فاتورة (كاش)')}
                        </span>
                      ) : (
                        <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{exp.receiptRef}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                        {language === 'ar' ? exp.titleAr : exp.title}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-neutral-400">
                        {t('Paid to:', 'الجهة المستفيدة:')} {exp.paidTo}
                      </span>
                      {exp.notes && (
                        <span className="block text-[10px] text-zinc-400 mt-0.5 italic">
                          {exp.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          exp.category === 'Transport & Delivery Fuel'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : exp.category === 'Machine & Equipment Repairs'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : exp.category === 'Purchases Without Invoice (Cash)'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {exp.category === 'Transport & Delivery Fuel' && <Fuel className="w-3 h-3 shrink-0" />}
                        {exp.category === 'Machine & Equipment Repairs' && <Wrench className="w-3 h-3 shrink-0" />}
                        {exp.category === 'Purchases Without Invoice (Cash)' && <ShoppingBag className="w-3 h-3 shrink-0" />}
                        <span>{exp.category}</span>
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
                  {t('Record Operating Expense / Cash Purchase', 'تسجيل مصروف تشغيلي / مشترى نقدي')}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-neutral-400">
                  {t('Normal operational costs like fuel, machine repairs, small needs & cash buys without invoice', 'تكاليف الوقود، تصليح الماكينات، مشتريات نقدية بدون فاتورة ونثريات')}
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
              {/* Invoice Status Toggle: Has Official Invoice vs Cash Buy with No Invoice */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200 dark:border-neutral-700">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-2">
                  {t('Invoice Availability', 'حالة توفر الفاتورة')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewHasInvoice(false);
                      setNewPaymentMethod('petty-cash');
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-start gap-1 transition-all border ${
                      !newHasInvoice
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-neutral-800 border-zinc-200 dark:border-neutral-700 text-zinc-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>⚡ {t('No Invoice (Cash / Market)', 'بدون فاتورة (دفع كاش / سوق)')}</span>
                    </span>
                    <span className="text-[10px] opacity-85 font-normal">
                      {t('Small emergency buy, local market, ice', 'مشتريات طارئة، بقالة، ثلج')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewHasInvoice(true)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-start gap-1 transition-all border ${
                      newHasInvoice
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-neutral-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-neutral-800 border-zinc-200 dark:border-neutral-700 text-zinc-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>📄 {t('Official Invoice Attached', 'فاتورة رسمية متوفرة')}</span>
                    </span>
                    <span className="text-[10px] opacity-85 font-normal">
                      {t('Company receipt, Woqod, repair bill', 'سند كهرماء، وقود، تصليح معتمد')}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                  {t('Expense Title / Description', 'بيان المصروف')} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Woqod Fuel for delivery van / Espresso pump repair / Souq cash lemons & ice"
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
                    onChange={(e) => {
                      const cat = e.target.value as ExpenseCategory;
                      setNewCategory(cat);
                      if (cat === 'Purchases Without Invoice (Cash)') {
                        setNewHasInvoice(false);
                      }
                    }}
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
                    placeholder="e.g. 450"
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
                    {t('Paid To / Vendor / Market', 'الجهة المدفوع لها')}
                  </label>
                  <input
                    type="text"
                    value={newPaidTo}
                    onChange={(e) => setNewPaidTo(e.target.value)}
                    placeholder={newHasInvoice ? 'e.g. WOQOD / Doha Tech' : 'e.g. Souq Waqif / Al Meera / Cash Float'}
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
                    <option value="petty-cash">{t('Petty Cash / Float (صندوق النثرية والكاش)', 'صندوق النثرية والكاش')}</option>
                    <option value="card">{t('Company Card (بطاقة الشركة)', 'بطاقة الشركة')}</option>
                    <option value="bank-transfer">{t('Bank Transfer (تحويل بنكي)', 'تحويل بنكي')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {newHasInvoice ? t('Invoice / Receipt #', 'رقم الفاتورة') : t('Reference / Float Note', 'الرمز المرجعي')}
                  </label>
                  <input
                    type="text"
                    value={newReceiptRef}
                    onChange={(e) => setNewReceiptRef(e.target.value)}
                    placeholder={newHasInvoice ? 'e.g. INV-99120' : 'e.g. CASH-FLOAT-01'}
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                  {t('Operational Notes', 'ملاحظات وتفاصيل')}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Machine broke down on peak hours / Ran out of mint and bought 5 bunches with cash..."
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
                  {t('Save Operating Expense', 'حفظ المصروف')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
