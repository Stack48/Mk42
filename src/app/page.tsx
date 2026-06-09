import type { Metadata } from 'next'
import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import WhyOpus from '@/components/landing/WhyOpus'
import Testimonials from '@/components/landing/Testimonials'
import Pricing from '@/components/landing/Pricing'
import Faq from '@/components/landing/Faq'
import Footer from '@/components/landing/Footer'
import ScrollReveal from '@/components/landing/ScrollReveal'

export const metadata: Metadata = {
  title: "Opus — Simplifiez vos commissions d'apporteurs d'affaires BTP",
  description:
    "Contrats légaux, factures, DAS2 et coffre-fort automatisés. Évitez les redressements fiscaux et conformez-vous en 10 minutes.",
  openGraph: {
    title: "Opus — Simplifiez vos commissions d'apporteurs d'affaires BTP",
    description: "Contrats légaux, factures, DAS2 et coffre-fort automatisés. Évitez les redressements fiscaux.",
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <WhyOpus />
        <Testimonials />
        <Pricing />
        <ScrollReveal delay={0.05}>
          <Faq />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  )
}
