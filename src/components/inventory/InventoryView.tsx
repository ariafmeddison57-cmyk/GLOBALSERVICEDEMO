import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Clock,
  ClipboardList,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Filter,
  DollarSign,
  TrendingDown,
  Layers,
  Edit3,
  X,
  Trash2,
  Flame,
  FileCheck,
  Calendar,
  AlertCircle,
  HelpCircle,
  Timer,
  ShieldAlert,
  Scale,
  Check,
  Tag,
  ArrowRight,
  TrendingUp,
  PackageCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { InventoryItem, DamageReason, BranchId } from '../../types';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    updateInventoryStock,
    updateInventoryItem,
    updateActualClosingStock,
    damagedGoods,
    logDamagedStock,
    totalDamagedLoss,
    formatCurrency,
    t,
    language,
    setCurrentView,
    purchases,
    isRTL,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stock' | 'comparison' | 'damaged'>('stock');
  const [comparisonFilter, setComparisonFilter] = useState<'all' | 'variance' | 'matched'>('all');
  const [inlineActualCounts, setInlineActualCounts] = useState<{ [id: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState<'all' | 'expired' | 'critical' | 'warning' | 'fresh'>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'variance' | 'normal'>('all');

  // Physical Count Modal
  const [physicalCountItem, setPhysicalCountItem] = useState<InventoryItem | null>(null);
  const [physicalCountVal, setPhysicalCountVal] = useState<string>('');

  // Adjust / Edit modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [newStockVal, setNewStockVal] = useState<string>('');
  const [newActualStockVal, setNewActualStockVal] = useState<string>('');
  const [newMinReorderVal, setNewMinReorderVal] = useState<string>('');

  // Damaged stock modal state
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [damageItemId, setDamageItemId] = useState<string>(inventory[0]?.id || '');
  const [damageQty, setDamageQty] = useState<number>(1);
  const [damageReason, setDamageReason] = useState<DamageReason>('Spoilage & Expired');
  const [damageBranch, setDamageBranch] = useState<BranchId>('west-walk');
  const [damageLoggedBy, setDamageLoggedBy] = useState<string>('Store Shift Lead');
  const [damageNotes, setDamageNotes] = useState<string>('');

  // Current timestamp for comparisons
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Helper to calculate expiry metrics for any item
  const getExpiryMetrics = (expiryDateStr: string) => {
    if (!expiryDateStr) {
      return { daysRemaining: 999, isExpired: false, isCritical: false, isWarning: false, isFresh: true };
    }
    const target = new Date(expiryDateStr);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysRemaining: diffDays,
      isExpired: diffDays < 0,
      isCritical: diffDays >= 0 && diffDays <= 7,
      isWarning: diffDays > 7 && diffDays <= 30,
      isFresh: diffDays > 30,
    };
  };

  // Variance calculations across inventory
  const itemsWithVariance = inventory.filter((item) => {
    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    return Math.abs(actual - item.closingStock) > 0.01;
  });

  const totalVarianceLossQar = inventory.reduce((sum, item) => {
    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    const diff = actual - item.closingStock;
    return sum + (diff * item.unitCost);
  }, 0);

  // Filter calculations
  const categories: string[] = [
    'all',
    'Beans & Leaves',
    'Dairy & Fresh',
    'Syrups & Flavors',
    'Packaging',
    'Proteins & Base',
    'Dry Goods',
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.includes(searchQuery) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.expiryDate && item.expiryDate.includes(searchQuery));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;

    const metrics = getExpiryMetrics(item.expiryDate);
    const matchesExpiry =
      expiryStatusFilter === 'all' ||
      (expiryStatusFilter === 'expired' && metrics.isExpired) ||
      (expiryStatusFilter === 'critical' && metrics.isCritical) ||
      (expiryStatusFilter === 'warning' && metrics.isWarning) ||
      (expiryStatusFilter === 'fresh' && metrics.isFresh);

    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    const hasVar = Math.abs(actual - item.closingStock) > 0.01;

    const matchesStock =
      stockStatusFilter === 'all' ||
      (stockStatusFilter === 'low' && item.closingStock <= item.minReorderLevel) ||
      (stockStatusFilter === 'variance' && hasVar) ||
      (stockStatusFilter === 'normal' && item.closingStock > item.minReorderLevel);

    return matchesSearch && matchesCategory && matchesLocation && matchesExpiry && matchesStock;
  });

  // KPI Computations
  const totalSystemValue = inventory.reduce((sum, item) => sum + item.closingStock * item.unitCost, 0);
  const totalActualPhysicalValue = inventory.reduce((sum, item) => {
    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    return sum + (actual * item.unitCost);
  }, 0);
  const shortageItems = inventory.filter((item) => {
    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    return item.closingStock - actual > 0.01;
  });
  const surplusItems = inventory.filter((item) => {
    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    return actual - item.closingStock > 0.01;
  });
  const matchedItems = inventory.filter((item) => {
    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    return Math.abs(actual - item.closingStock) <= 0.01;
  });

  const expiredItems = inventory.filter((item) => getExpiryMetrics(item.expiryDate).isExpired);
  const criticalExpiringItems = inventory.filter((item) => getExpiryMetrics(item.expiryDate).isCritical);
  const lowStockItems = inventory.filter((item) => item.closingStock <= item.minReorderLevel);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUpdateInlineActual = (itemId: string, val: string) => {
    setInlineActualCounts((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSaveSingleInline = (item: InventoryItem) => {
    const raw = inlineActualCounts[item.id];
    if (raw !== undefined) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed >= 0) {
        updateActualClosingStock(item.id, parsed);
        setInlineActualCounts((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
        showToast(
          t(
            `Actual closing count for ${item.name} set to ${parsed} ${item.unit}.`,
            `تم حفظ الجرد الفعلي لـ ${language === 'ar' ? item.nameAr : item.name} إلى ${parsed} ${item.unit}.`
          )
        );
      }
    }
  };

  const handleSaveAllInlineCounts = () => {
    let count = 0;
    Object.entries(inlineActualCounts).forEach(([id, rawVal]) => {
      const parsed = parseFloat(rawVal);
      if (!isNaN(parsed) && parsed >= 0) {
        updateActualClosingStock(id, parsed);
        count++;
      }
    });
    setInlineActualCounts({});
    showToast(
      t(
        `Successfully saved actual closing counts for ${count} items.`,
        `تم حفظ الجرد الفعلي لـ ${count} أصناف بنجاح.`
      )
    );
  };

  const handleReconcileSystemToActual = (item: InventoryItem) => {
    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    updateInventoryItem(item.id, { closingStock: actual });
    showToast(
      t(
        `System theoretical stock for ${item.name} adjusted to ${actual} ${item.unit} to match physical count.`,
        `تمت مطابقة رصيد النظام لـ ${language === 'ar' ? item.nameAr : item.name} إلى ${actual} ${item.unit} ليتوافق مع الجرد الفعلي.`
      )
    );
  };

  const handleReconcileAllDiscrepancies = () => {
    let count = 0;
    inventory.forEach((item) => {
      const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
      if (Math.abs(actual - item.closingStock) > 0.01) {
        updateInventoryItem(item.id, { closingStock: actual });
        count++;
      }
    });
    showToast(
      t(
        `Reconciled ${count} items: System stock adjusted to match physical closing counts.`,
        `تمت تسوية ${count} أصناف: تم تعديل رصيد النظام ليتطابق مع الجرد الفعلي.`
      )
    );
  };

  const handleWriteOffShortage = (item: InventoryItem) => {
    const actual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    const shortage = item.closingStock - actual;
    if (shortage > 0) {
      setDamageItemId(item.id);
      setDamageQty(parseFloat(shortage.toFixed(2)));
      setDamageBranch(item.location);
      setDamageReason('Spoilage & Expired');
      setDamageNotes(
        language === 'ar'
          ? `عجز في الجرد الفعلي: رصيد النظام ${item.closingStock} والجرد الفعلي ${actual} (${shortage.toFixed(2)} ${item.unit})`
          : `Physical closing count shortage: System ${item.closingStock} vs Actual ${actual} (${shortage.toFixed(2)} ${item.unit})`
      );
      setIsDamageModalOpen(true);
    }
  };

  // Quick Open Physical Count Modal
  const handleOpenPhysicalCount = (item: InventoryItem) => {
    setPhysicalCountItem(item);
    const currentActual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    setPhysicalCountVal(currentActual.toString());
  };

  const handleSavePhysicalCount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!physicalCountItem) return;
    const parsed = parseFloat(physicalCountVal);
    if (!isNaN(parsed) && parsed >= 0) {
      updateActualClosingStock(physicalCountItem.id, parsed);
    }
    setPhysicalCountItem(null);
  };

  // Adjust Modal Open
  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setNewStockVal(item.closingStock.toString());
    const currentActual = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
    setNewActualStockVal(currentActual.toString());
    setNewMinReorderVal(item.minReorderLevel.toString());
  };

  const handleSaveAdjust = () => {
    if (!adjustingItem) return;
    const parsedStock = parseFloat(newStockVal);
    const parsedActual = parseFloat(newActualStockVal);
    const parsedMin = parseInt(newMinReorderVal, 10);

    const updates: Partial<InventoryItem> = {};
    if (!isNaN(parsedStock) && parsedStock >= 0) updates.closingStock = parsedStock;
    if (!isNaN(parsedActual) && parsedActual >= 0) updates.actualClosingStock = parsedActual;
    if (!isNaN(parsedMin) && parsedMin >= 0) updates.minReorderLevel = parsedMin;

    updateInventoryItem(adjustingItem.id, updates);
    setAdjustingItem(null);
  };

  // Quick Disposal action for expired item
  const handleQuickLogExpired = (item: InventoryItem) => {
    setDamageItemId(item.id);
    setDamageQty(item.closingStock);
    setDamageBranch(item.location);
    setDamageReason('Spoilage & Expired');
    setDamageNotes(
      language === 'ar'
        ? `إتلاف فوري للصنف منتهي الصلاحية بتاريخ ${item.expiryDate}`
        : `Immediate disposal of expired stock (Date: ${item.expiryDate})`
    );
    setIsDamageModalOpen(true);
  };

  const handleSubmitDamage = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find((i) => i.id === damageItemId);
    if (!item || damageQty <= 0) return;

    logDamagedStock({
      inventoryItemId: item.id,
      itemName: item.name,
      itemNameAr: item.nameAr,
      quantity: damageQty,
      unit: item.unit,
      unitCost: item.unitCost,
      totalFinancialLoss: parseFloat((damageQty * item.unitCost).toFixed(2)),
      reason: damageReason,
      branchId: damageBranch,
      loggedBy: damageLoggedBy,
      notes: damageNotes.trim() || undefined,
    });

    setIsDamageModalOpen(false);
    setDamageNotes('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-neutral-700 dark:border-neutral-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-[10px] font-bold tracking-wide uppercase">
              {t('Inventory & Stocktake Control', 'إدارة المخزون والجرد الدوري')}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              {t('System Stock vs Actual Closing Count Reconciliation', 'مطابقة الرصيد الدفتري مع الجرد الفعلي')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('Inventory Ledger, Stocktake & Shelf Expiry', 'جدول أرصدة المخزون، الجرد الفعلي وتواريخ الصلاحية')}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
            {t(
              'Compare theoretical system stock with manual physical counts, view shelf-life expiry dates derived from Purchases, and write off inventory shrinkage.',
              'مقارنة رصيد النظام الدفتري مع الجرد الفعلي المدخل يدوياً، ومتابعة تواريخ انتهاء الصلاحية المحددة من فواتير المشتريات.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 active:scale-95 ${
              activeTab === 'comparison'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{t('Actual Closing Count (Compare)', 'الجرد الفعلي والمطابقة')}</span>
            {itemsWithVariance.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold">
                {itemsWithVariance.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('purchases')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs transition-all flex items-center gap-2 active:scale-95"
          >
            <PackageCheck className="w-4 h-4" />
            <span>{t('Record Purchase (Set Expiry)', 'تسجيل مشترى (تحديث الصلاحية)')}</span>
          </button>

          <button
            onClick={() => setIsDamageModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('+ Log Damaged / Expired Goods', '+ تسجيل بضاعة تالفة / هدر')}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total System Value */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Total System Stock Value', 'قيمة المخزون الدفتري')}
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
            {formatCurrency(totalSystemValue)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {inventory.length} {t('Active ingredients & SKUs', 'صنف ومادة غذائية')}
          </p>
        </div>

        {/* Physical Count Reconciliation / Variance Card */}
        <div
          onClick={() => {
            setActiveTab('stock');
            setStockStatusFilter(stockStatusFilter === 'variance' ? 'all' : 'variance');
          }}
          className={`cursor-pointer transition-all rounded-2xl p-4 border shadow-xs ${
            itemsWithVariance.length > 0
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60 hover:ring-2 hover:ring-amber-400'
              : 'bg-white dark:bg-neutral-900 border-zinc-200/80 dark:border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              {t('Physical Count Variance', 'فروقات الجرد الفعلي')}
            </span>
            {itemsWithVariance.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white font-mono text-[10px] font-bold">
                {itemsWithVariance.length} {t('Diffs', 'فروقات')}
              </span>
            )}
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${totalVarianceLossQar < 0 ? 'text-rose-600' : totalVarianceLossQar > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {totalVarianceLossQar === 0 ? '0.00 QAR' : formatCurrency(totalVarianceLossQar)}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
            {itemsWithVariance.length > 0
              ? t(`${itemsWithVariance.length} items differ from physical count`, `${itemsWithVariance.length} أصناف فيها انحراف عن الجرد`)
              : t('Physical count exactly matches system', 'الجرد الفعلي مطابق للنظام ١٠٠٪')}
          </p>
        </div>

        {/* Expired Items Alert Card */}
        <div
          onClick={() => {
            setActiveTab('stock');
            setExpiryStatusFilter(expiryStatusFilter === 'expired' ? 'all' : 'expired');
          }}
          className={`cursor-pointer transition-all rounded-2xl p-4 border shadow-xs ${
            expiredItems.length > 0
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 hover:ring-2 hover:ring-rose-400'
              : 'bg-white dark:bg-neutral-900 border-zinc-200/80 dark:border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {t('Expired Items', 'أصناف منتهية الصلاحية')}
            </span>
            {expiredItems.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
            {expiredItems.length} {t('Items', 'صنف')}
          </div>
          <p className="text-[11px] text-rose-600/90 mt-1 font-medium">
            {expiredItems.length > 0
              ? t('Click to filter & write off', 'اضغط للتصفية وتدوين التلف')
              : t('No expired stock detected', 'لا توجد بضائع منتهية')}
          </p>
        </div>

        {/* Expiring Soon (<= 7 Days) */}
        <div
          onClick={() => {
            setActiveTab('stock');
            setExpiryStatusFilter(expiryStatusFilter === 'critical' ? 'all' : 'critical');
          }}
          className={`cursor-pointer transition-all rounded-2xl p-4 border shadow-xs ${
            criticalExpiringItems.length > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60 hover:ring-2 hover:ring-amber-400'
              : 'bg-white dark:bg-neutral-900 border-zinc-200/80 dark:border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" />
              {t('Expiring (≤ 7 Days)', 'تنتهي خلال أسبوع')}
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {criticalExpiringItems.length} {t('Items', 'صنف')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {t('Check supplier batches from purchases', 'متابعة الدفعات الموردة')}
          </p>
        </div>

        {/* Low Stock Threshold */}
        <div
          onClick={() => {
            setActiveTab('stock');
            setStockStatusFilter(stockStatusFilter === 'low' ? 'all' : 'low');
          }}
          className="cursor-pointer bg-white dark:bg-neutral-900 hover:ring-2 hover:ring-zinc-300 dark:hover:ring-neutral-700 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs transition-all"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Low Stock Threshold', 'أصناف قاربت على النفاد')}
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {lowStockItems.length} {t('Items', 'أصناف')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {t('Below minimum reorder level', 'أقل من حد إعادة الطلب')}
          </p>
        </div>
      </div>

      {/* 3. Section Tabs: Stock Ledger vs Comparison vs Damaged Goods Log */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-zinc-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{t('Inventory & Shelf Expiry', 'أرصدة المخزون وتواريخ الصلاحية')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white dark:bg-neutral-200 dark:text-neutral-900">
            {inventory.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'comparison'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{t('System vs Actual Closing Count', 'مقارنة رصيد النظام مع الجرد الفعلي')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            itemsWithVariance.length > 0
              ? 'bg-amber-400 text-amber-950'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
          }`}>
            {itemsWithVariance.length > 0 ? `${itemsWithVariance.length} ${t('Diffs', 'فروقات')}` : t('Matched', 'مطابق')}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('damaged')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'damaged'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-zinc-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{t('Damaged Goods & Loss Write-Offs', 'سجل البضائع التالفة والهدر المالي')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
            {damagedGoods.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Main Inventory Ledger with System vs Actual Count & Purchases Expiry */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Expiry Quick Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-zinc-500 dark:text-neutral-400 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              {t('Expiry Status:', 'حالة الصلاحية:')}
            </span>

            <button
              onClick={() => setExpiryStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                expiryStatusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-300 hover:bg-zinc-200'
              }`}
            >
              {t('All Items', 'الكل')} ({inventory.length})
            </button>

            <button
              onClick={() => setExpiryStatusFilter('expired')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                expiryStatusFilter === 'expired'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{t('Expired Stock', 'منتهي')} ({expiredItems.length})</span>
            </button>

            <button
              onClick={() => setExpiryStatusFilter('critical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                expiryStatusFilter === 'critical'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <Timer className="w-3 h-3" />
              <span>{t('Expiring (≤ 7 Days)', 'ينتهي خلال أسبوع')} ({criticalExpiringItems.length})</span>
            </button>

            <button
              onClick={() => setStockStatusFilter(stockStatusFilter === 'variance' ? 'all' : 'variance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                stockStatusFilter === 'variance'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>{t('Has Stock Variance', 'يوجد فرق جرد')} ({itemsWithVariance.length})</span>
            </button>

            {(expiryStatusFilter !== 'all' || stockStatusFilter !== 'all' || searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all') && (
              <button
                onClick={() => {
                  setExpiryStatusFilter('all');
                  setStockStatusFilter('all');
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline shrink-0 ml-auto"
              >
                {t('Reset Filters', 'إعادة ضبط')}
              </button>
            )}
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Filter by item, supplier, or batch expiry...', 'بحث بالصنف، المورد، أو تاريخ الصلاحية...')}
                className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-medium bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 px-3 py-2 rounded-xl border border-zinc-200 dark:border-neutral-700"
              >
                <option value="all">{t('All Categories', 'كافة التصنيفات')}</option>
                {categories.filter((c) => c !== 'all').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-xs font-medium bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 px-3 py-2 rounded-xl border border-zinc-200 dark:border-neutral-700"
              >
                <option value="all">{t('All Locations', 'كافة المستودعات')}</option>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock & Expiry Table */}
          <div className="bg-white dark:bg-neutral-900 border border-zinc-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-neutral-800/60 border-b border-zinc-200 dark:border-neutral-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-4">{t('Product / Ingredient', 'الصنف / المادة')}</th>
                    <th className="py-3 px-3">{t('Category', 'التصنيف')}</th>
                    <th className="py-3 px-3 text-right">{t('System Stock', 'رصيد النظام')}</th>
                    <th className="py-3 px-3 text-right">{t('Actual Closing Count', 'الجرد الفعلي')}</th>
                    <th className="py-3 px-3 text-right">{t('Variance (Diff)', 'فرق الجرد')}</th>
                    <th className="py-3 px-3 text-right">{t('Unit Cost', 'سعر الوحدة')}</th>
                    <th className="py-3 px-3">{t('Expiration (From Purchases)', 'الصلاحية (من المشتريات)')}</th>
                    <th className="py-3 px-3 text-center">{t('Shelf Status', 'حالة الصلاحية')}</th>
                    <th className="py-3 px-4 text-center">{t('Actions', 'إجراءات')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 font-medium">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-400">
                        <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>{t('No inventory items match the selected filter criteria.', 'لا توجد أصناف مطابقة لمعايير البحث الحالية.')}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const expiryMetrics = getExpiryMetrics(item.expiryDate);
                      const isLow = item.closingStock <= item.minReorderLevel;
                      const actualCount = item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock;
                      const variance = actualCount - item.closingStock;
                      const varianceFinancial = variance * item.unitCost;
                      const hasVariance = Math.abs(variance) > 0.01;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            expiryMetrics.isExpired
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                              : expiryMetrics.isCritical
                              ? 'bg-amber-50/30 dark:bg-amber-950/15 hover:bg-amber-50 dark:hover:bg-amber-950/25'
                              : hasVariance
                              ? 'bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50/40'
                              : 'hover:bg-zinc-50/80 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          {/* Product / Ingredient */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                              <span>{language === 'ar' ? item.nameAr : item.name}</span>
                              {expiryMetrics.isExpired && (
                                <span className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase">
                                  {t('Expired', 'منتهي')}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              {item.supplier} · {BRANCHES.find((b) => b.id === item.location)?.name}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-300 font-medium">
                              {item.category}
                            </span>
                          </td>

                          {/* SYSTEM THEORETICAL STOCK */}
                          <td className="py-3.5 px-3 text-right">
                            <span className={`font-mono font-bold text-sm ${isLow ? 'text-amber-600' : 'text-neutral-900 dark:text-white'}`}>
                              {item.closingStock} {item.unit}
                            </span>
                            <span className="block text-[10px] text-zinc-400">
                              {t('Book Stock', 'دفتري')}
                            </span>
                          </td>

                          {/* ACTUAL CLOSING COUNT (MANUALLY ENTERED) */}
                          <td className="py-3.5 px-3 text-right">
                            <div
                              onClick={() => handleOpenPhysicalCount(item)}
                              className="cursor-pointer group inline-flex flex-col items-end"
                              title={t('Click to enter/adjust manual physical count', 'اضغط لإدخال وتعديل الجرد الفعلي')}
                            >
                              <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-300 group-hover:underline flex items-center gap-1">
                                <span>{actualCount} {item.unit}</span>
                                <Edit3 className="w-3 h-3 text-zinc-400 group-hover:text-blue-600 inline" />
                              </span>
                              <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-medium">
                                {item.actualClosingStock !== undefined
                                  ? t('Manual Count', 'جرد يدوي')
                                  : t('Click to count', 'اضغط للجرد')}
                              </span>
                            </div>
                          </td>

                          {/* STOCK VARIANCE (DIFF) */}
                          <td className="py-3.5 px-3 text-right font-mono">
                            {!hasVariance ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t('Matched', 'مطابق')}</span>
                              </span>
                            ) : variance < 0 ? (
                              <div>
                                <span className="font-bold text-rose-600 dark:text-rose-400 text-xs block">
                                  {variance} {item.unit}
                                </span>
                                <span className="text-[10px] text-rose-500 font-medium">
                                  {formatCurrency(varianceFinancial)} {t('short', 'عجز')}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-amber-600 dark:text-amber-400 text-xs block">
                                  +{variance} {item.unit}
                                </span>
                                <span className="text-[10px] text-amber-600 font-medium">
                                  +{formatCurrency(varianceFinancial)} {t('surplus', 'فائض')}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Unit Cost */}
                          <td className="py-3.5 px-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
                            {formatCurrency(item.unitCost)}
                          </td>

                          {/* EXPIRATION DATE COLUMN (DERIVED FROM PURCHASES) */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <Calendar className={`w-3.5 h-3.5 ${
                                expiryMetrics.isExpired
                                  ? 'text-rose-600'
                                  : expiryMetrics.isCritical
                                  ? 'text-amber-600'
                                  : 'text-zinc-400'
                              }`} />
                              <span className={`font-semibold ${
                                expiryMetrics.isExpired
                                  ? 'text-rose-700 dark:text-rose-400 font-black'
                                  : expiryMetrics.isCritical
                                  ? 'text-amber-700 dark:text-amber-400 font-bold'
                                  : 'text-neutral-800 dark:text-neutral-200'
                              }`}>
                                {item.expiryDate || t('From Purchases', 'من المشتريات')}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {expiryMetrics.isExpired
                                ? t(`Expired ${Math.abs(expiryMetrics.daysRemaining)}d ago`, `انتهت منذ ${Math.abs(expiryMetrics.daysRemaining)} أيام`)
                                : expiryMetrics.daysRemaining === 0
                                ? t('Expires today!', 'ينتهي اليوم!')
                                : item.expiryDate
                                ? t(`${expiryMetrics.daysRemaining}d left (Purchase batch)`, `${expiryMetrics.daysRemaining} يوم (دفعة المشتريات)`)
                                : t('Record in Purchases to set', 'سجل في المشتريات للتحديد')}
                            </span>
                          </td>

                          {/* SHELF LIFE STATUS BADGE */}
                          <td className="py-3.5 px-3 text-center">
                            {expiryMetrics.isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{t('EXPIRED', 'منتهي')}</span>
                              </span>
                            ) : expiryMetrics.isCritical ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                                <Timer className="w-3 h-3" />
                                <span>{t('CRITICAL (≤7d)', 'حرج (خلال أسبوع)')}</span>
                              </span>
                            ) : expiryMetrics.isWarning ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                <Clock className="w-3 h-3" />
                                <span>{t('Expiring (≤30d)', 'خلال شهر')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t('Fresh & Safe', 'صالح وآمن')}</span>
                              </span>
                            )}
                          </td>

                          {/* ACTION COLUMN */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick Physical Count Button */}
                              <button
                                onClick={() => handleOpenPhysicalCount(item)}
                                className="px-2 py-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded-lg transition-colors flex items-center gap-1"
                                title={t('Enter Actual Physical Count', 'تسجيل الجرد الفعلي')}
                              >
                                <Scale className="w-3 h-3" />
                                <span>{t('Count', 'جرد')}</span>
                              </button>

                              {expiryMetrics.isExpired && (
                                <button
                                  onClick={() => handleQuickLogExpired(item)}
                                  className="px-2 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1"
                                  title="Write off expired stock to damaged goods"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{t('Write Off', 'إتلاف')}</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenAdjust(item)}
                                className="p-1.5 text-zinc-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
                                title="Edit Stock & Reorder Thresholds"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB: SYSTEM VS ACTUAL CLOSING COUNT COMPARISON AUDIT */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          {/* Comparison Banner */}
          <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 dark:from-blue-950/40 dark:via-neutral-900 dark:to-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {t('System Theoretical Stock vs. Actual Physical Closing Count Audit', 'مطابقة الرصيد الدفتري للنظام مع الجرد الفعلي اليدوي')}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                    {t('End-of-Shift Stocktake', 'الجرد الدوري ونهاية الوردية')}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-3xl">
                  {t(
                    'Compare the theoretical closing stock (opening + purchases − POS recipe sales) against the actual physical counts manually recorded by staff. Identify shrinkage, prevent stockouts, and reconcile your inventory ledger.',
                    'مقارنة الرصيد الدفتري للنظام (الافتتاحي + المشتريات − مبيعات نقاط البيع) مع الجرد الفعلي المدخل يدوياً من قبل موظفي الفرع لكشف الهدر والتسوية.'
                  )}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    {t('Batch Expiry Dates flow directly from supplier Purchases and are assigned automatically.', 'تواريخ انتهاء الصلاحية تُسجل من فواتير المشتريات وترتبط مباشرة بالأصناف.')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
              {Object.keys(inlineActualCounts).length > 0 && (
                <button
                  onClick={handleSaveAllInlineCounts}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t(`Save All (${Object.keys(inlineActualCounts).length}) Counts`, `حفظ كافة التعديلات (${Object.keys(inlineActualCounts).length})`)}</span>
                </button>
              )}

              {itemsWithVariance.length > 0 && (
                <button
                  onClick={handleReconcileAllDiscrepancies}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-neutral-900 text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{t('Accept & Align All to Physical', 'تسوية النظام ليطابق الفعلي')}</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Comparative Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {t('Theoretical System Valuation', 'قيمة رصيد النظام الدفتري')}
              </span>
              <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
                {formatCurrency(totalSystemValue)}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {t('Calculated by POS & Purchases', 'محسوبة عبر المبيعات والمشتريات')}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-blue-200 dark:border-blue-900/60 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {t('Actual Physical Count Valuation', 'قيمة الجرد الفعلي بالمستودع')}
              </span>
              <div className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300 mt-1 tabular-nums">
                {formatCurrency(totalActualPhysicalValue)}
              </div>
              <p className="text-[11px] text-blue-600/80 mt-1">
                {t('Based on staff manual stocktake', 'بناءً على العد اليدوي للموظفين')}
              </p>
            </div>

            <div className={`rounded-2xl p-4 border shadow-xs ${
              totalVarianceLossQar < 0
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                : totalVarianceLossQar > 0
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {t('Net Discrepancy Amount (Variance)', 'صافي الفرق المالي (انحراف)')}
              </span>
              <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${
                totalVarianceLossQar < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : totalVarianceLossQar > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {totalVarianceLossQar === 0 ? '0.00 QAR' : formatCurrency(totalVarianceLossQar)}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                {totalVarianceLossQar < 0
                  ? t('Net shrinkage deficit from system', 'عجز في المخزون عن رصيد النظام')
                  : totalVarianceLossQar > 0
                  ? t('Net surplus over system', 'فائض زيادة عن رصيد النظام')
                  : t('Zero discrepancy - 100% accurate', 'مطابق ١٠٠٪ دون أي فروقات')}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {t('Reconciliation Status', 'حالة مطابقة الأصناف')}
              </span>
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                {matchedItems.length} / {inventory.length}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className="text-rose-600 font-bold">{shortageItems.length} {t('short', 'عجز')}</span>
                <span>•</span>
                <span className="text-amber-600 font-bold">{surplusItems.length} {t('surplus', 'فائض')}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">{matchedItems.length} {t('matched', 'مطابق')}</span>
              </div>
            </div>
          </div>

          {/* Table Container & Filter */}
          <div className="bg-white dark:bg-neutral-900 border border-zinc-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {t('Filter Comparison:', 'تصفية المقارنة:')}
                </span>

                <button
                  onClick={() => setComparisonFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    comparisonFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-300 hover:bg-zinc-200'
                  }`}
                >
                  {t('All Items', 'كافة الأصناف')} ({inventory.length})
                </button>

                <button
                  onClick={() => setComparisonFilter('variance')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    comparisonFilter === 'variance'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t('Discrepancies Only', 'الفروقات فقط')} ({itemsWithVariance.length})</span>
                </button>

                <button
                  onClick={() => setComparisonFilter('matched')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    comparisonFilter === 'matched'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('Matched Only', 'المطابقة فقط')} ({matchedItems.length})</span>
                </button>
              </div>

              <div className="text-xs text-neutral-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>{t('Type in the Actual Count column to update physical counts inline', 'يمكنك كتابة الرصيد الفعلي مباشرة في الجدول للتحديث السريع')}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-neutral-800/60 border-b border-zinc-200 dark:border-neutral-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-4">{t('Product / Ingredient', 'الصنف / المادة')}</th>
                    <th className="py-3 px-3">{t('Location', 'المستودع')}</th>
                    <th className="py-3 px-3 text-right">{t('Unit Cost', 'سعر الوحدة')}</th>
                    <th className="py-3 px-3 text-right bg-zinc-100/60 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200">
                      {t('System Stock (Expected)', 'رصيد النظام (الدفتري)')}
                    </th>
                    <th className="py-3 px-3 text-right bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">
                      {t('Actual Closing Count (Physical)', 'الجرد الفعلي (اليدوي)')}
                    </th>
                    <th className="py-3 px-3 text-right">{t('Variance (Units)', 'فرق الكمية')}</th>
                    <th className="py-3 px-3 text-right">{t('Variance Value (QAR)', 'القيمة المالية للفرق')}</th>
                    <th className="py-3 px-3 text-center">{t('Status', 'الحالة')}</th>
                    <th className="py-3 px-4 text-center">{t('Reconciliation Actions', 'إجراءات التسوية')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 font-medium">
                  {(() => {
                    const comparisonItems = inventory.filter((item) => {
                      const actual = inlineActualCounts[item.id] !== undefined
                        ? parseFloat(inlineActualCounts[item.id])
                        : item.actualClosingStock !== undefined
                        ? item.actualClosingStock
                        : item.closingStock;
                      const diff = actual - item.closingStock;
                      const hasDiff = Math.abs(diff) > 0.01;

                      const matchesFilter =
                        comparisonFilter === 'all' ||
                        (comparisonFilter === 'variance' && hasDiff) ||
                        (comparisonFilter === 'matched' && !hasDiff);

                      const matchesSearch =
                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.nameAr.includes(searchQuery) ||
                        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

                      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
                      const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;

                      return matchesFilter && matchesSearch && matchesCategory && matchesLocation;
                    });

                    if (comparisonItems.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-zinc-400">
                            <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p>{t('No items match the comparison filter criteria.', 'لا توجد أصناف مطابقة للتصفية.')}</p>
                          </td>
                        </tr>
                      );
                    }

                    return comparisonItems.map((item) => {
                      const currentVal = inlineActualCounts[item.id] !== undefined
                        ? inlineActualCounts[item.id]
                        : (item.actualClosingStock !== undefined ? item.actualClosingStock : item.closingStock).toString();
                      const actual = parseFloat(currentVal);
                      const safeActual = isNaN(actual) ? item.closingStock : actual;
                      const diff = safeActual - item.closingStock;
                      const diffValue = diff * item.unitCost;
                      const isMatched = Math.abs(diff) <= 0.01;
                      const isShort = diff < -0.01;
                      const isSurplus = diff > 0.01;
                      const branch = BRANCHES.find((b) => b.id === item.location);

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isShort
                              ? 'bg-rose-50/30 dark:bg-rose-950/15 hover:bg-rose-50/50'
                              : isSurplus
                              ? 'bg-amber-50/20 dark:bg-amber-950/10 hover:bg-amber-50/40'
                              : 'hover:bg-zinc-50/80 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          {/* Item / Ingredient */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-neutral-900 dark:text-neutral-100">
                              {language === 'ar' ? item.nameAr : item.name}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              {item.category} · {item.supplier}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-3 text-neutral-600 dark:text-neutral-400">
                            {branch?.name}
                          </td>

                          {/* Unit Cost */}
                          <td className="py-3.5 px-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
                            {formatCurrency(item.unitCost)}
                          </td>

                          {/* Theoretical System Stock */}
                          <td className="py-3.5 px-3 text-right bg-zinc-100/40 dark:bg-neutral-800/50">
                            <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 block">
                              {item.closingStock} {item.unit}
                            </span>
                            <span className="text-[10px] text-neutral-400 block">
                              {t('System Book Stock', 'رصيد دفتري')}
                            </span>
                          </td>

                          {/* Actual Closing Count (Inline Input) */}
                          <td className="py-3.5 px-3 text-right bg-blue-50/40 dark:bg-blue-950/20">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={currentVal}
                                onChange={(e) => handleUpdateInlineActual(item.id, e.target.value)}
                                className={`w-24 p-1.5 text-xs font-mono font-bold text-right rounded-xl border outline-none transition-all ${
                                  inlineActualCounts[item.id] !== undefined
                                    ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-400 text-blue-900 dark:text-blue-100 ring-2 ring-blue-300'
                                    : 'bg-white dark:bg-neutral-800 border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                                }`}
                              />
                              <span className="text-[11px] font-semibold text-neutral-400 shrink-0">
                                {item.unit}
                              </span>

                              {inlineActualCounts[item.id] !== undefined && (
                                <button
                                  onClick={() => handleSaveSingleInline(item)}
                                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                                  title={t('Save this count', 'حفظ هذا الجرد')}
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80 block mt-0.5 text-right font-medium">
                              {item.actualClosingStock !== undefined
                                ? (item.lastCountDate ? `${t('Counted', 'تم الجرد')}: ${item.lastCountDate}` : t('Manual Count', 'جرد يدوي'))
                                : t('Uncounted (Matches system)', 'لم يُجرد بعد')}
                            </span>
                          </td>

                          {/* Variance in Units */}
                          <td className="py-3.5 px-3 text-right font-mono">
                            {isMatched ? (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                0.0 {item.unit}
                              </span>
                            ) : isShort ? (
                              <div>
                                <span className="font-bold text-rose-600 dark:text-rose-400 text-xs block">
                                  {diff.toFixed(1)} {item.unit}
                                </span>
                                <span className="text-[10px] text-rose-500 font-semibold">
                                  {t('Shortage', 'عجز')}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-amber-600 dark:text-amber-400 text-xs block">
                                  +{diff.toFixed(1)} {item.unit}
                                </span>
                                <span className="text-[10px] text-amber-600 font-semibold">
                                  {t('Surplus', 'فائض')}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Variance Value in QAR */}
                          <td className="py-3.5 px-3 text-right font-mono">
                            <span className={`font-bold text-xs ${
                              isMatched
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isShort
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {diffValue === 0 ? '0.00 QAR' : formatCurrency(diffValue)}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-3 text-center">
                            {isMatched ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t('MATCHED', 'مطابق')}</span>
                              </span>
                            ) : isShort ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{t('SHORTAGE', 'عجز')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                                <Boxes className="w-3 h-3" />
                                <span>{t('SURPLUS', 'فائض')}</span>
                              </span>
                            )}
                          </td>

                          {/* Reconciliation Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {!isMatched && (
                                <button
                                  onClick={() => handleReconcileSystemToActual(item)}
                                  className="px-2 py-1 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-neutral-900 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title={t('Adjust theoretical system stock to match this physical count', 'مطابقة رصيد النظام ليتفق مع الجرد')}
                                >
                                  <FileCheck className="w-3 h-3" />
                                  <span>{t('Align System', 'مطابقة')}</span>
                                </button>
                              )}

                              {isShort && (
                                <button
                                  onClick={() => handleWriteOffShortage(item)}
                                  className="px-2 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title={t('Write off shortage as damaged / shrinkage loss', 'شطب العجز كبضاعة تالفة')}
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{t('Write Off', 'إتلاف')}</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenPhysicalCount(item)}
                                className="p-1.5 text-zinc-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                title={t('Open Detailed Count Modal', 'فتح نافذة الجرد التفصيلي')}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'damaged' && (
        <div className="space-y-4">
          <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  {t('Direct Cash & P&L Loss: Damaged Goods & Expired Write-Offs', 'الخسارة المالية المباشرة للتالف، منتهي الصلاحية والهدر')}
                </h3>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                  {t(
                    'Every expired or damaged item directly reduces closing inventory and is booked as a cost write-off loss on the balance sheet.',
                    'أي بضاعة منتهية الصلاحية أو تالفة تخفض المخزون فورياً وتُقيد كخسارة مالية تؤثر على السيولة النقدية.'
                  )}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                {t('Total Spoilage Loss', 'إجمالي الخسارة')}
              </span>
              <span className="text-xl font-black text-rose-700 dark:text-rose-400 font-mono">
                {formatCurrency(totalDamagedLoss)}
              </span>
            </div>
          </div>

          {/* Damaged Goods Table */}
          <div className="bg-white dark:bg-neutral-900 border border-zinc-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-neutral-800/60 border-b border-zinc-200 dark:border-neutral-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-4">{t('Incident ID', 'رقم المحضر')}</th>
                    <th className="py-3 px-4">{t('Damaged / Expired Item', 'المادة التالفة / المنتهية')}</th>
                    <th className="py-3 px-3 text-right">{t('Quantity Lost', 'الكمية التالفة')}</th>
                    <th className="py-3 px-3">{t('Reason / Cause', 'سبب التلف')}</th>
                    <th className="py-3 px-3">{t('Branch', 'الفرع')}</th>
                    <th className="py-3 px-3">{t('Logged By', 'المسؤول')}</th>
                    <th className="py-3 px-3 text-right">{t('Financial Loss (QAR)', 'الخسارة المالية')}</th>
                    <th className="py-3 px-4 text-right">{t('Date & Time', 'الوقت')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 font-medium">
                  {damagedGoods.map((dmg) => {
                    const branch = BRANCHES.find((b) => b.id === dmg.branchId);

                    return (
                      <tr key={dmg.id} className="hover:bg-zinc-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-700 dark:text-rose-400">
                          {dmg.id}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                            {language === 'ar' ? dmg.itemNameAr : dmg.itemName}
                          </span>
                          {dmg.notes && (
                            <span className="text-[11px] text-zinc-400 block mt-0.5 italic">
                              "{dmg.notes}"
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          -{dmg.quantity} {dmg.unit}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                            {dmg.reason}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-zinc-600 dark:text-neutral-400">
                          {branch?.name}
                        </td>

                        <td className="py-3.5 px-3 text-zinc-500">
                          {dmg.loggedBy}
                        </td>

                        <td className="py-3.5 px-3 text-right font-black text-sm text-rose-700 dark:text-rose-400 font-mono">
                          {formatCurrency(dmg.totalFinancialLoss)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-[11px] text-zinc-400">
                          {dmg.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: ENTER ACTUAL PHYSICAL CLOSING COUNT */}
      {physicalCountItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>{t('Record Actual Physical Stock Count', 'تسجيل الجرد الفعلي للمادة')}</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  {physicalCountItem.name} ({physicalCountItem.unit})
                </p>
              </div>
              <button
                onClick={() => setPhysicalCountItem(null)}
                className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhysicalCount} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-800 text-xs">
                <div>
                  <span className="text-zinc-500 block">{t('System Theoretical Stock:', 'رصيد النظام الدفتري:')}</span>
                  <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                    {physicalCountItem.closingStock} {physicalCountItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">{t('Unit Cost:', 'سعر التكلفة:')}</span>
                  <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                    {formatCurrency(physicalCountItem.unitCost)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                  {t('Manually Entered Actual Physical Count', 'الرصيد الفعلي بعد الجرد اليدوي')} ({physicalCountItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  autoFocus
                  value={physicalCountVal}
                  onChange={(e) => setPhysicalCountVal(e.target.value)}
                  className="w-full p-3 text-lg font-bold font-mono rounded-2xl bg-zinc-50 dark:bg-neutral-800 border border-blue-300 dark:border-blue-700 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Live Variance Calculation Display */}
              {(() => {
                const parsed = parseFloat(physicalCountVal);
                if (isNaN(parsed)) return null;
                const diff = parsed - physicalCountItem.closingStock;
                const diffMoney = diff * physicalCountItem.unitCost;

                return (
                  <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                    diff === 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : diff < 0
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    <div>
                      <span className="font-bold block">
                        {diff === 0
                          ? t('✓ Exact Match with System', '✓ مطابق تماماً لرصيد النظام')
                          : diff < 0
                          ? t('⚠️ Inventory Shortage (Loss)', '⚠️ عجز / نقص في المخزون')
                          : t('📦 Inventory Surplus (Overage)', '📦 فائض في المخزون')}
                      </span>
                      <span className="text-[11px] font-mono">
                        {diff > 0 ? `+${diff}` : diff} {physicalCountItem.unit}
                      </span>
                    </div>
                    <div className="text-right font-mono font-bold text-sm">
                      {formatCurrency(diffMoney)}
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPhysicalCountItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-xs font-bold text-zinc-700 dark:text-neutral-300"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold"
                >
                  {t('Save Actual Count', 'حفظ الجرد الفعلي')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: LOG DAMAGED STOCK & CASH LOSS */}
      {isDamageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{t('Record Damaged / Expired Stock', 'تسجيل بضاعة تالفة / هدر')}</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  {t('Reduces inventory stock and logs financial write-off', 'خصم فوري من المخزون وتدوين الخسارة المالية')}
                </p>
              </div>
              <button
                onClick={() => setIsDamageModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDamage} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                  {t('Select Inventory Item', 'اختر المادة من المخزون')}
                </label>
                <select
                  value={damageItemId}
                  onChange={(e) => {
                    setDamageItemId(e.target.value);
                    const it = inventory.find((i) => i.id === e.target.value);
                    if (it) {
                      setDamageBranch(it.location);
                      setDamageQty(Math.min(it.closingStock, 1));
                    }
                  }}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (Stock: {inv.closingStock} {inv.unit} · {formatCurrency(inv.unitCost)}/{inv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Quantity Damaged', 'الكمية التالفة')} ({inventory.find((i) => i.id === damageItemId)?.unit || 'units'})
                  </label>
                  <input
                    type="number"
                    step={
                      inventory.find((i) => i.id === damageItemId)?.unit === 'g' ||
                      inventory.find((i) => i.id === damageItemId)?.unit === 'ml'
                        ? '1'
                        : '0.1'
                    }
                    min="0.1"
                    required
                    value={damageQty}
                    onChange={(e) => setDamageQty(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-xs font-mono font-bold rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Disposal Reason', 'سبب الإتلاف')}
                  </label>
                  <select
                    value={damageReason}
                    onChange={(e) => setDamageReason(e.target.value as DamageReason)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="Spoilage & Expired">{t('Spoilage & Expired', 'انتهاء الصلاحية والتلف')}</option>
                    <option value="Dropped & Spilled">{t('Dropped & Spilled', 'سقوط وانسكاب')}</option>
                    <option value="Overcooked & Burned">{t('Overcooked & Burned', 'احتراق أثناء التحضير')}</option>
                    <option value="Crushed Packaging">{t('Crushed Packaging', 'تلف التغليف')}</option>
                    <option value="Temperature Abuse">{t('Temperature Abuse', 'خلل تبريد')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                  {t('Branch Location', 'فرع الإتلاف')}
                </label>
                <select
                  value={damageBranch}
                  onChange={(e) => setDamageBranch(e.target.value as BranchId)}
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
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                  {t('Incident Notes', 'ملاحظات المحضر')}
                </label>
                <textarea
                  rows={2}
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="e.g. Milk jug spoiled due to power outage / Expired batch found during inspection..."
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Financial loss preview */}
              {(() => {
                const item = inventory.find((i) => i.id === damageItemId);
                const loss = (item ? item.unitCost : 0) * damageQty;
                return (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs">
                    <span className="text-rose-700 dark:text-rose-300 font-semibold">
                      {t('Total Cost Written-Off:', 'إجمالي الخسارة المشطوبة:')}
                    </span>
                    <span className="font-mono font-black text-rose-700 dark:text-rose-400 text-sm">
                      {formatCurrency(loss)}
                    </span>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-zinc-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDamageModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  {t('Confirm Write-Off', 'تأكيد الإتلاف والشطب')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: ADJUST / EDIT STOCK & COMPARISON */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('Adjust Stock & Reorder Levels', 'تعديل أرصدة المخزون وحدود الطلب')}
                </h3>
                <p className="text-xs text-zinc-500">
                  {adjustingItem.name} ({adjustingItem.unit})
                </p>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Info Note: Expiry comes from purchases */}
              <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-xs">
                <span className="font-bold text-blue-900 dark:text-blue-200 block mb-0.5">
                  {t('Batch Expiry Date (From Purchases):', 'تاريخ الصلاحية (مستخرج من المشتريات):')}
                </span>
                <span className="font-mono font-bold text-amber-600 block">
                  {adjustingItem.expiryDate || t('Not yet recorded in purchases', 'لم يتم تسجيله في المشتريات بعد')}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-neutral-400 mt-1 block">
                  {t('Expiry dates are assigned automatically when recording supplier purchases.', 'يتم تحديد تواريخ الصلاحية تلقائياً عند تسجيل المشتريات.')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('System Stock', 'رصيد النظام')} ({adjustingItem.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newStockVal}
                    onChange={(e) => setNewStockVal(e.target.value)}
                    className="w-full p-2.5 text-sm font-bold font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-blue-700 dark:text-blue-300 block mb-1">
                    {t('Actual Count', 'الجرد الفعلي')} ({adjustingItem.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newActualStockVal}
                    onChange={(e) => setNewActualStockVal(e.target.value)}
                    className="w-full p-2.5 text-sm font-bold font-mono rounded-xl bg-blue-50/40 dark:bg-neutral-800 border border-blue-300 dark:border-blue-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                  {t('Min Reorder Threshold', 'حد إعادة الطلب الأدنى')} ({adjustingItem.unit})
                </label>
                <input
                  type="number"
                  step="1"
                  value={newMinReorderVal}
                  onChange={(e) => setNewMinReorderVal(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-xs font-bold text-zinc-700 dark:text-neutral-300"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAdjust}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold"
                >
                  {t('Save Changes', 'حفظ التعديلات')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
