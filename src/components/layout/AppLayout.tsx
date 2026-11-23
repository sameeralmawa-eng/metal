'use client';

import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Header } from './Header';
import { WorkflowGuideModal } from '../workflow/WorkflowGuideModal';
import { DashboardView } from '../dashboard/DashboardView';
import { ManufacturingView } from '../manufacturing/ManufacturingView';
import { InventoryView } from '../inventory/InventoryView';
import { PurchaseView } from '../purchase/PurchaseView';
import { SalesView } from '../sales/SalesView';
import { AccountingView } from '../accounting/AccountingView';
import { MastersView } from '../masters/MastersView';
import { ReportsView } from '../reports/ReportsView';
import { LayoutDashboard, Flame, Boxes, TrendingUp, Menu } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  // Quick navigation items for mobile bottom bar
  const mobileNavItems: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'manufacturing', label: 'Melting', icon: Flame },
    { id: 'inventory', label: 'Stores', icon: Boxes },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 text-slate-900 overflow-hidden font-sans antialiased relative">
      {/* Ambient background glass light orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-300/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-indigo-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sidebar (Responsive: off-canvas drawer on mobile/tablet <lg, static on desktop lg+) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenWorkflow={() => {
          setIsWorkflowOpen(true);
          setMobileMenuOpen(false);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          onOpenWorkflow={() => setIsWorkflowOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 pb-20 md:pb-8 custom-scrollbar">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab: NavTab) => setCurrentTab(tab)}
              onOpenWorkflow={() => setIsWorkflowOpen(true)}
            />
          )}

          {currentTab === 'manufacturing' && <ManufacturingView />}

          {currentTab === 'inventory' && <InventoryView />}

          {currentTab === 'purchase' && <PurchaseView />}

          {currentTab === 'sales' && <SalesView />}

          {currentTab === 'accounting' && <AccountingView />}

          {currentTab === 'masters' && <MastersView />}

          {currentTab === 'reports' && <ReportsView />}
        </main>

        {/* Mobile Frosted Glass Bottom Navigation Bar (< md screens) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-2xl border-t border-blue-100/90 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {mobileNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-blue-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 stroke-[2.5]' : 'text-slate-500'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* More / All Modules Drawer Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              mobileMenuOpen ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        </nav>
      </div>

      {/* Interactive 15-Step Workflow Guide Modal */}
      <WorkflowGuideModal
        isOpen={isWorkflowOpen}
        onClose={() => setIsWorkflowOpen(false)}
        onNavigate={(tab: NavTab) => setCurrentTab(tab)}
      />
    </div>
  );
};
