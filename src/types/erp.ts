export type MaterialCategory = 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'RECOVERABLE_SCRAP';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export type MfgStatus = 'DRAFT' | 'IN_MELTING' | 'IN_ROLLING' | 'COMPLETED' | 'CANCELLED';

export type LabourRateType = 'PER_KG' | 'PER_DAY' | 'PER_BATCH' | 'FIXED';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface CompanySettings {
  id: string;
  companyName: string;
  legalName: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  expectedLossMin: number; // e.g. 2.0%
  expectedLossMax: number; // e.g. 3.5%
  defaultMeltingLossPct: number; // e.g. 2.0%
  defaultRollingLossPct: number; // e.g. 1.0%
  financialYear: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  gstin: string;
  billingAddress: string;
  shippingAddress: string;
  state: string;
  stateCode: string;
  openingBalance: number;
  currentBalance: number;
  paymentTerms: string;
  creditLimit: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  gstin: string;
  billingAddress: string;
  shippingAddress: string;
  state: string;
  stateCode: string;
  openingBalance: number;
  currentBalance: number;
  paymentTerms: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  grade: string;
  uom: string; // 'KG' | 'TON'
  description: string;
  defaultPurchaseRate: number;
  defaultSalesRate: number;
  minStockLevel: number;
  currentStock: number; // Cached in KG
  hsnCode: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  isDefault: boolean;
}

export interface ManufacturingUnit {
  id: string;
  code: string;
  name: string;
  capacityKgPerDay: number;
  supervisor: string;
  furnaceDetails: string;
  rollingDetails: string;
}

export interface Labour {
  id: string;
  code: string;
  name: string;
  category: string; // 'MELTER' | 'ROLLER' | 'FITTER' | 'HELPER' | 'SUPERVISOR'
  defaultRateType: LabourRateType;
  defaultRate: number; // Rate in INR
  phone: string;
}

export interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface TaxRate {
  id: string;
  name: string;
  hsnCode: string;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface MaterialBatch {
  id: string;
  batchNumber: string;
  materialId: string;
  materialName: string;
  warehouseId: string;
  warehouseName: string;
  initialQtyKg: number;
  availableQtyKg: number;
  ratePerKg: number;
  sourceType: 'PURCHASE' | 'MANUFACTURING_OUTPUT' | 'SCRAP_RECOVERY' | 'OPENING';
  sourceReference: string;
  mfgDate: string;
}

export interface InventoryTransaction {
  id: string;
  transactionNumber: string;
  transactionType:
    | 'PURCHASE_INWARD'
    | 'MFG_CONSUMPTION'
    | 'MFG_OUTPUT'
    | 'MFG_SCRAP'
    | 'SALES_OUTWARD'
    | 'PURCHASE_RETURN'
    | 'SALES_RETURN'
    | 'STOCK_ADJUSTMENT'
    | 'TRANSFER';
  materialId: string;
  materialName: string;
  batchId?: string;
  batchNumber?: string;
  warehouseId: string;
  warehouseName: string;
  quantityKg: number; // positive for inward, negative for outward
  balanceAfterKg: number;
  ratePerKg: number;
  totalValue: number;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  materialId: string;
  materialName: string;
  grade: string;
  quantityKg: number;
  ratePerKg: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierGstin: string;
  supplierState: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  paymentTerms: string;
  subtotal: number;
  discount: number;
  freightCharges: number;
  otherCharges: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  notes?: string;
  items: PurchaseInvoiceItem[];
  isReturned?: boolean;
}

export interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  productionDate: string;
  manufacturingUnitId: string;
  manufacturingUnitName: string;
  status: MfgStatus;

  // Raw Material Input
  inputBatchId: string;
  inputBatchNumber: string;
  inputMaterialId: string;
  inputMaterialName: string;
  inputMaterialGrade: string;
  inputWeightKg: number; // e.g. 100 KG
  inputRatePerKg: number; // e.g. 100 INR/KG
  inputMaterialCost: number; // e.g. 10,000 INR

  // Melting Process Details
  furnaceNumber: string;
  heatNumber: string;
  meltingTempCelsius: number;
  meltingStartTime?: string;
  meltingEndTime?: string;

  // Rolling Process Details
  rollingMillNumber: string;
  rollingPasses: number;
  rollingStartTime?: string;
  rollingEndTime?: string;

  // Output Product
  outputMaterialId: string;
  outputMaterialName: string;
  outputMaterialGrade: string;
  outputWeightKg: number; // e.g. 97 KG
  outputBatchNumber?: string;
  outputWarehouseId: string;

  // Recoverable Scrap
  recoverableScrapWeightKg: number; // e.g. 0 KG

  // Weight Loss Calculation (The Critical Requirement)
  processLossKg: number; // Input - Output - Scrap (e.g. 100 - 97 - 0 = 3 KG)
  lossPercentage: number; // (Loss / Input) * 100 (e.g. 3.0%)
  expectedLossMinPct: number; // 2.0%
  expectedLossMaxPct: number; // 3.5%
  isLossExceeded: boolean; // if lossPercentage > expectedLossMaxPct
  lossExceededApproved: boolean;
  lossExceededApprover?: string;
  lossRemarks: string;

  // Manufacturing Overheads & Labour
  labourCost: number;
  electricityCost: number;
  fuelCost: number;
  otherCost: number;
  totalOverheadsCost: number;
  totalManufacturingCost: number; // inputMaterialCost + totalOverheadsCost
  finishedGoodsCostPerKg: number; // totalManufacturingCost / outputWeightKg

  // Stages breakdown
  meltingOutputKg?: number;
  meltingLossKg?: number;
  rollingLossKg?: number;

  remarks?: string;
  completedAt?: string;
}

