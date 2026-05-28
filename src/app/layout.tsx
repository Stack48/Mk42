import type { Metadata } from 'next'
import { Rubik, DM_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-rubik',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Opus — Gestion des apporteurs d'affaires BTP",
  description:
    "Simplifiez la gestion de vos commissions d'apporteurs d'affaires. Documents légaux automatiques, conformité fiscale garantie.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${rubik.variable} ${dmMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
