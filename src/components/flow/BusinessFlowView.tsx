import React, { useState } from 'react';
import {
  Truck,
  Boxes,
  CookingPot,
  Store,
  DollarSign,
  BarChart3,
  Users,
  Clock,
  WalletCards,
  PieChart,
  ArrowDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ChefHat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewMode } from '../../types';

export const BusinessFlowView: React.FC = () => {
  const { setCurrentView, t, language, formatCurrency, isRTL } = useApp();

  const [activeFlow, setActiveFlow] = useState<'supply' | 'hr'>('supply');
  const [selectedStep, setSelectedStep] = useState<string>('pos');

  const supplySteps = [
    {
      id: 'purchases',
      title: '1. Vendor Purchases',
      titleAr: '١. مشتريات الموردين',
      icon: Truck,
      targetView: 'purchases' as ViewMode,
      description: 'Centralized PO generation with suppliers (Baladna Dairy, Coffee Planet, Gulf Packaging).',
      demoData: '7 Approved POs · QAR 42,080 MTD',
      benefit: 'Eliminates rogue purchasing & negotiates group volume discounts across all 5 brands.',
    },
    {
      id: 'inventory',
      title: '2. Commissary Inventory',
      titleAr: '٢. المستودع المركزي والمخزون',
      icon: Boxes,
      targetView: 'inventory' as ViewMode,
      description: 'Real-time stock valuation and automatic transfers between Main Store and retail branches.',
      demoData: '10 Tracked SKUs · QAR 184,200 asset value',
      benefit: 'Prevents stockouts; automated alerts for low stock and expiring dairy batches.',
    },
    {
      id: 'recipes',
      title: '3. Recipe Standards & BOM Linkage',
      titleAr: '٣. معايير الوصفات ومصفوفة المواد (BOM)',
      icon: ChefHat,
      targetView: 'menu' as ViewMode,
      description: 'Standardized gram/ml portion recipes linked directly to commissary stock SKUs for exact costing.',
      demoData: '35 Standard Recipes · 78.4% gross margin',
      benefit: 'Connects menu dishes directly to raw ingredients so every sold item depletes stock with zero manual input.',
    },
    {
      id: 'pos',
      title: '4. Dedicated POS Units & Auto-Depletion',
      titleAr: '٤. نقاط البيع الخمس والاستهلاك التلقائي',
      icon: Store,
      targetView: 'pos' as ViewMode,
      description: 'Independent POS logins for Coffee Shop, Restaurant, Boba, Bakery & Events. Rings sales and instantly deducts stock.',
      demoData: '5 Unit POS Terminals · Real-time BOM deduction',
      benefit: 'Zero manual data entry: each sale automatically decrements raw ingredient quantities from the inventory ledger.',
    },
    {
      id: 'revenue',
      title: '5. Consolidated Revenue',
      titleAr: '٥. تحصيل الإيرادات المجمعة',
      icon: DollarSign,
      targetView: 'dashboard' as ViewMode,
      description: 'Unified bank settlements and aggregator reconciliation for Talabat, Snoonu, and credit cards.',
      demoData: '5 Brands consolidated · QAR 28,450 today',
      benefit: 'Zero reconciliation discrepancies between cashier drawer and bank deposit.',
    },
    {
      id: 'reports',
      title: '6. Executive P&L & Cost Reports',
      titleAr: '٦. القوائم المالية وهندسة القائمة',
      icon: BarChart3,
      targetView: 'reports' as ViewMode,
      description: 'Automatic Food Cost calculation (COGS) and menu engineering matrix directly from POS transactions.',
      demoData: '28.8% Actual Food Cost vs 30% target',
      benefit: 'Owners and investors see EBITDA margin in real-time without waiting 30 days for accountants.',
    },
  ];

  const hrSteps = [
    {
      id: 'staff',
      title: '1. Staff Roster & Qatar IDs',
      titleAr: '١. ملفات الموظفين والإقامات',
      icon: Users,
      targetView: 'staff' as ViewMode,
      description: 'Complete employee records including QID numbers, Baladiya health certificates, and contracts.',
      demoData: '42 Active Staff · 1 Expiring QID alert',
      benefit: 'Guarantees zero fines from Ministry of Interior and Ministry of Public Health.',
    },
    {
      id: 'attendance',
      title: '2. Biometric Attendance & Shifts',
      titleAr: '٢. الحضور البيومتري والمناوبات',
      icon: Clock,
      targetView: 'staff' as ViewMode,
      description: 'Branch fingerprint/face scanners log shifts, breaks, and approved overtime hours automatically.',
      demoData: '106 Overtime hours logged this month',
      benefit: 'Accurate to the minute; eliminates buddy punching and disputed overtime claims.',
    },
    {
      id: 'payroll',
      title: '3. Automated Payroll (WPS)',
      titleAr: '٣. مسير الرواتب ونظام حماية الأجور',
      icon: WalletCards,
      targetView: 'payroll' as ViewMode,
      description: 'Calculates basic salaries, allowances, and OT with 1-click Qatar Central Bank SIF export.',
      demoData: 'QAR 74,680 Net Payable · QNB WPS format',
      benefit: 'Full Ministry of Labour compliance; prevents company commercial registration (CR) blocks.',
    },
    {
      id: 'laborcost',
      title: '4. Real-time Labor Cost %',
      titleAr: '٤. نسبة تكلفة العمالة الحية',
      icon: PieChart,
      targetView: 'reports' as ViewMode,
      description: 'Measures payroll cost against hourly and daily POS sales at each branch.',
      demoData: '21.1% of Sales (Target <22%)',
      benefit: 'Optimizes staff shift scheduling based on peak evening customer traffic in Doha.',
    },
    {
      id: 'pnl',
      title: '5. Net P&L Net Margin Impact',
      titleAr: '٥. الأثر المباشر على صافي الأرباح',
      icon: TrendingUp,
      targetView: 'reports' as ViewMode,
      description: 'Labor cost flows straight into the monthly EBITDA calculation alongside COGS and branch rent.',
      demoData: 'QAR 156,050 Net EBITDA (30.3% margin)',
      benefit: 'Owners see true bottom-line profitability per brand with full labor cost allocation.',
    },
  ];

  const currentSteps = activeFlow === 'supply' ? supplySteps : hrSteps;
  const activeStepDetails = currentSteps.find((s) => s.id === selectedStep) || currentSteps[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero presentation banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
              {t('Investor & Executive Architecture', 'هيكلية النظام للملاك والمستثمرين')}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-xs text-neutral-300">
              {t('Single Source of Truth', 'نظام موحد وشامل')}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('How K-OS Unifies Every Restaurant Operation', 'كيف يربط K-OS كافة مفاصل العمل في منصة واحدة')}
          </h2>
          <p className="text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            {t(
              'Traditional restaurants use 5 disconnected systems (Excel, separate POS, payroll software, delivery aggregators). K-OS unites them into an automated, real-time feedback loop.',
              'تستخدم المطاعم التقليدية برامج منفصلة تسبب هدر الوقت والأخطاء. يدمج K-OS المشتريات، الكاشير، شاشة المطبخ، الرواتب والتقارير في دورة عمل مؤتمتة واحدة.'
            )}
          </p>
        </div>

        {/* Flow selector buttons */}
        <div className="flex items-center gap-2 p-1 bg-white/10 rounded-xl border border-white/15 shrink-0">
          <button
            onClick={() => {
              setActiveFlow('supply');
              setSelectedStep('pos');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeFlow === 'supply'
                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            {t('1. Supply & Revenue Flow', '١. مسار التوريد والمبيعات')}
          </button>
          <button
            onClick={() => {
              setActiveFlow('hr');
              setSelectedStep('payroll');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeFlow === 'hr'
                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            {t('2. Staff & Labor Cost Flow', '٢. مسار العمالة والأرباح')}
          </button>
        </div>
      </div>

      {/* Interactive Diagram Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Column (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {activeFlow === 'supply'
                  ? t('Supply Chain to Revenue Pipeline', 'مسار التوريد والمخزون نحو المبيعات والأرباح')
                  : t('Workforce & Labor Cost to P&L Pipeline', 'مسار الكوادر البشرية وتكلفة العمل نحو الأرباح')}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {t('Click on any step to inspect live system connections', 'اضغط على أي مرحلة لعرض الربط البرمجي الحي')}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
              {currentSteps.length} {t('Connected Steps', 'مراحل متصلة')}
            </span>
          </div>

          <div className="space-y-3">
            {currentSteps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = selectedStep === step.id;

              return (
                <div key={step.id}>
                  <div
                    onClick={() => setSelectedStep(step.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {language === 'ar' ? step.titleAr : step.title}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-md line-clamp-1">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-block font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {step.demoData}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-neutral-400 ${isSelected ? 'text-amber-600' : ''} ${
                          isRTL ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  {idx < currentSteps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Inspector Column */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {t('Mechanism & Value Chain Inspector', 'تفاصيل الربط والقيمة المضافة')}
              </h4>
            </div>

            <div>
              <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {language === 'ar' ? activeStepDetails.titleAr : activeStepDetails.title}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                {activeStepDetails.description}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {t('Live System Telemetry', 'بيانات حية من هذا العرض')}
              </div>
              <div className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                {activeStepDetails.demoData}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('Executive Business Benefit', 'الأثر المالي والتنظيمي')}</span>
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                {activeStepDetails.benefit}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => setCurrentView(activeStepDetails.targetView)}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span>{t('Jump to this Live Module', 'الانتقال لهذا القسم في النظام')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
