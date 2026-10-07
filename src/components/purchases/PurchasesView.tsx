import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  Search,
  ExternalLink,
  Filter,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { PurchaseOrder } from '../../types';

export const PurchasesView: React.FC = () => {
  const { purchases, addPurchaseOrder, formatCurrency, t, language, isRTL } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New PO Form state
  const [newSupplier, setNewSupplier] = useState('Baladna Food Industries QPSC');
  const [newItemsSummary, setNewItemsSummary] = useState('');
  const [newQuantity, setNewQuantity] = useState('200');
  const [newAmount, setNewAmount] = useState('2800');
  const [newDestination, setNewDestination] = useState<PurchaseOrder['branchDestination']>('main-store');

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
  const pendingDeliveries = purchases.filter((p) => p.status === 'In Transit' || p.status === 'Ordered').length;
  const uniqueSuppliers = new Set(purchases.map((p) => p.supplier)).size;

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemsSummary.trim()) return;

    addPurchaseOrder({
      supplier: newSupplier,
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
      quantityTotal: parseInt(newQuantity) || 100,
      amount: parseFloat(newAmount) || 1500,
      status: 'Ordered',
      itemsSummary: newItemsSummary,
      branchDestination: newDestination,
    });

    setIsModalOpen(false);
    setNewItemsSummary('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('Purchasing & Supplier Procurement', 'المشتريات وسلاسل التوريد')}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t(
              'Purchase orders directly link to commissary inventory replenishment and cost ledger.',
              'أوامر الشراء المباشرة تغذي مستودع التوريد المركزي وتحدّث تكلفة البضاعة في النظام.'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('+ Create Purchase Order', '+ إنشاء أمر شراء جديد')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Total Purchases (Month)', 'إجمالي المشتريات الشهرية')}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatCurrency(totalPurchasesAmount)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {purchases.length} {t('Total Invoices on file', 'فواتير مسجلة')}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Pending Deliveries', 'شحنات قيد التوريد والتسليم')}</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {pendingDeliveries} {t('Shipments', 'شحنات')}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {t('Expected within 48-72 hours', 'متوقع وصولها خلال ٤٨-٧٢ ساعة')}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Active Supplier Count', 'عدد الموردين المعتمدين')}</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {uniqueSuppliers} {t('Suppliers', 'موردين')}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {t('Baladna, Coffee Planet, Gulf Pkg, Al Meera', 'بلدنا، كوفي بلانيت، والميرة')}
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search supplier or invoice...', 'ابحث عن مورد أو رقم فاتورة...')}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto self-start sm:self-auto py-1">
            {['all', 'Delivered', 'In Transit', 'Ordered', 'Pending Approval'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {st === 'all'
                  ? t('All Statuses', 'كافة الحالات')
                  : st === 'Delivered'
                  ? t('Delivered', 'تم الاستلام')
                  : st === 'In Transit'
                  ? t('In Transit', 'بالطريق')
                  : st === 'Ordered'
                  ? t('Ordered', 'تم الطلب')
                  : t('Pending Approval', 'بانتظار الموافقة')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4">{t('PO / Invoice', 'رقم الفاتورة')}</th>
                <th className="py-3 px-4">{t('Supplier Name', 'اسم المورد')}</th>
                <th className="py-3 px-4">{t('Items Summary', 'تفاصيل الأصناف')}</th>
                <th className="py-3 px-3">{t('Date', 'التاريخ')}</th>
                <th className="py-3 px-3 text-right">{t('Quantity', 'الكمية')}</th>
                <th className="py-3 px-3 text-right">{t('Amount', 'المبلغ')}</th>
                <th className="py-3 px-4 text-center">{t('Status', 'الحالة')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {filteredPurchases.map((po) => (
                <tr key={po.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{po.id}</span>
                    <div className="text-[11px] font-mono text-neutral-400">{po.invoiceNumber}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">{po.supplier}</div>
                    <div className="text-[11px] text-neutral-400">
                      {t('Destination', 'الوجهة')}: {BRANCHES.find((b) => b.id === po.branchDestination)?.name}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300 max-w-xs truncate">
                    {po.itemsSummary}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-neutral-500 whitespace-nowrap">
                    {po.date}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                    {po.quantityTotal.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(po.amount)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        po.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : po.status === 'In Transit'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                          : po.status === 'Ordered'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {po.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                      {po.status === 'In Transit' && <Truck className="w-3 h-3" />}
                      {po.status === 'Ordered' && <Clock className="w-3 h-3" />}
                      <span>{po.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border dark:border-neutral-800">
            <div className="flex items-center justify-between border-b dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{t('New Vendor Purchase Order', 'إنشاء أمر شراء مورد جديد')}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {t('Supplier / Vendor', 'المورد المعتمد')}
                </label>
                <select
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                >
                  <option value="Baladna Food Industries QPSC">Baladna Food Industries QPSC (Dairy)</option>
                  <option value="Coffee Planet Qatar LLC">Coffee Planet Qatar LLC (Beans)</option>
                  <option value="Gulf Packaging & Cartons WLL">Gulf Packaging & Cartons WLL (Cups/Boxes)</option>
                  <option value="Al Meera Wholesale Distribution">Al Meera Wholesale Distribution (Dry)</option>
                  <option value="Al Watania Food Logistics">Al Watania Food Logistics (Fries/Potato)</option>
                  <option value="Taiwan Tea & Boba Supply Co.">Taiwan Tea & Boba Supply Co. (Boba/Tea)</option>
                  <option value="French Bakery Essentials Qatar">French Bakery Essentials Qatar (Butter/Flour)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {t('Items & SKU Description', 'بيان الأصناف والكمية')}
                </label>
                <input
                  type="text"
                  required
                  value={newItemsSummary}
                  onChange={(e) => setNewItemsSummary(e.target.value)}
                  placeholder="e.g. 500L Baladna Whole Milk & Heavy Cream"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Quantity Units', 'الكمية الإجمالية')}
                  </label>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Total Amount (QAR)', 'المبلغ الإجمالي (ريال قطري)')}
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {t('Delivery Destination Hub', 'مستودع الاستلام')}
                </label>
                <select
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value as PurchaseOrder['branchDestination'])}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  {t('Issue Purchase Order', 'اعتماد وإصدار الأمر')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
