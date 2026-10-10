import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Globe,
  Moon,
  Save,
  Settings,
  Shield,
  Store,
  Sun,
  Volume2,
  VolumeX,
  AlertCircle,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANDS, BRANCHES } from '../../data/mockData';

export const SettingsView: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    taxRate,
    setTaxRate,
    saveAppSettings,
    playSound,
  } = useApp();

  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');

  const handleSave = () => {
    if (saveAppSettings()) {
      playSound('success');
      setSaveState('saved');
    } else {
      setSaveState('error');
    }
    window.setTimeout(() => setSaveState('idle'), 3500);
  };

  const cardClass = 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4';
  const fieldLabelClass = 'text-xs font-semibold text-neutral-700 dark:text-neutral-300';
  const choiceClass = (active: boolean) =>
    `px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${active
      ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white'
      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'}`;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t('Settings', 'الإعدادات')}
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('Configure this workspace for your brands, branches, and daily operations.', 'تهيئة مساحة العمل للعلامات التجارية والفروع والعمليات اليومية.')}
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{t('Save Settings', 'حفظ الإعدادات')}</span>
        </button>
      </div>

      {saveState !== 'idle' && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${saveState === 'saved'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'}`} role="status">
          {saveState === 'saved' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{saveState === 'saved'
            ? t('Settings saved in this browser.', 'تم حفظ الإعدادات في هذا المتصفح.')
            : t('Could not save settings in this browser.', 'تعذر حفظ الإعدادات في هذا المتصفح.')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className={cardClass}>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t('Workspace Preferences', 'تفضيلات مساحة العمل')}</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className={fieldLabelClass}>{t('Language', 'اللغة')}</p>
              <div className="flex gap-2">
                <button className={choiceClass(language === 'en')} onClick={() => setLanguage('en')}>English</button>
                <button className={choiceClass(language === 'ar')} onClick={() => setLanguage('ar')}>العربية</button>
              </div>
            </div>
            <div className="space-y-2">
              <p className={fieldLabelClass}>{t('Appearance', 'المظهر')}</p>
              <div className="flex gap-2">
                <button className={`${choiceClass(theme === 'light')} inline-flex items-center gap-2`} onClick={() => theme === 'dark' && toggleTheme()}>
                  <Sun className="w-3.5 h-3.5" />{t('Light', 'فاتح')}
                </button>
                <button className={`${choiceClass(theme === 'dark')} inline-flex items-center gap-2`} onClick={() => theme === 'light' && toggleTheme()}>
                  <Moon className="w-3.5 h-3.5" />{t('Dark', 'داكن')}
                </button>
              </div>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 p-3 cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
                {t('Interface sounds', 'أصوات الواجهة')}
              </span>
              <input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} className="accent-amber-500 w-4 h-4" />
            </label>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t('Regional & Tax', 'الإعدادات الإقليمية والضريبة')}</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className={`${fieldLabelClass} block mb-1.5`} htmlFor="settings-currency">{t('Operating currency', 'عملة التشغيل')}</label>
              <input id="settings-currency" type="text" disabled value="QAR — Qatari Riyal" className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono" />
              <p className="mt-1 text-[10px] text-neutral-500">{t('Currency conversion is not configured.', 'تحويل العملات غير مهيأ.')}</p>
            </div>
            <div>
              <label className={`${fieldLabelClass} block mb-1.5`} htmlFor="settings-tax">{t('Tax rate (%)', 'نسبة الضريبة (%)')}</label>
              <div className="relative">
                <input
                  id="settings-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(event) => setTaxRate(Math.min(100, Math.max(0, Number(event.target.value) || 0)))}
                  className="w-full p-2.5 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-neutral-400">%</span>
              </div>
              <p className="mt-1 text-[10px] text-neutral-500">{t('Applied to new POS orders. Confirm the rate with your finance adviser before using it for live operations.', 'يتم تطبيقها على طلبات نقاط البيع الجديدة. تحقق من النسبة مع مستشارك المالي قبل استخدامها في العمليات الفعلية.')}</p>
            </div>
          </div>
        </section>
      </div>

      <section className={cardClass}>
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t('Brands', 'العلامات التجارية')}</h3>
          <span className="ml-auto text-[10px] text-neutral-500">{BRANDS.length} {t('active', 'نشطة')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {BRANDS.map((brand) => (
            <div key={brand.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: `${brand.accentHex}20`, color: brand.accentHex }}>{brand.name[0]}</div>
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">{language === 'ar' ? brand.nameAr : brand.name}</div>
                <div className="text-[10px] text-neutral-500 truncate">{brand.tagline}</div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600">{t('Active', 'نشطة')}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t('Branches & POS Locations', 'الفروع ومواقع نقاط البيع')}</h3>
          <span className="ml-auto text-[10px] text-neutral-500">{BRANCHES.length} {t('locations', 'مواقع')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {BRANCHES.map((branch) => (
            <div key={branch.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{branch.name}</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">{branch.type}</span>
              </div>
              <p className="text-[11px] text-neutral-500">{branch.city}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-neutral-500 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />{t('Brand and location records are managed centrally.', 'تتم إدارة بيانات العلامات التجارية والفروع مركزيًا.')}</p>
      </section>

      <p className="text-[10px] text-neutral-500 text-center">{t('Preferences are stored in this browser for now.', 'يتم حفظ التفضيلات في هذا المتصفح حاليًا.')}</p>
    </div>
  );
};
