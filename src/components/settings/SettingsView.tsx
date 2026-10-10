import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Store,
  Shield,
  CreditCard,
  CheckCircle2,
  Sliders,
  DollarSign,
  Globe,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANDS, BRANCHES } from '../../data/mockData';

export const SettingsView: React.FC = () => {
  const { t, language, setLanguage, theme, toggleTheme, playSound } = useApp();

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = () => {
    playSound('success');
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('Enterprise Settings & Branch Config', 'إعدادات النظام وإدارة الفروع')}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t(
              'Manage your restaurant group brands, branches in Qatar, currency, and receipt templates.',
              'تهيئة العلامات التجارية، الفروع في دولة قطر، وإعدادات الطابعات والعملة.'
            )}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{t('Save Configuration', 'حفظ الإعدادات')}</span>
        </button>
      </div>

      {savedNotification && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t('All configuration settings saved successfully!', 'تم حفظ كافة الإعدادات بنجاح!')}</span>
        </div>
      )}

      {/* Brands Management */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('GLOBALSERVICES Brands Portfolio (5 Brands)', 'محفظة علامات GLOBALSERVICES (٥ علامات)')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-3"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                style={{ backgroundColor: `${brand.accentHex}20`, color: brand.accentHex }}
              >
                {brand.name[0]}
              </div>
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {language === 'ar' ? brand.nameAr : brand.name}
                </div>
                <div className="text-[10px] text-neutral-500 truncate">{brand.tagline}</div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600">Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Branches Management */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('Operating Branches in Qatar', 'فروع العمليات في دولة قطر')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {BRANCHES.map((br) => (
            <div
              key={br.id}
              className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{br.name}</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                  {br.type}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">{br.city}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tax & Regional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('Tax & Financial Currency', 'الضريبة والعملة')}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-neutral-500 block mb-1">{t('Base Currency', 'العملة الأساسية')}</label>
              <input
                type="text"
                disabled
                value={t('QAR (Qatari Riyal)', 'ريال قطري (QAR)')}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 font-mono font-medium"
              />
            </div>
            <div>
              <label className="text-neutral-500 block mb-1">{t('Standard VAT Rate', 'نسبة ضريبة القيمة المضافة')}</label>
              <input
                type="text"
                disabled
                value="0.0% (Qatar General F&B Law)"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 font-mono font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
