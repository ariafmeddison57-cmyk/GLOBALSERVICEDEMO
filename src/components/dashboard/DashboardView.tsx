import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Building,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ArrowRight,
  Coffee,
  Flame,
  Sparkles,
  CakeSlice,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Layers,
  ShoppingBag,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANDS, BRANCHES, SALES_TREND_DATA } from '../../data/mockData';
import { BrandId } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    formatCurrency,
    t,
    setCurrentView,
    setSelectedBrand,
    language,
    isRTL,
    orders,
    inventory,
    staff,
    expenses,
    totalExpenses,
    damagedGoods,
    totalDamagedLoss,
    totalTodaySales,
    totalMonthlySales,
    liveSessionSalesTotal,
    liveSessionOrdersCount,
    getBrandLiveMetrics,
  } = useApp();

  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Proportional, balanced KPI cards dynamically reflecting live sales and staff
  const topKpis = [
    {
      id: 'today-sales',
      label: t("TODAY'S SALES", 'مبيعات اليوم'),
      value: formatCurrency(totalTodaySales),
      change: liveSessionSalesTotal > 0 ? `+${formatCurrency(liveSessionSalesTotal)} POS` : '+12.5%',
      isPositive: true,
      subtext: liveSessionOrdersCount > 0 
        ? `${liveSessionOrdersCount} ${t('orders rung up this shift', 'طلب تم تسجيله في هذه المناوبة')}`
        : t('vs yesterday', 'مقارنة بالأمس'),
      icon: DollarSign,
      iconBg: 'bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200',
    },
    {
      id: 'monthly-sales',
      label: t('MONTHLY SALES (MTD)', 'المبيعات الشهرية'),
      value: formatCurrency(totalMonthlySales),
      change: '+18.2%',
      isPositive: true,
      subtext: t('Live ledger synced', 'محدث فورياً مع الكاشير'),
      icon: TrendingUp,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'operating-expenses',
      label: t('NON-STOCK OPEX (MTD)', 'المصروفات التشغيلية'),
      value: formatCurrency(totalExpenses),
      change: `${expenses.length} bills`,
      isPositive: true,
      subtext: t('Utilities, cleaning, ads', 'فواتير كهرماء، صيانة، إعلانات'),
      icon: Receipt,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
      action: () => setCurrentView('expenses'),
    },
    {
      id: 'staff-count',
      label: t('ACTIVE STAFF', 'فريق العمل'),
      value: `${staff.length} ${t('Members', 'موظف')}`,
      change: `${staff.filter(s => s.status === 'On Shift').length} on shift`,
      isPositive: true,
      subtext: t('Baristas, chefs, cashiers', 'باريستا، طهاة، كاشير'),
      icon: Users,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400',
      action: () => setCurrentView('staff'),
    },
  ];

  // Brand Performance 5 cards horizontal data (dynamically updated when orders are placed)
  const baseBrandData: Record<BrandId, { name: string; nameAr: string; baseRev: number; baseOrders: number; growth: string; isPositive: boolean; bgColor: string; icon: any; iconColor: string }> = {
    kahwatee: {
      name: 'Kahwatee',
      nameAr: 'قهوتي',
      baseRev: 142800,
      baseOrders: 5410,
      growth: '+14.8%',
      isPositive: true,
      bgColor: 'bg-amber-50/40 dark:bg-neutral-850 border-amber-200/50 dark:border-neutral-800',
      icon: Coffee,
      iconColor: 'text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60',
    },
    kfries: {
      name: 'K-Fries',
      nameAr: 'كي فرايز',
      baseRev: 118400,
      baseOrders: 4290,
      growth: '+18.2%',
      isPositive: true,
      bgColor: 'bg-orange-50/40 dark:bg-neutral-850 border-orange-200/50 dark:border-neutral-800',
      icon: Flame,
      iconColor: 'text-orange-800 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60',
    },
    kboba: {
      name: 'K-Boba',
      nameAr: 'كي بوبا',
      baseRev: 96300,
      baseOrders: 3880,
      growth: '+22.4%',
      isPositive: true,
      bgColor: 'bg-purple-50/40 dark:bg-neutral-850 border-purple-200/50 dark:border-neutral-800',
      icon: Sparkles,
      iconColor: 'text-purple-800 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60',
    },
    kinda: {
      name: 'Kinda',
      nameAr: 'كيندا',
      baseRev: 84600,
      baseOrders: 2650,
      growth: '-2.3%',
      isPositive: false,
      bgColor: 'bg-rose-50/40 dark:bg-neutral-850 border-rose-200/50 dark:border-neutral-800',
      icon: CakeSlice,
      iconColor: 'text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60',
    },
    events: {
      name: 'Events',
      nameAr: 'الفعاليات',
      baseRev: 72500,
      baseOrders: 420,
      growth: '+31.5%',
      isPositive: true,
      bgColor: 'bg-blue-50/40 dark:bg-neutral-850 border-blue-200/50 dark:border-neutral-800',
      icon: Building2,
      iconColor: 'text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60',
    },
  };

  const brandCards = (Object.keys(baseBrandData) as BrandId[]).map((brandKey) => {
    const brandInfo = baseBrandData[brandKey];
    const live = getBrandLiveMetrics(brandKey);
    const totalRev = brandInfo.baseRev + live.addedRevenue;
    const totalOrders = brandInfo.baseOrders + live.addedOrdersCount;
    const sharePct = Math.round((totalRev / totalMonthlySales) * 100);

    return {
      id: brandKey,
      name: brandInfo.name,
      nameAr: brandInfo.nameAr,
      revenueFormatted: formatCurrency(totalRev),
      ordersCount: totalOrders.toLocaleString(),
      sharePct: `${sharePct}%`,
      growth: brandInfo.growth,
      isPositive: brandInfo.isPositive,
      bgColor: brandInfo.bgColor,
      icon: brandInfo.icon,
      iconColor: brandInfo.iconColor,
      hasLiveOrders: live.addedOrdersCount > 0,
      addedRevenue: live.addedRevenue,
    };
  });

  // SVG Line Chart Coordinate Generator (Sleek Royal Indigo & Slate styling)
  const maxVal = chartMetric === 'revenue' ? 50000 : 1500;
  const chartPoints = SALES_TREND_DATA.map((d, index) => {
    const val = chartMetric === 'revenue' ? d.sales : d.orders;
    const x = 50 + (index / (SALES_TREND_DATA.length - 1)) * 620;
    const y = 220 - (val / maxVal) * 180;
    return { x, y, label: d.day, val, orig: d };
  });

  const prevMonthPoints = SALES_TREND_DATA.map((d, index) => {
    const val = (chartMetric === 'revenue' ? d.sales : d.orders) * 0.82;
    const x = 50 + (index / (SALES_TREND_DATA.length - 1)) * 620;
    const y = 220 - (val / maxVal) * 180;
    return { x, y };
  });

  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePathCurrent = generateSmoothPath(chartPoints);
  const linePathPrev = generateSmoothPath(prevMonthPoints);
  const areaPathCurrent = `${linePathCurrent} L ${chartPoints[chartPoints.length - 1].x} 230 L ${chartPoints[0].x} 230 Z`;

  // Donut chart with live brand shares
  const donutBrands = [
    { name: 'Kahwatee', color: '#D97706', pct: Math.round(((baseBrandData.kahwatee.baseRev + getBrandLiveMetrics('kahwatee').addedRevenue) / totalMonthlySales) * 100), label: `${Math.round(((baseBrandData.kahwatee.baseRev + getBrandLiveMetrics('kahwatee').addedRevenue) / totalMonthlySales) * 100)}%` },
    { name: 'K-Fries', color: '#EA580C', pct: Math.round(((baseBrandData.kfries.baseRev + getBrandLiveMetrics('kfries').addedRevenue) / totalMonthlySales) * 100), label: `${Math.round(((baseBrandData.kfries.baseRev + getBrandLiveMetrics('kfries').addedRevenue) / totalMonthlySales) * 100)}%` },
    { name: 'K-Boba', color: '#9333EA', pct: Math.round(((baseBrandData.kboba.baseRev + getBrandLiveMetrics('kboba').addedRevenue) / totalMonthlySales) * 100), label: `${Math.round(((baseBrandData.kboba.baseRev + getBrandLiveMetrics('kboba').addedRevenue) / totalMonthlySales) * 100)}%` },
    { name: 'Kinda', color: '#E11D48', pct: Math.round(((baseBrandData.kinda.baseRev + getBrandLiveMetrics('kinda').addedRevenue) / totalMonthlySales) * 100), label: `${Math.round(((baseBrandData.kinda.baseRev + getBrandLiveMetrics('kinda').addedRevenue) / totalMonthlySales) * 100)}%` },
    { name: 'Events', color: '#2563EB', pct: Math.round(((baseBrandData.events.baseRev + getBrandLiveMetrics('events').addedRevenue) / totalMonthlySales) * 100), label: `${Math.round(((baseBrandData.events.baseRev + getBrandLiveMetrics('events').addedRevenue) / totalMonthlySales) * 100)}%` },
  ];

  const circumference = 2 * Math.PI * 60;
  let cumulativeOffset = 0;

  return (
    <div className="dashboard-canvas p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <section className="dashboard-intro flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="dashboard-eyebrow flex items-center gap-2 mb-2">
            <span className="dashboard-eyebrow-mark" />
            <span>{t('GLOBALSERVICES  /  HEAD OFFICE', 'جلوبال سيرفيسز  /  الإدارة الرئيسية')}</span>
          </div>
          <h1 className="text-3xl sm:text-[2.15rem] font-bold tracking-tight text-slate-900 dark:text-white">
            {t('Portfolio overview', 'نظرة عامة على المجموعة')}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-neutral-400">
            {t('A clear view of sales, operations, and your five business units.', 'نظرة شاملة على المبيعات والعمليات ووحدات الأعمال الخمس.')}
          </p>
        </div>
        <button
          onClick={() => setCurrentView('pos')}
          className="dashboard-pos-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('Open point of sale', 'فتح نقطة البيع')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
      {/* Live Sales Sync Banner when POS orders have been completed */}
      {liveSessionSalesTotal > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                <span>{t('Live Sales Automatically Synced from POS', 'تزامن مبيعات فوري من نقاط البيع')}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900/80 text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-200">
                  +{formatCurrency(liveSessionSalesTotal)}
                </span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                {liveSessionOrdersCount} {t('live orders placed across brand terminals', 'طلبات مسجلة في المحطات')} • {t('All recipes automatically deducted from raw warehouse inventory', 'تم خصم كافة المكونات فورياً من جدول المخزون')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('inventory')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-slate-50 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 text-xs font-semibold transition-colors"
            >
              {t('View Stock Used →', 'استهلاك المخزون ←')}
            </button>
            <button
              onClick={() => setCurrentView('pos')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors shadow-xs"
            >
              {t('Open POS →', 'فتح الكاشير ←')}
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP ROW: 4 Proportional, Refined KPI Cards (balanced typography) */}
      <div className="dashboard-kpis grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {topKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              onClick={kpi.action}
              className={`bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-neutral-800 transition-all ${
                kpi.action ? 'cursor-pointer hover:border-slate-400 dark:hover:border-neutral-700' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg font-mono ${
                    kpi.isPositive
                      ? 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {kpi.change}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                  {kpi.label}
                </span>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight mt-0.5 font-mono">
                  {kpi.value}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                  {kpi.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MIDDLE ROW: 2 CHARTS (Sales Overview Line Chart + Donut Sales by Brand) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Sales Overview Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t('Sales Overview & Revenue Trends', 'نظرة عامة على الإيرادات والمبيعات')}
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-neutral-400 font-semibold mt-0.5">
                  {t('OCTOBER 2026 • CURRENT VS PREVIOUS MONTH', 'أكتوبر ٢٠٢٦ • مقارنة بالشهر السابق')}
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartMetric === 'revenue'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400'
                  }`}
                >
                  {t('Revenue', 'الإيراد')}
                </button>
                <button
                  onClick={() => setChartMetric('orders')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartMetric === 'orders'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400'
                  }`}
                >
                  {t('Orders', 'الطلبات')}
                </button>
              </div>
            </div>

            {/* SVG Interactive Line Chart (Indigo/Slate Theme) */}
            <div className="relative mt-4 h-60 w-full">
              <svg viewBox="0 0 700 260" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="50" y1="40" x2="670" y2="40" stroke="#F1F5F9" strokeWidth="1" className="dark:stroke-neutral-800" />
                <line x1="50" y1="85" x2="670" y2="85" stroke="#F1F5F9" strokeWidth="1" className="dark:stroke-neutral-800" />
                <line x1="50" y1="130" x2="670" y2="130" stroke="#F1F5F9" strokeWidth="1" className="dark:stroke-neutral-800" />
                <line x1="50" y1="175" x2="670" y2="175" stroke="#F1F5F9" strokeWidth="1" className="dark:stroke-neutral-800" />
                <line x1="50" y1="220" x2="670" y2="220" stroke="#E2E8F0" strokeWidth="1" className="dark:stroke-neutral-800" />

                {/* Y-axis labels */}
                <text x="42" y="44" textAnchor="end" className="text-[10px] fill-slate-400 dark:fill-neutral-400 font-mono">
                  {chartMetric === 'revenue' ? '50k' : '1.5k'}
                </text>
                <text x="42" y="89" textAnchor="end" className="text-[10px] fill-slate-400 dark:fill-neutral-400 font-mono">
                  {chartMetric === 'revenue' ? '37k' : '1.1k'}
                </text>
                <text x="42" y="134" textAnchor="end" className="text-[10px] fill-slate-400 dark:fill-neutral-400 font-mono">
                  {chartMetric === 'revenue' ? '25k' : '750'}
                </text>
                <text x="42" y="179" textAnchor="end" className="text-[10px] fill-slate-400 dark:fill-neutral-400 font-mono">
                  {chartMetric === 'revenue' ? '12k' : '370'}
                </text>
                <text x="42" y="224" textAnchor="end" className="text-[10px] fill-slate-400 dark:fill-neutral-400 font-mono">
                  0
                </text>

                {/* Shaded Area */}
                <path d={areaPathCurrent} fill="url(#chartGradient)" />

                {/* Comparative previous month (slate dashed) */}
                <path
                  d={linePathPrev}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                  className="opacity-60"
                />

                {/* Primary month line (solid Indigo #2563EB) */}
                <path
                  d={linePathCurrent}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {chartPoints.map((pt, i) => (
                  <g key={i}>
                    {i % 2 === 0 && (
                      <text
                        x={pt.x}
                        y="244"
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400 dark:fill-neutral-400 font-medium"
                      >
                        {pt.label}
                      </text>
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPointIndex === i ? 6 : 3.5}
                      fill="#2563EB"
                      stroke="#FFFFFF"
                      strokeWidth={hoveredPointIndex === i ? 3 : 2}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                  </g>
                ))}
              </svg>

              {hoveredPointIndex !== null && (
                <div
                  className="absolute p-2 rounded-xl bg-slate-900 text-white text-xs shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(chartPoints[hoveredPointIndex].x / 700) * 100}%`,
                    top: `${(chartPoints[hoveredPointIndex].y / 260) * 100}%`,
                  }}
                >
                  <p className="font-bold">{chartPoints[hoveredPointIndex].label}</p>
                  <p className="text-blue-300 font-mono">
                    {chartMetric === 'revenue'
                      ? `QAR ${chartPoints[hoveredPointIndex].orig.sales.toLocaleString()}`
                      : `${chartPoints[hoveredPointIndex].orig.orders.toLocaleString()} orders`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Badges footer */}
          <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-800/40">
                {t('Peak Day: Oct 24 • QAR 42,850', 'ذروة المبيعات: ٢٤ أكتوبر')}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold">
                {t('Avg Daily: QAR 16,600', 'المتوسط اليومي: ١٦,٦٠٠')}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-[#2563EB] rounded-full inline-block" />
                <span>{t('October 2026', 'أكتوبر ٢٠٢٦')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-slate-400 inline-block" />
                <span>{t('September 2026', 'سبتمبر ٢٠٢٦')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1/3: Donut Chart Sales by Brand */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t('Sales by Brand', 'المبيعات حسب العلامة')}
              </h3>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                5 BRANDS
              </span>
            </div>

            {/* Donut graphic */}
            <div className="relative flex items-center justify-center my-4 h-44">
              <svg viewBox="0 0 160 160" className="w-40 h-40 -rotate-90">
                {donutBrands.map((b) => {
                  const strokeLength = (b.pct / 100) * circumference;
                  const currentStrokeOffset = cumulativeOffset;
                  cumulativeOffset += strokeLength;

                  return (
                    <circle
                      key={b.name}
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke={b.color}
                      strokeWidth="16"
                      strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                      strokeDashoffset={-currentStrokeOffset}
                      className="transition-all duration-300 hover:opacity-85"
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-neutral-400">
                  {t('TOTAL MTD', 'إجمالي الشهر')}
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(totalMonthlySales)}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-neutral-800">
            {donutBrands.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="font-semibold text-slate-700 dark:text-neutral-300">
                    {b.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BRAND PERFORMANCE ROW: 5 cards horizontal */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
            {t('PORTFOLIO BRAND PERFORMANCE', 'أداء العلامات التجارية')}
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-neutral-400 font-medium">
            {t('5 Business Units in Qatar', '٥ وحدات أعمال في قطر')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {brandCards.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`rounded-2xl p-4 border shadow-xs transition-all hover:scale-[1.01] ${b.bgColor}`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${b.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md font-mono ${
                      b.isPositive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {b.growth}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {t(b.name, b.nameAr)}
                  </h4>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {b.revenueFormatted}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 font-medium">
                    {b.ordersCount} orders • {b.sharePct} of total
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BOTTOM: Recent Orders Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 dark:border-neutral-800">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t('Recent Transactions & POS Orders', 'أحدث طلبات نقاط البيع')}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-neutral-400 mt-0.5">
              {t('Orders automatically deplete recipe raw materials in the inventory ledger', 'استهلاك المخزون المباشر عبر الوصفات')}
            </p>
          </div>

          <button
            onClick={() => setCurrentView('pos')}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>{t('View All POS Terminals →', 'عرض نقاط البيع ←')}</span>
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                <th className="py-3 px-3">{t('Order ID', 'رقم الطلب')}</th>
                <th className="py-3 px-3">{t('Customer', 'العميل')}</th>
                <th className="py-3 px-3">{t('Brand / Unit', 'الوحدة')}</th>
                <th className="py-3 px-3">{t('Amount', 'المبلغ')}</th>
                <th className="py-3 px-3">{t('Recipe Stock Depletion', 'استهلاك المخزون')}</th>
                <th className="py-3 px-3">{t('Status', 'الحالة')}</th>
                <th className="py-3 px-3 text-right">{t('Time', 'الوقت')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
              {orders.slice(0, 6).map((order) => {
                const brand = BRANDS.find((b) => b.id === order.brandId) || BRANDS[0];
                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white dark:bg-neutral-800 dark:text-neutral-100 font-mono text-[11px] font-bold">
                        #{order.id}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">
                        {order.customerName || t('Walk-in Guest', 'عميل مباشر')}
                      </span>
                      {order.tableNumber && (
                        <span className="block text-[10px] text-slate-400 dark:text-neutral-400 font-normal">
                          {order.tableNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.accentHex }} />
                        <span>{brand.name}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-neutral-100">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => setCurrentView('inventory')}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
                      >
                        <Layers className="w-3 h-3" />
                        <span>
                          {order.deductedIngredientsSummary && order.deductedIngredientsSummary.length > 0
                            ? `${order.deductedIngredientsSummary.length} items deducted`
                            : 'Stock synced'}
                        </span>
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200/60 dark:border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('Completed', 'مكتمل')}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-400 dark:text-neutral-400 font-mono text-[11px]">
                      {t('Just now', 'الآن')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
