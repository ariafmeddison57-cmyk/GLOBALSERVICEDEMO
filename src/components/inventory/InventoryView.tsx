import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Clock,
  ClipboardList,
  Search,
  Plus,
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
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  HelpCircle,
  Timer,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { InventoryItem, DamageReason, BranchId } from '../../types';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    updateInventoryStock,
    updateInventoryItem,
    addInventoryItem,
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

  const [activeTab, setActiveTab] = useState<'stock' | 'damaged'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState<'all' | 'expired' | 'critical' | 'warning' | 'fresh'>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'normal'>('all');

  // Adjust / Edit modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [newStockVal, setNewStockVal] = useState<string>('');
  const [newExpiryVal, setNewExpiryVal] = useState<string>('');
  const [newMinReorderVal, setNewMinReorderVal] = useState<string>('');

  // Add Item Modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemNameAr, setNewItemNameAr] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('Dairy & Fresh');
  const [newItemUnit, setNewItemUnit] = useState<InventoryItem['unit']>('kg');
  const [newItemOpeningStock, setNewItemOpeningStock] = useState<number>(50);
  const [newItemMinReorder, setNewItemMinReorder] = useState<number>(15);
  const [newItemCost, setNewItemCost] = useState<number>(25);
  const [newItemLocation, setNewItemLocation] = useState<BranchId>('west-walk');
  const [newItemExpiry, setNewItemExpiry] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newItemSupplier, setNewItemSupplier] = useState('Baladna Food Industries');

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
    const expiry = new Date(expiryDateStr);
    const diffMs = expiry.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const isExpired = daysRemaining < 0;
    const isCritical = daysRemaining >= 0 && daysRemaining <= 7; // 0 to 7 days
    const isWarning = daysRemaining > 7 && daysRemaining <= 30; // 8 to 30 days
    const isFresh = daysRemaining > 30;

    return { daysRemaining, isExpired, isCritical, isWarning, isFresh };
  };

  // Aggregated Counts
  const totalValue = inventory.reduce((sum, item) => sum + item.closingStock * item.unitCost, 0);
  const lowStockItems = inventory.filter((item) => item.closingStock <= item.minReorderLevel);
  
  const expiredItems = inventory.filter((item) => getExpiryMetrics(item.expiryDate).isExpired);
  const criticalExpiringItems = inventory.filter((item) => getExpiryMetrics(item.expiryDate).isCritical);
  const warningExpiringItems = inventory.filter((item) => getExpiryMetrics(item.expiryDate).isWarning);
  const expiringSoonCount = criticalExpiringItems.length + warningExpiringItems.length;

  const openPoCount = purchases.filter((p) => p.status !== 'Delivered').length;

  const categories = ['all', 'Beans & Leaves', 'Dairy & Fresh', 'Syrups & Flavors', 'Packaging', 'Proteins & Base', 'Dry Goods'];

  const damageReasonsList: DamageReason[] = [
    'Spoilage & Expired',
    'Dropped & Spilled',
    'Overcooked & Burned',
    'Crushed Packaging',
    'Prep Defect',
    'Temperature Abuse',
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.includes(searchQuery) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.expiryDate.includes(searchQuery);
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;

    const metrics = getExpiryMetrics(item.expiryDate);
    let matchesExpiry = true;
    if (expiryStatusFilter === 'expired') matchesExpiry = metrics.isExpired;
    else if (expiryStatusFilter === 'critical') matchesExpiry = metrics.isCritical;
    else if (expiryStatusFilter === 'warning') matchesExpiry = metrics.isWarning;
    else if (expiryStatusFilter === 'fresh') matchesExpiry = metrics.isFresh;

    let matchesStock = true;
    if (stockStatusFilter === 'low') matchesStock = item.closingStock <= item.minReorderLevel;
    else if (stockStatusFilter === 'normal') matchesStock = item.closingStock > item.minReorderLevel;

    return matchesSearch && matchesCategory && matchesLocation && matchesExpiry && matchesStock;
  });

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setNewStockVal(item.closingStock.toString());
    setNewExpiryVal(item.expiryDate || todayStr);
    setNewMinReorderVal(item.minReorderLevel.toString());
  };

  const handleSaveAdjust = () => {
    if (!adjustingItem) return;
    const parsedStock = parseFloat(newStockVal);
    const parsedMin = parseFloat(newMinReorderVal);

    updateInventoryItem(adjustingItem.id, {
      closingStock: !isNaN(parsedStock) && parsedStock >= 0 ? parsedStock : adjustingItem.closingStock,
      expiryDate: newExpiryVal || adjustingItem.expiryDate,
      minReorderLevel: !isNaN(parsedMin) && parsedMin >= 0 ? parsedMin : adjustingItem.minReorderLevel,
    });

    setAdjustingItem(null);
  };

  const handleQuickLogExpired = (item: InventoryItem) => {
    // Quick write-off prefilling for an expired item
    setDamageItemId(item.id);
    setDamageQty(item.closingStock > 0 ? item.closingStock : 1);
    setDamageReason('Spoilage & Expired');
    setDamageBranch(item.location);
    setDamageNotes(`Expired on ${item.expiryDate}. Auto-logged for health safety write-off.`);
    setIsDamageModalOpen(true);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addInventoryItem({
      name: newItemName.trim(),
      nameAr: newItemNameAr.trim() || newItemName.trim(),
      brandIds: ['kahwatee', 'events'],
      category: newItemCategory,
      unit: newItemUnit,
      openingStock: newItemOpeningStock,
      purchased: 0,
      used: 0,
      closingStock: newItemOpeningStock,
      minReorderLevel: newItemMinReorder,
      unitCost: newItemCost,
      location: newItemLocation,
      expiryDate: newItemExpiry,
      supplier: newItemSupplier.trim() || 'Central Supplier',
    });

    setIsAddItemModalOpen(false);
    setNewItemName('');
    setNewItemNameAr('');
  };

  const handleSubmitDamage = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find((i) => i.id === damageItemId);
    if (!item || damageQty <= 0) return;

    const lossAmount = parseFloat((damageQty * item.unitCost).toFixed(2));

    logDamagedStock({
      inventoryItemId: item.id,
      itemName: item.name,
      itemNameAr: item.nameAr,
      quantity: damageQty,
      unit: item.unit,
      unitCost: item.unitCost,
      totalFinancialLoss: lossAmount,
      reason: damageReason,
      branchId: damageBranch,
      loggedBy: damageLoggedBy.trim() || 'Shift Supervisor',
      notes: damageNotes.trim() || undefined,
    });

    setIsDamageModalOpen(false);
    setDamageQty(1);
    setDamageNotes('');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-[10px] font-bold tracking-wide uppercase">
              {t('Central Warehouse & Branches', 'المستودع المركزي والفروع')}
            </span>
            {expiredItems.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase tracking-wide flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                <span>{expiredItems.length} {t('Expired SKUs Require Disposal', 'أصناف منتهية الصلاحية')}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('Inventory Ledger, Expiration Dates & Waste Tracking', 'دفتر المخزون، تواريخ الصلاحية وسجل الهدر والتلف')}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
            {t(
              'Tracks live stock, shelf-life expiration dates, FIFO alerts, recipe depletion, and automatic write-offs.',
              'متابعة المخزون الحي، تواريخ انتهاء الصلاحية، تنبيهات التلف، استهلاك الوصفات وشطب الهدر المالي.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-neutral-900 font-bold text-xs shadow-xs transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Add New Ingredient / SKU', '+ إضافة مادة للمخزون')}</span>
          </button>

          <button
            onClick={() => setIsDamageModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('+ Log Damaged / Expired Goods', '+ تسجيل بضاعة تالفة / هدر')}</span>
          </button>

          <button
            onClick={() => setCurrentView('menu')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs border border-zinc-200 dark:border-neutral-700 transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>{t('View Recipe BOMs', 'معاينة الوصفات')}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Refined SaaS sizing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Value */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Total Inventory Value', 'قيمة المخزون الكلية')}
          </span>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
            {formatCurrency(totalValue)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {inventory.length} {t('Active ingredients & SKUs', 'صنف ومادة غذائية')}
          </p>
        </div>

        {/* Expired Stock Alert Card */}
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

        {/* Expiring Soon Card */}
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
            +{warningExpiringItems.length} {t('expiring in 30 days', 'خلال ٣٠ يوماً')}
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

        {/* DAMAGED GOODS / SPOILAGE LOSS */}
        <div 
          onClick={() => setActiveTab('damaged')}
          className="cursor-pointer bg-rose-50/50 dark:bg-rose-950/20 hover:ring-2 hover:ring-rose-300 rounded-2xl p-4 border border-rose-200/70 dark:border-rose-900/40 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              {t('Damaged Stock Loss (MTD)', 'خسائر التلف والهدر')}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
            {formatCurrency(totalDamagedLoss)}
          </div>
          <p className="text-[11px] text-rose-600/90 mt-1 font-medium">
            {damagedGoods.length} {t('spoilage incidents written off', 'حالات إتلاف مسجلة')}
          </p>
        </div>
      </div>

      {/* 3. Section Tabs: Stock Ledger vs Damaged Goods Log */}
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
          <span>{t('Inventory Stock Ledger & Shelf Expiry', 'جدول أرصدة المخزون وتواريخ الصلاحية')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white dark:bg-neutral-200 dark:text-neutral-900">
            {inventory.length}
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

      {/* TAB 1: Main Inventory Ledger */}
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                expiryStatusFilter === 'expired'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>{t('Expired Already', 'منتهية الصلاحية')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {expiredItems.length}
              </span>
            </button>

            <button
              onClick={() => setExpiryStatusFilter('critical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                expiryStatusFilter === 'critical'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <Timer className="w-3 h-3" />
              <span>{t('Critical (≤ 7 Days)', 'حرجة (خلال ٧ أيام)')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {criticalExpiringItems.length}
              </span>
            </button>

            <button
              onClick={() => setExpiryStatusFilter('warning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                expiryStatusFilter === 'warning'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              {t('Warning (8 - 30 Days)', 'تحذير (٨ - ٣٠ يوماً)')} ({warningExpiringItems.length})
            </button>

            <button
              onClick={() => setExpiryStatusFilter('fresh')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                expiryStatusFilter === 'fresh'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {t('Fresh (> 30 Days)', 'صالحة ومستقرة')}
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
                placeholder={t('Filter by item, expiry date (YYYY-MM-DD), or supplier...', 'بحث بالصنف، تاريخ الصلاحية، أو المورد...')}
                className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Category Filter */}
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

              {/* Location Filter */}
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

              {/* Stock Level Filter */}
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value as any)}
                className="text-xs font-medium bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 px-3 py-2 rounded-xl border border-zinc-200 dark:border-neutral-700"
              >
                <option value="all">{t('All Stock Levels', 'كافة مستويات الرصيد')}</option>
                <option value="low">{t('Low Stock Only', 'الرصيد المنخفض فقط')}</option>
                <option value="normal">{t('Normal Stock', 'الرصيد الطبيعي')}</option>
              </select>
            </div>
          </div>

          {/* Stock & Expiry Table */}
          <div className="bg-white dark:bg-neutral-900 border border-zinc-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-neutral-800/60 border-b border-zinc-200 dark:border-neutral-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-4">{t('Product / Item', 'الصنف / المادة')}</th>
                    <th className="py-3 px-3">{t('Category', 'التصنيف')}</th>
                    <th className="py-3 px-3 text-right">{t('Opening', 'الافتتاحي')}</th>
                    <th className="py-3 px-3 text-right">{t('Purchased', 'المشترى')}</th>
                    <th className="py-3 px-3 text-right">{t('Used', 'المستهلك')}</th>
                    <th className="py-3 px-3 text-right">{t('Closing Stock', 'المخزون الحالي')}</th>
                    <th className="py-3 px-3 text-right">{t('Total Value', 'القيمة')}</th>
                    <th className="py-3 px-3">{t('Expiration Date', 'تاريخ الصلاحية')}</th>
                    <th className="py-3 px-3 text-center">{t('Shelf Status', 'حالة الصلاحية')}</th>
                    <th className="py-3 px-4 text-center">{t('Action', 'إجراء')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 font-medium">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-zinc-400">
                        <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>{t('No inventory items match the selected filter criteria.', 'لا توجد أصناف مطابقة لمعايير البحث الحالية.')}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isLow = item.closingStock <= item.minReorderLevel;
                      const totalItemVal = item.closingStock * item.unitCost;
                      const expiryMetrics = getExpiryMetrics(item.expiryDate);

                      return (
                        <tr 
                          key={item.id} 
                          className={`transition-colors ${
                            expiryMetrics.isExpired
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                              : expiryMetrics.isCritical
                              ? 'bg-amber-50/30 dark:bg-amber-950/15 hover:bg-amber-50 dark:hover:bg-amber-950/25'
                              : 'hover:bg-zinc-50/80 dark:hover:bg-neutral-800/40'
                          }`}
                        >
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

                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-300 font-medium">
                              {item.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono text-zinc-600 dark:text-neutral-400">
                            {item.openingStock} {item.unit}
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">
                            +{item.purchased} {item.unit}
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono text-amber-600 dark:text-amber-400 font-bold">
                            -{item.used} {item.unit}
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <span className={`font-mono font-black text-sm ${isLow ? 'text-rose-600' : 'text-neutral-900 dark:text-white'}`}>
                              {item.closingStock} {item.unit}
                            </span>
                            {isLow && (
                              <span className="block text-[10px] font-bold text-rose-500 uppercase">
                                {t('Reorder', 'إعادة طلب')}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white">
                            {formatCurrency(totalItemVal)}
                          </td>

                          {/* EXPIRATION DATE COLUMN */}
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
                                {item.expiryDate || 'N/A'}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {expiryMetrics.isExpired
                                ? t(`Expired ${Math.abs(expiryMetrics.daysRemaining)}d ago`, `انتهت منذ ${Math.abs(expiryMetrics.daysRemaining)} أيام`)
                                : expiryMetrics.daysRemaining === 0
                                ? t('Expires today!', 'ينتهي اليوم!')
                                : t(`${expiryMetrics.daysRemaining} days left`, `متبقي ${expiryMetrics.daysRemaining} يوماً`)}
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
                              {expiryMetrics.isExpired ? (
                                <button
                                  onClick={() => handleQuickLogExpired(item)}
                                  className="px-2 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1"
                                  title="Write off expired stock to damaged goods"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{t('Write Off', 'إتلاف')}</span>
                                </button>
                              ) : null}

                              <button
                                onClick={() => handleOpenAdjust(item)}
                                className="p-1.5 text-zinc-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
                                title="Edit Stock & Expiry Date"
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

      {/* TAB 2: Damaged Goods & Spoilage Write-Off Ledger */}
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

      {/* 4. MODAL: LOG DAMAGED STOCK & CASH LOSS */}
      {isDamageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {t('Log Damaged Goods / Spoilage / Expired Incident', 'تسجيل واقعة هدر أو بضاعة تالفة أو منتهية')}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-neutral-400">
                    {t('Instantly deducts stock and books direct financial loss', 'يخصم المخزون فورياً ويسجل الخسارة المالية')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDamageModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-neutral-800 text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDamage} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                  {t('Select Inventory Item', 'اختر المادة من المخزون')} *
                </label>
                <select
                  value={damageItemId}
                  onChange={(e) => setDamageItemId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium"
                >
                  {inventory.map((i) => {
                    const metrics = getExpiryMetrics(i.expiryDate);
                    return (
                      <option key={i.id} value={i.id}>
                        {i.name} (Stock: {i.closingStock} {i.unit} · Expiry: {i.expiryDate} {metrics.isExpired ? '⚠️ EXPIRED' : ''})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Quantity Damaged / Discarded', 'الكمية التالفة / المستبعدة')} *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={damageQty}
                    onChange={(e) => setDamageQty(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-xs font-bold font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Reason for Damage', 'سبب التلف')}
                  </label>
                  <select
                    value={damageReason}
                    onChange={(e) => setDamageReason(e.target.value as DamageReason)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    {damageReasonsList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Branch Location', 'الفرع')}
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
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Logged By (Employee)', 'الموظف المبلغ')}
                  </label>
                  <input
                    type="text"
                    value={damageLoggedBy}
                    onChange={(e) => setDamageLoggedBy(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                  {t('Incident Notes', 'تفاصيل الحادثة')}
                </label>
                <textarea
                  rows={2}
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="e.g. Expired batch disposed safely; or container broken during rush."
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Financial Write-Off Preview */}
              {(() => {
                const item = inventory.find((i) => i.id === damageItemId);
                const previewLoss = item ? (damageQty * item.unitCost).toFixed(2) : '0';
                return (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-rose-900 dark:text-rose-200 block">
                        {t('Financial Cost Write-off Loss:', 'قيمة الخسارة المالية المسجلة:')}
                      </span>
                      <span className="text-[11px] text-rose-700 dark:text-rose-300">
                        {damageQty} {item?.unit} @ QAR {item?.unitCost}/{item?.unit}
                      </span>
                    </div>
                    <span className="text-lg font-black text-rose-700 dark:text-rose-400 font-mono">
                      QAR {previewLoss}
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
                  {t('Confirm & Write Off Loss', 'تأكيد الخصم وتسجيل الخسارة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: EDIT STOCK COUNT & EXPIRY DATE */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-neutral-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('Edit Stock & Expiry Date', 'تعديل الرصيد وتاريخ الصلاحية')}
                </h3>
                <p className="text-xs text-zinc-500">{adjustingItem.name}</p>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                  {t('Physical Count (Closing Stock)', 'الرصيد الفعلي')} ({adjustingItem.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full p-3 text-lg font-bold font-mono rounded-2xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{t('Expiration Date (Shelf Life)', 'تاريخ انتهاء الصلاحية')}</span>
                </label>
                <input
                  type="date"
                  value={newExpiryVal}
                  onChange={(e) => setNewExpiryVal(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  {t('Used for automated spoilage warnings and FIFO batch tracking.', 'يُستخدم لتنبيهات الصلاحية ومتابعة الدفعات.')}
                </p>
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

      {/* 6. MODAL: ADD NEW INVENTORY ITEM */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('Add New Inventory Item / Raw Material', 'إضافة مادة خام جديدة للمخزون')}
                </h3>
                <p className="text-xs text-zinc-500">
                  {t('Record new SKU with expiration date and batch cost', 'تسجيل صنف جديد مع تاريخ الصلاحية وسعر التكلفة')}
                </p>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Item Name (EN)', 'اسم الصنف بالإنجليزي')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Organic Almond Milk 1L"
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Item Name (AR)', 'اسم الصنف بالعربي')}
                  </label>
                  <input
                    type="text"
                    value={newItemNameAr}
                    onChange={(e) => setNewItemNameAr(e.target.value)}
                    placeholder="مثال: حليب لوز عضوي ١ لتر"
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Category', 'التصنيف')}
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    {categories.filter((c) => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Unit of Measurement', 'وحدة القياس')}
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="kg">kg (كيلوغرام)</option>
                    <option value="L">L (لتر)</option>
                    <option value="pcs">pcs (حبة)</option>
                    <option value="box">box (علبة)</option>
                    <option value="carton">carton (كرتون)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Initial Stock', 'الرصيد الأولي')} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newItemOpeningStock}
                    onChange={(e) => setNewItemOpeningStock(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Min Reorder', 'حد الطلب')}
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={newItemMinReorder}
                    onChange={(e) => setNewItemMinReorder(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Unit Cost (QAR)', 'التكلفة بالريال')} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t('Expiration Date', 'تاريخ الصلاحية')} *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newItemExpiry}
                    onChange={(e) => setNewItemExpiry(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                    {t('Storage Location', 'موقع التخزين')}
                  </label>
                  <select
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-neutral-300 block mb-1">
                  {t('Supplier Name', 'اسم المورد')}
                </label>
                <input
                  type="text"
                  value={newItemSupplier}
                  onChange={(e) => setNewItemSupplier(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-neutral-900 text-white shadow-sm"
                >
                  {t('Add to Inventory', 'إضافة للمخزون')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
