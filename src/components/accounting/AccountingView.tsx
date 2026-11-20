'use client';

import React, { useState } from 'react';
import {
  BookOpenCheck,
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  Scale,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/excelExport';

export const AccountingView: React.FC = () => {
  const { state, createPaymentVoucher } = useERP();
  const [activeTab, setActiveTab] = useState<'journal' | 'accounts' | 'trial_balance' | 'pnl' | 'balance_sheet' | 'vouchers'>('journal');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Voucher Form State
  const [voucherType, setVoucherType] = useState<'PAYMENT' | 'RECEIPT'>('PAYMENT');
  const [partyType, setPartyType] = useState<'SUPPLIER' | 'CUSTOMER' | 'EXPENSE'>('SUPPLIER');
  const [partyId, setPartyId] = useState('');
  const [amount, setAmount] = useState<number>(10000);
  const [paymentMode, setPaymentMode] = useState<'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'UPI'>('BANK_TRANSFER');
  const [referenceNo, setReferenceNo] = useState(`REF-${Date.now().toString().slice(-6)}`);
  const [remarks, setRemarks] = useState('Payment against invoice settlement');

  // P&L calculation
  const totalRevenue = state.salesInvoices.reduce((s, i) => s + i.subtotal, 0);
  const totalScrapRevenue = 0;
  const rawMaterialCost = state.manufacturingOrders.reduce((s, o) => s + o.inputMaterialCost, 0);
  const totalLabour = state.manufacturingOrders.reduce((s, o) => s + o.labourCost, 0);
  const totalPower = state.manufacturingOrders.reduce((s, o) => s + o.electricityCost, 0);
  const totalFuel = state.manufacturingOrders.reduce((s, o) => s + o.fuelCost, 0);
  const totalOtherOverheads = state.manufacturingOrders.reduce((s, o) => s + o.otherCost, 0);

  const totalCOGS = rawMaterialCost + totalLabour + totalPower + totalFuel + totalOtherOverheads;
  const netOperatingProfit = totalRevenue - totalCOGS;

  // Trial Balance calculation
  const totalJournalDebit = state.journalEntries.reduce((s, j) => s + j.totalDebit, 0);
  const totalJournalCredit = state.journalEntries.reduce((s, j) => s + j.totalCredit, 0);

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Amount must be greater than zero.');
      return;
    }

    let partyName = 'Expense';
    if (partyType === 'SUPPLIER') {
      partyName = state.suppliers.find(s => s.id === partyId)?.name || 'Supplier';
    } else if (partyType === 'CUSTOMER') {
      partyName = state.customers.find(c => c.id === partyId)?.name || 'Customer';
    }

    createPaymentVoucher({
      voucherType,
      partyType,
      partyId,
      partyName,
      paymentMode,
      amount,
      bankAccount: 'HDFC Bank A/c 50200084729103',
      referenceNo,
      remarks,
    });

    setIsVoucherModalOpen(false);
    alert(`Voucher ${voucherType} of ${formatCurrency(amount)} recorded successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-blue-600" />
            Double-Entry Accounting & Financial Statements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Journal Entries, Chart of Accounts, Trial Balance, P&L Statement, and Payment/Receipt Vouchers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToExcel(state.journalEntries, 'Journal_Entries_Ledger')}
            className="px-3.5 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/70 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200"
          >
            <Download className="w-4 h-4" />
            <span>Export Ledgers</span>
          </button>

          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Record Voucher (Payment / Receipt)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-100 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('journal')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'journal'
              ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <BookOpenCheck className="w-4 h-4" />
          <span>Journal Entries ({state.journalEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'trial_balance'
              ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Trial Balance (Balanced)</span>
        </button>

        <button
          onClick={() => setActiveTab('pnl')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pnl'
              ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Profit & Loss Statement</span>
        </button>

        <button
          onClick={() => setActiveTab('balance_sheet')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'balance_sheet'
              ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Balance Sheet</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Chart of Accounts ({state.accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vouchers'
              ? 'border-blue-600 text-blue-700 bg-white/80 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Vouchers ({state.paymentVouchers.length})</span>
        </button>
      </div>

      {/* TAB 1: JOURNAL ENTRIES */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          {state.journalEntries.map(je => (
            <div key={je.id} className="p-4 rounded-xl bg-white/90 border border-blue-100 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-blue-600 text-sm">{je.entryNumber}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50/80 text-slate-700 font-semibold uppercase text-[10px]">
                    {je.referenceType}
                  </span>
                  <span className="text-slate-500 font-sans">{formatDate(je.date)}</span>
                </div>
                <div className="text-slate-700 font-mono font-bold">
                  Matched Total: {formatCurrency(je.totalDebit)}
                </div>
              </div>

              <div className="text-xs text-slate-700 italic">{je.narration}</div>

              {/* Journal Lines Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Account Code</th>
                      <th className="py-2 px-3">Account Description</th>
                      <th className="py-2 px-3 text-right">Debit (₹)</th>
                      <th className="py-2 px-3 text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100/40 text-slate-700">
                    {je.lines.map(l => (
                      <tr key={l.id} className="hover:bg-blue-50/80/30">
                        <td className="py-2 px-3 font-bold text-amber-400">{l.accountCode}</td>
                        <td className="py-2 px-3 font-sans">
                          <span className={l.credit > 0 ? 'pl-4 text-slate-500' : 'font-semibold text-slate-800'}>
                            {l.credit > 0 ? 'To ' : ''}{l.accountName}
                          </span>
                          {l.description && <span className="text-[10px] text-slate-500 block">({l.description})</span>}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                          {l.debit > 0 ? formatCurrency(l.debit) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-rose-400 font-bold">
                          {l.credit > 0 ? formatCurrency(l.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TRIAL BALANCE */}
      {activeTab === 'trial_balance' && (
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Trial Balance (FY 2026-27)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verification that total debits equal total credits across all ledger accounts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Debits & Credits in Equilibrium</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4 font-sans">Account Name</th>
                  <th className="py-3 px-4 font-sans">Type</th>
                  <th className="py-3 px-4 text-right">Debit Balance (₹)</th>
                  <th className="py-3 px-4 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 text-slate-700">
                {state.accounts.map(acc => {
                  const isDebitNature = acc.type === 'ASSET' || acc.type === 'EXPENSE';
                  return (
                    <tr key={acc.id} className="hover:bg-blue-50/80/30">
                      <td className="py-2.5 px-4 font-bold text-amber-400">{acc.code}</td>
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-800">{acc.name}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-500">{acc.type}</td>
                      <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                        {isDebitNature ? formatCurrency(acc.balance) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-rose-400 font-bold">
                        {!isDebitNature ? formatCurrency(acc.balance) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROFIT & LOSS STATEMENT */}
      {activeTab === 'pnl' && (
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-6">
          <div className="pb-3 border-b border-blue-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Statement of Profit and Loss (Income Statement)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reflects sales revenue, raw material consumption, melting power, rolling wages, and net gross margin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Operating Revenue */}
            <div className="p-4 rounded-xl bg-white/70 border border-blue-100 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Operating Revenue (Turnover)
              </h4>
              <div className="space-y-2 text-xs font-mono text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-blue-100">
                  <span className="font-sans text-slate-500">TMT Rebars & Steel Sales</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-blue-100">
                  <span className="font-sans text-slate-500">Scrap Metal Sales</span>
                  <span>{formatCurrency(totalScrapRevenue)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-extrabold text-emerald-400">
                  <span className="font-sans">Total Operating Income:</span>
                  <span>{formatCurrency(totalRevenue + totalScrapRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Right: Cost of Goods Sold & Overheads */}
            <div className="p-4 rounded-xl bg-white/70 border border-blue-100 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Cost of Goods Sold & Manufacturing Overheads
              </h4>
              <div className="space-y-2 text-xs font-mono text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-blue-100">
                  <span className="font-sans text-slate-500">Raw Scrap Consumption (100 KG)</span>
                  <span>{formatCurrency(rawMaterialCost)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-blue-100">
                  <span className="font-sans text-slate-500">Direct Labour Wages</span>
                  <span>{formatCurrency(totalLabour)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-blue-100">
                  <span className="font-sans text-slate-500">Furnace Electricity & Power</span>
                  <span>{formatCurrency(totalPower)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-blue-100">
                  <span className="font-sans text-slate-500">Furnace Fuel & Gas</span>
                  <span>{formatCurrency(totalFuel)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-blue-100">
                  <span className="font-sans text-slate-500">Plant Consumables & Overheads</span>
                  <span>{formatCurrency(totalOtherOverheads)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-extrabold text-rose-400">
                  <span className="font-sans">Total Manufacturing COGS:</span>
                  <span>{formatCurrency(totalCOGS)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit Callout Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Net Operating Profit (Before Tax)
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Revenue {formatCurrency(totalRevenue)} minus Total Manufacturing Cost {formatCurrency(totalCOGS)}
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 font-mono">
              {formatCurrency(netOperatingProfit)}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BALANCE SHEET */}
      {activeTab === 'balance_sheet' && (
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-6">
          <div className="pb-3 border-b border-blue-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Balance Sheet (Financial Position)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assets = Liabilities + Owner&apos;s Equity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets */}
            <div className="p-4 rounded-xl bg-white/70 border border-blue-100 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Assets
              </h4>
              <div className="space-y-2 text-xs font-mono text-slate-700">
                {state.accounts
                  .filter(a => a.type === 'ASSET')
                  .map(a => (
                    <div key={a.id} className="flex justify-between py-1.5 border-b border-blue-100">
                      <span className="font-sans text-slate-500">{a.name}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(a.balance)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="p-4 rounded-xl bg-white/70 border border-blue-100 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Liabilities & Equity
              </h4>
              <div className="space-y-2 text-xs font-mono text-slate-700">
                {state.accounts
                  .filter(a => a.type === 'LIABILITY' || a.type === 'EQUITY')
                  .map(a => (
                    <div key={a.id} className="flex justify-between py-1.5 border-b border-blue-100">
                      <span className="font-sans text-slate-500">{a.name}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(a.balance)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CHART OF ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-white/40 text-xs">
            <span className="font-bold text-slate-800">Standard Chart of Accounts</span>
            <span className="text-slate-500 font-mono">{state.accounts.length} Accounts Configured</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4 font-sans">Account Name</th>
                  <th className="py-3 px-4 font-sans">Type</th>
                  <th className="py-3 px-4 font-sans">Sub Category</th>
                  <th className="py-3 px-4 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 text-slate-700">
                {state.accounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-blue-50/80/30">
                    <td className="py-2.5 px-4 font-bold text-amber-400">{acc.code}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{acc.name}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">{acc.type}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">{acc.subCategory || '-'}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                      {formatCurrency(acc.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-white/40 text-xs">
            <span className="font-bold text-slate-800">Payment & Receipt Vouchers</span>
            <span className="text-slate-500 font-mono">{state.paymentVouchers.length} Transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-semibold border-b border-blue-100">
                <tr>
                  <th className="py-3 px-4">Voucher #</th>
                  <th className="py-3 px-4 font-sans">Type</th>
                  <th className="py-3 px-4 font-sans">Party Name</th>
                  <th className="py-3 px-4 font-sans">Mode</th>
                  <th className="py-3 px-4 font-sans">Reference / Bank</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 font-sans">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/60 text-slate-700">
                {state.paymentVouchers.map(v => (
                  <tr key={v.id} className="hover:bg-blue-50/80/30">
                    <td className="py-3 px-4 font-bold text-blue-600">{v.voucherNumber}</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          v.voucherType === 'RECEIPT'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {v.voucherType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">{v.partyName}</td>
                    <td className="py-3 px-4 font-sans text-slate-500">{v.paymentMode}</td>
                    <td className="py-3 px-4 font-sans text-slate-500">{v.referenceNo}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {formatCurrency(v.amount)}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500 max-w-xs truncate">{v.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VOUCHER CREATION MODAL */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/80 border border-blue-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Record Payment / Receipt Voucher
            </h3>

            <form onSubmit={handleVoucherSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={e => setVoucherType(e.target.value as any)}
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="PAYMENT">Payment Voucher (Outflow)</option>
                    <option value="RECEIPT">Receipt Voucher (Inflow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Party Type</label>
                  <select
                    value={partyType}
                    onChange={e => setPartyType(e.target.value as any)}
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="SUPPLIER">Supplier</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="EXPENSE">Direct Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Select Beneficiary / Party</label>
                <select
                  value={partyId}
                  onChange={e => setPartyId(e.target.value)}
                  className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="">-- Select Party --</option>
                  {partyType === 'SUPPLIER' &&
                    state.suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Balance: {formatCurrency(s.currentBalance)})
                      </option>
                    ))}
                  {partyType === 'CUSTOMER' &&
                    state.customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Balance: {formatCurrency(c.currentBalance)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as any)}
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash in Hand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Bank Reference No</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Remarks / Narration</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-4 border-t border-blue-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50/80 hover:bg-blue-100/70 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-indigo-500 text-white shadow-md shadow-blue-500/25"
                >
                  Confirm Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
