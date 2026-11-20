import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanySettings, SalesInvoice, PurchaseInvoice } from '@/types/erp';
import { formatCurrency, formatKg, formatDate, numberToWordsIndian } from './utils';

export function generateInvoicePDF(
  type: 'SALES' | 'PURCHASE',
  invoice: SalesInvoice | PurchaseInvoice,
  company: CompanySettings
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const isSales = type === 'SALES';

  // Colors
  const darkSteel = [15, 23, 42]; // #0f172a
  const furnaceOrange = [234, 88, 12]; // #ea580c
  const textDark = [30, 41, 59];
  const mutedText = [100, 116, 139];

  // Header Banner
  doc.setFillColor(darkSteel[0], darkSteel[1], darkSteel[2]);
  doc.rect(0, 0, 210, 36, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.companyName.toUpperCase(), 14, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.address}, ${company.city}, ${company.state} - ${company.pincode}`, 14, 20);
  doc.text(`GSTIN: ${company.gstin}  |  Phone: ${company.phone}  |  Email: ${company.email}`, 14, 25);

  // Invoice Title Badge
  doc.setFillColor(furnaceOrange[0], furnaceOrange[1], furnaceOrange[2]);
  doc.roundedRect(145, 8, 52, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(isSales ? 'TAX INVOICE' : 'PURCHASE VOUCHER', 148, 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Original for Recipient`, 148, 22);

  // Details Section (Invoice # and Party info)
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  // Left Column: Bill To / Supplier
  const partyName = isSales ? (invoice as SalesInvoice).customerName : (invoice as PurchaseInvoice).supplierName;
  const partyGstin = isSales ? (invoice as SalesInvoice).customerGstin : (invoice as PurchaseInvoice).supplierGstin;
  const partyState = isSales ? (invoice as SalesInvoice).customerState : (invoice as PurchaseInvoice).supplierState;

  doc.text(isSales ? 'Billed To (Customer):' : 'Supplier Details:', 14, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(partyName, 14, 50);
  doc.text(`GSTIN: ${partyGstin}`, 14, 55);
  doc.text(`Place of Supply: ${partyState}`, 14, 60);

  // Right Column: Invoice Details
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', 130, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 130, 50);
  doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, 130, 55);
  doc.text(`Payment Status: ${invoice.paymentStatus}`, 130, 60);
  if (invoice.dueDate) {
    doc.text(`Payment Due: ${formatDate(invoice.dueDate)}`, 130, 65);
  }

  // Items Table
  const tableData = invoice.items.map((item, idx) => {
    return [
      idx + 1,
      item.materialName,
      item.grade || 'Standard',
      `${item.quantityKg.toFixed(2)} KG`,
      `INR ${item.ratePerKg.toFixed(2)}`,
      `INR ${item.taxableAmount.toFixed(2)}`,
      item.cgstRate > 0 ? `${item.cgstRate}% (INR ${item.cgstAmount.toFixed(2)})` : '-',
      item.sgstRate > 0 ? `${item.sgstRate}% (INR ${item.sgstAmount.toFixed(2)})` : '-',
      item.igstRate > 0 ? `${item.igstRate}% (INR ${item.igstAmount.toFixed(2)})` : '-',
      `INR ${item.totalAmount.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: 72,
    head: [
      ['#', 'Material Description', 'Grade', 'Qty (KG)', 'Rate/KG', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total'],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 42 },
      2: { cellWidth: 24 },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 18, halign: 'right' },
      8: { cellWidth: 18, halign: 'right' },
      9: { cellWidth: 22, halign: 'right' },
    },
  });

  // Calculate position after table
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Amount in Words & Bank Info (Left Side)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in Words:', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(numberToWordsIndian(invoice.grandTotal), 14, finalY + 5, { maxWidth: 100 });

  doc.setFont('helvetica', 'bold');
  doc.text('Bank Transfer Details:', 14, finalY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank Name: ${company.bankName}  |  A/c: ${company.accountNumber}`, 14, finalY + 21);
  doc.text(`IFSC: ${company.ifscCode}  |  Branch: ${company.branch}`, 14, finalY + 26);

  // Totals Summary Box (Right Side)
  const boxX = 125;
  const boxY = finalY;
  const boxWidth = 72;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(boxX, boxY, boxWidth, 42, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal (Taxable):', boxX + 4, boxY + 7);
  doc.text(`INR ${invoice.subtotal.toFixed(2)}`, boxX + boxWidth - 4, boxY + 7, { align: 'right' });

  if (invoice.cgstTotal > 0) {
    doc.text('CGST Total:', boxX + 4, boxY + 13);
    doc.text(`INR ${invoice.cgstTotal.toFixed(2)}`, boxX + boxWidth - 4, boxY + 13, { align: 'right' });
  }

  if (invoice.sgstTotal > 0) {
    doc.text('SGST Total:', boxX + 4, boxY + 19);
    doc.text(`INR ${invoice.sgstTotal.toFixed(2)}`, boxX + boxWidth - 4, boxY + 19, { align: 'right' });
  }

  if (invoice.igstTotal > 0) {
    doc.text('IGST Total:', boxX + 4, boxY + 19);
    doc.text(`INR ${invoice.igstTotal.toFixed(2)}`, boxX + boxWidth - 4, boxY + 19, { align: 'right' });
  }

  if (invoice.freightCharges > 0) {
    doc.text('Freight / Delivery:', boxX + 4, boxY + 25);
    doc.text(`INR ${invoice.freightCharges.toFixed(2)}`, boxX + boxWidth - 4, boxY + 25, { align: 'right' });
  }

  // Grand Total Highlight
  doc.setFillColor(15, 23, 42);
  doc.rect(boxX, boxY + 30, boxWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('GRAND TOTAL:', boxX + 4, boxY + 38);
  doc.text(`INR ${invoice.grandTotal.toFixed(2)}`, boxX + boxWidth - 4, boxY + 38, { align: 'right' });

  // Signature Block
  const sigY = finalY + 54;
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Terms & Conditions: Material once inspected and dispatched is non-refundable. Subject to Pune jurisdiction.', 14, sigY);

  doc.setFont('helvetica', 'bold');
  doc.text(`For ${company.companyName}`, 145, sigY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text('[Authorized Signatory / Plant Manager]', 145, sigY + 24);

  // Save the PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
