'use client';

import React, { useState } from 'react';
import {
  Database,
  Users,
  Building,
  Boxes,
  Flame,
  Scale,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { formatCurrency, formatKg } from '@/lib/utils';
import { exportToExcel } from '@/lib/excelExport';

export const MastersView: React.FC = () => {
  const {
    state,
    addCustomer,
    addSupplier,
    addMaterial,
    addWarehouse,
    addManufacturingUnit,
    addLabour,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers' | 'materials' | 'warehouses' | 'units' | 'labour' | 'taxes'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simple modal form state for quickly adding any master
  const [custForm, setCustForm] = useState({
    name: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    gstin: '27AAACA0000A1Z5',
    billingAddress: '',
    shippingAddress: '',
    state: 'Maharashtra',
    stateCode: '27',
    openingBalance: 0,
    paymentTerms: 'Net 30 Days',
    creditLimit: 500000,
  });

  const [suppForm, setSuppForm] = useState({
    name: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    gstin: '27AAAFM0000B1Z1',
    billingAddress: '',
    shippingAddress: '',
    state: 'Maharashtra',
    stateCode: '27',
    openingBalance: 0,
    paymentTerms: 'Net 15 Days',
  });

  const [matForm, setMatForm] = useState({
    name: '',
    category: 'RAW_MATERIAL' as any,
    grade: 'IS 2062 Grade A',
    uom: 'KG',
    description: '',
    defaultPurchaseRate: 45,
    defaultSalesRate: 0,
    minStockLevel: 1000,
    hsnCode: '7204',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'customers') {
      if (!custForm.name) return alert('Name is required');
      addCustomer(custForm);
    } else if (activeTab === 'suppliers') {
      if (!suppForm.name) return alert('Name is required');
      addSupplier(suppForm);
    } else if (activeTab === 'materials') {
      if (!matForm.name) return alert('Name is required');
      addMaterial(matForm);
    }
    setIsModalOpen(false);
    alert('Master record created successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Master Record Management (Configuration Registry)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain verified entities: Customers, Scrap Suppliers, Materials, Mills, Labour Roster, and GST Tax Rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToExcel(state[activeTab as keyof typeof state] as any, `${activeTab}_Master`)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 shadow-xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Table</span>
          </button>

          {(activeTab === 'customers' || activeTab === 'suppliers' || activeTab === 'materials') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New {activeTab.slice(0, -1).toUpperCase()}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-100 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('customers')}
          className={`py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'customers' ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs' : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customers ({state.customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'suppliers' ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs' : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Suppliers ({state.suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'materials' ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs' : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Materials & Grades ({state.materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'units' ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs' : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Manufacturing Units ({state.manufacturingUnits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'warehouses' ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs' : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Warehouses & Bays ({state.warehouses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('labour')}
          className={`py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'labour' ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs' : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Labour Roster ({state.labours.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('taxes')}
          className={`py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'taxes' ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs' : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Tax Rates (GST 18%)</span>
        </button>
      </div>

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/70 text-blue-900 uppercase text-[10px] font-bold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4 text-right">Current Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 font-mono text-slate-700">
                {state.customers.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-700">{c.code}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.contactPerson}</div>
                    </td>
                    <td className="py-3.5 px-4 text-blue-700 font-bold">{c.gstin}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">
                      <div>{c.contactNumber}</div>
                      <div className="text-[10px] text-slate-500">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">{c.state}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{c.paymentTerms}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                      {formatCurrency(c.currentBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPPLIERS TAB */}
      {activeTab === 'suppliers' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/70 text-blue-900 uppercase text-[10px] font-bold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4 text-right">Current Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 font-mono text-slate-700">
                {state.suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-700">{s.code}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-500">{s.contactPerson}</div>
                    </td>
                    <td className="py-3.5 px-4 text-blue-700 font-bold">{s.gstin}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">
                      <div>{s.contactNumber}</div>
                      <div className="text-[10px] text-slate-500">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">{s.state}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{s.paymentTerms}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">
                      {formatCurrency(s.currentBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MATERIALS TAB */}
      {activeTab === 'materials' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/70 text-blue-900 uppercase text-[10px] font-bold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Material Name & Grade</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">UOM</th>
                  <th className="py-3 px-4">Default Purchase</th>
                  <th className="py-3 px-4">Default Sales</th>
                  <th className="py-3 px-4">Min Stock (KG)</th>
                  <th className="py-3 px-4">HSN Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 font-mono text-slate-700">
                {state.materials.map(m => (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-700">{m.code}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                      <div>{m.name}</div>
                      <div className="text-[10px] text-slate-500">{m.grade}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-[11px] text-slate-600 font-semibold">{m.category}</td>
                    <td className="py-3.5 px-4 text-slate-600">{m.uom}</td>
                    <td className="py-3.5 px-4">₹{m.defaultPurchaseRate.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">₹{m.defaultSalesRate.toFixed(2)}</td>
                    <td className="py-3.5 px-4">{formatKg(m.minStockLevel)}</td>
                    <td className="py-3.5 px-4 text-blue-700">{m.hsnCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UNITS TAB */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.manufacturingUnits.map(u => (
            <div key={u.id} className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700">{u.code}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Online
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{u.name}</h3>
              <div className="space-y-1 text-xs text-slate-600">
                <div>• Capacity: <strong className="text-slate-900">{formatKg(u.capacityKgPerDay)} / Day</strong></div>
                <div>• Supervisor: <strong className="text-slate-900">{u.supervisor}</strong></div>
                <div>• Furnace Specs: <span className="text-blue-700 font-mono text-[11px] font-semibold">{u.furnaceDetails}</span></div>
                <div>• Mill Specs: <span className="text-indigo-700 font-mono text-[11px] font-semibold">{u.rollingDetails}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WAREHOUSES TAB */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.warehouses.map(w => (
            <div key={w.id} className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700">{w.code}</span>
                {w.isDefault && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    Default Yard
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{w.name}</h3>
              <p className="text-xs text-slate-600">{w.location}</p>
            </div>
          ))}
        </div>
      )}

      {/* LABOUR TAB */}
      {activeTab === 'labour' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/70 text-blue-900 uppercase text-[10px] font-bold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Badge #</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Role / Category</th>
                  <th className="py-3 px-4">Rate Basis</th>
                  <th className="py-3 px-4">Rate (₹)</th>
                  <th className="py-3 px-4">Contact Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 font-mono text-slate-700">
                {state.labours.map(l => (
                  <tr key={l.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-700">{l.code}</td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{l.name}</td>
                    <td className="py-3.5 px-4 font-sans text-indigo-700 font-bold">{l.category}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{l.defaultRateType}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">₹{l.defaultRate.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">{l.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAXES TAB */}
      {activeTab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.taxRates.map(t => (
            <div key={t.id} className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-3 font-mono">
              <h3 className="text-base font-extrabold text-slate-900 font-sans">{t.name}</h3>
              <div className="text-xs text-slate-600 space-y-1">
                <div>HSN Prefix: <strong className="text-blue-700">{t.hsnCode}</strong></div>
                <div>CGST: <strong className="text-indigo-700">{t.cgst}%</strong> | SGST: <strong className="text-indigo-700">{t.sgst}%</strong> (Intra-state Total 18%)</div>
                <div>IGST: <strong className="text-blue-700">{t.igst}%</strong> (Inter-state Total 18%)</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MASTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl border border-blue-200/80 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Add New {activeTab.slice(0, -1).toUpperCase()} Master
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {activeTab === 'customers' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Company / Customer Name</label>
                    <input
                      type="text"
                      value={custForm.name}
                      onChange={e => setCustForm({ ...custForm, name: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none shadow-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={custForm.gstin}
                      onChange={e => setCustForm({ ...custForm, gstin: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none font-mono shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Person & Phone</label>
                    <input
                      type="text"
                      value={custForm.contactNumber}
                      onChange={e => setCustForm({ ...custForm, contactNumber: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none shadow-xs"
                    />
                  </div>
                </>
              )}

              {activeTab === 'suppliers' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Supplier / Scrap Vendor Name</label>
                    <input
                      type="text"
                      value={suppForm.name}
                      onChange={e => setSuppForm({ ...suppForm, name: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none shadow-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={suppForm.gstin}
                      onChange={e => setSuppForm({ ...suppForm, gstin: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none font-mono shadow-xs"
                    />
                  </div>
                </>
              )}

              {activeTab === 'materials' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Material Name</label>
                    <input
                      type="text"
                      value={matForm.name}
                      onChange={e => setMatForm({ ...matForm, name: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none shadow-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                    <select
                      value={matForm.category}
                      onChange={e => setMatForm({ ...matForm, category: e.target.value as any })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none shadow-xs"
                    >
                      <option value="RAW_MATERIAL">Raw Material (Scrap / DRI)</option>
                      <option value="WIP">Work in Progress (Billets)</option>
                      <option value="FINISHED_GOODS">Finished Goods (TMT Rebars)</option>
                      <option value="RECOVERABLE_SCRAP">Recoverable Scrap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Grade (e.g. IS 1786 Fe 500D)</label>
                    <input
                      type="text"
                      value={matForm.grade}
                      onChange={e => setMatForm({ ...matForm, grade: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none shadow-xs"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-blue-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                >
                  Save Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
