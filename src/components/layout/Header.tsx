import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  Sun,
  Moon,
  Globe,
  Store,
  ChevronDown,
  Lock,
  Unlock,
  CheckCircle2,
  Check,
  X,
  FileSpreadsheet,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANDS, BRANCHES, POS_UNITS } from '../../data/mockData';
import { PosUnitId } from '../../types';

export const Header: React.FC = () => {
  const {
    currentView,
    userRole,
    currentPosUnit,
    posUnits,
    loginAsCashier,
    loginAsAdmin,
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    designVariant,
    setDesignVariant,
    formatCurrency,
    isSidebarCollapsed,
    toggleSidebar,
    isRTL,
    dateRange,
    setDateRange,
    orders,
    inventory,
    staff,
    expenses,
    totalTodaySales,
    totalMonthlySales,
    totalExpenses,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const [isExportToastOpen, setIsExportToastOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDesignMenuOpen, setIsDesignMenuOpen] = useState(false);
  const [exportedReportName, setExportedReportName] = useState('');

  const designOptions = [
    { id: 'grove' as const, name: t('Grove', 'الحديقة'), note: t('Forest & brass', 'أخضر ونحاسي'), colors: ['#17352c', '#e6c18f', '#f5f6f3'] },
    { id: 'dune' as const, name: t('Dune', 'الكثبان'), note: t('Clay & sand', 'طيني ورملي'), colors: ['#624431', '#c26c45', '#faf5ed'] },
    { id: 'harbor' as const, name: t('Harbor', 'المرفأ'), note: t('Navy & mist', 'كحلي وضبابي'), colors: ['#1c3552', '#cd9b64', '#f1f5f8'] },
  ];

  const handleExport = () => {
    const csvValue = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows: unknown[][] = [
      ['GLOBALSERVICES Operations Report'],
      [t('Dashboard period selected', 'الفترة المحددة في لوحة المعلومات'), dateRange],
      [t('Ledger coverage', 'نطاق السجل'), t('All records currently loaded in this demo', 'كل السجلات المحملة حاليًا في هذه النسخة التجريبية')],
      [t('Generated at', 'تاريخ الإنشاء'), new Date().toLocaleString()],
      [],
      [t('Summary metric', 'المؤشر'), t('Value', 'القيمة')],
      [t("Today's sales (QAR)", 'مبيعات اليوم (ر.ق)'), totalTodaySales.toFixed(2)],
      [t('Monthly sales (QAR)', 'المبيعات الشهرية (ر.ق)'), totalMonthlySales.toFixed(2)],
      [t('Operating expenses (QAR)', 'المصروفات التشغيلية (ر.ق)'), totalExpenses.toFixed(2)],
      [t('Orders in ledger', 'الطلبات في السجل'), orders.length],
      [t('Inventory items', 'أصناف المخزون'), inventory.length],
      [t('Staff members', 'الموظفون'), staff.length],
      [],
      [
        t('Order ID', 'رقم الطلب'),
        t('Created at', 'تاريخ الطلب'),
        t('Brand', 'العلامة'),
        t('Branch', 'الفرع'),
        t('POS unit', 'نقطة البيع'),
        t('Order type', 'نوع الطلب'),
        t('Payment method', 'طريقة الدفع'),
        t('Status', 'الحالة'),
        t('Subtotal (QAR)', 'المجموع الفرعي (ر.ق)'),
        t('Tax (QAR)', 'الضريبة (ر.ق)'),
        t('Total (QAR)', 'الإجمالي (ر.ق)'),
        t('Items', 'الأصناف'),
      ],
      ...orders.map((order) => [
        order.id,
        order.createdAt.toLocaleString(),
        BRANDS.find((brand) => brand.id === order.brandId)?.name || order.brandId,
        BRANCHES.find((branch) => branch.id === order.branchId)?.name || order.branchId,
        POS_UNITS.find((unit) => unit.id === order.posUnitId)?.name || order.posUnitId,
        order.orderType,
        order.paymentMethod,
        order.status,
        order.subtotal.toFixed(2),
        order.tax.toFixed(2),
        order.total.toFixed(2),
        order.items.map((item) => `${item.product.name} x${item.quantity}`).join('; '),
      ]),
      [],
      [t('Expense details', 'تفاصيل المصروفات')],
      [
        t('Expense', 'المصروف'),
        t('Date', 'التاريخ'),
        t('Category', 'الفئة'),
        t('Branch', 'الفرع'),
        t('Paid to', 'دفع إلى'),
        t('Payment method', 'طريقة الدفع'),
        t('Amount (QAR)', 'المبلغ (ر.ق)'),
        t('Receipt reference', 'مرجع الإيصال'),
      ],
      ...expenses.map((expense) => [
        expense.title,
        expense.date,
        expense.category,
        BRANCHES.find((branch) => branch.id === expense.branchId)?.name || expense.branchId,
        expense.paidTo,
        expense.paymentMethod,
        expense.amount.toFixed(2),
        expense.receiptRef || '',
      ]),
    ];

    const csv = `\uFEFF${rows.map((row) => row.map(csvValue).join(',')).join('\r\n')}`;
    const reportName = `GLOBALSERVICES_Operations_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    const reportUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const downloadLink = document.createElement('a');
    downloadLink.href = reportUrl;
    downloadLink.download = reportName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(reportUrl), 1000);

    setExportedReportName(reportName);
    setIsExportToastOpen(true);
    setTimeout(() => setIsExportToastOpen(false), 3500);
  };

  return (
    <header className="h-18 px-4 sm:px-6 bg-white dark:bg-neutral-900 border-b border-slate-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 sm:gap-4 z-20 shrink-0 transition-colors duration-200">
      {/* Zone 1: Sidebar Toggle (when admin) + Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Sidebar Collapse Toggle Button (only when logged in as admin) */}
        {userRole === 'admin' && ['dashboard', 'reports', 'payroll'].includes(currentView) && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            title={isSidebarCollapsed ? t('Expand Sidebar', 'توسيع القائمة') : t('Collapse Sidebar', 'طي القائمة')}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-slate-700 dark:text-neutral-300" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-slate-700 dark:text-neutral-300" />
            )}
          </button>
        )}

        {/* POS Station Indicator badge when logged into cashier POS mode (No Sidebar) */}
        {userRole === 'cashier' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold shrink-0">
            <Store className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">{currentPosUnit.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              userRole === 'cashier'
                ? t('Search terminal products...', 'بحث في منتجات المحطة...')
                : t('Search products, orders, recipes, inventory, expenses...', 'بحث في الأصناف، الطلبات، الوصفات، المصروفات...')
            }
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-xs rounded-full bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700/80 text-slate-900 dark:text-neutral-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Zone 2: Controls, Switcher, Theme, Bell, Date Range & Primary CTA */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Terminal Login Status Pill */}
        <button
          onClick={() => setIsStationModalOpen(true)}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            userRole === 'admin'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 border-slate-900 dark:border-white shadow-xs'
              : 'bg-amber-500 text-white border-amber-600 shadow-xs'
          }`}
          title="Switch Login Role or Station"
        >
          {userRole === 'admin' ? (
            <Unlock className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-white" />
          )}
          <span className="hidden sm:inline">
            {userRole === 'admin'
              ? t('HQ Admin (All Units)', 'المدير العام للمجموعة')
              : `${currentPosUnit.name.split(' ')[0]} POS (Cashier)`}
          </span>
          <ChevronDown className="w-3 h-3 opacity-80" />
        </button>

        {/* Date Range Dropdown Pill (Desktop & Tablet) */}
        {userRole === 'admin' && (
          <div className="relative">
            <button
              onClick={() => setIsCalendarMenuOpen(!isCalendarMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-neutral-800/80 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700/80 text-xs text-slate-700 dark:text-neutral-300 font-medium transition-colors shadow-xs"
              title={t('Change reporting period', 'تغيير الفترة الزمنية')}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isCalendarMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 p-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-neutral-800 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('Reporting Date Range', 'الفترة الزمنية')}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">2026</span>
                </div>

                <div className="space-y-1">
                  {[
                    { id: 'today', label: t('Today (Real-time)', 'اليوم (مباشر)'), val: 'Today (Oct 8, 2026)' },
                    { id: 'this-week', label: t('This Week', 'هذا الأسبوع'), val: 'Oct 4 - Oct 10, 2026' },
                    { id: 'this-month', label: t('This Month (MTD)', 'هذا الشهر (MTD)'), val: 'Oct 1 - Oct 31, 2026' },
                    { id: 'last-month', label: t('Last Month', 'الشهر الماضي'), val: 'Sep 1 - Sep 30, 2026' },
                    { id: 'q3', label: t('Q3 2026', 'الربع الثالث ٢٠٢٦'), val: 'Jul 1 - Sep 30, 2026' },
                    { id: 'ytd', label: t('Year to Date (YTD)', 'من بداية السنة (YTD)'), val: 'Jan 1 - Oct 31, 2026' },
                  ].map((preset) => {
                    const isSelected = dateRange === preset.val;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setDateRange(preset.val);
                          setIsCalendarMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 font-bold'
                            : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-slate-900 dark:text-neutral-100">
                  {t('Live Activity Alerts', 'تنبيهات العمليات المباشرة')}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">{t('3 New', '٣ جديدة')}</span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200">
                  <p className="font-semibold">{t('Recipe Stock Depleted', 'تم خصم كمية المكونات')}</p>
                  <p className="text-[11px] opacity-80">{t('Order #1042 deducted 36g beans & 400ml milk', 'الطلب #١٠٤٢ خصم ٣٦جم بن و ٤٠٠ مل حليب')}</p>
                </div>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200">
                  <p className="font-semibold">{t('Damaged Stock Logged', 'تم تسجيل إتلاف بضاعة')}</p>
                  <p className="text-[11px] opacity-80">{t('12L Baladna Milk written off (-QAR 78.00)', 'تم شطب ١٢ لتر حليب تالف (-٧٨ ر.ق)')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button (Light/Dark mode) */}
        <div className="relative">
          <button
            onClick={() => setIsDesignMenuOpen(!isDesignMenuOpen)}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title={t('Try another design', 'جرّب تصميماً آخر')}
            aria-label={t('Choose a design', 'اختر تصميماً')}
          >
            <Palette className="w-4 h-4" />
          </button>
          {isDesignMenuOpen && (
            <div className="design-menu absolute right-0 mt-3 w-72 p-2 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-neutral-800">
                <p className="text-xs font-bold text-slate-900 dark:text-neutral-100">{t('Design concepts', 'اتجاهات التصميم')}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-neutral-400">{t('Switch the look without changing your data.', 'غيّر المظهر دون تغيير بياناتك.')}</p>
              </div>
              <div className="mt-1 space-y-1">
                {designOptions.map((option) => {
                  const isSelected = designVariant === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setDesignVariant(option.id);
                        setIsDesignMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isSelected ? 'bg-slate-50 dark:bg-neutral-800' : 'hover:bg-slate-50 dark:hover:bg-neutral-800'}`}
                    >
                      <span className="flex items-center -space-x-1.5">
                        {option.colors.map((color) => (
                          <span key={color} className="design-swatch" style={{ backgroundColor: color }} />
                        ))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-800 dark:text-neutral-100">{option.name}</span>
                        <span className="block text-[10px] text-slate-500 dark:text-neutral-400">{option.note}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Language Toggle (English / Arabic RTL) */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'en' ? 'AR' : 'EN'}</span>
        </button>

        {/* Primary Export CTA (HQ Admin Only) */}
        {userRole === 'admin' ? (
          <button
            onClick={handleExport}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('Download Report', 'تنزيل التقرير')}</span>
          </button>
        ) : (
          <button
            onClick={loginAsAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            title={t('Return to HQ Admin with Full Modules', 'العودة لحساب المدير العام')}
          >
            <Unlock className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('Exit to HQ', 'لوحة الإدارة')}</span>
          </button>
        )}
      </div>

      {/* Export Toast Notification */}
      {isExportToastOpen && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold">{t('Report downloaded', 'تم تنزيل التقرير')}</h4>
            <p className="text-[11px] text-slate-300">{exportedReportName}</p>
          </div>
        </div>
      )}

      {/* Login / POS Switcher Modal */}
      {isStationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
                  {t('Switch System Role & Station Login', 'تبديل الصلاحية ونقطة البيع')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  {t('Log in as Master Admin or Cashier (POS-Only with No Sidebar)', 'الدخول كمدير عام أو كاشير محطة (شاشة نقاط بيع فقط بدون شريط جانبي)')}
                </p>
              </div>
              <button
                onClick={() => setIsStationModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {/* Admin Card */}
              <button
                onClick={() => {
                  loginAsAdmin();
                  setIsStationModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  userRole === 'admin'
                    ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-neutral-800 ring-2 ring-slate-900/10'
                    : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
                    HQ
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-neutral-100">
                      {t('👑 Master Group Admin (With Sidebar)', '👑 المدير العام (مع الشريط الجانبي)')}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      {t('Full access: Dashboard, All POS units, Recipes, Inventory, Expenses, Payroll', 'صلاحيات كاملة لكافة الوحدات والتقارير والمصروفات')}
                    </p>
                  </div>
                </div>
                {userRole === 'admin' && <CheckCircle2 className="w-5 h-5 text-slate-900 dark:text-white" />}
              </button>

              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-2">
                {t('10" Station POS Cashiers (POS View Only • NO Sidebar):', 'شاشات كاشير المحطات (عرض الكاشير فقط • بدون شريط جانبي):')}
              </div>

              {/* 5 POS Units */}
              {posUnits.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    loginAsCashier(u.id);
                    setIsStationModalOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    userRole === 'cashier' && currentPosUnit.id === u.id
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                      POS
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-neutral-100">
                        {u.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        {u.operatorName} • {u.terminalId} • {t('Full Tablet POS Screen', 'شاشة كاشير كاملة بدون شريط')}
                      </p>
                    </div>
                  </div>
                  {userRole === 'cashier' && currentPosUnit.id === u.id && (
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setIsStationModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-neutral-300"
              >
                {t('Close', 'إغلاق')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
