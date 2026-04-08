import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-provider';
import { ProtectedLayout } from '@/components/protected-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bling Orders - Centralizador de Pedidos',
  description: 'Dashboard para gerenciamento de pedidos Bling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
