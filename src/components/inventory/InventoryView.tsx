'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Download,
  Search,
  Filter,
  Layers,
  Flame,
  Scale,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { formatCurrency, formatKg, formatDate, formatDateTime } from '@/lib/utils';
import { exportToExcel } from '@/lib/excelExport';
import { MaterialCategory } from '@/types/erp';

export const InventoryView: React.FC = () => {
  const { state, createStockAdjustment } = useERP();
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | 'ALL' | 'LEDGER' | 'BATCHES'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);

  // Adjustment state
  const [adjMaterialId, setAdjMaterialId] = useState(state.materials[0]?.id || '');
  const [adjWarehouseId, setAdjWarehouseId] = useState(state.warehouses[0]?.id || '');
  const [adjType, setAdjType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjQty, setAdjQty] = useState<number>(50);
  const [adjReason, setAdjReason] = useState('Physical weighment calibration difference');

  const rawMaterials = state.materials.filter(m => m.category === 'RAW_MATERIAL');
  const wipMaterials = state.materials.filter(m => m.category === 'WIP');
  const fgMaterials = state.materials.filter(m => m.category === 'FINISHED_GOODS');
  const scrapMaterials = state.materials.filter(m => m.category === 'RECOVERABLE_SCRAP');

  const totalRawKg = rawMaterials.reduce((sum, m) => sum + m.currentStock, 0);
  const totalWipKg = wipMaterials.reduce((sum, m) => sum + m.currentStock, 0);
  const totalFgKg = fgMaterials.reduce((sum, m) => sum + m.currentStock, 0);
  const totalScrapKg = scrapMaterials.reduce((sum, m) => sum + m.currentStock, 0);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjQty <= 0) {
      alert('Adjustment quantity must be greater than zero.');
      return;
    }
    createStockAdjustment(adjMaterialId, adjWarehouseId, adjType, adjQty, adjReason);
    setIsAdjModalOpen(false);
    alert(`Stock Adjustment (${adjType} ${adjQty} KG) confirmed and recorded in audit ledger!`);
  };

  const filteredMaterials = state.materials.filter(m => {
    const matchesCat = activeCategory === 'ALL' || m.category === activeCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.grade.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-400" />
            4-Store Inventory Management & Batch Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Raw Material Scrap Yard, Cast Billets (WIP), Rolled TMT Rebars (Finished Goods), and Recoverable Scrap Pits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToExcel(state.materials, 'Inventory_Valuation_Report')}
            className="px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/70 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200"
          >
            <Download className="w-4 h-4" />
            <span>Export Valuation</span>
          </button>

          <button
            onClick={() => setIsAdjModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* 4 Category Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category 1: Raw Material */}
        <div
          onClick={() => setActiveCategory('RAW_MATERIAL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeCategory === 'RAW_MATERIAL'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-white/80 border-blue-100 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-amber-300">1. Raw Material (Scrap/DRI)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{formatKg(totalRawKg)}</div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Yard Bay-A</span>
            <span className="text-amber-400 font-medium">{rawMaterials.length} Items</span>
          </div>
        </div>

        {/* Category 2: WIP */}
        <div
          onClick={() => setActiveCategory('WIP')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeCategory === 'WIP'
              ? 'bg-orange-500/10 border-orange-500/50 shadow-md shadow-orange-500/10'
              : 'bg-white/80 border-blue-100 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-orange-300">2. Work in Progress (Billets)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{formatKg(totalWipKg)}</div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Runway Bay-B</span>
            <span className="text-orange-400 font-medium">{wipMaterials.length} Items</span>
          </div>
        </div>

        {/* Category 3: Finished Goods */}
        <div
          onClick={() => setActiveCategory('FINISHED_GOODS')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeCategory === 'FINISHED_GOODS'
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'bg-white/80 border-blue-100 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-emerald-300">3. Finished Goods (TMT)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{formatKg(totalFgKg)}</div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Depot Bay-C</span>
            <span className="text-emerald-400 font-medium">{fgMaterials.length} Items</span>
          </div>
        </div>

        {/* Category 4: Recoverable Scrap */}
        <div
          onClick={() => setActiveCategory('RECOVERABLE_SCRAP')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeCategory === 'RECOVERABLE_SCRAP'
              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
              : 'bg-white/80 border-blue-100 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-cyan-300">4. Recoverable Scrap Pit</span>
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">{formatKg(totalScrapKg)}</div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Pit Bay-D</span>
            <span className="text-cyan-400 font-medium">{scrapMaterials.length} Items</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-100 space-x-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeCategory === 'ALL'
              ? 'border-blue-500 text-blue-300 bg-white/70'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>All Material Stock Balances ({state.materials.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('BATCHES')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeCategory === 'BATCHES'
              ? 'border-blue-500 text-blue-300 bg-white/70'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Batch Tracking ({state.batches.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('LEDGER')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeCategory === 'LEDGER'
              ? 'border-blue-500 text-blue-300 bg-white/70'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" />
          <span>Inventory Audit Ledger ({state.inventoryTransactions.length} Movements)</span>
        </button>
      </div>

      {/* VIEW 1: MATERIAL STOCKS */}
      {activeCategory !== 'LEDGER' && activeCategory !== 'BATCHES' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="p-4 border-b border-blue-100 flex items-center justify-between gap-4 bg-white/40">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search material code, name, grade..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Showing {filteredMaterials.length} Inventory Items
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Material Code</th>
                  <th className="py-3 px-4">Material Name & Grade</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Default Rate</th>
                  <th className="py-3 px-4">Stock Valuation</th>
                  <th className="py-3 px-4">Min Level Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 font-mono text-slate-700">
                {filteredMaterials.map(m => {
                  const rate = m.defaultPurchaseRate || m.defaultSalesRate || 50;
                  const valuation = m.currentStock * rate;
                  const isLow = m.currentStock < m.minStockLevel;

                  return (
                    <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-amber-400">{m.code}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-800">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.grade} • HSN: {m.hsnCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            m.category === 'RAW_MATERIAL'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : m.category === 'WIP'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : m.category === 'FINISHED_GOODS'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {m.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {formatKg(m.currentStock)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">₹{rate.toFixed(2)} / KG</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {formatCurrency(valuation)}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock (&lt;{formatKg(m.minStockLevel)})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Adequate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: BATCH TRACKING */}
      {activeCategory === 'BATCHES' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-white/40 text-xs">
            <span className="font-bold text-slate-800">Active Material Batches</span>
            <span className="text-slate-500 font-mono">{state.batches.length} Registered Batches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Material Name</th>
                  <th className="py-3 px-4">Warehouse Location</th>
                  <th className="py-3 px-4">Initial Qty (KG)</th>
                  <th className="py-3 px-4">Available Qty (KG)</th>
                  <th className="py-3 px-4">Rate / KG</th>
                  <th className="py-3 px-4">Source Reference</th>
                  <th className="py-3 px-4">Mfg / Inward Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 font-mono text-slate-700">
                {state.batches.map(b => (
                  <tr key={b.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-amber-400">{b.batchNumber}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-800 font-medium">{b.materialName}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-500">{b.warehouseName}</td>
                    <td className="py-3.5 px-4">{formatKg(b.initialQtyKg)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{formatKg(b.availableQtyKg)}</td>
                    <td className="py-3.5 px-4">₹{b.ratePerKg.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-blue-400 font-semibold">{b.sourceReference}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-500">{formatDate(b.mfgDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: INVENTORY AUDIT LEDGER */}
      {activeCategory === 'LEDGER' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-white/40 text-xs">
            <span className="font-bold text-slate-800">Complete Inventory Movement Ledger</span>
            <span className="text-slate-500 font-mono">{state.inventoryTransactions.length} Audit Entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Txn #</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Qty Change (KG)</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Source Reference</th>
                  <th className="py-3 px-4">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 font-mono text-slate-700">
                {state.inventoryTransactions.map(tx => {
                  const isInward = tx.quantityKg > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-500">{tx.transactionNumber}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-500">{formatDateTime(tx.createdAt)}</td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isInward
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-800 font-medium">{tx.materialName}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-500">{tx.warehouseName}</td>
                      <td
                        className={`py-3.5 px-4 font-bold ${
                          isInward ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isInward ? `+${formatKg(tx.quantityKg)}` : formatKg(tx.quantityKg)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatKg(tx.balanceAfterKg)}</td>
                      <td className="py-3.5 px-4 text-amber-400 font-semibold">{tx.referenceNumber || '-'}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-500 max-w-xs truncate">{tx.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {isAdjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/80 border border-blue-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-400" />
              Manual Stock Adjustment
            </h3>
            <p className="text-xs text-slate-500">
              Adjust stock based on physical yard weighment audits. Every adjustment creates an immutable audit transaction.
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Select Material</label>
                <select
                  value={adjMaterialId}
                  onChange={e => setAdjMaterialId(e.target.value)}
                  className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {state.materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({formatKg(m.currentStock)} currently)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Adjustment Type</label>
                  <select
                    value={adjType}
                    onChange={e => setAdjType(e.target.value as any)}
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ADD">Add (+) Stock</option>
                    <option value="SUBTRACT">Subtract (-) Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Quantity (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjQty}
                    onChange={e => setAdjQty(Number(e.target.value))}
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Reason / Authorization</label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-4 border-t border-blue-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50/80 hover:bg-blue-100/70 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
