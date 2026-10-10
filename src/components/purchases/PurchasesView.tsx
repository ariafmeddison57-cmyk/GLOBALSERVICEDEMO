import React, { useState } from 'react';
import {
  PackageCheck,
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
  RotateCcw,
  ShieldCheck,
  Eye,
  Edit3,
  Calendar,
  Layers,
  Boxes,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { InventoryItem, PurchaseOrder } from '../../types';

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    addPurchaseOrder,
    updatePurchaseOrderStatus,
    updatePurchaseOrder,
    inventory,
    addInventoryItem,
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

  // New Purchase Form state
  // Item specification mode: 'assign' = assign existing inventory SKU, 'manual' = manual description / first-time purchase
  const [itemEntryMode, setItemEntryMode] = useState<'assign' | 'manual'>('assign');
  const [manualItemName, setManualItemName] = useState('');
  const [manualCategory, setManualCategory] = useState<InventoryItem['category']>('Dairy & Fresh');
  const [manualUnit, setManualUnit] = useState<InventoryItem['unit']>('kg');
  const [autoAddToInventory, setAutoAddToInventory] = useState(true);

  const [newTargetInventoryId, setNewTargetInventoryId] = useState<string>('');
  const [newSupplier, setNewSupplier] = useState('Baladna Food Industries');
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [newItemsSummary, setNewItemsSummary] = useState('');
  const [newQuantity, setNewQuantity] = useState('100');
  const [newAmount, setNewAmount] = useState('1500');
  const [newDestination, setNewDestination] = useState<PurchaseOrder['branchDestination']>('west-walk');
  const [newInitialStatus, setNewInitialStatus] = useState<PurchaseOrder['status']>('Delivered');
  const [newExpiryDate, setNewExpiryDate] = useState<string>(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newBatchNumber, setNewBatchNumber] = useState('');

  // Details / Edit modal state
  const [detailModalStatus, setDetailModalStatus] = useState<PurchaseOrder['status']>('Delivered');
  const [detailModalNotes, setDetailModalNotes] = useState('');
  const [detailModalExpiryDate, setDetailModalExpiryDate] = useState('');
  const [detailModalBatchNumber, setDetailModalBatchNumber] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
  const pendingApprovals = purchases.filter((p) => p.status === 'Pending Approval').length;
  const orderedPurchases = purchases.filter((p) => p.status === 'Ordered').length;
  const deliveredPurchases = purchases.filter((p) => p.status === 'Delivered').length;

  // Counts for each status filter badge (NO 'In Transit')
  const statusCounts = {
    all: purchases.length,
    'Pending Approval': pendingApprovals,
    Ordered: orderedPurchases,
    Delivered: deliveredPurchases,
    Rejected: purchases.filter((p) => p.status === 'Rejected').length,
  };

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || p.branchDestination === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleSelectInventorySKU = (itemId: string) => {
    setNewTargetInventoryId(itemId);
    if (!itemId) return;
    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      setNewSupplier(item.supplier || 'Baladna Food Industries');
      setNewItemsSummary(`${item.name} (${item.unit})`);
      setNewDestination(item.location);
      const suggestedQty = item.minReorderLevel > 0 ? item.minReorderLevel * 2 : 50;
      setNewQuantity(suggestedQty.toString());
      setNewAmount(Math.round(suggestedQty * item.unitCost).toString());
      if (item.expiryDate) {
        setNewExpiryDate(item.expiryDate);
      }
    }
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const finalItemDescription =
      itemEntryMode === 'manual' ? manualItemName.trim() : newItemsSummary.trim();

    if (!finalItemDescription) return;

    const qty = parseInt(newQuantity) || 1;
    const totalAmt = parseFloat(newAmount) || 0;
    const unitPrice = qty > 0 ? parseFloat((totalAmt / qty).toFixed(2)) : 10;
    const isDelivered = newInitialStatus === 'Delivered';

    let assignedInventoryId =
      itemEntryMode === 'assign' ? newTargetInventoryId || undefined : undefined;
    let createdAsNewBatch = false;

    // Check Case: An item is assigned or entered with a different expiry date from already existing stock
    // Rule: "if an item is entered but has different expirey with the already in invetory item it shoukd be asigned as a new item"
    if (itemEntryMode === 'assign' && newTargetInventoryId) {
      const existingItem = inventory.find((i) => i.id === newTargetInventoryId);
      if (
        existingItem &&
        existingItem.expiryDate &&
        newExpiryDate &&
        existingItem.expiryDate !== newExpiryDate
      ) {
        // Different expiry date: Assign as a separate new inventory item
        const baseName = existingItem.name
          .replace(/\s*\(Batch.*?\)/gi, '')
          .replace(/\s*\(Exp:.*?\)/gi, '')
          .replace(/\s*\[Batch.*?\]/gi, '')
          .trim();
        const batchSuffix = newBatchNumber.trim()
          ? `(Batch ${newBatchNumber.trim()} • Exp: ${newExpiryDate})`
          : `(Exp: ${newExpiryDate})`;
        const newBatchItemName = `${baseName} ${batchSuffix}`;

        const newBatchItem = addInventoryItem({
          name: newBatchItemName,
          nameAr: newBatchItemName,
          brandIds: existingItem.brandIds,
          category: existingItem.category,
          unit: existingItem.unit,
          openingStock: 0,
          purchased: qty,
          used: 0,
          closingStock: isDelivered ? qty : 0,
          actualClosingStock: isDelivered ? qty : undefined,
          minReorderLevel: existingItem.minReorderLevel,
          unitCost: unitPrice || existingItem.unitCost,
          location: newDestination,
          expiryDate: newExpiryDate,
          batchNumber: newBatchNumber.trim() || undefined,
          supplier: newSupplier.trim() || existingItem.supplier,
          lastPurchaseRef: newInvoiceNumber.trim() || undefined,
        });

        assignedInventoryId = newBatchItem.id;
        createdAsNewBatch = true;
      }
    } else if (itemEntryMode === 'manual' && autoAddToInventory) {
      // Check if item with this name already exists in inventory with a different expiry
      const matchingExisting = inventory.find(
        (i) => i.name.toLowerCase().trim() === manualItemName.toLowerCase().trim()
      );

      let finalName = manualItemName.trim();
      if (
        matchingExisting &&
        matchingExisting.expiryDate &&
        newExpiryDate &&
        matchingExisting.expiryDate !== newExpiryDate
      ) {
        const batchSuffix = newBatchNumber.trim()
          ? `(Batch ${newBatchNumber.trim()} • Exp: ${newExpiryDate})`
          : `(Exp: ${newExpiryDate})`;
        finalName = `${manualItemName.trim()} ${batchSuffix}`;
        createdAsNewBatch = true;
      }

      const newItem = addInventoryItem({
        name: finalName,
        nameAr: finalName,
        brandIds: ['kahwatee', 'kinda'],
        category: manualCategory,
        unit: manualUnit,
        openingStock: 0,
        purchased: qty,
        used: 0,
        closingStock: isDelivered ? qty : 0,
        actualClosingStock: isDelivered ? qty : undefined,
        minReorderLevel: Math.max(5, Math.round(qty * 0.2)),
        unitCost: unitPrice,
        location: newDestination,
        expiryDate: newExpiryDate,
        batchNumber: newBatchNumber.trim() || undefined,
        supplier: newSupplier.trim() || 'Baladna Food Industries',
        lastPurchaseRef: newInvoiceNumber.trim() || undefined,
      });
      if (newItem && newItem.id) {
        assignedInventoryId = newItem.id;
      }
    }

    addPurchaseOrder({
      supplier: newSupplier,
      invoiceNumber: newInvoiceNumber.trim() || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
      quantityTotal: qty,
      amount: totalAmt,
      status: newInitialStatus,
      itemsSummary: finalItemDescription,
      branchDestination: newDestination,
      targetInventoryItemId: assignedInventoryId,
      expiryDate: newExpiryDate || undefined,
      batchNumber: newBatchNumber.trim() || undefined,
    });

    setIsModalOpen(false);
    setNewItemsSummary('');
    setManualItemName('');
    setNewInvoiceNumber('');
    setNewBatchNumber('');
    setNewTargetInventoryId('');

    showToast(
      createdAsNewBatch
        ? t(
            `Different expiry detected: Created and assigned as a new inventory batch item (${newExpiryDate})!`,
            `تم رصد تاريخ صلاحية مختلف: تم إنشاء الصنف كدفعة جديدة في المخزون (${newExpiryDate})!`
          )
        : itemEntryMode === 'manual' && autoAddToInventory
        ? t(
            `Purchase recorded & new SKU "${manualItemName.trim()}" added to inventory with batch expiry ${newExpiryDate}!`,
            `تم تسجيل المشترى وإضافة الصنف الجديد "${manualItemName.trim()}" للمخزون بصلاحية ${newExpiryDate}!`
          )
        : t(
            `Purchase recorded! Expiry date ${newExpiryDate} applied to inventory item.`,
            `تم تسجيل المشترى بنجاح! تم تعيين تاريخ الصلاحية ${newExpiryDate} للمخزون.`
          )
    );
  };

  const handleQuickStatusChange = (po: PurchaseOrder, newStatus: PurchaseOrder['status']) => {
    updatePurchaseOrderStatus(po.id, newStatus);
    showToast(
      t(
        `Purchase ${po.id} status manually updated to "${newStatus}"`,
        `تم تغيير حالة المشترى ${po.id} يدوياً إلى "${newStatus}"`
      )
    );
  };

  const openDetailsModal = (po: PurchaseOrder) => {
    setSelectedPoForDetails(po);
    setDetailModalStatus(po.status);
    setDetailModalNotes(po.notes || '');
    setDetailModalExpiryDate(po.expiryDate || '');
    setDetailModalBatchNumber(po.batchNumber || '');
  };

  const handleSaveModalStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForDetails) return;

    updatePurchaseOrder(selectedPoForDetails.id, {
      status: detailModalStatus,
      notes: detailModalNotes,
      expiryDate: detailModalExpiryDate || undefined,
      batchNumber: detailModalBatchNumber.trim() || undefined,
    });

    if (detailModalStatus !== selectedPoForDetails.status) {
      updatePurchaseOrderStatus(selectedPoForDetails.id, detailModalStatus, detailModalNotes);
    }

    showToast(
      t(
        `Purchase ${selectedPoForDetails.id} updated! Expiry and status saved to inventory.`,
        `تم تحديث المشترى ${selectedPoForDetails.id}! تم حفظ الصلاحية والحالة في المخزون.`
      )
    );
    setSelectedPoForDetails(null);
  };

  const getStatusBadgeClasses = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
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
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold tracking-wide uppercase">
              {t('Ordered Goods Ledger', 'سجل البضائع الموردة')}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('Batch Expiry Assigned Directly to Inventory', 'تواريخ الصلاحية تنتقل مباشرة إلى المخزون')}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('Purchases', 'المشتريات')}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t(
              'Record ordered goods received from suppliers, log batch shelf-life expiration dates, and reconcile inventory stock.',
              'تسجيل البضائع الموردة المستلمة من الموردين، وإدخال تواريخ انتهاء صلاحية الشحنات لترحيلها للمخزون.'
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setNewTargetInventoryId('');
            setNewInitialStatus('Delivered');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('+ Create Purchase', '+ تسجيل مشترى جديد')}</span>
        </button>
      </div>

      {/* 4 Summary Cards (NO In Transit) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases MTD */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Total Purchases (MTD)', 'إجمالي المشتريات')}</span>
            <DollarSign className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatCurrency(totalPurchasesAmount)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {purchases.length} {t('recorded purchase invoices', 'سندات مشتريات مسجلة')}
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Pending Approval' ? 'all' : 'Pending Approval')}
          className="cursor-pointer bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold">{t('Pending Approval', 'بانتظار الاعتماد')}</span>
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {pendingApprovals} {t('Purchases', 'مشتريات')}
          </div>
          <div className="mt-1 text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
            {t('Awaiting manager sign-off', 'تتطلب اعتماد الإدارة')}
          </div>
        </div>

        {/* Ordered (Approved) */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Ordered' ? 'all' : 'Ordered')}
          className="cursor-pointer bg-white dark:bg-neutral-900 border border-sky-200 dark:border-sky-900/40 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-sky-400 transition-colors"
        >
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-semibold">{t('Ordered & Confirmed', 'مؤكدة / تم الطلب')}</span>
            <ShieldCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-600 tabular-nums">
            {orderedPurchases} {t('Shipments', 'شحنات')}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {t('Supplier confirmed order', 'تم التأكيد مع المورد')}
          </div>
        </div>

        {/* Delivered & Stocked */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Delivered' ? 'all' : 'Delivered')}
          className="cursor-pointer bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold">{t('Delivered & Stocked', 'تم الاستلام والمطابقة')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {deliveredPurchases} {t('Batches', 'شحنات')}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400 font-medium">
            {t('Transferred to inventory ledger', 'تم ترحيلها إلى المخزون')}
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search supplier, invoice #, SKU, or batch...', 'ابحث عن مورد، رقم فاتورة، صنف، أو رقم دفعة...')}
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

            {/* Filter Selectors (NO In Transit) */}
            <div className="flex flex-wrap items-center gap-2">
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
                  <option value="Ordered" className="dark:bg-neutral-900 text-sky-600">
                    ✓ {t('Ordered (Approved)', 'معتمد / تم الطلب')} ({statusCounts.Ordered})
                  </option>
                  <option value="Delivered" className="dark:bg-neutral-900 text-emerald-600 font-bold">
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
                  className="text-xs font-semibold bg-transparent text-neutral-900 dark:text-neutral-100 outline-none cursor-pointer"
                >
                  <option value="all" className="dark:bg-neutral-900">{t('All Destinations', 'كافة المستودعات')}</option>
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id} className="dark:bg-neutral-900">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {(statusFilter !== 'all' || branchFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setBranchFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 underline"
                >
                  {t('Reset', 'إعادة ضبط')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4">{t('Purchase ID & Invoice', 'رقم السند والفاتورة')}</th>
                <th className="py-3 px-4">{t('Supplier & Description', 'المورد والبيان')}</th>
                <th className="py-3 px-3">{t('Batch Expiration Date', 'تاريخ الصلاحية')}</th>
                <th className="py-3 px-3">{t('Destination', 'المستودع')}</th>
                <th className="py-3 px-3 text-right">{t('Quantity', 'الكمية')}</th>
                <th className="py-3 px-3 text-right">{t('Amount (QAR)', 'المبلغ')}</th>
                <th className="py-3 px-4 text-center">{t('Status', 'الحالة')}</th>
                <th className="py-3 px-3 text-right">{t('Actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>{t('No purchases found matching your criteria.', 'لا توجد مشتريات مطابقة للبحث.')}</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const branch = BRANCHES.find((b) => b.id === po.branchDestination);
                  const linkedItem = po.targetInventoryItemId ? inventory.find((i) => i.id === po.targetInventoryItemId) : null;

                  return (
                    <tr key={po.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 block">{po.id}</span>
                        <span className="text-[11px] text-neutral-400 block">{po.invoiceNumber}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-neutral-100">{po.supplier}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{po.itemsSummary}</div>
                        {linkedItem ? (
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                            <Tag className="w-2.5 h-2.5" />
                            {linkedItem.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            <Sparkles className="w-2.5 h-2.5" />
                            {t('Manual / First-Time Entry', 'إدخال يدوي / أول مرة')}
                          </span>
                        )}
                      </td>

                      {/* Expiration date column entered from purchases */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {po.expiryDate ? (
                          <div>
                            <div className="flex items-center gap-1 font-mono font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{po.expiryDate}</span>
                            </div>
                            {po.batchNumber && (
                              <span className="text-[10px] font-mono text-neutral-400 block">
                                Lot: {po.batchNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">N/A</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-neutral-600 dark:text-neutral-400">
                        {branch?.name}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                        {po.quantityTotal.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(po.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-block relative">
                          <select
                            value={po.status}
                            onChange={(e) => handleQuickStatusChange(po, e.target.value as PurchaseOrder['status'])}
                            className={`text-[11px] font-bold px-3 py-1 rounded-full border outline-none cursor-pointer transition-colors ${getStatusBadgeClasses(
                              po.status
                            )}`}
                          >
                            <option value="Pending Approval" className="dark:bg-neutral-900 text-amber-600 font-bold">
                              ⏳ {t('Pending Approval', 'بانتظار الموافقة')}
                            </option>
                            <option value="Ordered" className="dark:bg-neutral-900 text-sky-600 font-bold">
                              ✓ {t('Ordered (Approved)', 'معتمد / تم الطلب')}
                            </option>
                            <option value="Delivered" className="dark:bg-neutral-900 text-emerald-600 font-bold">
                              ✓✓ {t('Delivered', 'تم الاستلام')}
                            </option>
                            <option value="Rejected" className="dark:bg-neutral-900 text-rose-600 font-bold">
                              ✕ {t('Rejected', 'مرفوض')}
                            </option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => openDetailsModal(po)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title={t('View / Edit Details', 'عرض وتعديل التفاصيل')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PURCHASE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('Record Ordered Goods (Create Purchase)', 'تسجيل بضاعة موردة / إنشاء مشترى')}
                </h3>
                <p className="text-xs text-neutral-500">
                  {t('Record supplier invoice and enter batch expiration date for automatic inventory sync', 'تسجيل فاتورة المورد وإدخال تاريخ انتهاء الصلاحية للترحيل للمخزون')}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-3.5">
              {/* Item Specification Mode: Assign from Inventory OR Manual / First-Time Purchase */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 flex items-center justify-between">
                  <span>{t('Inventory Item Source', 'مصدر مادة المخزون')}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    {itemEntryMode === 'assign'
                      ? t('Assign to existing inventory SKU', 'ربط بصنف موجود مسبقاً')
                      : t('Manual / First-time purchased item', 'إدخال يدوي لصنف يشترى لأول مرة')}
                  </span>
                </label>
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => setItemEntryMode('assign')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      itemEntryMode === 'assign'
                        ? 'bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-400 shadow-xs border border-blue-200/50 dark:border-blue-900/50'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{t('Assign Inventory SKU', 'تعيين من المخزون')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemEntryMode('manual')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      itemEntryMode === 'manual'
                        ? 'bg-white dark:bg-neutral-900 text-amber-700 dark:text-amber-400 shadow-xs border border-amber-200/50 dark:border-amber-900/50'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('Manual / First-Time Item', 'إدخال يدوي / أول مرة')}</span>
                  </button>
                </div>
              </div>

              {/* MODE A: ASSIGN EXISTING INVENTORY SKU */}
              {itemEntryMode === 'assign' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-blue-600" />
                        <span>{t('Select Existing Inventory Item', 'اختر الصنف من قائمة المخزون')} *</span>
                      </span>
                      <span className="text-[10px] text-blue-600 font-normal">
                        {t('Auto-assigns expiry & stock', 'يرحّل الصلاحية والرصيد')}
                      </span>
                    </label>
                    <select
                      value={newTargetInventoryId}
                      onChange={(e) => handleSelectInventorySKU(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-blue-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold"
                    >
                      <option value="">{t('-- Select Inventory SKU --', '-- اختر الصنف من المخزون --')}</option>
                      {[...inventory]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} ({inv.unit} · {inv.supplier} · {inv.category})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {t('Item Description & Packing Details', 'بيان المادة وملاحظات التعبئة')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={newItemsSummary}
                      onChange={(e) => setNewItemsSummary(e.target.value)}
                      placeholder={t('e.g. Baladna Whipping Cream 1L (Carton of 12)', 'مثال: كريمة خفق بلدنا ١ لتر (كرتونة ١٢ حبة)')}
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* MODE B: MANUAL ENTRY / FIRST-TIME PURCHASE ITEM */}
              {itemEntryMode === 'manual' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('First-Time Purchased Item (Manual Description)', 'بيانات الصنف المشترى لأول مرة (وصف يدوي)')}</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {t('Item Name & Description', 'اسم وبيان الصنف المشترى')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualItemName}
                      onChange={(e) => setManualItemName(e.target.value)}
                      placeholder="e.g. Madagascar Bourbon Vanilla Extract 500ml"
                      className="w-full text-xs p-2.5 rounded-xl border border-amber-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                        {t('Inventory Category', 'التصنيف بالمخزون')}
                      </label>
                      <select
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value as InventoryItem['category'])}
                        className="w-full text-xs p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none font-semibold"
                      >
                        <option value="Dairy & Fresh">{t('Dairy & Fresh', 'ألبان ومواد طازجة')}</option>
                        <option value="Beans & Leaves">{t('Beans & Leaves', 'حبوب البن والشاي')}</option>
                        <option value="Syrups & Flavors">{t('Syrups & Flavors', 'سيروب ومنكهات')}</option>
                        <option value="Packaging">{t('Packaging', 'تغليف وأكواب')}</option>
                        <option value="Dry Goods">{t('Dry Goods', 'مواد جافة وسكر')}</option>
                        <option value="Proteins & Base">{t('Proteins & Base', 'بروتينات وقواعد')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center justify-between">
                        <span>{t('Measurement Unit', 'وحدة القياس')}</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                          {t('g for small items, ml for small liquids', 'جرام للصغار، مل للسوائل')}
                        </span>
                      </label>
                      <select
                        value={manualUnit}
                        onChange={(e) => setManualUnit(e.target.value as InventoryItem['unit'])}
                        className="w-full text-xs p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none font-semibold"
                      >
                        <option value="g">{t('g (Grams - small items & spices)', 'جرام (للأصناف الصغيرة والبهارات)')}</option>
                        <option value="ml">{t('ml (Milliliters - small liquids & oils)', 'مل (للسوائل والزيوت الصغيرة)')}</option>
                        <option value="kg">{t('kg (Kilograms - bulk ingredients)', 'كجم (كيلو جرام للمواد الكبيرة)')}</option>
                        <option value="L">{t('L (Liters - bulk liquids & milk)', 'لتر (للسوائل الكبيرة والحليب)')}</option>
                        <option value="pcs">{t('pcs (Pieces / Units)', 'حبة / قطعة')}</option>
                        <option value="box">{t('box (Boxes)', 'صندوق / علبة')}</option>
                        <option value="carton">{t('carton (Cartons)', 'كرتون / شدة')}</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-xs text-neutral-800 dark:text-neutral-200 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAddToInventory}
                      onChange={(e) => setAutoAddToInventory(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t('Register automatically as a trackable SKU in Inventory stock', 'تسجيل الصنف تلقائياً كرمز SKU في جدول المخزون')}</span>
                  </label>
                </div>
              )}

              {/* BATCH EXPIRATION DATE & BATCH NUMBER */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                <div>
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-200 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('Batch Expiry Date', 'تاريخ انتهاء الصلاحية')} *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full p-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-neutral-800 border border-amber-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                    {t('Directly sets stock shelf-life', 'يحدد تاريخ الصلاحية للمخزون')}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-200 block mb-1">
                    {t('Batch / Lot #', 'رقم الدفعة / التشغيلة')}
                  </label>
                  <input
                    type="text"
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value)}
                    placeholder="e.g. BAL-B902"
                    className="w-full p-2 text-xs font-mono rounded-xl bg-white dark:bg-neutral-800 border border-amber-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Supplier Name', 'اسم المورد')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="e.g. Baladna Food Industries"
                    className="w-full p-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Invoice / Delivery Note #', 'رقم الفاتورة / إشعار التوريد')}
                  </label>
                  <input
                    type="text"
                    value={newInvoiceNumber}
                    onChange={(e) => setNewInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-QA-2026-99"
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {t('Items & SKU Description', 'بيان الأصناف والكمية')} *
                </label>
                <input
                  type="text"
                  required
                  value={newItemsSummary}
                  onChange={(e) => setNewItemsSummary(e.target.value)}
                  placeholder="e.g. 500L Baladna Whole Milk & Heavy Cream"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Quantity Units', 'الكمية الإجمالية')} (
                    {itemEntryMode === 'manual'
                      ? manualUnit
                      : inventory.find((i) => i.id === newTargetInventoryId)?.unit || 'units'}
                    ) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Total Amount (QAR)', 'المبلغ الإجمالي (ر.ق)')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Delivery Destination', 'مستودع الاستلام')}
                  </label>
                  <select
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value as PurchaseOrder['branchDestination'])}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {t('Receipt Status', 'حالة الاستلام')}
                  </label>
                  <select
                    value={newInitialStatus}
                    onChange={(e) => setNewInitialStatus(e.target.value as PurchaseOrder['status'])}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none font-semibold"
                  >
                    <option value="Delivered">✓✓ {t('Delivered & Stocked (Received)', 'تم الاستلام والتوريد للمخزون')}</option>
                    <option value="Ordered">✓ {t('Ordered (Approved)', 'معتمد / تم الطلب')}</option>
                    <option value="Pending Approval">⏳ {t('Pending Approval', 'بانتظار الموافقة')}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {t('Record Purchase', 'تسجيل وحفظ المشترى')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS / EDIT STATUS MODAL */}
      {selectedPoForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('Purchase Details', 'تفاصيل المشترى')}
                </h3>
                <span className="text-xs font-mono text-neutral-500">{selectedPoForDetails.id}</span>
              </div>
              <button
                onClick={() => setSelectedPoForDetails(null)}
                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalStatus} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t('Supplier:', 'المورد:')}</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{selectedPoForDetails.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t('Invoice #:', 'رقم الفاتورة:')}</span>
                  <span className="font-mono font-semibold">{selectedPoForDetails.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t('Batch Expiration:', 'تاريخ الصلاحية:')}</span>
                  <span className="font-mono font-bold text-amber-600">{selectedPoForDetails.expiryDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t('Amount:', 'المبلغ:')}</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedPoForDetails.amount)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {t('Update Approval & Delivery Status', 'تحديث حالة المشترى')}
                </label>
                <select
                  value={detailModalStatus}
                  onChange={(e) => setDetailModalStatus(e.target.value as PurchaseOrder['status'])}
                  className="w-full p-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold"
                >
                  <option value="Pending Approval">⏳ {t('Pending Approval', 'بانتظار الموافقة')}</option>
                  <option value="Ordered">✓ {t('Ordered (Approved)', 'معتمد / تم الطلب')}</option>
                  <option value="Delivered">✓✓ {t('Delivered & Received', 'تم الاستلام والتوريد')}</option>
                  <option value="Rejected">✕ {t('Rejected', 'مرفوض')}</option>
                </select>
              </div>

              {/* Editable Expiry Date & Batch Number (Sets Inventory Expiry) */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <div>
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-200 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('Batch Expiry Date', 'تاريخ الصلاحية')}</span>
                  </label>
                  <input
                    type="date"
                    value={detailModalExpiryDate}
                    onChange={(e) => setDetailModalExpiryDate(e.target.value)}
                    className="w-full p-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-neutral-800 border border-amber-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-1">
                    {t('Syncs to inventory item', 'يرحّل لمخزون الصنف')}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-200 block mb-1">
                    {t('Batch / Lot #', 'رقم الدفعة')}
                  </label>
                  <input
                    type="text"
                    value={detailModalBatchNumber}
                    onChange={(e) => setDetailModalBatchNumber(e.target.value)}
                    placeholder="e.g. LOT-2026-99"
                    className="w-full p-2 text-xs font-mono rounded-xl bg-white dark:bg-neutral-800 border border-amber-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {t('Notes & Remarks', 'ملاحظات وتفاصيل')}
                </label>
                <textarea
                  rows={2}
                  value={detailModalNotes}
                  onChange={(e) => setDetailModalNotes(e.target.value)}
                  placeholder="Optional internal remarks..."
                  className="w-full p-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedPoForDetails(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs"
                >
                  {t('Save Status', 'حفظ الحالة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
