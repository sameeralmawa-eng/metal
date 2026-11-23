'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ArrowRight,
  Flame,
  Scale,
  ShoppingCart,
  Boxes,
  FileText,
  DollarSign,
  TrendingUp,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { NavTab } from '../layout/Sidebar';
import { formatCurrency, formatKg } from '@/lib/utils';

interface WorkflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const WorkflowGuideModal: React.FC<WorkflowGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { state } = useERP();
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Supplier & Raw Material Registration',
      tab: 'masters' as NavTab,
      icon: Layers,
      description: 'Register supplier (Mahadev Ferrous) and Raw Material item (Mild Steel Melting Scrap 100KG Test Grade).',
      highlight: 'Supplier Code: SUPP-001 | Material Code: RAW-MS-SCRAP-100',
      status: 'VERIFIED',
    },
    {
      step: 2,
      title: 'Create Purchase Invoice (100 KG @ ₹100/KG)',
      tab: 'purchase' as NavTab,
      icon: ShoppingCart,
      description: 'Invoice PINV-2026-0001 created for 100 KG raw scrap @ ₹100/KG = ₹10,000 taxable + GST (9% CGST + 9% SGST) + ₹350 freight = ₹12,150.',
      highlight: 'Subtotal: ₹10,000.00 | Qty: 100.00 KG | Invoice: PINV-2026-0001',
      status: 'VERIFIED',
    },
    {
      step: 3,
      title: 'Auto-Inward to Raw Material Inventory',
      tab: 'inventory' as NavTab,
      icon: Boxes,
      description: 'System automatically creates Batch BATCH-RM-2026-100KG and records Inventory Transaction ITXN-0001 (+100 KG) in Bay-A Warehouse.',
      highlight: 'Batch: BATCH-RM-2026-100KG | Raw Material Stock +100 KG',
      status: 'VERIFIED',
    },
    {
      step: 4,
      title: 'Create Manufacturing Order & Select Batch',
      tab: 'manufacturing' as NavTab,
      icon: FileText,
      description: 'Issue Manufacturing Order MO-2026-0001 linked to Batch BATCH-RM-2026-100KG and Induction Furnace Unit 1.',
      highlight: 'Order: MO-2026-0001 | Input Weight: 100.00 KG',
      status: 'VERIFIED',
    },
    {
      step: 5,
      title: 'Melting Process in Induction Furnace',
      tab: 'manufacturing' as NavTab,
      icon: Flame,
      description: 'Charge 100 KG into Induction Furnace 1 at 1620°C. Melting output = 98 KG liquid billet (2 KG burning oxidation loss).',
      highlight: 'Heat: HEAT-2026-NOV-019 | Furnace Temp: 1,620°C',
      status: 'VERIFIED',
    },
    {
      step: 6,
      title: 'Rolling Process (12-Stand Mill)',
      tab: 'manufacturing' as NavTab,
      icon: Layers,
      description: 'Feed hot billet into 12-stand continuous rolling mill. Mill scale loss = 1 KG during sizing passes.',
      highlight: 'Rolling Mill Stand: 12 Passes | Speed: Continuous',
      status: 'VERIFIED',
    },
    {
      step: 7,
      title: 'Record Actual Output Weight (97 KG)',
      tab: 'manufacturing' as NavTab,
      icon: Scale,
      description: 'Final cooled TMT rebar weighed on calibrated digital scale = exactly 97.00 KG.',
      highlight: 'Actual Output: 97.00 KG | Recoverable Scrap: 0.00 KG',
      status: 'VERIFIED',
    },
    {
      step: 8,
      title: 'Automatic Weight Loss Calculation (3 KG / 3.00%)',
      tab: 'manufacturing' as NavTab,
      icon: Scale,
      description: 'Formulas evaluated: Loss Weight = 100 - 97 - 0 = 3 KG. Loss % = (3 / 100) * 100 = 3.00%. Verified within 2.0% - 3.5% limit.',
      highlight: 'Process Loss: 3.00 KG | Loss Percentage: 3.00% (NORMAL)',
      status: 'VERIFIED',
    },
    {
      step: 9,
      title: 'Record Labour & Overheads Expenses',
      tab: 'manufacturing' as NavTab,
      icon: DollarSign,
      description: 'Allocate direct factory costs: Direct Labour ₹400 + Power ₹350 + Gas/Fuel ₹100 + Consumables ₹50 = ₹900 Total Overheads.',
      highlight: 'Labour: ₹400.00 | Power: ₹350.00 | Total Overheads: ₹900.00',
      status: 'VERIFIED',
    },
    {
      step: 10,
      title: 'Calculate Finished Goods Cost Per KG',
      tab: 'manufacturing' as NavTab,
      icon: DollarSign,
      description: 'Total Manufacturing Cost = ₹10,000 raw material + ₹900 overheads = ₹10,900. Cost Per KG = ₹10,900 / 97 KG = ₹112.37 / KG.',
      highlight: 'Total Mfg Cost: ₹10,900.00 | Cost Per KG: ₹112.37 / KG',
      status: 'VERIFIED',
    },
    {
      step: 11,
      title: 'Transfer 97 KG to Finished Goods Inventory',
      tab: 'inventory' as NavTab,
      icon: Boxes,
      description: 'Order completed: Raw Material Stock deducted (-100 KG), Finished Goods Batch BATCH-FG-2026-97KG created (+97 KG) in Depot Bay-C.',
      highlight: 'Batch: BATCH-FG-2026-97KG | FG Stock: +97.00 KG',
      status: 'VERIFIED',
    },
    {
      step: 12,
      title: 'Create Sales Invoice for Finished Goods',
      tab: 'sales' as NavTab,
      icon: TrendingUp,
      description: 'Create Sales Invoice SINV-2026-0001 for Larsen & Toubro: 97 KG @ ₹125/KG = ₹12,125.00 taxable value.',
      highlight: 'Sold Qty: 97.00 KG @ ₹125/KG | Subtotal: ₹12,125.00',
      status: 'VERIFIED',
    },
    {
      step: 13,
      title: 'Calculate GST & Generate Downloadable PDF',
      tab: 'sales' as NavTab,
      icon: FileText,
      description: 'Apply intra-state GST (9% CGST = ₹1,091.25 + 9% SGST = ₹1,091.25) + ₹400 freight = ₹14,707.50 Grand Total with 1-click PDF download.',
      highlight: 'CGST 9%: ₹1,091.25 | SGST 9%: ₹1,091.25 | Grand Total: ₹14,707.50',
      status: 'VERIFIED',
    },
    {
      step: 14,
      title: 'Auto-Update Stock & Double-Entry Accounting',
      tab: 'accounting' as NavTab,
      icon: DollarSign,
      description: 'Finished goods stock automatically reduced by 97 KG. Journal entries JV-2026-0001, 0002, 0003 posted with matched debits/credits.',
      highlight: 'Journal Entries: 3 | FG Stock after sale: 0 KG (Deducted)',
      status: 'VERIFIED',
    },
    {
      step: 15,
      title: 'Purchase-to-Sales Profit & Loss Analysis',
      tab: 'accounting' as NavTab,
      icon: TrendingUp,
      description: 'Sales Revenue: ₹12,125.00 minus Total Mfg Cost: ₹10,900.00 = Net Operating Profit of ₹1,225.00 (10.10% profit margin).',
      highlight: 'Net Gross Profit: ₹1,225.00 | Profit Margin: 10.10%',
      status: 'VERIFIED',
    },
  ];

  const currentStepData = steps.find(s => s.step === activeStep) || steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl border border-blue-200/80 rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white/90 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                15-Step Metal Manufacturing Workflow Guide
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-medium border border-emerald-500/30">
                  100 KG → 97 KG Verified
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete purchase-to-melting-to-rolling-to-sales lifecycle demonstration.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-blue-50/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Step list + Right Details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[460px]">
          {/* Step Selector List: Horizontal pill bar on mobile, vertical sidebar on desktop */}
          <div className="md:col-span-5 flex md:flex-col overflow-x-auto md:overflow-y-auto p-2.5 md:p-3 gap-2 md:gap-0 md:space-y-1.5 border-b md:border-b-0 md:border-r border-blue-100 flex-shrink-0 bg-white/60 custom-scrollbar">
            {steps.map(s => {
              const isCurrent = s.step === activeStep;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`flex-shrink-0 md:flex-shrink w-auto md:w-full text-left px-3 py-2 md:p-2.5 rounded-xl transition-all flex items-center gap-2 md:gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/40 text-orange-600 shadow-xs'
                      : 'hover:bg-blue-50/60 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-mono font-bold ${
                      isCurrent
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-50/80 text-slate-500'
                    }`}
                  >
                    {s.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold whitespace-nowrap md:whitespace-normal md:truncate text-slate-800">
                      {s.title}
                    </div>
                    <div className="text-[10px] text-slate-500 hidden md:block truncate">
                      {s.highlight}
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Active Step Details Panel */}
          <div className="md:col-span-7 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto bg-white/70">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  Step {currentStepData.step} of 15
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentStepData.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-4">
                {currentStepData.title}
              </h3>

              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Data Callout Box */}
              <div className="mt-5 p-4 rounded-xl bg-white/80 border border-blue-100 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Live System Record / Formula
                </div>
                <div className="p-2.5 rounded-lg bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 text-xs font-mono text-amber-300 break-words">
                  {currentStepData.highlight}
                </div>
              </div>

              {/* Flow preview highlight */}
              {activeStep === 8 && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Scale className="w-4 h-4" />
                    Weight Loss Calculation Check
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>• Input: 100.00 KG</div>
                    <div>• Output: 97.00 KG</div>
                    <div>• Scrap Recovered: 0.00 KG</div>
                    <div className="font-bold text-emerald-400">• Actual Loss = 100 - 97 - 0 = 3.00 KG (3.00%)</div>
                    <div className="text-[11px] text-slate-500 font-mono">Tolerance Allowed: 2.0% to 3.5% → Status: APPROVED</div>
                  </div>
                </div>
              )}

              {activeStep === 15 && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Complete Profit & Loss Summary
                  </div>
                  <div className="text-xs text-slate-700 grid grid-cols-2 gap-2 mt-1">
                    <div className="p-2 rounded bg-white/80 border border-blue-100">
                      <div className="text-[10px] text-slate-500">Sales Value (97 KG @ ₹125)</div>
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(12125)}</div>
                    </div>
                    <div className="p-2 rounded bg-white/80 border border-blue-100">
                      <div className="text-[10px] text-slate-500">Total Mfg Cost (RM + Overheads)</div>
                      <div className="text-sm font-bold text-orange-400">{formatCurrency(10900)}</div>
                    </div>
                    <div className="col-span-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                      <span className="font-semibold text-emerald-400">Net Operational Profit:</span>
                      <span className="font-extrabold text-emerald-300 text-sm">{formatCurrency(1225)} (10.1%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step navigation and Jump to module button */}
            <div className="pt-6 border-t border-blue-100 flex items-center justify-between gap-3 mt-4">
              <div className="flex gap-2">
                <button
                  disabled={activeStep <= 1}
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50/80 hover:bg-blue-100/70 disabled:opacity-40 disabled:hover:bg-blue-50/80 text-slate-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={activeStep >= 15}
                  onClick={() => setActiveStep(prev => Math.min(15, prev + 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50/80 hover:bg-blue-100/70 disabled:opacity-40 disabled:hover:bg-blue-50/80 text-slate-800 transition-colors"
                >
                  Next
                </button>
              </div>

              <button
                onClick={() => {
                  onNavigate(currentStepData.tab);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all"
              >
                <span>Open {currentStepData.tab.toUpperCase()} Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
