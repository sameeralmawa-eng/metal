'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Boxes,
  Flame,
  Scale,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Layers,
  Building,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { formatCurrency, formatKg, formatDate } from '@/lib/utils';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenWorkflow: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenWorkflow }) => {
  const { state } = useERP();
  const [period, setPeriod] = useState<'today' | 'month' | 'year'>('month');

  // Compute live aggregates from state
  const totalPurchaseAmount = state.purchaseInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalSalesAmount = state.salesInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

  const rawMaterialStockKg = state.materials
    .filter(m => m.category === 'RAW_MATERIAL')
    .reduce((sum, m) => sum + m.currentStock, 0);

  const finishedGoodsStockKg = state.materials
    .filter(m => m.category === 'FINISHED_GOODS')
    .reduce((sum, m) => sum + m.currentStock, 0);

  const wipStockKg = state.materials
    .filter(m => m.category === 'WIP')
    .reduce((sum, m) => sum + m.currentStock, 0);

  const scrapStockKg = state.materials
    .filter(m => m.category === 'RECOVERABLE_SCRAP')
    .reduce((sum, m) => sum + m.currentStock, 0);

  const totalProductionKg = state.manufacturingOrders.reduce((sum, o) => sum + o.outputWeightKg, 0);
  const totalLossKg = state.manufacturingOrders.reduce((sum, o) => sum + o.processLossKg, 0);
  const totalInputKg = state.manufacturingOrders.reduce((sum, o) => sum + o.inputWeightKg, 0);
  const avgLossPercentage = totalInputKg > 0 ? (totalLossKg / totalInputKg) * 100 : 0;

  const totalLabourExpenses = state.labourCostEntries.reduce((sum, l) => sum + l.totalAmount, 0);
  const totalOperationalExpenses = state.manufacturingOrders.reduce(
    (sum, o) => sum + (o.electricityCost + o.fuelCost + o.otherCost),
    0
  );

  const pendingCustomerPayments = state.customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const pendingSupplierPayments = state.suppliers.reduce((sum, s) => sum + s.currentBalance, 0);

  const totalInputGst = state.purchaseInvoices.reduce((sum, i) => sum + i.taxTotal, 0);
  const totalOutputGst = state.salesInvoices.reduce((sum, i) => sum + i.taxTotal, 0);
  const netGstPayable = Math.max(0, totalOutputGst - totalInputGst);

  // Revenue - COGS - Overheads
  const totalManufacturingCost = state.manufacturingOrders.reduce(
    (sum, o) => sum + o.totalManufacturingCost,
    0
  );
  const grossProfit = totalSalesAmount > 0 ? totalSalesAmount - totalManufacturingCost : 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 via-indigo-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <span>Plant Telemetry • Induction Heat: 1,620°C Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Metal Melting & Rolling Operations Center
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time monitoring of scrap charge, induction furnace melting loss, 12-stand continuous rolling, inventory valuation, and GST double-entry accounting.
            </p>
          </div>

          {/* Quick Period Selector & Guide Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-blue-50/70 p-1 rounded-xl border border-blue-200 flex items-center text-xs">
              <button
                onClick={() => setPeriod('today')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  period === 'today'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  period === 'month'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                Nov 2026
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  period === 'year'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                FY 26-27
              </button>
            </div>

            <button
              onClick={onOpenWorkflow}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>15-Step Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (12 Cards as specified in the prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Purchases */}
        <div
          onClick={() => onNavigate('purchase')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Total Purchases</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(totalPurchaseAmount)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Invoices: {state.purchaseInvoices.length}</span>
            <span className="text-blue-400 font-medium">Auto-Inwarded</span>
          </div>
        </div>

        {/* 2. Total Sales */}
        <div
          onClick={() => onNavigate('sales')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Total Sales Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(totalSalesAmount)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Invoices: {state.salesInvoices.length}</span>
            <span className="text-emerald-400 font-medium">Rebars Dispatched</span>
          </div>
        </div>

        {/* 3. Raw Material Stock (KG) */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Raw Material Stock (Scrap/DRI)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono">
            {formatKg(rawMaterialStockKg)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Yard Bay-A</span>
            <span className="text-amber-400 font-medium">Available to Melt</span>
          </div>
        </div>

        {/* 4. Finished Goods Stock (KG) */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Finished Goods (TMT Rebars)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatKg(finishedGoodsStockKg)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Depot Bay-C</span>
            <span className="text-emerald-400 font-medium">Ready for Dispatch</span>
          </div>
        </div>

        {/* 5. Total Production (KG) */}
        <div
          onClick={() => onNavigate('manufacturing')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Total Finished Production</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatKg(totalProductionKg)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Melting & Rolling Heats</span>
            <span className="text-orange-400 font-medium">{state.manufacturingOrders.length} Orders Done</span>
          </div>
        </div>

        {/* 6. Manufacturing Loss & Percentage (CRITICAL METRIC) */}
        <div
          onClick={() => onNavigate('manufacturing')}
          className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200 hover:border-amber-400 transition-all cursor-pointer group shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-amber-800">Manufacturing Process Loss</span>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700 group-hover:scale-110 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-700 font-mono">
              {formatKg(totalLossKg)}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 font-mono">
              {avgLossPercentage.toFixed(2)}% Loss
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Expected: 2.0% - 3.5%</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Within Limit
            </span>
          </div>
        </div>

        {/* 7. Labour Expenses */}
        <div
          onClick={() => onNavigate('manufacturing')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Direct Labour Expenses</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-indigo-600 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(totalLabourExpenses)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Melters & Rollers</span>
            <span className="text-indigo-600 font-medium">{state.labourCostEntries.length} Wage Entries</span>
          </div>
        </div>

        {/* 8. Operational Expenses (Electricity + Fuel) */}
        <div
          onClick={() => onNavigate('accounting')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Power, Fuel & Overheads</span>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(totalOperationalExpenses)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>HT Tariff & Gas</span>
            <span className="text-yellow-400 font-medium">Absorbed in FG Cost</span>
          </div>
        </div>

        {/* 9. Pending Customer Payments */}
        <div
          onClick={() => onNavigate('accounting')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Customer Receivables</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-blue-600 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(pendingCustomerPayments)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Debtors</span>
            <span className="text-blue-600 font-medium">{state.customers.length} Clients</span>
          </div>
        </div>

        {/* 10. Pending Supplier Payments */}
        <div
          onClick={() => onNavigate('accounting')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Supplier Payables</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {formatCurrency(pendingSupplierPayments)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Creditors</span>
            <span className="text-rose-400 font-medium">{state.suppliers.length} Vendors</span>
          </div>
        </div>

        {/* 11. GST Summary */}
        <div
          onClick={() => onNavigate('accounting')}
          className="p-4 rounded-xl bg-white/80 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium">Net GST Liability</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(netGstPayable)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>ITC: {formatCurrency(totalInputGst)}</span>
            <span className="text-cyan-400 font-medium">Output: {formatCurrency(totalOutputGst)}</span>
          </div>
        </div>

        {/* 12. Profit & Loss Summary */}
        <div
          onClick={() => onNavigate('accounting')}
          className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium text-emerald-200">Net Operating Profit</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatCurrency(grossProfit)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Revenue - Full Mfg Cost</span>
            <span className="text-emerald-400 font-semibold">Healthy Margin</span>
          </div>
        </div>
      </div>

      {/* Visual Plant Flow: Induction Melting -> Billet Caster -> Rolling Mill -> Finished Product */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-slate-900">
              Live Manufacturing Process Telemetry & Stage Loss Flow
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Standards: IS 2062 & IS 1786 Fe 500D
          </span>
        </div>

        {/* Responsive Process Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="p-4 rounded-xl bg-white/80 border border-blue-100 space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">1. Raw Scrap Charge</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                Input
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900">100.00 KG</div>
            <p className="text-[11px] text-slate-500">
              HMS 1&2 Scrap + DRI sponge mix charged into 10-Ton Induction Furnace.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Rate: ₹100.00 / KG</div>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-orange-950/20 border border-orange-500/30 space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-orange-300">2. Induction Melting</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-mono">
                1,620°C
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-orange-400">98.00 KG Molten</div>
            <p className="text-[11px] text-slate-500">
              Oxidation & slag loss: <strong className="text-orange-300">2.00 KG (2.0%)</strong> during refining.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Furnace Unit 1 • Heat 019</div>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-amber-950/20 border border-amber-500/30 space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300">3. Continuous Hot Rolling</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                12 Passes
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-amber-400">97.00 KG Billet</div>
            <p className="text-[11px] text-slate-500">
              Mill scale burning & cropping loss: <strong className="text-amber-300">1.00 KG (1.0%)</strong>.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Mill Stand 1-12 • Fe 500D</div>
          </div>

          {/* Stage 4 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-emerald-950/20 border border-emerald-500/30 space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300">4. Finished Goods & Loss</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                Verified
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400">97.00 KG Output</div>
            <p className="text-[11px] text-slate-500">
              Total Weight Loss: <strong className="text-emerald-300">3.00 KG (3.00%)</strong>. Scrap: 0 KG.
            </p>
            <div className="text-[10px] text-emerald-400 font-mono">Mfg Cost: ₹112.37 / KG</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Manufacturing Orders + Stock Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Production Orders */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-slate-900">
                Recent Manufacturing Orders & Weight Loss
              </h3>
            </div>
            <button
              onClick={() => onNavigate('manufacturing')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              View All Orders
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/60 text-slate-500 uppercase text-[10px] font-semibold border-y border-blue-100">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Input (KG)</th>
                  <th className="py-2.5 px-3">Output (KG)</th>
                  <th className="py-2.5 px-3">Loss (KG / %)</th>
                  <th className="py-2.5 px-3">Cost/KG</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 font-mono text-slate-700">
                {state.manufacturingOrders.map(mo => (
                  <tr key={mo.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-amber-400">
                      {mo.orderNumber}
                    </td>
                    <td className="py-3 px-3">{formatKg(mo.inputWeightKg)}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {formatKg(mo.outputWeightKg)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-amber-300">
                        {formatKg(mo.processLossKg)} ({mo.lossPercentage.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800">
                      ₹{mo.finishedGoodsCostPerKg.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {mo.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: 4-Category Inventory Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900">
                4-Store Inventory Balances
              </h3>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Stock Ledger
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Raw Material */}
            <div className="p-3 rounded-xl bg-white/70 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div>
                  <div className="text-xs font-bold text-slate-800">1. Raw Material (Scrap/DRI)</div>
                  <div className="text-[10px] text-slate-500">Yard Bay-A</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-amber-300">{formatKg(rawMaterialStockKg)}</div>
                <div className="text-[10px] text-slate-500">Valuation: ₹6.8L</div>
              </div>
            </div>

            {/* WIP */}
            <div className="p-3 rounded-xl bg-white/70 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <div>
                  <div className="text-xs font-bold text-slate-800">2. Work in Progress (Billets)</div>
                  <div className="text-[10px] text-slate-500">Runway Bay-B</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-orange-300">{formatKg(wipStockKg)}</div>
                <div className="text-[10px] text-slate-500">Valuation: ₹3.2L</div>
              </div>
            </div>

            {/* Finished Goods */}
            <div className="p-3 rounded-xl bg-white/70 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-slate-800">3. Finished Goods (TMT Bars)</div>
                  <div className="text-[10px] text-slate-500">Depot Bay-C</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-emerald-400">{formatKg(finishedGoodsStockKg)}</div>
                <div className="text-[10px] text-slate-500">Valuation: ₹13.9L</div>
              </div>
            </div>

            {/* Recoverable Scrap */}
            <div className="p-3 rounded-xl bg-white/70 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-slate-800">4. Recoverable Mill Scrap</div>
                  <div className="text-[10px] text-slate-500">Pit Bay-D</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-cyan-300">{formatKg(scrapStockKg)}</div>
                <div className="text-[10px] text-slate-500">Valuation: ₹1.2L</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
