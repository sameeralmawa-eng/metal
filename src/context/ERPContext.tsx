'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ERPState,
  Customer,
  Supplier,
  Material,
  Warehouse,
  ManufacturingUnit,
  Labour,
  ExpenseCategory,
  TaxRate,
  PurchaseInvoice,
  ManufacturingOrder,
  SalesInvoice,
  JournalEntry,
  PaymentVoucher,
  MaterialBatch,
  InventoryTransaction,
  LabourCostEntry,
} from '@/types/erp';
import { initialERPState } from '@/data/initialData';

interface ERPContextType {
  state: ERPState;
  // Masters
  addCustomer: (customer: Omit<Customer, 'id' | 'code' | 'currentBalance'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code' | 'currentBalance'>) => void;
  addMaterial: (material: Omit<Material, 'id' | 'code' | 'currentStock'>) => void;
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'code'>) => void;
  addManufacturingUnit: (unit: Omit<ManufacturingUnit, 'id' | 'code'>) => void;
  addLabour: (labour: Omit<Labour, 'id' | 'code'>) => void;
  addExpenseCategory: (cat: Omit<ExpenseCategory, 'id' | 'code'>) => void;

  // Transactions
  createPurchaseInvoice: (invoice: any) => void;
  createManufacturingOrder: (order: any) => void;
  createSalesInvoice: (invoice: any) => void;
  createPaymentVoucher: (voucher: any) => void;
  createStockAdjustment: (materialId: string, warehouseId: string, type: 'ADD' | 'SUBTRACT', qtyKg: number, reason: string) => void;

