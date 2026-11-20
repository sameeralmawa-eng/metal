import type { Metadata } from 'next';
import './globals.css';
import { ERPProvider } from '@/context/ERPContext';

export const metadata: Metadata = {
  title: 'Apex Metal & Rolling Mills ERP | White & Blue Glass Edition',
  description: 'Production-ready Metal Manufacturing ERP for Melting & Rolling operations with automatic weight loss calculation, batch traceability, GST billing, and double-entry accounting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <html lang="en">
          <body className="bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40 text-slate-900 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
            <ERPProvider>{children}</ERPProvider>
          </body>
        </html>
        );
}
