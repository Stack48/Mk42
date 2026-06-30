import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import { Providers } from '@/components/providers'
import '@/styles/globals.css'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-rubik',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Opus — Simplifiez vos commissions d'apporteurs d'affaires BTP",
  description:
    "Contrats légaux, factures, DAS2 et coffre-fort automatisés. Évitez les redressements fiscaux.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={rubik.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
