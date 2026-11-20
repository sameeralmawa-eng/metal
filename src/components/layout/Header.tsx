'use client';

import React from 'react';
import {
  Flame,
  RotateCcw,
  Sparkles,
  Workflow,
  Building2,
  Calendar,
  ShieldCheck,
  Activity,
  Layers,
  ThermometerSnowflake,
  Gauge,
  ChevronDown,
  Download,
  FileText,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  setCurrentTab?: (tab: NavTab) => void;
  onOpenWorkflow: () => void;
}

  export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenWorkflow }) => {
    const { state, resetDemoData, runGolden100KgDemo } = useERP();

    const navOptions: Array<{ id: NavTab; label: string }> = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'manufacturing', label: 'Manufacturing & Loss' },
      { id: 'inventory', label: '4-Store Inventory' },
      { id: 'purchase', label: 'Purchase & Inward' },
      { id: 'sales', label: 'Sales & Invoicing' },
      { id: 'accounting', label: 'Double-Entry Accounting' },
      { id: 'masters', label: 'Master Management' },
      { id: 'reports', label: 'Reports & Analytics' },
    ];

    const getTabTitle = (tab: NavTab) => {
      switch (tab) {
        case 'dashboard':
          return 'Executive Plant Dashboard & KPIs';
        case 'manufacturing':
          return 'Metal Melting & Rolling Operations (Weight Loss Management)';
        case 'inventory':
          return '4-Store Inventory (Raw, WIP, Finished Goods, Scrap)';
        case 'purchase':
          return 'Purchase Invoices, Inward & Supplier Management';
        case 'sales':
          return 'Finished Goods Sales Invoicing & GST Billing';
        case 'accounting':
          return 'Double-Entry Accounting, Ledgers & Financial Statements';
        case 'masters':
          return 'Master Records (Customers, Suppliers, Materials, Mills)';
        case 'reports':
          return 'Real-Time Operational & Financial Reports (15 Reports)';
        default:
          return 'Apex Metal Manufacturing ERP';
      }
    };

    const handleReset = () => {
      if (confirm('Reset ERP state back to standard factory demo data?')) {
        resetDemoData();
      }
    };

    return (
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-blue-100/90 px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0 shadow-sm">
          {/* Left: Tab Title, Module Switcher & Facility Status */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{getTabTitle(currentTab)}</span>
                </h1>

                    {/* Quick Module Switcher for immediate navigation */}
                    {setCurrentTab && (
                      <div className="relative inline-block ml-1">
                        <select
                          value={currentTab}
                          onChange={e => setCurrentTab(e.target.value as NavTab)}
                          className="text-xs font-bold text-blue-700 bg-blue-50/80 border border-blue-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
                          title="Switch ERP Module"
                        >
                        {navOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            Go to {opt.label}
                          </option>
                        ))}
                      </select>
              </div>
            )}
              </div>

              <div className="flex items-center gap-2.5 mt-0.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium truncate max-w-[160px] sm:max-w-none">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  {state.company.companyName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Furnace-1: 1,620°C
                </span>
                <span className="text-slate-300 hidden md:inline">•</span>
                <span className="hidden md:flex items-center gap-1 font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-semibold shadow-xs">
                  <Gauge className="w-3 h-3 text-blue-600" />
                  Mill-12 (Online)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls & User Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Launch 15-Step Workflow Guide */}
            <button
              type="button"
              onClick={onOpenWorkflow}
              className="py-2 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              title="See complete 15-step metal manufacturing workflow"
            >
              <Workflow className="w-4 h-4 text-blue-100" />
              <span className="hidden sm:inline">15-Step Guide</span>
            </button>

            {/* 1-Click Golden 100KG Demo */}
            <button
              type="button"
              onClick={() => {
                runGolden100KgDemo();
                alert('Golden 100 KG -> 97 KG Test Scenario reloaded and ready for verification!');
              }}
              className="py-2 px-2.5 sm:px-3 rounded-xl bg-white/80 hover:bg-blue-50/90 text-blue-700 text-xs font-bold border border-blue-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Reload the 100 KG Scrap -> 97 KG Rebar test data"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">100KG Test Data</span>
            </button>

            {/* Direct Download Hindi Guide .txt */}
            <a
              href="/SIDEBAR_MENUS_HINDI_GUIDE.txt"
              download="SIDEBAR_MENUS_HINDI_GUIDE.txt"
              className="py-2 px-2.5 sm:px-3 rounded-xl bg-blue-50/90 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download Hindi Sidebar Guide (.txt)"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">Hindi Guide (.txt)</span>
              <span className="lg:hidden">Hindi .txt</span>
            </a>

        {/* Reset Data Button */}
        <button
          type="button"
          onClick={handleReset}
          className="p-2 rounded-xl bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 transition-colors shadow-xs cursor-pointer"
          title="Reset to factory demo data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="hidden lg:flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
            VR
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800">Vikram Rathi</span>
            <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Plant Director
            </span>
          </div>
        </div>
      </div>
    </header >
  );
};
