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

export const AppLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 text-slate-900 overflow-hidden font-sans antialiased relative">
        {/* Ambient background glass light orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-300/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-indigo-300/15 rounded-full blur-3xl pointer-events-none -z-10" />
        {/* Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onOpenWorkflow={() => setIsWorkflowOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <Header
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenWorkflow={() => setIsWorkflowOpen(true)}
          />

          {/* Dynamic Page Views */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
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