export interface LabourCostEntry {
  id: string;
  manufacturingOrderId?: string;
  manufacturingOrderNumber?: string;
  labourId?: string;
  labourName: string;
  labourCategory: string;
  processType: 'MELTING' | 'ROLLING' | 'GENERAL';
  rateType: LabourRateType;
  workersCount: number;
  workingUnits: number; // KG, hours, or days
  rate: number;
  totalAmount: number;
  paymentDate: string;
  paymentStatus: 'PAID' | 'PENDING';
  remarks?: string;
}

export interface SalesInvoiceItem {
  id: string;
  materialId: string;
  materialName: string;
  batchId?: string;
  batchNumber?: string;
  grade: string;
  quantityKg: number;
  ratePerKg: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  customerState: string;
  customerBillingAddress: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  freightCharges: number;
  otherCharges: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  notes?: string;
  items: SalesInvoiceItem[];
  isReturned?: boolean;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subCategory: string;
  balance: number;
  isSystem: boolean;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  entityType?: 'SUPPLIER' | 'CUSTOMER' | 'LABOUR';
  entityId?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  referenceType: 'PURCHASE' | 'SALES' | 'MANUFACTURING' | 'PAYMENT' | 'RECEIPT' | 'ADJUSTMENT' | 'MANUAL';
  referenceId?: string;
  referenceNumber?: string;
  narration: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalEntryLine[];
}

export interface PaymentVoucher {
  id: string;
  voucherNumber: string;
  voucherType: 'PAYMENT' | 'RECEIPT';
  partyType: 'SUPPLIER' | 'CUSTOMER' | 'EXPENSE' | 'LABOUR';
  partyId?: string;
  partyName: string;
  paymentMode: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI';
  amount: number;
  date: string;
  bankAccount: string;
  referenceNo: string;
  remarks: string;
}

export interface ERPState {
  company: CompanySettings;
  customers: Customer[];
  suppliers: Supplier[];
  materials: Material[];
  warehouses: Warehouse[];
  manufacturingUnits: ManufacturingUnit[];
  labours: Labour[];
  expenseCategories: ExpenseCategory[];
  taxRates: TaxRate[];
  batches: MaterialBatch[];
  inventoryTransactions: InventoryTransaction[];
  purchaseInvoices: PurchaseInvoice[];
  manufacturingOrders: ManufacturingOrder[];
  labourCostEntries: LabourCostEntry[];
  salesInvoices: SalesInvoice[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  paymentVouchers: PaymentVoucher[];
}
