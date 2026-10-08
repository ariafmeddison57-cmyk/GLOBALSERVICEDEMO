import React, { useState } from 'react';
import {
  LayoutDashboard,
  Store,
  ChefHat,
  Boxes,
  Truck,
  Receipt,
  Users,
  WalletCards,
  BarChart3,
  GitFork,
  Settings,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building2,
  Sparkles,
  Lock,
  Unlock,
  Coffee,
  Flame,
  CakeSlice,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewMode, PosUnitId } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    t,
    inventory,
    staff,
    userRole,
    currentPosUnit,
    posUnits,
    loginAsCashier,
    loginAsAdmin,
    isSidebarCollapsed,
    toggleSidebar,
    isRTL,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  // If logged into POS as cashier, the sidebar shouldn't render at all
  if (userRole === 'cashier') {
    return null;
  }

  const lowStockCount = inventory.filter((i) => i.closingStock <= i.minReorderLevel).length;
  const staffAlertCount = staff.filter(
    (s) => new Date(s.qidExpiry).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30
  ).length;

  const navItems: {
    id: ViewMode;
    label: string;
    labelAr: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: LayoutDashboard,
    },
    {
      id: 'pos',
      label: 'POS Terminals',
      labelAr: 'نقاط البيع (POS)',
      icon: Store,
    },
    {
      id: 'menu',
      label: 'Menu & Recipes',
      labelAr: 'الوصفات وقائمة الأطعمة',
      icon: ChefHat,
    },
    {
      id: 'inventory',
      label: 'Inventory & Waste',
      labelAr: 'المخزون والهدر',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'expenses',
      label: 'Operating Expenses',
      labelAr: 'المصروفات العامة (OPEX)',
      icon: Receipt,
    },
    {
      id: 'purchases',
      label: 'Purchaces',
      labelAr: 'المشتريات والتوريد',
      icon: Truck,
    },
    {
      id: 'staff',
      label: 'Staff & HR',
      labelAr: 'الموظفون والامتثال',
      icon: Users,
      badge: staffAlertCount > 0 ? staffAlertCount : undefined,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'payroll',
      label: 'Payroll (WPS)',
      labelAr: 'الرواتب ونظام WPS',
      icon: WalletCards,
    },
    {
      id: 'reports',
      label: 'Reports & P&L',
      labelAr: 'التقارير والأرباح',
      icon: BarChart3,
    },
    {
      id: 'flow',
      label: 'Business Flow',
      labelAr: 'تدفق العمليات',
      icon: GitFork,
    },
    {
      id: 'settings',
      label: 'Settings',
      labelAr: 'الإعدادات والفروع',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`shrink-0 bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 flex flex-col justify-between select-none transition-all duration-300 ease-in-out relative z-30 ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
    >
      {/* Top Header & Brand Identity */}
      <div>
        <div className={`h-18 px-3.5 flex items-center border-b border-slate-100 dark:border-neutral-800 ${
          isSidebarCollapsed ? 'justify-center' : 'justify-between px-5'
        }`}>
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={() => setCurrentView('dashboard')}
              className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-black text-sm shadow-sm cursor-pointer hover:opacity-90 shrink-0 tracking-tighter"
              title="GLOBALSERVICES Restaurant Group ERP"
            >
              GS
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-neutral-100 truncate">
                    GLOBALSERVICES
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                    ERP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate font-medium">
                  {t('Qatar Hospitality Group', 'مجموعة مطاعم قطر')}
                </p>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button inside header (visible on expanded) */}
          {!isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-colors"
              title={t('Collapse Sidebar', 'طي القائمة الجانبية')}
            >
              {isRTL ? <PanelLeftClose className="w-4 h-4 rotate-180" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Collapsed quick expand button */}
        {isSidebarCollapsed && (
          <div className="pt-2 px-3 flex justify-center">
            <button
              onClick={toggleSidebar}
              className="w-full py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-800 dark:hover:text-neutral-200 flex items-center justify-center transition-colors"
              title={t('Expand Sidebar', 'توسيع القائمة الجانبية')}
            >
              {isRTL ? <PanelLeftOpen className="w-4 h-4 rotate-180" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="p-2 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={isSidebarCollapsed ? t(item.label, item.labelAr) : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group relative ${
                  isSidebarCollapsed
                    ? 'justify-center p-3'
                    : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100/70 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white dark:text-neutral-900'
                        : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-neutral-200'
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="tracking-wide truncate">
                      {t(item.label, item.labelAr)}
                    </span>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge ? (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-600" />
                    )}
                  </div>
                )}

                {/* Collapsed Badge Dot indicator */}
                {isSidebarCollapsed && item.badge ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card & Role Switcher at Bottom */}
      <div className="p-2 sm:p-3 border-t border-slate-100 dark:border-neutral-800">
        <div className="relative">
          {isSidebarCollapsed ? (
            /* Collapsed Profile Icon with Tooltip / Dropdown */
            <div className="flex justify-center">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shadow-xs hover:scale-105 transition-transform"
                title={t('HQ Admin • Click to switch station', 'المدير العام • اضغط للتحويل لكاشير')}
              >
                HQ
              </button>
            </div>
          ) : (
            /* Expanded Profile Card */
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/70 border border-slate-200/80 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0">
                  HQ
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">
                    {t('HQ Executive Admin', 'المدير التنفيذي')}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                    {t('Full System Access', 'كافة الصلاحيات')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-neutral-700 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                title="Switch Station or Admin Login"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${isRoleMenuOpen ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}

          {/* Role / Terminal Switcher Dropdown */}
          {isRoleMenuOpen && (
            <div className={`absolute bottom-full mb-2 p-2 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
              isSidebarCollapsed ? 'left-0 w-64' : 'left-0 right-0'
            }`}>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-neutral-800 mb-1 flex items-center justify-between">
                <span>{t('Switch Terminal Login', 'تسجيل دخول نقطة بيع')}</span>
                <button
                  onClick={() => setIsRoleMenuOpen(false)}
                  className="hover:text-slate-700 dark:hover:text-neutral-200"
                >
                  ✕
                </button>
              </div>

              {/* Admin Mode */}
              <button
                onClick={() => {
                  loginAsAdmin();
                  setIsRoleMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  userRole === 'admin'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{t('Master Admin (HQ Group)', 'المدير العام للمجموعة')}</span>
                </div>
                {userRole === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-neutral-800" />
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400">
                {t('Login to POS Only (No Sidebar):', 'تسجيل دخول كاشير (بدون شريط جانبي):')}
              </div>

              {posUnits.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    loginAsCashier(u.id);
                    setIsRoleMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-neutral-300 hover:text-amber-900 dark:hover:text-amber-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate font-medium">{u.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                    POS
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
