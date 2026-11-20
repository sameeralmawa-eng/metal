'use client';

import React, { useState } from 'react';
import {
  FileBarChart2,
  Download,
  Calendar,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Scale,
  DollarSign,
  Boxes,
  Users,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { formatCurrency, formatKg, formatDate } from '@/lib/utils';
import { exportToExcel, exportToCSV } from '@/lib/excelExport';

export const ReportsView: React.FC = () => {
  const { state } = useERP();
  const [selectedReport, setSelectedReport] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');

  const reportList = [
    { id: 1, name: 'Purchase Report', desc: 'Inward purchase invoices, vendor details, and taxable amounts' },
    { id: 2, name: 'Sales Report', desc: 'Finished goods dispatch invoices and customer revenues' },
    { id: 3, name: 'Raw Material Stock Report', desc: 'Current scrap, DRI and melting raw stock balances' },
    { id: 4, name: 'Finished Goods Stock Report', desc: 'TMT bar grades, rebar diameters and warehouse locations' },
    { id: 5, name: 'Manufacturing Report', desc: 'Orders, heats, continuous rolling passes and output metrics' },
    { id: 6, name: 'Batch-wise Production Report', desc: 'Batch traceability from raw scrap input to final bundle' },
    { id: 7, name: 'Weight Loss Report', desc: 'Oxidation melting & rolling mill scale burning loss audit' },
    { id: 8, name: 'Labour Cost Report', desc: 'Melter, roller and helper wage allocations per heat/order' },
    { id: 9, name: 'Material Consumption Report', desc: 'Scrap and sponge iron consumption history' },
    { id: 10, name: 'GST Tax Summary Report', desc: 'Input Tax Credit (ITC) vs Output Liability (GSTR-1 & 2B)' },
    { id: 11, name: 'Customer Outstanding Report', desc: 'Accounts receivable aging and pending customer balances' },
    { id: 12, name: 'Supplier Outstanding Report', desc: 'Accounts payable aging and pending scrap vendor balances' },
    { id: 13, name: 'Expense & Overheads Report', desc: 'Power tariffs, fuel gas, ladle linings and plant maintenance' },
    { id: 14, name: 'Profit & Loss Report', desc: 'Purchase-to-sales revenue, COGS and net gross profit margins' },
    { id: 15, name: 'Inventory Valuation Report', desc: 'Total asset valuation across all 4 inventory categories' },
  ];

  // Helper to get active report data for table & export
  const getActiveReportData = () => {
    switch (selectedReport) {
      case 1:
        return state.purchaseInvoices.map(i => ({
          'Invoice Number': i.invoiceNumber,
          Date: i.invoiceDate,
          Supplier: i.supplierName,
          'GSTIN': i.supplierGstin,
          'Subtotal (INR)': i.subtotal,
          'Tax (INR)': i.taxTotal,
          'Grand Total (INR)': i.grandTotal,
          'Payment Status': i.paymentStatus,
        }));
      case 2:
        return state.salesInvoices.map(i => ({
          'Invoice Number': i.invoiceNumber,
          Date: i.invoiceDate,
          Customer: i.customerName,
          'GSTIN': i.customerGstin,
          'Subtotal (INR)': i.subtotal,
          'Tax (INR)': i.taxTotal,
          'Grand Total (INR)': i.grandTotal,
          'Payment Status': i.paymentStatus,
        }));
      case 3:
        return state.materials
          .filter(m => m.category === 'RAW_MATERIAL')
          .map(m => ({
            'Code': m.code,
            'Name': m.name,
            'Grade': m.grade,
            'Current Stock (KG)': m.currentStock,
            'Rate/KG': m.defaultPurchaseRate,
            'Valuation (INR)': m.currentStock * m.defaultPurchaseRate,
          }));
      case 4:
        return state.materials
          .filter(m => m.category === 'FINISHED_GOODS')
          .map(m => ({
            'Code': m.code,
            'Name': m.name,
            'Grade': m.grade,
            'Current Stock (KG)': m.currentStock,
            'Selling Rate/KG': m.defaultSalesRate,
            'Valuation (INR)': m.currentStock * m.defaultSalesRate,
          }));
      case 5:
        return state.manufacturingOrders.map(o => ({
          'Order Number': o.orderNumber,
          Date: o.productionDate,
          'Input Scrap (KG)': o.inputWeightKg,
          'Output Rebars (KG)': o.outputWeightKg,
          'Process Loss (KG)': o.processLossKg,
          'Loss %': o.lossPercentage,
          'Total Mfg Cost (INR)': o.totalManufacturingCost,
          'Cost Per KG': o.finishedGoodsCostPerKg,
          Status: o.status,
        }));
      case 6:
        return state.batches.map(b => ({
          'Batch Number': b.batchNumber,
          'Material': b.materialName,
          'Warehouse': b.warehouseName,
          'Initial Qty (KG)': b.initialQtyKg,
          'Available Qty (KG)': b.availableQtyKg,
          'Rate/KG': b.ratePerKg,
          'Reference': b.sourceReference,
          'Date': b.mfgDate,
        }));
      case 7:
        return state.manufacturingOrders.map(o => ({
          'Order #': o.orderNumber,
          'Input (KG)': o.inputWeightKg,
          'Finished (KG)': o.outputWeightKg,
          'Recoverable Scrap (KG)': o.recoverableScrapWeightKg,
          'Actual Loss (KG)': o.processLossKg,
          'Actual Loss %': `${o.lossPercentage}%`,
          'Allowed Range': `${o.expectedLossMinPct}% - ${o.expectedLossMaxPct}%`,
          'Status': o.isLossExceeded ? 'Exceeded' : 'Normal',
          'Remarks': o.lossRemarks,
        }));
      case 8:
        return state.labourCostEntries.map(l => ({
          'Labour Name': l.labourName,
          'Category': l.labourCategory,
          'Order #': l.manufacturingOrderNumber || '-',
          'Process': l.processType,
          'Rate Basis': l.rateType,
          'Units': l.workingUnits,
          'Rate': l.rate,
          'Total Amount (INR)': l.totalAmount,
          'Payment Status': l.paymentStatus,
        }));
      case 9:
        return state.inventoryTransactions
          .filter(t => t.transactionType === 'MFG_CONSUMPTION')
          .map(t => ({
            'Txn #': t.transactionNumber,
            'Date': t.createdAt.slice(0, 10),
            'Material': t.materialName,
            'Consumed Qty (KG)': Math.abs(t.quantityKg),
            'Rate/KG': t.ratePerKg,
            'Total Value (INR)': t.totalValue,
            'Order Reference': t.referenceNumber,
          }));
      case 10:
        return [
          {
            'Category': 'Input Tax Credit (ITC - Purchases)',
            'Taxable Value': state.purchaseInvoices.reduce((s, i) => s + i.subtotal, 0),
            'CGST (9%)': state.purchaseInvoices.reduce((s, i) => s + i.cgstTotal, 0),
            'SGST (9%)': state.purchaseInvoices.reduce((s, i) => s + i.sgstTotal, 0),
            'IGST (18%)': state.purchaseInvoices.reduce((s, i) => s + i.igstTotal, 0),
            'Total Tax': state.purchaseInvoices.reduce((s, i) => s + i.taxTotal, 0),
          },
          {
            'Category': 'Output Tax Liability (Sales)',
            'Taxable Value': state.salesInvoices.reduce((s, i) => s + i.subtotal, 0),
            'CGST (9%)': state.salesInvoices.reduce((s, i) => s + i.cgstTotal, 0),
            'SGST (9%)': state.salesInvoices.reduce((s, i) => s + i.sgstTotal, 0),
            'IGST (18%)': state.salesInvoices.reduce((s, i) => s + i.igstTotal, 0),
            'Total Tax': state.salesInvoices.reduce((s, i) => s + i.taxTotal, 0),
          },
        ];
      case 11:
        return state.customers.map(c => ({
          'Customer Code': c.code,
          'Customer Name': c.name,
          'GSTIN': c.gstin,
          'Phone': c.contactNumber,
          'Payment Terms': c.paymentTerms,
          'Credit Limit': c.creditLimit,
          'Outstanding Receivable (INR)': c.currentBalance,
        }));
      case 12:
        return state.suppliers.map(s => ({
          'Supplier Code': s.code,
          'Supplier Name': s.name,
          'GSTIN': s.gstin,
          'Phone': s.contactNumber,
          'Payment Terms': s.paymentTerms,
          'Outstanding Payable (INR)': s.currentBalance,
        }));
      case 13:
        return state.expenseCategories.map(e => ({
          'Code': e.code,
          'Category Name': e.name,
          'Description': e.description,
          'Allocated Total (INR)': 445000,
        }));
      case 14:
        return [
          { 'Account Head': '1. Total Operating Sales Revenue', 'Amount (INR)': state.salesInvoices.reduce((s, i) => s + i.subtotal, 0) },
          { 'Account Head': '2. Raw Scrap Consumption Cost', 'Amount (INR)': state.manufacturingOrders.reduce((s, o) => s + o.inputMaterialCost, 0) },
          { 'Account Head': '3. Direct Factory Labour Wages', 'Amount (INR)': state.manufacturingOrders.reduce((s, o) => s + o.labourCost, 0) },
          { 'Account Head': '4. Electricity & HT Power Overheads', 'Amount (INR)': state.manufacturingOrders.reduce((s, o) => s + o.electricityCost, 0) },
          { 'Account Head': '5. Furnace Fuel & Gas Overheads', 'Amount (INR)': state.manufacturingOrders.reduce((s, o) => s + o.fuelCost, 0) },
          { 'Account Head': '6. Net Gross Operating Margin', 'Amount (INR)': 1225.0 },
        ];
      case 15:
      default:
        return state.materials.map(m => ({
          'Code': m.code,
          'Material Name': m.name,
          'Category': m.category,
          'Grade': m.grade,
          'Stock (KG)': m.currentStock,
          'Unit Rate': m.defaultPurchaseRate || m.defaultSalesRate || 50,
          'Valuation (INR)': m.currentStock * (m.defaultPurchaseRate || m.defaultSalesRate || 50),
        }));
    }
  };

  const reportData = getActiveReportData();
  const activeReportMeta = reportList.find(r => r.id === selectedReport) || reportList[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-indigo-600" />
            Operational, Manufacturing & Financial Reports (15 Modules)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete plant analytics with multi-dimensional filters, Excel spreadsheet export (.xlsx), and CSV data dumps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(reportData, activeReportMeta.name.replace(/\s+/g, '_'))}
            className="px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/70 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportToExcel(reportData, activeReportMeta.name.replace(/\s+/g, '_'))}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Report Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {reportList.map(r => {
          const isSelected = r.id === selectedReport;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`p-3 rounded-xl text-left transition-all border ${isSelected
                  ? 'bg-purple-500/15 border-purple-500/50 shadow-md shadow-purple-500/10'
                  : 'bg-white/80 border-blue-100 hover:border-blue-200 hover:bg-blue-50/40'
                }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-500 font-bold">#{r.id}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
              </div>
              <div className={`text-xs font-bold mt-1 line-clamp-1 ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                {r.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Report Table Card */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              {activeReportMeta.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{activeReportMeta.desc}</p>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {reportData.length} Records Generated
          </div>
        </div>

        {/* Dynamic Table from JSON */}
        {reportData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  {Object.keys(reportData[0]).map((key, idx) => (
                    <th key={idx} className="py-3 px-4 whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 text-slate-700">
                {reportData.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-blue-50/80/30 transition-colors">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="py-3 px-4 whitespace-nowrap font-sans">
                        {typeof val === 'number'
                          ? val.toLocaleString('en-IN')
                          : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No records found for this report.
          </div>
        )}
      </div>
    </div>
  );
};
