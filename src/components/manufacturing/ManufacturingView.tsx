'use client';

import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Scale,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Download,
  Search,
  Filter,
  Check,
  Zap,
  Users,
  Layers,
  Thermometer,
  Sparkles,
  Info,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { formatCurrency, formatKg, formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/excelExport';

export const ManufacturingView: React.FC = () => {
  const { state, createManufacturingOrder } = useERP();
  const [activeTab, setActiveTab] = useState<'orders' | 'loss_report' | 'labour_wages'>('orders');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for New Manufacturing Order
  const [formData, setFormData] = useState({
    inputBatchId: state.batches[0]?.id || '',
    inputMaterialId: state.materials.find(m => m.category === 'RAW_MATERIAL')?.id || '',
    inputWeightKg: 100,
    inputRatePerKg: 100,
    furnaceNumber: 'Furnace-1 (Induction)',
    heatNumber: `HEAT-2026-${Date.now().toString().slice(-4)}`,
    meltingTempCelsius: 1620,
    rollingMillNumber: 'Mill Stand 12 (Continuous)',
    rollingPasses: 12,
    outputMaterialId: state.materials.find(m => m.category === 'FINISHED_GOODS')?.id || '',
    outputWeightKg: 97,
    recoverableScrapWeightKg: 0,
    labourCost: 400,
    electricityCost: 350,
    fuelCost: 100,
    otherCost: 50,
    lossRemarks: 'Normal melting oxidation burning (2%) & rolling mill scale loss (1%)',
    lossExceededApproved: false,
    lossExceededApprover: 'Vikram Rathi (Plant Director)',
  });

  // Dynamic live calculations
  const inputWeight = Number(formData.inputWeightKg) || 0;
  const outputWeight = Number(formData.outputWeightKg) || 0;
  const scrapWeight = Number(formData.recoverableScrapWeightKg) || 0;

  // Formula: Loss Weight = Input - Output - Scrap
  const calculatedLossWeight = Math.max(0, Number((inputWeight - outputWeight - scrapWeight).toFixed(2)));
  // Formula: Loss % = (Loss / Input) * 100
  const calculatedLossPercentage = inputWeight > 0 ? Number(((calculatedLossWeight / inputWeight) * 100).toFixed(2)) : 0;

  const minAllowedLoss = state.company.expectedLossMin; // 2.0%
  const maxAllowedLoss = state.company.expectedLossMax; // 3.5%
  const isLossExceeded = calculatedLossPercentage > maxAllowedLoss;

  const inputCost = Number((inputWeight * Number(formData.inputRatePerKg)).toFixed(2));
  const overheadsCost = Number(formData.labourCost) + Number(formData.electricityCost) + Number(formData.fuelCost) + Number(formData.otherCost);
  const totalMfgCost = Number((inputCost + overheadsCost).toFixed(2));
  const costPerKg = outputWeight > 0 ? Number((totalMfgCost / outputWeight).toFixed(2)) : 0;

  // Pre-fill 100 KG standard golden test case
  const handlePrefill100Kg = () => {
    const rawMat = state.materials.find(m => m.code === 'RAW-MS-SCRAP-100') || state.materials.find(m => m.category === 'RAW_MATERIAL');
    const fgMat = state.materials.find(m => m.code === 'FG-TMT-97KG-TEST') || state.materials.find(m => m.category === 'FINISHED_GOODS');
    const batch = state.batches.find(b => b.materialId === rawMat?.id) || state.batches[0];

    setFormData({
      ...formData,
      inputBatchId: batch?.id || '',
      inputMaterialId: rawMat?.id || '',
      inputWeightKg: 100,
      inputRatePerKg: 100,
      outputMaterialId: fgMat?.id || '',
      outputWeightKg: 97,
      recoverableScrapWeightKg: 0,
      labourCost: 400,
      electricityCost: 350,
      fuelCost: 100,
      otherCost: 50,
      lossRemarks: 'Verified 100 KG input -> 97 KG output: 3 KG (3%) normal process loss within 2.0%-3.5% limits',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputWeight <= 0 || outputWeight <= 0) {
      alert('Input and Output weights must be greater than zero.');
      return;
    }

    if (outputWeight + scrapWeight > inputWeight) {
      alert('Output weight + recoverable scrap cannot exceed input raw material weight.');
      return;
    }

    if (isLossExceeded && !formData.lossExceededApproved) {
      alert(`Warning: Actual weight loss (${calculatedLossPercentage}%) exceeds configured limit of ${maxAllowedLoss}%. You must mark approval to proceed.`);
      return;
    }

    const inputMat = state.materials.find(m => m.id === formData.inputMaterialId);
    const outputMat = state.materials.find(m => m.id === formData.outputMaterialId);
    const batch = state.batches.find(b => b.id === formData.inputBatchId);
    const unit = state.manufacturingUnits[0];

    createManufacturingOrder({
      ...formData,
      inputMaterialName: inputMat?.name || 'Raw Scrap',
      inputMaterialGrade: inputMat?.grade || 'IS 2062',
      inputBatchNumber: batch?.batchNumber || 'BATCH-RM-001',
      outputMaterialName: outputMat?.name || 'TMT Rebars',
      outputMaterialGrade: outputMat?.grade || 'IS 1786 Fe 500D',
      manufacturingUnitId: unit?.id || 'unit-1',
      manufacturingUnitName: unit?.name || 'Induction Melting Shop',
      outputWarehouseId: state.warehouses.find(w => w.name.includes('Finished'))?.id || state.warehouses[0].id,
    });

    setIsModalOpen(false);
    alert(`Manufacturing Order successfully completed!\n\n• Input: ${inputWeight} KG\n• Output: ${outputWeight} KG\n• Process Loss: ${calculatedLossWeight} KG (${calculatedLossPercentage}%)\n• Finished Goods Cost: ₹${costPerKg}/KG\n\nStock and Accounting entries updated automatically!`);
  };

  // Filtered orders
  const filteredOrders = state.manufacturingOrders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.inputMaterialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.outputMaterialName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            Metal Melting & Rolling Operations (Manufacturing Management)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Induction Furnace Heats, 12-Stand Continuous Mill Passes, Automatic Weight Loss & Manufacturing Cost Allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToExcel(state.manufacturingOrders, 'Manufacturing_Orders_Report')}
            className="px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/70 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              handlePrefill100Kg();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-semibold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Manufacturing Order</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-100 space-x-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-orange-500 text-amber-300 bg-white/70'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Manufacturing Orders ({state.manufacturingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('loss_report')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'loss_report'
              ? 'border-orange-500 text-amber-300 bg-white/70'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Weight Loss & Burning Audit Report</span>
        </button>

        <button
          onClick={() => setActiveTab('labour_wages')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'labour_wages'
              ? 'border-orange-500 text-amber-300 bg-white/70'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Labour Wage Allocations ({state.labourCostEntries.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS TABLE */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          {/* Table Search & Filter Bar */}
          <div className="p-4 border-b border-blue-100 flex items-center justify-between gap-4 bg-white/40">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by Order #, Input scrap, or Output grade..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Showing {filteredOrders.length} Completed Production Runs
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Order / Heat #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Input Scrap (KG)</th>
                  <th className="py-3 px-4">Output Rebars (KG)</th>
                  <th className="py-3 px-4">Weight Loss</th>
                  <th className="py-3 px-4">Total Mfg Cost</th>
                  <th className="py-3 px-4">Cost / KG</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 font-mono text-slate-700">
                {filteredOrders.map(mo => (
                  <tr key={mo.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-amber-400">{mo.orderNumber}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{mo.heatNumber} • {mo.furnaceNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-500">{formatDate(mo.productionDate)}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{formatKg(mo.inputWeightKg)}</div>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-[140px]">{mo.inputMaterialName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-400">{formatKg(mo.outputWeightKg)}</div>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-[140px]">{mo.outputMaterialName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-amber-300">
                        {formatKg(mo.processLossKg)} ({mo.lossPercentage.toFixed(2)}%)
                      </div>
                      <span className="text-[10px] font-sans font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Within {mo.expectedLossMinPct}% - {mo.expectedLossMaxPct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(mo.totalManufacturingCost)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50/80 font-bold text-amber-300 border border-blue-200">
                        ₹{mo.finishedGoodsCostPerKg.toFixed(2)} / KG
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {mo.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WEIGHT LOSS REPORT */}
      {activeTab === 'loss_report' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                Automatic Weight Loss & Burning Loss Audit
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configured Tolerance: <strong className="text-amber-300">{state.company.expectedLossMin}% to {state.company.expectedLossMax}%</strong>. Formula: Loss = Input - Output - Recoverable Scrap.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Standard Range: 2.0% - 3.5%
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Batch / Order</th>
                  <th className="py-3 px-4">Input (KG)</th>
                  <th className="py-3 px-4">Finished (KG)</th>
                  <th className="py-3 px-4">Scrap (KG)</th>
                  <th className="py-3 px-4">Actual Loss (KG)</th>
                  <th className="py-3 px-4">Loss %</th>
                  <th className="py-3 px-4">Expected Range</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4">Remarks / Causes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 font-mono text-slate-700">
                {state.manufacturingOrders.map(mo => (
                  <tr key={mo.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-amber-400">{mo.orderNumber}</div>
                      <div className="text-[10px] text-slate-500">{mo.inputBatchNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold">{formatKg(mo.inputWeightKg)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{formatKg(mo.outputWeightKg)}</td>
                    <td className="py-3.5 px-4 font-bold text-cyan-400">{formatKg(mo.recoverableScrapWeightKg)}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-300">{formatKg(mo.processLossKg)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-400">
                      {mo.lossPercentage.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {mo.expectedLossMinPct}% - {mo.expectedLossMaxPct}%
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      {mo.isLossExceeded ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Exceeded (Approved)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Normal Within Limits
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-500 max-w-xs truncate">
                      {mo.lossRemarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LABOUR WAGES */}
      {activeTab === 'labour_wages' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Production-Linked Labour & Wages Ledger
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Wages Allocated: {formatCurrency(state.labourCostEntries.reduce((s, l) => s + l.totalAmount, 0))}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Labour Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Mfg Order #</th>
                  <th className="py-3 px-4">Process</th>
                  <th className="py-3 px-4">Rate Basis</th>
                  <th className="py-3 px-4">Units (KG/Days)</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 font-mono text-slate-700">
                {state.labourCostEntries.map(lc => (
                  <tr key={lc.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{lc.labourName}</td>
                    <td className="py-3.5 px-4 font-sans text-indigo-600">{lc.labourCategory}</td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">{lc.manufacturingOrderNumber || '-'}</td>
                    <td className="py-3.5 px-4 font-sans">{lc.processType}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-500">{lc.rateType}</td>
                    <td className="py-3.5 px-4">{lc.workingUnits}</td>
                    <td className="py-3.5 px-4">₹{lc.rate}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{formatCurrency(lc.totalAmount)}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {lc.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MANUFACTURING ORDER MODAL (WITH LIVE WEIGHT LOSS CALCULATOR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/80 border border-blue-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Create Manufacturing Order & Record Melting / Rolling Process
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live automatic loss calculation, cost per KG allocation, and automatic inventory updates.
                  </p>
                </div>
              </div>

              {/* Prefill 100KG Test Button */}
              <button
                type="button"
                onClick={handlePrefill100Kg}
                className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center gap-1.5 transition-all"
                title="Prefill 100 KG -> 97 KG Standard Test Case"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load 100KG Golden Test Data</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* SECTION 1: RAW MATERIAL INPUT */}
              <div className="p-4 rounded-xl bg-white/70 border border-blue-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    1. Raw Material Input & Furnace Charge
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Induction Melting Shop Unit 1
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Select Raw Scrap Material</label>
                    <select
                      value={formData.inputMaterialId}
                      onChange={e => setFormData({ ...formData, inputMaterialId: e.target.value })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      {state.materials
                        .filter(m => m.category === 'RAW_MATERIAL')
                        .map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({formatKg(m.currentStock)} in stock)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Select Material Batch</label>
                    <select
                      value={formData.inputBatchId}
                      onChange={e => setFormData({ ...formData, inputBatchId: e.target.value })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      {state.batches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.batchNumber} ({b.materialName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Input Weight (KG)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.inputWeightKg}
                      onChange={e => setFormData({ ...formData, inputWeightKg: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Purchase Rate / KG (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.inputRatePerKg}
                      onChange={e => setFormData({ ...formData, inputRatePerKg: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Furnace # & Heat ID</label>
                    <input
                      type="text"
                      value={formData.heatNumber}
                      onChange={e => setFormData({ ...formData, heatNumber: e.target.value })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Melting Temperature (°C)</label>
                    <input
                      type="number"
                      value={formData.meltingTempCelsius}
                      onChange={e => setFormData({ ...formData, meltingTempCelsius: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-orange-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ROLLING & FINISHED GOODS OUTPUT */}
              <div className="p-4 rounded-xl bg-white/70 border border-blue-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    2. Rolling Output & Recoverable Scrap
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    12-Stand Hot Rolling Continuous Mill
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Output Finished Material</label>
                    <select
                      value={formData.outputMaterialId}
                      onChange={e => setFormData({ ...formData, outputMaterialId: e.target.value })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      {state.materials
                        .filter(m => m.category === 'FINISHED_GOODS')
                        .map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.grade})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Actual Finished Output Weight (KG)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.outputWeightKg}
                      onChange={e => setFormData({ ...formData, outputWeightKg: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Recoverable Scrap Weight (KG)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.recoverableScrapWeightKg}
                      onChange={e => setFormData({ ...formData, recoverableScrapWeightKg: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: AUTOMATIC WEIGHT LOSS ENGINE (THE CORE REQUIREMENT) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border-2 border-amber-500/40 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-400" />
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      3. Automatic Weight Loss Engine (Formula Verified)
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Tolerance Range: {minAllowedLoss}% - {maxAllowedLoss}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/90 border border-blue-100">
                    <span className="text-[10px] text-slate-500 block font-sans">Input Scrap</span>
                    <span className="text-base font-bold text-slate-900">{formatKg(inputWeight)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 border border-blue-100">
                    <span className="text-[10px] text-slate-500 block font-sans">Finished Output</span>
                    <span className="text-base font-bold text-emerald-400">{formatKg(outputWeight)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 border border-blue-100">
                    <span className="text-[10px] text-slate-500 block font-sans">Calculated Loss</span>
                    <span className="text-base font-extrabold text-amber-400">{formatKg(calculatedLossWeight)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/90 border border-blue-100">
                    <span className="text-[10px] text-slate-500 block font-sans">Loss Percentage</span>
                    <span className="text-base font-extrabold text-amber-300">{calculatedLossPercentage}%</span>
                  </div>
                </div>

                {/* Live Tolerance Status Banner */}
                {isLossExceeded ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-200">
                      <div className="font-bold">
                        Warning: Manufacturing Loss of {calculatedLossPercentage}% exceeds allowed limit of {maxAllowedLoss}%!
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.lossExceededApproved}
                            onChange={e => setFormData({ ...formData, lossExceededApproved: e.target.checked })}
                            className="rounded border-rose-500 text-rose-500"
                          />
                          <span>Authorize and approve exceptional process loss</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Loss Approved:</strong> Actual process loss of {calculatedLossWeight} KG ({calculatedLossPercentage}%) is within expected range ({minAllowedLoss}% - {maxAllowedLoss}%).
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-500 text-xs mb-1 font-medium">Loss Reasons / Metallurgical Remarks</label>
                  <input
                    type="text"
                    value={formData.lossRemarks}
                    onChange={e => setFormData({ ...formData, lossRemarks: e.target.value })}
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* SECTION 4: LABOUR, ELECTRICITY & OVERHEAD COSTS */}
              <div className="p-4 rounded-xl bg-white/70 border border-blue-100 space-y-4">
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  4. Direct Labour & Manufacturing Overheads Allocation
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Direct Labour Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.labourCost}
                      onChange={e => setFormData({ ...formData, labourCost: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Electricity & Power Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.electricityCost}
                      onChange={e => setFormData({ ...formData, electricityCost: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Furnace Fuel & Gas (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fuelCost}
                      onChange={e => setFormData({ ...formData, fuelCost: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Other Consumables (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.otherCost}
                      onChange={e => setFormData({ ...formData, otherCost: Number(e.target.value) })}
                      className="w-full bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Total Cost Summary Card */}
                <div className="p-3.5 rounded-xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-slate-500">
                      Raw Material: <strong className="text-slate-800">{formatCurrency(inputCost)}</strong> + Overheads: <strong className="text-slate-800">{formatCurrency(overheadsCost)}</strong>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Total Manufacturing Cost: <span className="text-amber-400 font-mono">{formatCurrency(totalMfgCost)}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-right">
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase">
                      Finished Goods Cost Per KG
                    </span>
                    <span className="text-base font-extrabold text-emerald-300 font-mono">
                      ₹{costPerKg.toFixed(2)} / KG
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-blue-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50/80 hover:bg-blue-100/70 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]"
                >
                  Complete Order & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
