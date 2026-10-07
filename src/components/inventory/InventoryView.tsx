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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { InventoryItem, DamageReason, BranchId } from '../../types';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    updateInventoryStock,
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
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [newStockVal, setNewStockVal] = useState<string>('');

  // Damaged stock modal state
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [damageItemId, setDamageItemId] = useState<string>(inventory[0]?.id || '');
  const [damageQty, setDamageQty] = useState<number>(1);
  const [damageReason, setDamageReason] = useState<DamageReason>('Spoilage & Expired');
  const [damageBranch, setDamageBranch] = useState<BranchId>('west-walk');
  const [damageLoggedBy, setDamageLoggedBy] = useState<string>('Store Shift Lead');
  const [damageNotes, setDamageNotes] = useState<string>('');

  // Calculations
  const totalValue = inventory.reduce((sum, item) => sum + item.closingStock * item.unitCost, 0);
  const lowStockItems = inventory.filter((item) => item.closingStock <= item.minReorderLevel);
  const expiringSoonItems = inventory.filter(
    (item) => new Date(item.expiryDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30
  );
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
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setNewStockVal(item.closingStock.toString());
  };

  const handleSaveAdjust = () => {
    if (!adjustingItem) return;
    const parsed = parseFloat(newStockVal);
    if (!isNaN(parsed) && parsed >= 0) {
      updateInventoryStock(adjustingItem.id, parsed);
    }
    setAdjustingItem(null);
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
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('Inventory Ledger & Waste / Damaged Goods Tracking', 'دفتر المخزون وسجل الهدر والتلف المالي')}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-1">
            {t(
              'Tracks live stock, POS recipe depletion, and automatic financial write-offs for damaged goods.',
              'متابعة المخزون، استهلاك الوصفات وخصم الهدر والتلفيات المباشرة من الأرباح والمخزون.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDamageModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('+ Log Damaged Goods / Spoilage', '+ تسجيل بضاعة تالفة / هدر')}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* DAMAGED GOODS / SPOILAGE DIRECT FINANCIAL LOSS CARD */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-200/70 dark:border-rose-900/40 shadow-xs">
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

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Low Stock Threshold', 'أصناف قاربت على النفاد')}
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {lowStockItems.length} {t('Items', 'أصناف')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {t('Needs reorder PO generation', 'بحاجة لأمر شراء فوري')}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('Open Purchase Orders', 'أوامر شراء مفتوحة')}
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {openPoCount} {t('Orders', 'أوامر')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {t('Baladna, Global Frozen, Coffee Planet', 'موردو الألبان والبن')}
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
          <span>{t('Inventory Stock Ledger', 'جدول أرصدة المخزون')}</span>
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
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Filter by item or supplier...', 'بحث بالصنف أو المورد...')}
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

          {/* Stock Table */}
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
                    <th className="py-3 px-4 text-center">{t('Status', 'الحالة')}</th>
                    <th className="py-3 px-4 text-center">{t('Action', 'إجراء')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 font-medium">
                  {filteredInventory.map((item) => {
                    const isLow = item.closingStock <= item.minReorderLevel;
                    const totalItemVal = item.closingStock * item.unitCost;

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-neutral-900 dark:text-neutral-100">
                            {language === 'ar' ? item.nameAr : item.name}
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
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white">
                          {formatCurrency(totalItemVal)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{t('Low Stock', 'منخفض')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('Normal', 'طبيعي')}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenAdjust(item)}
                            className="p-1.5 text-zinc-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Adjust Count"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
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
                  {t('Direct Cash & P&L Loss: Damaged Goods Write-Offs', 'الخسارة المالية المباشرة للتالف والهدر')}
                </h3>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                  {t('Every damaged item directly reduces closing inventory and is booked as a cost write-off loss on the balance sheet.', 'أي بضاعة تالفة تخفض المخزون فورياً وتُقيد كخسارة مالية تؤثر على السيولة النقدية.')}
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
                    <th className="py-3 px-4">{t('Damaged Item', 'المادة التالفة')}</th>
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
                    {t('Log Damaged Goods / Spoilage Incident', 'تسجيل واقعة هدر أو بضاعة تالفة')}
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
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Available: {i.closingStock} {i.unit} · Unit Cost: QAR {i.unitCost})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-neutral-400 block mb-1">
                    {t('Quantity Damaged', 'الكمية التالفة')} *
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
                  placeholder="e.g. Milk carton dropped during morning rush; container punctured on floor."
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

      {/* Adjust Count Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-neutral-800">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {t('Manual Physical Stock Count', 'تعديل الجرد الفعلي للمخزون')}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">{adjustingItem.name}</p>

            <div>
              <label className="text-xs font-bold text-zinc-500">
                {t('Physical Count', 'الرصيد الفعلي')} ({adjustingItem.unit})
              </label>
              <input
                type="number"
                value={newStockVal}
                onChange={(e) => setNewStockVal(e.target.value)}
                className="w-full mt-1 p-3 text-lg font-bold font-mono rounded-2xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700 text-center"
              />
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setAdjustingItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 text-xs font-bold text-zinc-700 dark:text-neutral-300"
              >
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={handleSaveAdjust}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold"
              >
                {t('Save Count', 'تحديث الرصيد')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
