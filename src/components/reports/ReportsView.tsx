import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Building2,
  Receipt,
  Users,
  Boxes,
  DollarSign,
  Wallet,
  ArrowRight,
  Layers,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MENU_ENGINEERING, MONTHLY_PROFIT_DATA, BRANDS } from '../../data/mockData';

export const ReportsView: React.FC = () => {
  const { formatCurrency, t, language, isRTL, setCurrentView } = useApp();

  const [activeTab, setActiveTab] = useState<'pnl' | 'foodcost' | 'menu'>('pnl');
  const [chartViewMode, setChartViewMode] = useState<'summary' | 'breakdown'>('summary');

  // Latest MTD metrics
  const currentMonth = MONTHLY_PROFIT_DATA[MONTHLY_PROFIT_DATA.length - 1];

  // Prime profit = Revenue - (COGS + Labor)
  const primeProfit = currentMonth.revenue - currentMonth.foodCost - currentMonth.laborCost;
  const primeProfitPct = ((primeProfit / currentMonth.revenue) * 100).toFixed(1);

  // Gross profit = Revenue - COGS
  const grossProfit = currentMonth.revenue - currentMonth.foodCost;
  const grossProfitPct = ((grossProfit / currentMonth.revenue) * 100).toFixed(1);

  // Labor cost percentage
  const laborPct = ((currentMonth.laborCost / currentMonth.revenue) * 100).toFixed(1);

  // Operating Expenses percentage
  const opexPct = ((currentMonth.operatingExpenses / currentMonth.revenue) * 100).toFixed(1);

  // Net Profit percentage
  const netProfitPct = ((currentMonth.profit / currentMonth.revenue) * 100).toFixed(1);

  // Detailed OpEx breakdown categories matching real operational costs
  const OPEX_BREAKDOWN = [
    {
      name: t('Machine & Equipment Repairs', 'صيانة وتصليح الماكينات والمعدات'),
      sub: t('Espresso machines, burr grinders, deep fryers, ovens & refrigeration', 'تصليح ماكينات القهوة، المطاحن، القلايات، الأفران والثلاجات'),
      amount: 38500,
      pctOfOpex: 33.9,
      color: 'bg-amber-600',
    },
    {
      name: t('Transport & Delivery Fleet Fuel', 'وقود وبترول سيارات التوصيل والمطبخ'),
      sub: t('WOQOD petrol for catering vans & delivery fleet', 'بترول وقود لسيارات المطبخ المركزي وأسطول التوصيل'),
      amount: 28400,
      pctOfOpex: 25.0,
      color: 'bg-blue-600',
    },
    {
      name: t('Purchases Without Invoice (Cash)', 'مشتريات نقدية بدون فواتير (سوق وبقالة)'),
      sub: t('Local market cash runs, emergency ice bags, lemons, mint & daily cash top-ups', 'مشتريات نقدية طارئة من السوق، ثلج طارئ، نعناع وليمون وسوبرماركت'),
      amount: 18200,
      pctOfOpex: 16.0,
      color: 'bg-rose-600',
    },
    {
      name: t('Small Things & Daily Supplies (Not in POs)', 'مستلزمات وأغراض صغيرة خارج المشتريات'),
      sub: t('Tools, barista mats, replacement parts, extension cables & hardware needs', 'أدوات مطبخ، قطع غيار، توصيلات كهربائية ونثريات غير مسجلة بالمشتريات'),
      amount: 12800,
      pctOfOpex: 11.3,
      color: 'bg-purple-600',
    },
    {
      name: t('Utilities (Kahramaa Power & Water)', 'كهرماء (كهرباء ومياه الفروع)'),
      sub: t('Industrial power for 3-phase espresso machines & water consumption', 'الكهرباء الصناعية لتشغيل ماكينات الإسبريسو ومياه الفروع'),
      amount: 9600,
      pctOfOpex: 8.5,
      color: 'bg-emerald-600',
    },
    {
      name: t('Kitchen Sanitizers & POS Paper Rolls', 'معقمات ومواد نظافة وورق فواتير'),
      sub: t('Food-grade cleaning chemicals & thermal cashier receipt rolls', 'كيماويات النظافة المعتمدة وورق الكاشير الحراري'),
      amount: 5981,
      pctOfOpex: 5.3,
      color: 'bg-cyan-600',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('Executive Financials & Menu Intelligence', 'التقارير المالية وهندسة القائمة')}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t(
              'Consolidated Profit & Loss with Operating Expenses, food cost variance by brand, and Boston Consulting Group menu quadrant.',
              'قائمة الأرباح والخسائر المجمعة مع المصروفات التشغيلية، انحراف تكلفة الأغذية ومصفوفة هندسة أطباق القائمة.'
            )}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl self-start sm:self-auto border border-neutral-200 dark:border-neutral-700">
          {[
            { id: 'pnl', label: t('Profit & Loss (P&L)', 'الأرباح والخسائر') },
            { id: 'foodcost', label: t('Food Cost Analysis', 'تكلفة المواد الغذائية') },
            { id: 'menu', label: t('Menu Engineering', 'هندسة القائمة (BCG)') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'pnl' | 'foodcost' | 'menu')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: P&L Statement & Trends */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          {/* 5 Summary KPI Cards: Gross Revenue, COGS, Labor, Operating Expenses, Net EBITDA Profit */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Gross Revenue */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{t('Gross Revenue', 'إجمالي الإيرادات')}</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
                  {formatCurrency(currentMonth.revenue)}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span>+18.5% {t('vs last mo', 'عن الشهر الماضي')}</span>
              </div>
            </div>

            {/* 2. COGS */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{t('COGS (Food Cost)', 'تكلفة البضاعة')}</span>
                  <Boxes className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
                  {formatCurrency(currentMonth.foodCost)}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500 font-medium flex items-center justify-between">
                <span>{currentMonth.foodCostPct}% {t('of sales', 'من المبيعات')}</span>
                <span className="text-emerald-600 font-semibold">{t('<30% Target', 'المستهدف')}</span>
              </div>
            </div>

            {/* 3. Labor & Payroll */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{t('Labor & Payroll', 'تكلفة العمالة')}</span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
                  {formatCurrency(currentMonth.laborCost)}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500 font-medium flex items-center justify-between">
                <span>{laborPct}% {t('of sales', 'من المبيعات')}</span>
                <span className="text-neutral-400 font-mono text-[10px]">WPS Qatar</span>
              </div>
            </div>

            {/* 4. Operating Expenses (OpEx) */}
            <div className="bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col justify-between shadow-xs bg-blue-50/20 dark:bg-blue-950/10">
              <div>
                <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{t('Operating Expenses', 'المصروفات التشغيلية')}</span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold font-mono text-blue-950 dark:text-blue-100 mt-1 tabular-nums">
                  {formatCurrency(currentMonth.operatingExpenses)}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 font-medium flex items-center justify-between">
                <span>{opexPct}% {t('of sales', 'من المبيعات')}</span>
                <span className="font-semibold">{t('Fuel, Repairs, Cash Buys', 'وقود، صيانة، كاش')}</span>
              </div>
            </div>

            {/* 5. Net EBITDA Profit */}
            <div className="bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 flex flex-col justify-between shadow-xs bg-emerald-50/30 dark:bg-emerald-950/20 col-span-2 md:col-span-1">
              <div>
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{t('Net EBITDA Profit', 'صافي الربح')}</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums">
                  {formatCurrency(currentMonth.profit)}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between">
                <span>{netProfitPct}% {t('Margin', 'هامش الربح')}</span>
                <span className="text-emerald-600 font-semibold">{t('+39.3% YTD', '+٣٩.٣٪')}</span>
              </div>
            </div>
          </div>

          {/* Detailed Statement of Profit & Loss Waterfall and OpEx Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Waterfall P&L Statement Table (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-600" />
                    <span>{t('Consolidated Income Statement (P&L Waterfall)', 'قائمة الدخل والأرباح المجمعة')}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {t('October 2026 MTD accounting breakdown following restaurant USAR standards', 'تفصيل محاسبي لشهر أكتوبر وفق المعايير المعتمدة لقطاع المطاعم')}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  {currentMonth.month}
                </span>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {/* 1. Gross Revenue */}
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">
                      {t('1. Gross Revenue', '١. إجمالي المبيعات والإيرادات')}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {t('Dine-in, takeaway, Talabat/Snoonu delivery & corporate events', 'المحلي، السفري، تطبيقات التوصيل وحفلات الضيافة')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                      {formatCurrency(currentMonth.revenue)}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">100.0%</div>
                  </div>
                </div>

                {/* 2. Less COGS */}
                <div className="py-2.5 flex items-center justify-between bg-rose-50/20 dark:bg-rose-950/10 -mx-2 px-2 rounded-lg">
                  <div>
                    <div className="font-semibold text-rose-700 dark:text-rose-400">
                      {t('2. Less: Cost of Goods Sold (COGS)', '٢. يطرح: تكلفة البضاعة والمواد المباعة')}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {t('Coffee beans, dairy, wagyu meat, sauces & central commissary prep', 'حبوب القهوة، الألبان، لحم الواغيو ومستلزمات المطبخ المركزي')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                      - {formatCurrency(currentMonth.foodCost)}
                    </div>
                    <div className="text-[11px] text-rose-600 font-mono">-{currentMonth.foodCostPct}%</div>
                  </div>
                </div>

                {/* Subtotal: Gross Profit Margin */}
                <div className="py-2.5 flex items-center justify-between font-bold bg-neutral-50 dark:bg-neutral-800/60 -mx-2 px-2 rounded-lg">
                  <div>
                    <div className="text-neutral-900 dark:text-neutral-100">
                      {t('(=) Gross Profit (Gross Margin)', '(=) إجمالي الربح الهامشي')}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-normal">
                      {t('Revenue remaining after ingredient costs', 'المتبقي بعد خصم المواد الأولية')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
                      {formatCurrency(grossProfit)}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-mono">{grossProfitPct}%</div>
                  </div>
                </div>

                {/* 3. Less Labor */}
                <div className="py-2.5 flex items-center justify-between bg-purple-50/20 dark:bg-purple-950/10 -mx-2 px-2 rounded-lg">
                  <div>
                    <div className="font-semibold text-purple-700 dark:text-purple-400">
                      {t('3. Less: Total Labor & Staff Wages', '٣. يطرح: إجمالي تكلفة اليد العاملة والرواتب')}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {t('Baristas, kitchen line chefs, shift leads & Qatar WPS payroll transfers', 'رواتب الباريستا، طهاة التحضير، الحوافز وتحويلات نظام حماية الأجور')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-purple-700 dark:text-purple-400 tabular-nums">
                      - {formatCurrency(currentMonth.laborCost)}
                    </div>
                    <div className="text-[11px] text-purple-600 font-mono">-{laborPct}%</div>
                  </div>
                </div>

                {/* Subtotal: Prime Profit */}
                <div className="py-2.5 flex items-center justify-between font-semibold bg-neutral-50/60 dark:bg-neutral-800/40 -mx-2 px-2 rounded-lg">
                  <div>
                    <div className="text-neutral-800 dark:text-neutral-200">
                      {t('(=) Prime Profit (Prime Cost Deducted)', '(=) الربح بعد استقطاع التكاليف الأولية')}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-normal">
                      {t('Industry indicator: Total Prime Cost =', 'مؤشر كفاءة التشغيل: إجمالي التكاليف المباشرة =')} {(parseFloat(currentMonth.foodCostPct as any) + parseFloat(laborPct)).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-neutral-800 dark:text-neutral-200 tabular-nums font-bold">
                      {formatCurrency(primeProfit)}
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">{primeProfitPct}%</div>
                  </div>
                </div>

                {/* 4. Less Operating Expenses (OpEx) */}
                <div className="py-2.5 flex items-center justify-between bg-blue-50/30 dark:bg-blue-950/20 -mx-2 px-2 rounded-lg border border-blue-200 dark:border-blue-900/40">
                  <div>
                    <div className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('4. Less: Operating Expenses (OpEx)', '٤. يطرح: المصروفات التشغيلية اليومية')}</span>
                    </div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-400">
                      {t('Vehicle fuel, machine repairs, cash purchases with no invoice, and small store needs', 'وقود السيارات، تصليح الماكينات، مشتريات نقدية بدون فواتير ونثريات صغيرة خارج المشتريات')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-blue-800 dark:text-blue-300 tabular-nums">
                      - {formatCurrency(currentMonth.operatingExpenses)}
                    </div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-400 font-mono">-{opexPct}%</div>
                  </div>
                </div>

                {/* 5. Net Operating Profit (EBITDA) */}
                <div className="py-3 flex items-center justify-between font-bold bg-emerald-50 dark:bg-emerald-950/30 -mx-2 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 mt-1">
                  <div>
                    <div className="text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>{t('(=) Net Operating EBITDA Profit', '(=) صافي الأرباح التشغيلية للمجموعة')}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-normal">
                      {t('Final group bottom-line profit before tax and depreciation', 'صافي أرباح العمليات المتبقية للشركة')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {formatCurrency(currentMonth.profit)}
                    </div>
                    <div className="text-xs text-emerald-600 font-mono font-bold">{netProfitPct}% {t('Net Margin', 'صافي الهامش')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Expenses Breakdown (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span>{t('Operating Expenses (OpEx) Breakdown', 'تفاصيل بنود المصروفات التشغيلية')}</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                    {formatCurrency(currentMonth.operatingExpenses)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  {t('Routine operational spending: vehicle fuel, machine repairs (espresso & fryers), cash purchases with no invoice, and small store supplies', 'النفقات التشغيلية اليومية: وقود السيارات، تصليح ماكينات القهوة والقلايات، مشتريات نقدية بدون فواتير ومستلزمات الفروع')}
                </p>

                {/* Categories List */}
                <div className="space-y-3">
                  {OPEX_BREAKDOWN.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="truncate max-w-[220px]">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.name}</span>
                        </div>
                        <div className="font-mono text-neutral-700 dark:text-neutral-300 text-right tabular-nums">
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                          <span className="text-[11px] text-neutral-400 ml-1.5 font-normal">({item.pctOfOpex}%)</span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.pctOfOpex}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button to Open Expenses View */}
              <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="text-[11px] text-neutral-500">
                  {t('Need to log or reconcile bills?', 'هل ترغب في تسجيل أو تدقيق الفواتير؟')}
                </div>
                <button
                  onClick={() => setCurrentView('expenses')}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>{t('Manage Vouchers', 'إدارة سندات الصرف')}</span>
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Monthly Profit & Expense Trend Chart */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {t('6-Month Financial Evolution (May - Oct 2026)', 'التطور المالي لمجموعة جلوبال للخدمات (مايو - أكتوبر)')}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {t(
                    'Tracking Revenue alongside COGS, Labor, Operating Expenses (OpEx), and expanding Net Profit',
                    'مقارنة الإيرادات مع تكلفة البضاعة، العمالة، المصاريف التشغيلية وصافي الأرباح'
                  )}
                </p>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs">
                <button
                  onClick={() => setChartViewMode('summary')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    chartViewMode === 'summary'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {t('Revenue vs Profit', 'الإيراد وصافي الربح')}
                </button>
                <button
                  onClick={() => setChartViewMode('breakdown')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    chartViewMode === 'breakdown'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {t('All 4 Components (COGS, Labor, OpEx, Net)', 'تفصيل التكاليف الأربعة')}
                </button>
              </div>
            </div>

            {/* Chart Area */}
            {chartViewMode === 'summary' ? (
              <div className="grid grid-cols-6 gap-3 items-end h-52 pt-6 border-b border-neutral-200 dark:border-neutral-800">
                {MONTHLY_PROFIT_DATA.map((item, idx) => {
                  const maxRev = 550000;
                  const revHeight = (item.revenue / maxRev) * 100;
                  const profitHeight = (item.profit / maxRev) * 100;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full max-w-[56px] flex items-end justify-center gap-1.5 h-full">
                        {/* Revenue Bar */}
                        <div
                          className="w-1/2 bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400 rounded-t-md transition-all relative"
                          style={{ height: `${revHeight}%` }}
                          title={`Gross Revenue: ${formatCurrency(item.revenue)}`}
                        />
                        {/* Profit Bar */}
                        <div
                          className="w-1/2 bg-emerald-600 hover:bg-emerald-500 rounded-t-md transition-all relative"
                          style={{ height: `${profitHeight}%` }}
                          title={`Net EBITDA Profit: ${formatCurrency(item.profit)}`}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500 truncate">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Breakdown mode: Stacked cost bars showing COGS, Labor, OpEx, and Net Profit */
              <div className="grid grid-cols-6 gap-3 items-end h-52 pt-6 border-b border-neutral-200 dark:border-neutral-800">
                {MONTHLY_PROFIT_DATA.map((item, idx) => {
                  const maxRev = 550000;
                  const cogsH = (item.foodCost / maxRev) * 100;
                  const laborH = (item.laborCost / maxRev) * 100;
                  const opexH = (item.operatingExpenses / maxRev) * 100;
                  const profitH = (item.profit / maxRev) * 100;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-full">
                        <div
                          className="w-1/4 bg-amber-500 hover:bg-amber-400 rounded-t-xs transition-all"
                          style={{ height: `${cogsH}%` }}
                          title={`COGS: ${formatCurrency(item.foodCost)}`}
                        />
                        <div
                          className="w-1/4 bg-purple-500 hover:bg-purple-400 rounded-t-xs transition-all"
                          style={{ height: `${laborH}%` }}
                          title={`Labor: ${formatCurrency(item.laborCost)}`}
                        />
                        <div
                          className="w-1/4 bg-blue-500 hover:bg-blue-400 rounded-t-xs transition-all"
                          style={{ height: `${opexH}%` }}
                          title={`OpEx: ${formatCurrency(item.operatingExpenses)}`}
                        />
                        <div
                          className="w-1/4 bg-emerald-600 hover:bg-emerald-500 rounded-t-xs transition-all"
                          style={{ height: `${profitH}%` }}
                          title={`Net Profit: ${formatCurrency(item.profit)}`}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500 truncate">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
              <div className="flex flex-wrap items-center gap-4">
                {chartViewMode === 'summary' ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-slate-300 dark:bg-neutral-700" />
                      <span>{t('Gross Revenue', 'إجمالي الإيرادات')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-600" />
                      <span>{t('Net Operating EBITDA Profit', 'صافي الربح التشغيلي')}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500" />
                      <span>{t('COGS (Food Cost)', 'تكلفة البضاعة')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-purple-500" />
                      <span>{t('Labor Cost', 'تكلفة العمالة')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-blue-500" />
                      <span>{t('Operating Expenses (OpEx)', 'المصروفات التشغيلية')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-600" />
                      <span>{t('Net Profit', 'صافي الربح')}</span>
                    </div>
                  </>
                )}
              </div>
              <span className="font-mono text-emerald-600 font-semibold">
                {t('+39.3% Profit Growth in 6 Months', '+٣٩.٣٪ نمو في الأرباح')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Food Cost Analysis */}
      {activeTab === 'foodcost' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {t('Food Cost % Benchmark by Brand', 'مقارنة تكلفة المواد الغذائية حسب العلامة التجارية')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {t('Industry standard target for hospitality in Qatar: 28% – 32%', 'المستهدف المعياري لقطاع الضيافة في قطر: ٢٨٪ إلى ٣٢٪')}
            </p>

            <div className="space-y-4">
              {[
                { brand: 'Kahwatee (Specialty Coffee)', target: 26, actual: 24.2, status: 'Optimal', variance: -1.8 },
                { brand: 'K-Fries (Loaded Fries & Street Food)', target: 29, actual: 27.5, status: 'Optimal', variance: -1.5 },
                { brand: 'K-Boba (Artisanal Boba & Teas)', target: 25, actual: 23.8, status: 'Optimal', variance: -1.2 },
                { brand: 'Kinda (Artisanal Bakery & Desserts)', target: 30, actual: 32.1, status: 'Monitor (Butter costs)', variance: +2.1 },
                { brand: 'Events (Catering & Mobile Pop-ups)', target: 32, actual: 29.4, status: 'Optimal', variance: -2.6 },
              ].map((b, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-150 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-900 dark:text-neutral-100">{b.brand}</span>
                    <span className="font-mono text-neutral-600 dark:text-neutral-300">
                      {t('Actual', 'الفعلي')}: <span className="font-bold text-amber-600">{b.actual}%</span> · {t('Target', 'المستهدف')}: {b.target}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full ${b.variance > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${(b.actual / 40) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-neutral-500">
                    <span>{b.status}</span>
                    <span className={b.variance > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {b.variance > 0 ? `+${b.variance}% Over` : `${b.variance}% Under Target`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Menu Engineering Matrix (BCG Quadrant) */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {t('Menu Engineering Matrix (BCG Quadrant)', 'مصفوفة هندسة قائمة الأطباق')}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {t(
                    'Classifying menu items by sales volume and gross profit contribution per unit.',
                    'تصنيف أصناف القائمة حسب حجم المبيعات ومقدار هامش الربح للقطعة.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  ★ Stars (Maintain Quality)
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold">
                  🐎 Plowhorses (Raise Price)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                  🧩 Puzzles (Market More)
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold">
                  🐕 Dogs (Remove/Rethink)
                </span>
              </div>
            </div>

            {/* Table of Classified Menu Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3 px-4">{t('Product Name', 'اسم الصنف')}</th>
                    <th className="py-3 px-3">{t('Brand', 'العلامة')}</th>
                    <th className="py-3 px-3">{t('Category', 'التصنيف')}</th>
                    <th className="py-3 px-3 text-right">{t('Units Sold (MTD)', 'الكمية المباعة')}</th>
                    <th className="py-3 px-3 text-right">{t('Margin (QAR)', 'هامش الربح للقطعة')}</th>
                    <th className="py-3 px-4 text-center">{t('Classification', 'التصنيف الاستراتيجي')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {MENU_ENGINEERING.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-3 text-neutral-500">{item.brand}</td>
                      <td className="py-3.5 px-3 text-neutral-500">{item.category}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-medium tabular-nums">
                        {item.volumeSold.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600 tabular-nums">
                        {formatCurrency(item.profitMarginQar)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                            item.classification === 'Star'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                              : item.classification === 'Plowhorse'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700'
                              : item.classification === 'Puzzle'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700'
                          }`}
                        >
                          {item.classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
