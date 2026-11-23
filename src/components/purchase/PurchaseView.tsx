'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Download,
  Printer,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Boxes,
  Sparkles,
  X,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { formatCurrency, formatKg, formatDate } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { exportToExcel } from '@/lib/excelExport';

export const PurchaseView: React.FC = () => {
  const { state, createPurchaseInvoice } = useERP();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Invoice creation state
  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID' | 'PARTIAL'>('PAID');
  const [freightCharges, setFreightCharges] = useState<number>(350);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('Raw material inward for rolling mill production');

  const [items, setItems] = useState<
    Array<{
      materialId: string;
      quantityKg: number;
      ratePerKg: number;
    }>
  >([
    {
      materialId: state.materials.find(m => m.category === 'RAW_MATERIAL')?.id || '',
      quantityKg: 100,
      ratePerKg: 100,
    },
  ]);

  const selectedSupplier = state.suppliers.find(s => s.id === supplierId) || state.suppliers[0];
  const isInterstate = selectedSupplier?.stateCode !== state.company.stateCode;

  // Calculate items total
  const calculatedItems = items.map((item, idx) => {
    const mat = state.materials.find(m => m.id === item.materialId);
    const taxable = Number((item.quantityKg * item.ratePerKg).toFixed(2));
    const cgstRate = isInterstate ? 0 : 9;
    const sgstRate = isInterstate ? 0 : 9;
    const igstRate = isInterstate ? 18 : 0;

    const cgstAmount = Number(((taxable * cgstRate) / 100).toFixed(2));
    const sgstAmount = Number(((taxable * sgstRate) / 100).toFixed(2));
    const igstAmount = Number(((taxable * igstRate) / 100).toFixed(2));
    const totalAmount = Number((taxable + cgstAmount + sgstAmount + igstAmount).toFixed(2));

    return {
      id: `pitem-${idx + 1}`,
      materialId: item.materialId,
      materialName: mat?.name || 'Raw Material',
      grade: mat?.grade || 'IS 2062',
      quantityKg: item.quantityKg,
      ratePerKg: item.ratePerKg,
      taxableAmount: taxable,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalAmount,
    };
  });

  const subtotal = calculatedItems.reduce((sum, i) => sum + i.taxableAmount, 0);
  const cgstTotal = calculatedItems.reduce((sum, i) => sum + i.cgstAmount, 0);
  const sgstTotal = calculatedItems.reduce((sum, i) => sum + i.sgstAmount, 0);
  const igstTotal = calculatedItems.reduce((sum, i) => sum + i.igstAmount, 0);
  const taxTotal = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = Number((subtotal + taxTotal + freightCharges - discount).toFixed(2));

  const handleAddItem = () => {
    const defaultRaw = state.materials.find(m => m.category === 'RAW_MATERIAL') || state.materials[0];
    setItems([...items, { materialId: defaultRaw.id, quantityKg: 500, ratePerKg: defaultRaw.defaultPurchaseRate || 42.5 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert('Invoice must have at least one line item.');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.some(i => i.quantityKg <= 0 || i.ratePerKg <= 0)) {
      alert('Quantity and Rate must be greater than zero for all items.');
      return;
    }

    createPurchaseInvoice({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      supplierGstin: selectedSupplier.gstin,
      supplierState: selectedSupplier.state,
      invoiceDate,
      paymentStatus,
      paymentTerms: selectedSupplier.paymentTerms,
      subtotal,
      discount,
      freightCharges,
      otherCharges: 0,
      cgstTotal,
      sgstTotal,
      igstTotal,
      taxTotal,
      grandTotal,
      paidAmount: paymentStatus === 'PAID' ? grandTotal : 0,
      pendingAmount: paymentStatus === 'PAID' ? 0 : grandTotal,
      notes,
      items: calculatedItems,
    });

    setIsModalOpen(false);
    alert(`Purchase Invoice successfully recorded!\n\n• Grand Total: ${formatCurrency(grandTotal)}\n• Raw Material stock increased automatically!\n• Double-entry accounting entry posted.`);
  };

  const filteredInvoices = state.purchaseInvoices.filter(i =>
    i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Purchase Invoices & Raw Material Inward
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Supplier Billing, Automatic Raw Material Inventory Inward, GST Input Tax Credit & Accounting.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => exportToExcel(state.purchaseInvoices, 'Purchase_Invoices_Report')}
              className="py-2 px-3 sm:px-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Invoice</span>
            </button>
          </div>
        </div>

              {/* Invoices Table in White & Blue Glass */}
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
                <div className="p-4 border-b border-blue-100 flex items-center justify-between gap-4 bg-blue-50/40">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-blue-500" />
                    <input
                      type="text"
                      placeholder="Search by Invoice # or Supplier..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                    />
                  </div>
                    <div className="text-xs text-slate-500 font-mono font-medium">
                      {filteredInvoices.length} Inward Purchase Records
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/70 text-blue-900 uppercase text-[10px] font-bold border-b border-blue-100">
                          <tr>
                            <th className="py-3 px-4">Invoice #</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Supplier</th>
                            <th className="py-3 px-4">Total Qty (KG)</th>
                            <th className="py-3 px-4">Taxable</th>
                            <th className="py-3 px-4">GST (Input)</th>
                            <th className="py-3 px-4">Grand Total</th>
                            <th className="py-3 px-4">Payment</th>
                            <th className="py-3 px-4 text-right">PDF Invoice</th>
                          </tr>
                        </thead>
                          <tbody className="divide-y divide-blue-50 font-mono text-slate-700">
                            {filteredInvoices.map(inv => {
                              const totalQty = inv.items.reduce((s, i) => s + i.quantityKg, 0);
                              return (
                                    <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors">
                                      <td className="py-3.5 px-4 font-extrabold text-blue-700">
                                        {inv.invoiceNumber}
                                      </td>
                                      <td className="py-3.5 px-4 font-sans text-slate-600">{formatDate(inv.invoiceDate)}</td>
                                      <td className="py-3.5 px-4 font-sans">
                                        <div className="font-bold text-slate-900">{inv.supplierName}</div>
                                        <div className="text-[10px] text-slate-500">{inv.supplierGstin}</div>
                                      </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                          {formatKg(totalQty)}
                                        </td>
                                        <td className="py-3.5 px-4">{formatCurrency(inv.subtotal)}</td>
                                          <td className="py-3.5 px-4 text-blue-700 font-bold">{formatCurrency(inv.taxTotal)}</td>
                                          <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                                            {formatCurrency(inv.grandTotal)}
                                          </td>
                                          <td className="py-3.5 px-4 font-sans">
                                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                                                {inv.paymentStatus}
                                              </span>
                                          </td>
                                          <td className="py-3.5 px-4 text-right">
                                            <button
                                              onClick={() => generateInvoicePDF('PURCHASE', inv, state.company)}
                                              className="py-1 px-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-blue-200 shadow-xs"
                                              title="Download official PDF invoice"
                                            >
                                              <Download className="w-3.5 h-3.5 text-blue-600" />
                                              <span>PDF</span>
                                            </button>
                                          </td>
                                        </tr>
                                        );
              })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

      {/* CREATE PURCHASE INVOICE MODAL (WHITE & BLUE GLASS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl border border-blue-200/80 rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh]">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white/90 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white font-bold flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Record Inward Purchase Invoice
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Select vendor, add raw materials, compute GST and automatically inward to inventory.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const demoMat = state.materials.find(m => m.code === 'RAW-MS-SCRAP-100') || state.materials[0];
                    setSupplierId(state.suppliers[0].id);
                    setItems([{ materialId: demoMat.id, quantityKg: 100, ratePerKg: 100 }]);
                    setFreightCharges(350);
                  }}
                  className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] sm:text-xs font-bold border border-blue-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  <span>Fill 100KG Test Data</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

                                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                                  {/* Header Info */}
                                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                                    <div>
                                                      <label className="block text-slate-700 mb-1 font-semibold">Supplier</label>
                                                      <select
                                                        value={supplierId}
                                                        onChange={e => setSupplierId(e.target.value)}
                                                        className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                                                      >
                                                        {state.suppliers.map(s => (
                                                          <option key={s.id} value={s.id}>
                                                            {s.name} ({s.state})
                                                          </option>
                                                        ))}
                                                      </select>
                                                    </div>

                                                    <div>
                                                      <label className="block text-slate-700 mb-1 font-semibold">Invoice Date</label>
                                                      <input
                                                        type="date"
                                                        value={invoiceDate}
                                                        onChange={e => setInvoiceDate(e.target.value)}
                                                        className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                                                        required
                                                      />
                                                    </div>

                                                    <div>
                                                      <label className="block text-slate-700 mb-1 font-semibold">Payment Status</label>
                                                      <select
                                                        value={paymentStatus}
                                                        onChange={e => setPaymentStatus(e.target.value as any)}
                                                        className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                                                      >
                                                        <option value="PAID">Paid (Bank Settlement)</option>
                                                        <option value="UNPAID">Unpaid (Add to Creditors)</option>
                                                        <option value="PARTIAL">Partial</option>
                                                      </select>
                                                    </div>
                                                  </div>

                                                  {/* Items Table */}
                                                    <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
                                                      <div className="flex items-center justify-between">
                                                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                                            <Boxes className="w-4 h-4 text-blue-600" />
                                                            Material Line Items
                                                          </h4>
                                                          <button
                                                            type="button"
                                                            onClick={handleAddItem}
                                                            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                                                          >
                                                            <Plus className="w-3.5 h-3.5" />
                                                            <span>Add Item</span>
                                                          </button>
                                                      </div>

                                                      <div className="space-y-2">
                                                        {items.map((item, idx) => (
                                                            <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 items-stretch sm:items-center p-3 rounded-xl bg-white border border-blue-100 text-xs shadow-xs">
                                                              <div className="sm:col-span-5">
                                                                <label className="block text-[10px] text-slate-500 font-medium mb-1">Raw Material</label>
                                                                <select
                                                                  value={item.materialId}
                                                                  onChange={e => {
                                                                    const newItems = [...items];
                                                                    newItems[idx].materialId = e.target.value;
                                                                    setItems(newItems);
                                                                  }}
                                                                  className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none"
                                                                >
                                                                  {state.materials.map(m => (
                                                                    <option key={m.id} value={m.id}>
                                                                      {m.name} ({m.category})
                                                                    </option>
                                                                  ))}
                                                                </select>
                                                              </div>

                                                              <div className="grid grid-cols-2 gap-2 sm:col-span-6">
                                                                <div>
                                                                  <label className="block text-[10px] text-slate-500 font-medium mb-1">Quantity (KG)</label>
                                                                  <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={item.quantityKg}
                                                                    onChange={e => {
                                                                      const newItems = [...items];
                                                                      newItems[idx].quantityKg = Number(e.target.value);
                                                                      setItems(newItems);
                                                                    }}
                                                                    className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none"
                                                                    required
                                                                  />
                                                                </div>

                                                                <div>
                                                                  <label className="block text-[10px] text-slate-500 font-medium mb-1">Rate / KG (₹)</label>
                                                                  <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={item.ratePerKg}
                                                                    onChange={e => {
                                                                      const newItems = [...items];
                                                                      newItems[idx].ratePerKg = Number(e.target.value);
                                                                      setItems(newItems);
                                                                    }}
                                                                    className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none"
                                                                    required
                                                                  />
                                                                </div>
                                                              </div>

                                                              <div className="sm:col-span-1 flex justify-end sm:pt-4">
                                                                <button
                                                                  type="button"
                                                                  onClick={() => handleRemoveItem(idx)}
                                                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                                  title="Remove Item"
                                                                >
                                                                  <Trash2 className="w-4 h-4" />
                                                                </button>
                                                              </div>
                                                            </div>
                  ))}
                                                          </div>
              </div>

                                                      {/* Tax & Charges Summary */}
                                                        <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                          <div className="space-y-3">
                                                            <div>
                                                              <label className="block text-slate-700 font-semibold mb-1">Freight / Transport Charges (₹)</label>
                                                              <input
                                                                type="number"
                                                                value={freightCharges}
                                                                onChange={e => setFreightCharges(Number(e.target.value))}
                                                                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none shadow-xs"
                                                              />
                                                            </div>
                                                            <div>
                                                              <label className="block text-slate-700 font-semibold mb-1">Invoice Remarks</label>
                                                              <input
                                                                type="text"
                                                                value={notes}
                                                                onChange={e => setNotes(e.target.value)}
                                                                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none shadow-xs"
                                                              />
                                                            </div>
                                                          </div>

                                                            <div className="space-y-2 p-4 rounded-2xl bg-white border border-blue-200 font-mono text-slate-700 shadow-xs">
                                                              <div className="flex justify-between">
                                                                <span className="font-sans text-slate-500 font-medium">Subtotal:</span>
                                                                <span className="font-bold">{formatCurrency(subtotal)}</span>
                                                              </div>
                                                              {!isInterstate ? (
                                                                <>
                                                                    <div className="flex justify-between text-blue-700">
                                                                      <span className="font-sans">CGST (9%):</span>
                                                                      <span className="font-bold">{formatCurrency(cgstTotal)}</span>
                                                                    </div>
                                                                      <div className="flex justify-between text-blue-700">
                                                                        <span className="font-sans">SGST (9%):</span>
                                                                        <span className="font-bold">{formatCurrency(sgstTotal)}</span>
                                                                      </div>
                                                                    </>
                                                                    ) : (
                                                                      <div className="flex justify-between text-blue-700">
                                                                        <span className="font-sans">IGST (18% Interstate):</span>
                                                                        <span className="font-bold">{formatCurrency(igstTotal)}</span>
                                                                      </div>
                  )}
                                                                      <div className="flex justify-between">
                                                                        <span className="font-sans text-slate-500 font-medium">Freight:</span>
                                                                        <span>{formatCurrency(freightCharges)}</span>
                                                                      </div>
                                                                        <div className="pt-2 border-t border-blue-100 flex justify-between text-sm font-extrabold text-emerald-700">
                                                                          <span className="font-sans">Grand Total:</span>
                                                                          <span>{formatCurrency(grandTotal)}</span>
                                                                        </div>
                                                                      </div>
                                                                    </div>

                                                                    {/* Submit Buttons */}
                                                                      <div className="pt-4 border-t border-blue-100 flex items-center justify-end gap-3">
                                                                        <button
                                                                          type="button"
                                                                          onClick={() => setIsModalOpen(false)}
                                                                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                                                        >
                                                                          Cancel
                                                                        </button>
                                                                        <button
                                                                          type="submit"
                                                                          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                                                                        >
                                                                          Confirm Invoice & Add Stock
                                                                        </button>
                                                                      </div>
                                                                    </form>
                                                                  </div>
                                                                </div>
      )}
                                                            </div>
                                                            );
};
