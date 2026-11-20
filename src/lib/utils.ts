import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatKg(weight: number | null | undefined): string {
  if (weight === null || weight === undefined || isNaN(weight)) return '0.00 KG';
  return `${Number(weight).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function numberToWordsIndian(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Zero Rupees Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return single[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    const t = Math.floor(n / 10);
    const u = n % 10;
    return (tens[t] + (u > 0 ? ' ' + single[u] : '')).trim();
  }

  function convertThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    let res = '';
    if (h > 0) {
      res += single[h] + ' Hundred';
      if (rem > 0) res += ' and ';
    }
    if (rem > 0) {
      res += convertTwoDigits(rem);
    }
    return res.trim();
  }

  const [rupeesPart, paisePart] = amount.toFixed(2).split('.').map(Number);

  let num = rupeesPart;
  if (num === 0) return 'Zero Rupees';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundredAndBelow = num;

  let words = '';

  if (crore > 0) {
    words += convertTwoDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (hundredAndBelow > 0) {
    words += convertThreeDigits(hundredAndBelow);
  }

  words = words.trim() + ' Rupees';

  if (paisePart > 0) {
    words += ' and ' + convertTwoDigits(paisePart) + ' Paise';
  }

  return words + ' Only';
}
