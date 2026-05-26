import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Opus — Gestion des apporteurs d'affaires BTP",
  description: "Légalisez et automatisez vos commissions d'apporteurs d'affaires.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr'>
      <body className='antialiased'>{children}</body>
    </html>
  );
}
