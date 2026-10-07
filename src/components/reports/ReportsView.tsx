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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MENU_ENGINEERING, MONTHLY_PROFIT_DATA, BRANDS } from '../../data/mockData';

export const ReportsView: React.FC = () => {
  const { formatCurrency, t, language, isRTL } = useApp();

  const [activeTab, setActiveTab] = useState<'pnl' | 'foodcost' | 'menu'>('pnl');

  // Latest MTD metrics
  const currentMonth = MONTHLY_PROFIT_DATA[MONTHLY_PROFIT_DATA.length - 1];

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
              'Consolidated Profit & Loss, food cost variance by brand, and Boston Consulting Group menu quadrant.',
              'قائمة الأرباح والخسائر المجمعة، انحراف تكلفة الأغذية ومصفوفة هندسة أطباق القائمة.'
            )}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl self-start sm:self-auto border border-neutral-200 dark:border-neutral-700">
          {[
            { id: 'pnl', label: t('Profit & Loss', 'الأرباح والخسائر') },
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
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <span className="text-xs font-medium text-neutral-500">{t('Gross Revenue (MTD)', 'إجمالي الإيرادات')}</span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
                {formatCurrency(currentMonth.revenue)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.5% {t('vs previous month', 'مقارنة بالشهر الماضي')}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <span className="text-xs font-medium text-neutral-500">{t('Cost of Goods Sold (COGS)', 'تكلفة البضاعة المباعة')}</span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
                {formatCurrency(currentMonth.foodCost)}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500 font-medium">
                {currentMonth.foodCostPct}% {t('of total sales (Target <30%)', 'من إجمالي المبيعات')}
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <span className="text-xs font-medium text-neutral-500">{t('Total Labor & Payroll', 'تكلفة اليد العاملة والرواتب')}</span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 tabular-nums">
                {formatCurrency(currentMonth.laborCost)}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500 font-medium">
                21.1% {t('Labor Cost ratio', 'نسبة تكلفة العمالة')}
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-emerald-50/20 dark:bg-emerald-950/10">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{t('Net EBITDA Profit', 'صافي الأرباح التشغيلية')}</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
                {formatCurrency(currentMonth.profit)}
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 font-bold">
                30.3% {t('Operating EBITDA margin', 'هامش الربح التشغيلي')}
              </div>
            </div>
          </div>

          {/* Monthly Profit & Food Cost Trend Chart */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {t('Monthly Group Revenue vs Net Profit Trend (May - Oct 2026)', 'منحنى الإيرادات وصافي الربح للمجموعة (مايو - أكتوبر)')}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {t('Demonstrating steady margin expansion as central commissary scaling kicks in', 'يوضح التوسع في هوامش الربح مع تشغيل المطبخ المركزي')}
            </p>

            <div className="grid grid-cols-6 gap-3 items-end h-48 pt-6 border-b border-neutral-200 dark:border-neutral-800">
              {MONTHLY_PROFIT_DATA.map((item, idx) => {
                const maxRev = 550000;
                const revHeight = (item.revenue / maxRev) * 100;
                const profitHeight = (item.profit / maxRev) * 100;

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-full">
                      {/* Revenue Bar */}
                      <div
                        className="w-1/2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 rounded-t-md transition-all relative"
                        style={{ height: `${revHeight}%` }}
                        title={`Revenue: ${formatCurrency(item.revenue)}`}
                      />
                      {/* Profit Bar */}
                      <div
                        className="w-1/2 bg-amber-500 hover:bg-amber-400 rounded-t-md transition-all relative"
                        style={{ height: `${profitHeight}%` }}
                        title={`Profit: ${formatCurrency(item.profit)}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 truncate">{item.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <span>{t('Gross Revenue (QAR)', 'الإيرادات')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  <span>{t('Net Operating Profit (QAR)', 'صافي الربح')}</span>
                </div>
              </div>
              <span className="font-mono text-emerald-600 font-semibold">{t('+39.3% Profit Growth in 6 Months', '+٣٩.٣٪ نمو في الأرباح')}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Food Cost Analysis */}
      {activeTab === 'foodcost' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
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
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
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
