'use client';

import React from 'react';
import {
  LayoutDashboard,
  Database,
  ShoppingCart,
  Boxes,
  Flame,
  TrendingUp,
  BookOpenCheck,
  FileBarChart2,
  Workflow,
  ChevronRight,
  Sparkles,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab =
  | 'dashboard'
  | 'masters'
  | 'purchase'
  | 'inventory'
  | 'manufacturing'
  | 'sales'
  | 'accounting'
  | 'reports'
  | 'workflow';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  onOpenWorkflow: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  onOpenWorkflow,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      id: 'manufacturing',
      label: 'Manufacturing & Loss',
      icon: Flame,
      badge: 'Core',
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    {
      id: 'inventory',
      label: 'Inventory & Batches',
      icon: Boxes,
      badge: '4 Stores',
      badgeColor: 'bg-sky-50 text-sky-700 border border-sky-200',
    },
    {
      id: 'purchase',
      label: 'Purchase & Inward',
      icon: ShoppingCart,
    },
    {
      id: 'sales',
      label: 'Sales & Invoicing',
      icon: TrendingUp,
    },
    {
      id: 'accounting',
      label: 'Double-Entry Accounts',
      icon: BookOpenCheck,
    },
    {
      id: 'masters',
      label: 'Master Management',
      icon: Database,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: FileBarChart2,
      badge: '15 Reports',
      badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    },
  ];

  return (
    <aside
      className={cn(
        'bg-white/80 backdrop-blur-2xl border-r border-blue-100/90 flex flex-col transition-all duration-300 z-30 select-none shadow-xl shadow-blue-500/5',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Brand Header */}
          <div className="h-20 border-b border-blue-100/80 flex items-center px-4 justify-between bg-white/60 backdrop-blur-md">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white">
                <Flame className="w-6 h-6 text-white" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

                {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-indigo-900 to-blue-700 truncate">
                  APEX METAL ERP
                </span>
                <span className="text-[11px] font-semibold text-blue-600/80 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-ping"></span>
                  Melting & Rolling OS
                </span>
              </div>
          )}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronRight
                className={cn('w-4 h-4 transition-transform duration-200', !collapsed && 'rotate-180')}
              />
            </button>
          </div>

      {/* Guided Walkthrough Callout Banner in Frosted Blue Glass */}
          {!collapsed ? (
            <div className="p-3.5 mx-3 my-3 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-white/90 border border-blue-200/80 relative overflow-hidden shadow-sm group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
                    <span>100KG Test Scenario</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-mono font-bold">
                      15 Steps
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Step-by-step 100 KG scrap → 97 KG rebar + 3% loss verification.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenWorkflow}
                    className="mt-2 w-full py-1.5 px-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Workflow className="w-3.5 h-3.5" />
                    Launch 15-Step Guide
                  </button>

                  <a
                    href="/SIDEBAR_MENUS_HINDI_GUIDE.txt"
                    download="SIDEBAR_MENUS_HINDI_GUIDE.txt"
                    className="mt-1.5 w-full py-1.5 px-2 rounded-xl text-[11px] font-bold text-blue-700 bg-white/90 hover:bg-blue-50 border border-blue-200/90 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Download Hindi Guide (.txt)"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download Hindi Guide (.txt)</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 flex justify-center">
              <button
                type="button"
                onClick={onOpenWorkflow}
                className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all shadow-sm cursor-pointer"
                title="Launch 15-Step Workflow Guide"
              >
                <Workflow className="w-5 h-5" />
              </button>
            </div>
          )}

      {/* Navigation Links */}
            <div className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
              {!collapsed && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ERP Modules
                </div>
              )}

                        {
                          navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = currentTab === item.id;
                            return (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => setCurrentTab(item.id as NavTab)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group cursor-pointer text-left',
                                  isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/25'
                                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
                                )}
                                title={collapsed ? item.label : undefined}
                              >
                                <Icon
                                  className={cn(
                                    'w-5 h-5 flex-shrink-0 transition-colors',
                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                )}
              />

                                          {!collapsed && (
                                            <div className="flex-1 flex items-center justify-between text-left truncate">
                                              <span className="truncate">{item.label}</span>
                                              {item.badge && (
                                                <span
                                                  className={cn(
                                                    'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider',
                                                    isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor || 'bg-slate-100 text-slate-600'
                            )
                          }
                    >
                            { item.badge }
                    </span>
                )
              }
                </div>
              )}
          </button>
          );
        })}
        </div>

        {/* Footer Info */}
  <div className="p-3 border-t border-blue-100/80 bg-white/60">
    {!collapsed ? (
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-700">Apex Mills Glass OS</span>
          <span className="text-[10px] text-blue-600/80 font-mono">GST: 27AAACA1234A1Z5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-600">Online</span>
        </div>
      </div>
    ) : (
      <div className="flex justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
      </div>
    )}
  </div>
    </aside >
  );
};