  // Utility
  resetDemoData: () => void;
  runGolden100KgDemo: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const STORAGE_KEY = 'apex_metal_erp_state_v1';

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ERPState>(initialERPState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load ERP state from localStorage:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes (after initial mount)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to save ERP state to localStorage:', err);
      }
    }
  }, [state, isLoaded]);

  // Master creation functions
  const addCustomer = (data: Omit<Customer, 'id' | 'code' | 'currentBalance'>) => {
    const code = `CUST-${String(state.customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      code,
      currentBalance: data.openingBalance || 0,
    };
    setState(prev => ({
      ...prev,
      customers: [newCustomer, ...prev.customers],
    }));
  };

  const addSupplier = (data: Omit<Supplier, 'id' | 'code' | 'currentBalance'>) => {
    const code = `SUPP-${String(state.suppliers.length + 1).padStart(3, '0')}`;
    const newSupplier: Supplier = {
      ...data,
      id: `supp-${Date.now()}`,
      code,
      currentBalance: data.openingBalance || 0,
    };
    setState(prev => ({
      ...prev,
      suppliers: [newSupplier, ...prev.suppliers],
    }));
  };

  const addMaterial = (data: Omit<Material, 'id' | 'code' | 'currentStock'>) => {
    const prefix = data.category === 'RAW_MATERIAL' ? 'RAW' : data.category === 'WIP' ? 'WIP' : data.category === 'FINISHED_GOODS' ? 'FG' : 'SCRAP';
    const code = `${prefix}-${String(state.materials.length + 1).padStart(3, '0')}`;
    const newMaterial: Material = {
      ...data,
      id: `mat-${Date.now()}`,
      code,
      currentStock: 0,
    };
    setState(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial],
    }));
  };

  const addWarehouse = (data: Omit<Warehouse, 'id' | 'code'>) => {
    const code = `WH-BAY-${String(state.warehouses.length + 1).padStart(2, '0')}`;
    const newWh: Warehouse = {
      ...data,
      id: `wh-${Date.now()}`,
      code,
    };
    setState(prev => ({
      ...prev,
      warehouses: [...prev.warehouses, newWh],
    }));
  };

  const addManufacturingUnit = (data: Omit<ManufacturingUnit, 'id' | 'code'>) => {
    const code = `UNIT-${String(state.manufacturingUnits.length + 1).padStart(2, '0')}`;
    const newUnit: ManufacturingUnit = {
      ...data,
      id: `unit-${Date.now()}`,
      code,
    };
    setState(prev => ({
      ...prev,
      manufacturingUnits: [...prev.manufacturingUnits, newUnit],
    }));
  };

  const addLabour = (data: Omit<Labour, 'id' | 'code'>) => {
    const code = `EMP-${String(state.labours.length + 1).padStart(3, '0')}`;
    const newLabour: Labour = {
      ...data,
      id: `lab-${Date.now()}`,
      code,
    };
    setState(prev => ({
      ...prev,
      labours: [...prev.labours, newLabour],
    }));
  };

  const addExpenseCategory = (data: Omit<ExpenseCategory, 'id' | 'code'>) => {
    const code = `EXP-${String(state.expenseCategories.length + 1).padStart(2, '0')}`;
    const newCat: ExpenseCategory = {
      ...data,
      id: `exp-${Date.now()}`,
      code,
    };
    setState(prev => ({
      ...prev,
      expenseCategories: [...prev.expenseCategories, newCat],
    }));
  };

  // 1. CREATE PURCHASE INVOICE (Atomically updates Inventory + Batches + Ledger)
  const createPurchaseInvoice = (invoiceData: any) => {
    const invoiceNumber = `PINV-2026-${String(state.purchaseInvoices.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newInvoice: PurchaseInvoice = {
      ...invoiceData,
      id: `pinv-${Date.now()}`,
      invoiceNumber,
      invoiceDate: invoiceData.invoiceDate || now.slice(0, 10),
    };

    // Update Materials Stock and create Batches & Inventory Transactions
    const updatedMaterials = [...state.materials];
    const newBatches: MaterialBatch[] = [];
    const newTxns: InventoryTransaction[] = [];

    invoiceData.items.forEach((item: any, idx: number) => {
      // Find material and update stock
      const matIndex = updatedMaterials.findIndex(m => m.id === item.materialId);
      if (matIndex >= 0) {
        updatedMaterials[matIndex] = {
          ...updatedMaterials[matIndex],
          currentStock: updatedMaterials[matIndex].currentStock + Number(item.quantityKg),
        };
      }

      // Create new batch for this purchased material
      const batchNumber = `BATCH-${item.materialName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}-${idx + 1}`;
      const defaultWh = state.warehouses.find(w => w.isDefault) || state.warehouses[0];

      const newBatch: MaterialBatch = {
        id: `batch-${Date.now()}-${idx}`,
        batchNumber,
        materialId: item.materialId,
        materialName: item.materialName,
        warehouseId: defaultWh.id,
        warehouseName: defaultWh.name,
        initialQtyKg: Number(item.quantityKg),
        availableQtyKg: Number(item.quantityKg),
        ratePerKg: Number(item.ratePerKg),
        sourceType: 'PURCHASE',
        sourceReference: invoiceNumber,
        mfgDate: invoiceData.invoiceDate || now.slice(0, 10),
      };
      newBatches.push(newBatch);

      // Create inventory inward transaction
      const txnNumber = `ITXN-${String(state.inventoryTransactions.length + newTxns.length + 1).padStart(4, '0')}`;
      newTxns.push({
        id: `txn-${Date.now()}-${idx}`,
        transactionNumber: txnNumber,
        transactionType: 'PURCHASE_INWARD',
        materialId: item.materialId,
        materialName: item.materialName,
        batchId: newBatch.id,
        batchNumber: newBatch.batchNumber,
        warehouseId: defaultWh.id,
        warehouseName: defaultWh.name,
        quantityKg: Number(item.quantityKg),
        balanceAfterKg: (matIndex >= 0 ? updatedMaterials[matIndex].currentStock : Number(item.quantityKg)),
        ratePerKg: Number(item.ratePerKg),
        totalValue: Number(item.taxableAmount),
        referenceType: 'PURCHASE_INVOICE',
        referenceId: newInvoice.id,
        referenceNumber: invoiceNumber,
        notes: `Inward from Purchase Invoice ${invoiceNumber}`,
        createdAt: now,
      });
    });

    // Create Double-Entry Journal Entry
    const jvNumber = `JV-2026-${String(state.journalEntries.length + 1).padStart(4, '0')}`;
    const newJournalEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: jvNumber,
      date: invoiceData.invoiceDate || now.slice(0, 10),
      referenceType: 'PURCHASE',
      referenceId: newInvoice.id,
      referenceNumber: invoiceNumber,
      narration: `Purchase from ${newInvoice.supplierName} (Inv: ${invoiceNumber})`,
      totalDebit: newInvoice.grandTotal,
      totalCredit: newInvoice.grandTotal,
      lines: [
        {
          id: `jel-${Date.now()}-1`,
          accountId: 'acc-1040',
          accountCode: '1040',
          accountName: 'Raw Material Inventory A/c',
          debit: newInvoice.subtotal,
          credit: 0,
          description: `Raw Material Inward (${invoiceNumber})`,
        },
        ...(newInvoice.cgstTotal > 0
          ? [
              {
                id: `jel-${Date.now()}-2`,
                accountId: 'acc-1060',
                accountCode: '1060',
                accountName: 'Input CGST',
                debit: newInvoice.cgstTotal,
                credit: 0,
                description: `Input CGST 9% on ${invoiceNumber}`,
              },
            ]
          : []),
        ...(newInvoice.sgstTotal > 0
          ? [
              {
                id: `jel-${Date.now()}-3`,
                accountId: 'acc-1061',
                accountCode: '1061',
                accountName: 'Input SGST',
                debit: newInvoice.sgstTotal,
                credit: 0,
                description: `Input SGST 9% on ${invoiceNumber}`,
              },
            ]
          : []),
        ...(newInvoice.igstTotal > 0
          ? [
              {
                id: `jel-${Date.now()}-4`,
                accountId: 'acc-1062',
                accountCode: '1062',
                accountName: 'Input IGST',
                debit: newInvoice.igstTotal,
                credit: 0,
                description: `Input IGST 18% on ${invoiceNumber}`,
              },
            ]
          : []),
        ...(newInvoice.freightCharges > 0
          ? [
              {
                id: `jel-${Date.now()}-5`,
                accountId: 'acc-5060',
                accountCode: '5060',
                accountName: 'Freight Expense',
                debit: newInvoice.freightCharges,
                credit: 0,
                description: `Freight on ${invoiceNumber}`,
              },
            ]
          : []),
        {
          id: `jel-${Date.now()}-6`,
          accountId: newInvoice.paymentStatus === 'PAID' ? 'acc-1020' : 'acc-2010',
          accountCode: newInvoice.paymentStatus === 'PAID' ? '1020' : '2010',
          accountName: newInvoice.paymentStatus === 'PAID' ? 'HDFC Current Bank A/c' : 'Accounts Payable (Creditors)',
          debit: 0,
          credit: newInvoice.grandTotal,
          description: `Payable/Settlement to ${newInvoice.supplierName}`,
          entityType: 'SUPPLIER',
          entityId: newInvoice.supplierId,
        },
      ],
    };

    // Update Supplier Balance if unpaid
    const updatedSuppliers = state.suppliers.map(s => {
      if (s.id === newInvoice.supplierId) {
        return {
          ...s,
          currentBalance: s.currentBalance + (newInvoice.paymentStatus === 'PAID' ? 0 : newInvoice.grandTotal),
        };
      }
      return s;
    });

    setState(prev => ({
      ...prev,
      purchaseInvoices: [newInvoice, ...prev.purchaseInvoices],
      materials: updatedMaterials,
      batches: [...newBatches, ...prev.batches],
      inventoryTransactions: [...newTxns, ...prev.inventoryTransactions],
      journalEntries: [newJournalEntry, ...prev.journalEntries],
      suppliers: updatedSuppliers,
    }));
  };

  // 2. CREATE MANUFACTURING ORDER (Melting & Rolling Process with Weight Loss)
  const createManufacturingOrder = (orderData: any) => {
    const orderNumber = `MO-2026-${String(state.manufacturingOrders.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const inputWeight = Number(orderData.inputWeightKg);
    const outputWeight = Number(orderData.outputWeightKg);
    const scrapWeight = Number(orderData.recoverableScrapWeightKg || 0);

    // Business Formulas:
    // Loss Weight = Input Weight - Finished Output Weight - Recoverable Scrap Weight
    const processLossKg = Number((inputWeight - outputWeight - scrapWeight).toFixed(2));
    // Loss Percentage = (Loss Weight / Input Weight) * 100
    const lossPercentage = inputWeight > 0 ? Number(((processLossKg / inputWeight) * 100).toFixed(2)) : 0;

    const minLoss = state.company.expectedLossMin; // 2.0%
    const maxLoss = state.company.expectedLossMax; // 3.5%
    const isLossExceeded = lossPercentage > maxLoss;

    // Costing
    const inputRate = Number(orderData.inputRatePerKg || 100);
    const inputMaterialCost = Number((inputWeight * inputRate).toFixed(2));

    const labourCost = Number(orderData.labourCost || 0);
    const electricityCost = Number(orderData.electricityCost || 0);
    const fuelCost = Number(orderData.fuelCost || 0);
    const otherCost = Number(orderData.otherCost || 0);
    const totalOverheadsCost = Number((labourCost + electricityCost + fuelCost + otherCost).toFixed(2));
    const totalManufacturingCost = Number((inputMaterialCost + totalOverheadsCost).toFixed(2));

    // Finished Goods Cost Per KG = Total Manufacturing Cost / Finished Output Weight
    const finishedGoodsCostPerKg = outputWeight > 0 ? Number((totalManufacturingCost / outputWeight).toFixed(2)) : 0;

    const outputBatchNumber = `BATCH-FG-${Date.now().toString().slice(-4)}`;

    const newOrder: ManufacturingOrder = {
      ...orderData,
      id: `mo-${Date.now()}`,
      orderNumber,
      productionDate: orderData.productionDate || now.slice(0, 10),
      status: 'COMPLETED',
      inputWeightKg: inputWeight,
      inputRatePerKg: inputRate,
      inputMaterialCost,
      outputWeightKg: outputWeight,
      outputBatchNumber,
      recoverableScrapWeightKg: scrapWeight,
      processLossKg,
      lossPercentage,
      expectedLossMinPct: minLoss,
      expectedLossMaxPct: maxLoss,
      isLossExceeded,
      lossExceededApproved: isLossExceeded ? (orderData.lossExceededApproved || false) : true,
      lossRemarks: orderData.lossRemarks || 'Melting and rolling scale burning loss recorded',
      labourCost,
      electricityCost,
      fuelCost,
      otherCost,
      totalOverheadsCost,
      totalManufacturingCost,
      finishedGoodsCostPerKg,
      completedAt: now,
    };

    // Update Materials Stock:
    // Deduct raw material input, Add finished goods output, Add recoverable scrap if any
    const updatedMaterials = [...state.materials];
    const newTxns: InventoryTransaction[] = [];

    // Deduct RM
    const rmIdx = updatedMaterials.findIndex(m => m.id === newOrder.inputMaterialId);
    if (rmIdx >= 0) {
      updatedMaterials[rmIdx] = {
        ...updatedMaterials[rmIdx],
        currentStock: Math.max(0, updatedMaterials[rmIdx].currentStock - inputWeight),
      };
    }

    // Add FG
    const fgIdx = updatedMaterials.findIndex(m => m.id === newOrder.outputMaterialId);
    if (fgIdx >= 0) {
      updatedMaterials[fgIdx] = {
        ...updatedMaterials[fgIdx],
        currentStock: updatedMaterials[fgIdx].currentStock + outputWeight,
      };
    }

    // Add Scrap if applicable
    if (scrapWeight > 0) {
      const scrapMat = updatedMaterials.find(m => m.category === 'RECOVERABLE_SCRAP');
      if (scrapMat) {
        const sIdx = updatedMaterials.findIndex(m => m.id === scrapMat.id);
        updatedMaterials[sIdx] = {
          ...updatedMaterials[sIdx],
          currentStock: updatedMaterials[sIdx].currentStock + scrapWeight,
        };
      }
    }

    // Deduct from input batch
    const updatedBatches = state.batches.map(b => {
      if (b.id === newOrder.inputBatchId) {
        return {
          ...b,
          availableQtyKg: Math.max(0, b.availableQtyKg - inputWeight),
        };
      }
      return b;
    });

    // Create Output Batch for Finished Goods
    const fgWh = state.warehouses.find(w => w.name.includes('Finished')) || state.warehouses[0];
    const newFgBatch: MaterialBatch = {
      id: `batch-${Date.now()}-fg`,
      batchNumber: outputBatchNumber,
      materialId: newOrder.outputMaterialId,
      materialName: newOrder.outputMaterialName,
      warehouseId: fgWh.id,
      warehouseName: fgWh.name,
      initialQtyKg: outputWeight,
      availableQtyKg: outputWeight,
      ratePerKg: finishedGoodsCostPerKg,
      sourceType: 'MANUFACTURING_OUTPUT',
      sourceReference: orderNumber,
      mfgDate: now.slice(0, 10),
    };

    // Inventory Transactions
    // 1. Consumption
    newTxns.push({
      id: `txn-${Date.now()}-c`,
      transactionNumber: `ITXN-${String(state.inventoryTransactions.length + 1).padStart(4, '0')}`,
      transactionType: 'MFG_CONSUMPTION',
      materialId: newOrder.inputMaterialId,
      materialName: newOrder.inputMaterialName,
      batchId: newOrder.inputBatchId,
      batchNumber: newOrder.inputBatchNumber,
      warehouseId: state.warehouses[0].id,
      warehouseName: state.warehouses[0].name,
      quantityKg: -inputWeight,
      balanceAfterKg: rmIdx >= 0 ? updatedMaterials[rmIdx].currentStock : 0,
      ratePerKg: inputRate,
      totalValue: inputMaterialCost,
      referenceType: 'MANUFACTURING_ORDER',
      referenceId: newOrder.id,
      referenceNumber: orderNumber,
      notes: `Consumed ${inputWeight} KG in Melting & Rolling (${orderNumber})`,
      createdAt: now,
    });

    // 2. Output
    newTxns.push({
      id: `txn-${Date.now()}-o`,
      transactionNumber: `ITXN-${String(state.inventoryTransactions.length + 2).padStart(4, '0')}`,
      transactionType: 'MFG_OUTPUT',
      materialId: newOrder.outputMaterialId,
      materialName: newOrder.outputMaterialName,
      batchId: newFgBatch.id,
      batchNumber: outputBatchNumber,
      warehouseId: fgWh.id,
      warehouseName: fgWh.name,
      quantityKg: outputWeight,
      balanceAfterKg: fgIdx >= 0 ? updatedMaterials[fgIdx].currentStock : outputWeight,
      ratePerKg: finishedGoodsCostPerKg,
      totalValue: totalManufacturingCost,
      referenceType: 'MANUFACTURING_ORDER',
      referenceId: newOrder.id,
      referenceNumber: orderNumber,
      notes: `Produced ${outputWeight} KG Finished Rebars. Weight Loss = ${processLossKg} KG (${lossPercentage}%)`,
      createdAt: now,
    });

    // Accounting Journal Entry
    const jvNumber = `JV-2026-${String(state.journalEntries.length + 1).padStart(4, '0')}`;
    const newJournalEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: jvNumber,
      date: orderData.productionDate || now.slice(0, 10),
      referenceType: 'MANUFACTURING',
      referenceId: newOrder.id,
      referenceNumber: orderNumber,
      narration: `Mfg Order ${orderNumber}: Converted ${inputWeight} KG Scrap into ${outputWeight} KG Finished Goods (Loss: ${processLossKg} KG)`,
      totalDebit: totalManufacturingCost,
      totalCredit: totalManufacturingCost,
      lines: [
        {
          id: `jel-${Date.now()}-1`,
          accountId: 'acc-1050',
          accountCode: '1050',
          accountName: 'Finished Goods Inventory A/c',
          debit: totalManufacturingCost,
          credit: 0,
          description: `${outputWeight} KG Produced @ ₹${finishedGoodsCostPerKg}/KG`,
        },
        {
          id: `jel-${Date.now()}-2`,
          accountId: 'acc-1040',
          accountCode: '1040',
          accountName: 'Raw Material Inventory A/c',
          debit: 0,
          credit: inputMaterialCost,
          description: `Raw Scrap Consumed (${inputWeight} KG)`,
        },
        ...(labourCost > 0
          ? [
              {
                id: `jel-${Date.now()}-3`,
                accountId: 'acc-5030',
                accountCode: '5030',
                accountName: 'Direct Labour Wages A/c',
                debit: 0,
                credit: labourCost,
                description: `Labour allocation on ${orderNumber}`,
              },
            ]
          : []),
        ...(electricityCost > 0
          ? [
              {
                id: `jel-${Date.now()}-4`,
                accountId: 'acc-5040',
                accountCode: '5040',
                accountName: 'Electricity & HT Power Expense',
                debit: 0,
                credit: electricityCost,
                description: `Induction furnace power allocation`,
              },
            ]
          : []),
        ...(fuelCost > 0
          ? [
              {
                id: `jel-${Date.now()}-5`,
                accountId: 'acc-5050',
                accountCode: '5050',
                accountName: 'Furnace Fuel & Gas Expense',
                debit: 0,
                credit: fuelCost,
                description: `Reheating gas & fuel allocation`,
              },
            ]
          : []),
        ...(otherCost > 0
          ? [
              {
                id: `jel-${Date.now()}-6`,
                accountId: 'acc-5060',
                accountCode: '5060',
                accountName: 'General Factory Overheads',
                debit: 0,
                credit: otherCost,
                description: `Consumables allocation`,
              },
            ]
          : []),
      ],
    };

    // Labour cost entry
    const newLabourEntries: LabourCostEntry[] = [];
    if (labourCost > 0) {
      newLabourEntries.push({
        id: `lc-${Date.now()}`,
        manufacturingOrderId: newOrder.id,
        manufacturingOrderNumber: orderNumber,
        labourName: 'Plant Production Crew (Melter & Roller)',
        labourCategory: 'MELTER',
        processType: 'MELTING',
        rateType: 'PER_KG',
        workersCount: 2,
        workingUnits: inputWeight,
        rate: Number((labourCost / inputWeight).toFixed(2)),
        totalAmount: labourCost,
        paymentDate: now.slice(0, 10),
        paymentStatus: 'PAID',
        remarks: `Production labour for order ${orderNumber}`,
      });
    }

    setState(prev => ({
      ...prev,
      manufacturingOrders: [newOrder, ...prev.manufacturingOrders],
      materials: updatedMaterials,
      batches: [newFgBatch, ...updatedBatches],
      inventoryTransactions: [...newTxns, ...prev.inventoryTransactions],
      journalEntries: [newJournalEntry, ...prev.journalEntries],
      labourCostEntries: [...newLabourEntries, ...prev.labourCostEntries],
    }));
  };

  // 3. CREATE SALES INVOICE (Deducts Finished Goods Stock + Records GST + Updates Ledger)
  const createSalesInvoice = (invoiceData: any) => {
    const invoiceNumber = `SINV-2026-${String(state.salesInvoices.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newInvoice: SalesInvoice = {
      ...invoiceData,
      id: `sinv-${Date.now()}`,
      invoiceNumber,
      invoiceDate: invoiceData.invoiceDate || now.slice(0, 10),
    };

    // Deduct stock from Materials and Batches, create outward inventory transactions
    const updatedMaterials = [...state.materials];
    const newTxns: InventoryTransaction[] = [];
    const updatedBatches = [...state.batches];

    invoiceData.items.forEach((item: any, idx: number) => {
      const matIdx = updatedMaterials.findIndex(m => m.id === item.materialId);
      if (matIdx >= 0) {
        updatedMaterials[matIdx] = {
          ...updatedMaterials[matIdx],
          currentStock: Math.max(0, updatedMaterials[matIdx].currentStock - Number(item.quantityKg)),
        };
      }

      // Deduct from batch if selected
      if (item.batchId) {
        const bIdx = updatedBatches.findIndex(b => b.id === item.batchId);
        if (bIdx >= 0) {
          updatedBatches[bIdx] = {
            ...updatedBatches[bIdx],
            availableQtyKg: Math.max(0, updatedBatches[bIdx].availableQtyKg - Number(item.quantityKg)),
          };
        }
      }

      const defaultWh = state.warehouses.find(w => w.name.includes('Finished')) || state.warehouses[0];
      const txnNumber = `ITXN-${String(state.inventoryTransactions.length + newTxns.length + 1).padStart(4, '0')}`;
      newTxns.push({
        id: `txn-${Date.now()}-${idx}`,
        transactionNumber: txnNumber,
        transactionType: 'SALES_OUTWARD',
        materialId: item.materialId,
        materialName: item.materialName,
        batchId: item.batchId,
        batchNumber: item.batchNumber,
        warehouseId: defaultWh.id,
        warehouseName: defaultWh.name,
        quantityKg: -Number(item.quantityKg),
        balanceAfterKg: matIdx >= 0 ? updatedMaterials[matIdx].currentStock : 0,
        ratePerKg: Number(item.ratePerKg),
        totalValue: Number(item.taxableAmount),
        referenceType: 'SALES_INVOICE',
        referenceId: newInvoice.id,
        referenceNumber: invoiceNumber,
        notes: `Outward dispatch for Sales Invoice ${invoiceNumber}`,
        createdAt: now,
      });
    });

    // Double-Entry Journal Entry
    const jvNumber = `JV-2026-${String(state.journalEntries.length + 1).padStart(4, '0')}`;
    const newJournalEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: jvNumber,
      date: invoiceData.invoiceDate || now.slice(0, 10),
      referenceType: 'SALES',
      referenceId: newInvoice.id,
      referenceNumber: invoiceNumber,
      narration: `Sales to ${newInvoice.customerName} (Inv: ${invoiceNumber})`,
      totalDebit: newInvoice.grandTotal,
      totalCredit: newInvoice.grandTotal,
      lines: [
        {
          id: `jel-${Date.now()}-1`,
          accountId: newInvoice.paymentStatus === 'PAID' ? 'acc-1020' : 'acc-1030',
          accountCode: newInvoice.paymentStatus === 'PAID' ? '1020' : '1030',
          accountName: newInvoice.paymentStatus === 'PAID' ? 'HDFC Current Bank A/c' : 'Accounts Receivable (Debtors)',
          debit: newInvoice.grandTotal,
          credit: 0,
          description: `Receivable/Payment from ${newInvoice.customerName}`,
          entityType: 'CUSTOMER',
          entityId: newInvoice.customerId,
        },
        {
          id: `jel-${Date.now()}-2`,
          accountId: 'acc-4010',
          accountCode: '4010',
          accountName: 'TMT & Finished Rebar Sales Revenue',
          debit: 0,
          credit: newInvoice.subtotal,
          description: `Sales Revenue (${invoiceNumber})`,
        },
        ...(newInvoice.cgstTotal > 0
          ? [
              {
                id: `jel-${Date.now()}-3`,
                accountId: 'acc-2020',
                accountCode: '2020',
                accountName: 'Output CGST',
                debit: 0,
                credit: newInvoice.cgstTotal,
                description: `Output CGST 9% on ${invoiceNumber}`,
              },
            ]
          : []),
        ...(newInvoice.sgstTotal > 0
          ? [
              {
                id: `jel-${Date.now()}-4`,
                accountId: 'acc-2021',
                accountCode: '2021',
                accountName: 'Output SGST',
                debit: 0,
                credit: newInvoice.sgstTotal,
                description: `Output SGST 9% on ${invoiceNumber}`,
              },
            ]
          : []),
        ...(newInvoice.igstTotal > 0
          ? [
              {
                id: `jel-${Date.now()}-5`,
                accountId: 'acc-2022',
                accountCode: '2022',
                accountName: 'Output IGST',
                debit: 0,
                credit: newInvoice.igstTotal,
                description: `Output IGST 18% on ${invoiceNumber}`,
              },
            ]
          : []),
        ...(newInvoice.freightCharges > 0
          ? [
              {
                id: `jel-${Date.now()}-6`,
                accountId: 'acc-4020',
                accountCode: '4020',
                accountName: 'Freight Charged to Customer',
                debit: 0,
                credit: newInvoice.freightCharges,
                description: `Freight charges on ${invoiceNumber}`,
              },
            ]
          : []),
      ],
    };

    // Update Customer Balance if unpaid
    const updatedCustomers = state.customers.map(c => {
      if (c.id === newInvoice.customerId) {
        return {
          ...c,
          currentBalance: c.currentBalance + (newInvoice.paymentStatus === 'PAID' ? 0 : newInvoice.grandTotal),
        };
      }
      return c;
    });

    setState(prev => ({
      ...prev,
      salesInvoices: [newInvoice, ...prev.salesInvoices],
      materials: updatedMaterials,
      batches: updatedBatches,
      inventoryTransactions: [...newTxns, ...prev.inventoryTransactions],
      journalEntries: [newJournalEntry, ...prev.journalEntries],
      customers: updatedCustomers,
    }));
  };

  // 4. CREATE PAYMENT / RECEIPT VOUCHER
  const createPaymentVoucher = (voucherData: any) => {
    const isPayment = voucherData.voucherType === 'PAYMENT';
    const prefix = isPayment ? 'PV-2026-' : 'RV-2026-';
    const voucherNumber = `${prefix}${String(state.paymentVouchers.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newVoucher: PaymentVoucher = {
      ...voucherData,
      id: `pv-${Date.now()}`,
      voucherNumber,
      date: voucherData.date || now.slice(0, 10),
    };

    // Update party balance
    let updatedSuppliers = [...state.suppliers];
    let updatedCustomers = [...state.customers];

    if (voucherData.partyType === 'SUPPLIER' && voucherData.partyId) {
      updatedSuppliers = updatedSuppliers.map(s => {
        if (s.id === voucherData.partyId) {
          return {
            ...s,
            currentBalance: Math.max(0, s.currentBalance - Number(voucherData.amount)),
          };
        }
        return s;
      });
    } else if (voucherData.partyType === 'CUSTOMER' && voucherData.partyId) {
      updatedCustomers = updatedCustomers.map(c => {
        if (c.id === voucherData.partyId) {
          return {
            ...c,
            currentBalance: Math.max(0, c.currentBalance - Number(voucherData.amount)),
          };
        }
        return c;
      });
    }

    setState(prev => ({
      ...prev,
      paymentVouchers: [newVoucher, ...prev.paymentVouchers],
      suppliers: updatedSuppliers,
      customers: updatedCustomers,
    }));
  };

  // 5. STOCK ADJUSTMENT
  const createStockAdjustment = (materialId: string, warehouseId: string, type: 'ADD' | 'SUBTRACT', qtyKg: number, reason: string) => {
    const now = new Date().toISOString();
    const updatedMaterials = [...state.materials];
    const matIdx = updatedMaterials.findIndex(m => m.id === materialId);
    if (matIdx === -1) return;

    const diff = type === 'ADD' ? qtyKg : -qtyKg;
    const newStock = Math.max(0, updatedMaterials[matIdx].currentStock + diff);
    updatedMaterials[matIdx] = {
      ...updatedMaterials[matIdx],
      currentStock: newStock,
    };

    const wh = state.warehouses.find(w => w.id === warehouseId) || state.warehouses[0];
    const txnNumber = `ITXN-${String(state.inventoryTransactions.length + 1).padStart(4, '0')}`;

    const newTxn: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      transactionNumber: txnNumber,
      transactionType: 'STOCK_ADJUSTMENT',
      materialId,
      materialName: updatedMaterials[matIdx].name,
      warehouseId: wh.id,
      warehouseName: wh.name,
      quantityKg: diff,
      balanceAfterKg: newStock,
      ratePerKg: updatedMaterials[matIdx].defaultPurchaseRate || updatedMaterials[matIdx].defaultSalesRate,
      totalValue: Math.abs(diff) * (updatedMaterials[matIdx].defaultPurchaseRate || 50),
      notes: `Manual Stock Adjustment (${type}): ${reason}`,
      createdAt: now,
    };

    setState(prev => ({
      ...prev,
      materials: updatedMaterials,
      inventoryTransactions: [newTxn, ...prev.inventoryTransactions],
    }));
  };

  // Reset to default demo state
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialERPState);
  };

  // 1-Click Golden 100 KG -> 97 KG Demo Simulation
  const runGolden100KgDemo = () => {
    setState(initialERPState);
  };

  return (
    <ERPContext.Provider
      value={{
        state,
        addCustomer,
        addSupplier,
        addMaterial,
        addWarehouse,
        addManufacturingUnit,
        addLabour,
        addExpenseCategory,
        createPurchaseInvoice,
        createManufacturingOrder,
        createSalesInvoice,
        createPaymentVoucher,
        createStockAdjustment,
        resetDemoData,
        runGolden100KgDemo,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
