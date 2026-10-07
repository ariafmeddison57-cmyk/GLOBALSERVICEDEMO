import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { POSView } from './components/pos/POSView';
import { InventoryView } from './components/inventory/InventoryView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { StaffView } from './components/staff/StaffView';
import { PayrollView } from './components/payroll/PayrollView';
import { ReportsView } from './components/reports/ReportsView';
import { MenuRecipesView } from './components/menu/MenuRecipesView';
import { BusinessFlowView } from './components/flow/BusinessFlowView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'pos' && <POSView />}
          {currentView === 'menu' && <MenuRecipesView />}
          {currentView === 'inventory' && <InventoryView />}
          {currentView === 'purchases' && <PurchasesView />}
          {currentView === 'expenses' && <ExpensesView />}
          {currentView === 'staff' && <StaffView />}
          {currentView === 'payroll' && <PayrollView />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'flow' && <BusinessFlowView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
