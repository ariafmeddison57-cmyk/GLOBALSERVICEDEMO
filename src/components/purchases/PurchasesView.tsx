import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  DollarSign,
  Search,
  ExternalLink,
  Filter,
  X,
  FileText,
  Check,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  Eye,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { PurchaseOrder } from '../../types';

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    addPurchaseOrder,
    updatePurchaseOrderStatus,
    updatePurchaseOrder,
    formatCurrency,
    t,
    language,
    isRTL,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoForDetails, setSelectedPoForDetails] = useState<PurchaseOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New PO Form state
  const [newSupplier, setNewSupplier] = useState('Baladna Food Industries QPSC');
  const [newItemsSummary, setNewItemsSummary] = useState('');
  const [newQuantity, setNewQuantity] = useState('200');
  const [newAmount, setNewAmount] = useState('2800');
  const [newDestination, setNewDestination] = useState<PurchaseOrder['branchDestination']>('main-store');
  const [newInitialStatus, setNewInitialStatus] = useState<PurchaseOrder['status']>('Pending Approval');

  // Details / Edit modal state
  const [detailModalStatus, setDetailModalStatus] = useState<PurchaseOrder['status']>('Pending Approval');
  const [detailModalNotes, setDetailModalNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
  const pendingDeliveries = purchases.filter((p) => p.status === 'In Transit' || p.status === 'Ordered').length;
  const pendingApprovals = purchases.filter((p) => p.status === 'Pending Approval').length;
  const uniqueSuppliers = new Set(purchases.map((p) => p.supplier)).size;

  // Counts for each status filter badge
  const statusCounts = {
    all: purchases.length,
    'Pending Approval': purchases.filter((p) => p.status === 'Pending Approval').length,
    Ordered: purchases.filter((p) => p.status === 'Ordered').length,
    'In Transit': purchases.filter((p) => p.status === 'In Transit').length,
    Delivered: purchases.filter((p) => p.status === 'Delivered').length,
    Rejected: purchases.filter((p) => p.status === 'Rejected').length,
  };

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || p.branchDestination === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
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
      status: newInitialStatus,
      itemsSummary: newItemsSummary,
      branchDestination: newDestination,
    });

    setIsModalOpen(false);
    setNewItemsSummary('');
    showToast(
      t(
        `Purchase order created with status "${newInitialStatus}"`,
        `تم إنشاء أمر الشراء بحالة "${newInitialStatus}"`
      )
    );
  };

  const handleQuickStatusChange = (po: PurchaseOrder, newStatus: PurchaseOrder['status']) => {
    updatePurchaseOrderStatus(po.id, newStatus);
    showToast(
      t(
        `Order ${po.id} status manually updated to "${newStatus}"`,
        `تم تغيير حالة أمر الشراء ${po.id} يدوياً إلى "${newStatus}"`
      )
    );
  };

  const openDetailsModal = (po: PurchaseOrder) => {
    setSelectedPoForDetails(po);
    setDetailModalStatus(po.status);
    setDetailModalNotes(po.notes || '');
  };

  const handleSaveModalStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForDetails) return;

    updatePurchaseOrderStatus(selectedPoForDetails.id, detailModalStatus, detailModalNotes);
    showToast(
      t(
        `Order ${selectedPoForDetails.id} updated to "${detailModalStatus}"`,
        `تم تحديث أمر الشراء ${selectedPoForDetails.id} إلى "${detailModalStatus}"`
      )
    );
    setSelectedPoForDetails(null);
  };

  const getStatusBadgeClasses = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'In Transit':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'Ordered':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-800';
      case 'Pending Approval':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700';
    }
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'In Transit':
        return <Truck className="w-3.5 h-3.5" />;
      case 'Ordered':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Pending Approval':
        return <Clock className="w-3.5 h-3.5" />;
      case 'Rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const isFiltersActive = statusFilter !== 'all' || branchFilter !== 'all' || searchQuery.trim().length > 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-neutral-700 dark:border-neutral-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('Purchaces', 'المشتريات')}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t(
              'Manage supplier orders, manually approve or adjust order statuses, and monitor central replenishment.',
              'إدارة أوامر الشراء، وتعديل حالات الاعتماد يدوياً، ومتابعة سلسلة التوريد المركزية.'
            )}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('+ Create Purchase Order', '+ إنشاء أمر شراء جديد')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
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

        {/* Clickable Pending Approvals Card */}
        <div
          onClick={() => setStatusFilter('Pending Approval')}
          className={`bg-white dark:bg-neutral-900 border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all shadow-xs ${
            statusFilter === 'Pending Approval'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-amber-400'
          }`}
          title={t('Click to filter pending approvals', 'اضغط للتصفية حسب الطلبات بانتظار الاعتماد')}
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {t('Pending Approval', 'بانتظار الاعتماد')}
            </span>
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {pendingApprovals} {t('Orders', 'أوامر')}
          </div>
          <div className="mt-1 text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium flex items-center justify-between">
            <span>{t('Requires manager sign-off', 'تتطلب اعتماد المدير')}</span>
            <span className="text-[10px] underline font-semibold">{t('Filter', 'تصفية')} &rarr;</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('In Transit & Ordered', 'شحنات قيد التوريد والتسليم')}</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 tabular-nums">
            {pendingDeliveries} {t('Shipments', 'شحنات')}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {t('Expected within 48-72 hours', 'متوقع وصولها خلال ٤٨-٧٢ ساعة')}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Active Suppliers', 'عدد الموردين المعتمدين')}</span>
            <Building2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {uniqueSuppliers} {t('Suppliers', 'موردين')}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 truncate">
            {t('Baladna, Coffee Planet, Gulf Pkg, Al Meera', 'بلدنا، كوفي بلانيت، والميرة')}
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Filters & Manual Approval Filter Controls */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          {/* Top Filter Bar: Search + Manual Status Dropdown + Branch Dropdown + Reset */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search supplier, PO number, invoice, or items...', 'ابحث عن مورد، أمر شراء، فاتورة، أو صنف...')}
                className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Manual Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Manual Approval Status Dropdown */}
              <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0">
                  {t('Status Filter:', 'تصفية الحالة:')}
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-semibold bg-transparent text-neutral-900 dark:text-neutral-100 outline-none cursor-pointer pr-1"
                >
                  <option value="all" className="dark:bg-neutral-900">{t('All Statuses', 'كافة الحالات')} ({statusCounts.all})</option>
                  <option value="Pending Approval" className="dark:bg-neutral-900 text-amber-600 font-bold">
                    ⏳ {t('Pending Approval', 'بانتظار الموافقة')} ({statusCounts['Pending Approval']})
                  </option>
                  <option value="Ordered" className="dark:bg-neutral-900">
                    ✓ {t('Ordered (Approved)', 'معتمد / تم الطلب')} ({statusCounts.Ordered})
                  </option>
                  <option value="In Transit" className="dark:bg-neutral-900">
                    🚚 {t('In Transit', 'بالطريق')} ({statusCounts['In Transit']})
                  </option>
                  <option value="Delivered" className="dark:bg-neutral-900">
                    ✓✓ {t('Delivered', 'تم الاستلام')} ({statusCounts.Delivered})
                  </option>
                  <option value="Rejected" className="dark:bg-neutral-900 text-rose-600">
                    ✕ {t('Rejected', 'مرفوض')} ({statusCounts.Rejected})
                  </option>
                </select>
              </div>

              {/* Branch / Destination Filter */}
              <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="text-xs font-semibold bg-transparent text-neutral-900 dark:text-neutral-100 outline-none cursor-pointer pr-1"
                >
                  <option value="all" className="dark:bg-neutral-900">{t('All Destination Hubs', 'كافة الوجهات')}</option>
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id} className="dark:bg-neutral-900">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters */}
              {isFiltersActive && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setBranchFilter('all');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                  title={t('Clear all filters', 'إعادة ضبط كافة الفلاتر')}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('Reset', 'إعادة ضبط')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            {[
              { id: 'all', label: t('All', 'الكل'), count: statusCounts.all, color: 'neutral' },
              {
                id: 'Pending Approval',
                label: t('Pending Approval', 'بانتظار الاعتماد'),
                count: statusCounts['Pending Approval'],
                color: 'amber',
              },
              { id: 'Ordered', label: t('Approved / Ordered', 'معتمد / تم الطلب'), count: statusCounts.Ordered, color: 'sky' },
              { id: 'In Transit', label: t('In Transit', 'بالطريق'), count: statusCounts['In Transit'], color: 'blue' },
              { id: 'Delivered', label: t('Delivered', 'تم الاستلام'), count: statusCounts.Delivered, color: 'emerald' },
              { id: 'Rejected', label: t('Rejected', 'مرفوض'), count: statusCounts.Rejected, color: 'rose' },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-900'
                        : tab.id === 'Pending Approval' && tab.count > 0
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
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
                <th className="py-3 px-3">{t('Date & Expected', 'التاريخ')}</th>
                <th className="py-3 px-3 text-right">{t('Quantity', 'الكمية')}</th>
                <th className="py-3 px-3 text-right">{t('Amount', 'المبلغ')}</th>
                <th className="py-3 px-4 text-center min-w-[210px]">{t('Approval & Status', 'حالة الاعتماد والتوريد')}</th>
                <th className="py-3 px-4 text-right min-w-[140px]">{t('Manual Actions', 'إجراءات يدوية')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {t('No purchase orders match this filter', 'لا توجد أوامر شراء مطابقة لهذا الفلتر')}
                      </p>
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setBranchFilter('all');
                          setSearchQuery('');
                        }}
                        className="text-xs text-amber-600 hover:underline font-semibold"
                      >
                        {t('Reset filters', 'إعادة ضبط الفلاتر')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const isPending = po.status === 'Pending Approval';

                  return (
                    <tr
                      key={po.id}
                      className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                        isPending ? 'bg-amber-50/20 dark:bg-amber-950/5' : ''
                      }`}
                    >
                      {/* PO ID & Invoice */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{po.id}</span>
                          {isPending && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Needs Approval" />
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400">{po.invoiceNumber}</div>
                      </td>

                      {/* Supplier & Destination Hub */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-neutral-100">{po.supplier}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-neutral-400" />
                          <span>
                            {t('Destination', 'الوجهة')}:{' '}
                            {BRANCHES.find((b) => b.id === po.branchDestination)?.name || po.branchDestination}
                          </span>
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300 max-w-xs">
                        <p className="truncate font-medium">{po.itemsSummary}</p>
                        {po.notes && (
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 italic truncate mt-0.5">
                            {t('Note:', 'ملاحظة:')} {po.notes}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 font-mono text-neutral-500 whitespace-nowrap">
                        <div>{po.date}</div>
                        <div className="text-[10px] text-neutral-400">
                          {t('Exp:', 'المتوقع:')} {po.expectedDelivery}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-3 text-right font-mono font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                        {po.quantityTotal.toLocaleString()}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(po.amount)}
                      </td>

                      {/* Manual Approval Status Selector */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          {/* Interactive Status Selector Dropdown */}
                          <div className="relative inline-flex items-center">
                            <select
                              value={po.status}
                              onChange={(e) =>
                                handleQuickStatusChange(po, e.target.value as PurchaseOrder['status'])
                              }
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 cursor-pointer outline-none appearance-none pr-6 ${getStatusBadgeClasses(
                                po.status
                              )}`}
                              title={t('Click to manually change status', 'اضغط لتغيير الحالة يدوياً')}
                            >
                              <option value="Pending Approval" className="dark:bg-neutral-900 text-amber-600 font-bold">
                                ⏳ {t('Pending Approval', 'بانتظار الموافقة')}
                              </option>
                              <option value="Ordered" className="dark:bg-neutral-900 text-sky-600 font-bold">
                                ✓ {t('Ordered (Approved)', 'معتمد / تم الطلب')}
                              </option>
                              <option value="In Transit" className="dark:bg-neutral-900 text-blue-600 font-bold">
                                🚚 {t('In Transit', 'بالطريق')}
                              </option>
                              <option value="Delivered" className="dark:bg-neutral-900 text-emerald-600 font-bold">
                                ✓✓ {t('Delivered', 'تم الاستلام')}
                              </option>
                              <option value="Rejected" className="dark:bg-neutral-900 text-rose-600 font-bold">
                                ✕ {t('Rejected', 'مرفوض')}
                              </option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none opacity-60" />
                          </div>

                          {/* Approval metadata hint */}
                          {po.approvedBy && (
                            <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                              {t('Signed by', 'معتمد من')}: {po.approvedBy}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quick Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              {/* Quick Approve Button */}
                              <button
                                onClick={() => handleQuickStatusChange(po, 'Ordered')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                title={t('Manually Approve this purchase order', 'اعتماد أمر الشراء يدوياً')}
                              >
                                <Check className="w-3 h-3" />
                                <span>{t('Approve', 'اعتماد')}</span>
                              </button>

                              {/* Quick Reject Button */}
                              <button
                                onClick={() => handleQuickStatusChange(po, 'Rejected')}
                                className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 font-medium text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                title={t('Reject this purchase order', 'رفض أمر الشراء')}
                              >
                                <X className="w-3 h-3" />
                                <span>{t('Reject', 'رفض')}</span>
                              </button>
                            </>
                          ) : (
                            <>
                              {po.status === 'Ordered' && (
                                <button
                                  onClick={() => handleQuickStatusChange(po, 'In Transit')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900 dark:text-blue-300 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                  title={t('Mark as In Transit', 'تحديث: في الطريق')}
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>{t('Dispatch', 'شحن')}</span>
                                </button>
                              )}
                              {po.status === 'In Transit' && (
                                <button
                                  onClick={() => handleQuickStatusChange(po, 'Delivered')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                  title={t('Mark as Delivered to Commissary', 'تأكيد الاستلام بالمستودع')}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{t('Receive', 'استلام')}</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* Details / Edit Modal Trigger */}
                          <button
                            onClick={() => openDetailsModal(po)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title={t('View order details & edit status', 'عرض التفاصيل وتعديل الحالة')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Manual Status Change Modal */}
      {selectedPoForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <span>{selectedPoForDetails.id}</span>
                    <span className="text-xs text-neutral-400 font-mono">({selectedPoForDetails.invoiceNumber})</span>
                  </h3>
                  <p className="text-xs text-neutral-500">{selectedPoForDetails.supplier}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoForDetails(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PO Summary Card */}
            <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-neutral-500">
                <span>{t('Items Summary', 'الأصناف:')}</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right max-w-[240px]">
                  {selectedPoForDetails.itemsSummary}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-500">
                <span>{t('Total Quantity', 'الكمية:')}</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {selectedPoForDetails.quantityTotal.toLocaleString()} units
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-500">
                <span>{t('Total Invoice Amount', 'قيمة الفاتورة:')}</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  {formatCurrency(selectedPoForDetails.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-500">
                <span>{t('Destination Hub', 'مستودع الاستلام:')}</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {BRANCHES.find((b) => b.id === selectedPoForDetails.branchDestination)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-500">
                <span>{t('Date Issued', 'تاريخ الإصدار:')}</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">{selectedPoForDetails.date}</span>
              </div>
            </div>

            {/* Manual Status Modification Section */}
            <form onSubmit={handleSaveModalStatus} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-2 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('Change Approval & Order Status Manually', 'تعديل حالة الاعتماد والتوريد يدوياً')}</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'Pending Approval' as PurchaseOrder['status'],
                      label: t('Pending Approval', 'بانتظار الموافقة'),
                      desc: t('Awaiting management approval', 'قيد مراجعة واعتماد الإدارة'),
                      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                      icon: Clock,
                    },
                    {
                      id: 'Ordered' as PurchaseOrder['status'],
                      label: t('Ordered (Approved)', 'معتمد / تم الطلب'),
                      desc: t('PO signed and sent to vendor', 'تم اعتماد الطلب وإرساله للمورد'),
                      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
                      icon: ShieldCheck,
                    },
                    {
                      id: 'In Transit' as PurchaseOrder['status'],
                      label: t('In Transit', 'بالطريق'),
                      desc: t('Dispatched by supplier', 'في طريقها للتوصيل'),
                      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
                      icon: Truck,
                    },
                    {
                      id: 'Delivered' as PurchaseOrder['status'],
                      label: t('Delivered', 'تم الاستلام'),
                      desc: t('Received at hub inventory', 'تم الاستلام والفرز في المستودع'),
                      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                      icon: CheckCircle2,
                    },
                    {
                      id: 'Rejected' as PurchaseOrder['status'],
                      label: t('Rejected', 'مرفوض'),
                      desc: t('Declined by manager', 'تم رفض الطلب أو إلغاؤه'),
                      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                      icon: XCircle,
                    },
                  ].map((option) => {
                    const isSelected = detailModalStatus === option.id;
                    const IconComponent = option.icon;

                    return (
                      <div
                        key={option.id}
                        onClick={() => setDetailModalStatus(option.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-neutral-900 dark:border-white bg-neutral-900/5 dark:bg-white/5 ring-1 ring-neutral-900 dark:ring-white'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white text-white dark:text-neutral-950'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
                            <IconComponent className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{option.label}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{option.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval Notes */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {t('Approval / Status Notes', 'ملاحظات الاعتماد والتحديث')}
                </label>
                <input
                  type="text"
                  value={detailModalNotes}
                  onChange={(e) => setDetailModalNotes(e.target.value)}
                  placeholder={t('e.g. Approved by Head of Ops per weekly budget', 'مثال: معتمد من مدير العمليات')}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedPoForDetails(null)}
                  className="py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('Save Status Change', 'حفظ تغيير الحالة')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{t('New Vendor Purchase Order', 'إنشاء أمر شراء مورد جديد')}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
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
                  <option value="Meat Master Qatar">Meat Master Qatar (Wagyu Beef & Poultry)</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Delivery Destination', 'مستودع الاستلام')}
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

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Initial Status', 'الحالة المبدئية')}
                  </label>
                  <select
                    value={newInitialStatus}
                    onChange={(e) => setNewInitialStatus(e.target.value as PurchaseOrder['status'])}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 outline-none font-semibold"
                  >
                    <option value="Pending Approval">⏳ {t('Pending Approval', 'بانتظار الموافقة')}</option>
                    <option value="Ordered">✓ {t('Ordered (Approved)', 'معتمد / تم الطلب')}</option>
                    <option value="In Transit">🚚 {t('In Transit', 'بالطريق')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
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
