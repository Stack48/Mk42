'use client'
import { motion } from 'framer-motion'
import {
  clipRevealVariants,
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  EASE_POWER3,
  VIEWPORT,
} from '@/lib/motion'

function MiniDash({ title, stats }: { title: string, stats: { label: string, value: string }[] }) {
  return (
    <motion.div
      variants={staggerItemVariants}
      whileHover={{
        y: -5,
        boxShadow: '0 16px 40px rgba(70,72,212,0.12)',
        borderColor: '#4648D4',
        transition: { duration: 0.28, ease: EASE_POWER3 },
      }}
      className="bg-white rounded-[10px] border border-gray-200 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] will-change-transform h-full min-h-[180px] flex flex-col"
    >
      <p className="text-[11px] font-semibold text-opus-ink mb-2.5 break-words">{title}</p>
      <div className="flex gap-2 flex-wrap">
        {stats.map(s => (
          <div key={s.label} className="flex-1 min-w-[80px] bg-gray-50 rounded-md px-2.5 py-2 border border-gray-200">
            <p className="text-[15px] font-extrabold text-opus-primary break-words">{s.value}</p>
            <p className="text-[9px] text-gray-500 mt-0.5 leading-snug break-words">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5">
        {['Dashboard', 'Mes Opportunités', 'Factures'].map((item, i) => (
          <div key={item} className={`flex items-center gap-1.5 py-[5px] ${i < 2 ? 'border-b border-gray-100' : ''}`}>
            <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${i === 0 ? 'bg-opus-primary' : 'bg-gray-300'}`} />
            <span className={`text-[10px] ${i === 0 ? 'text-opus-ink' : 'text-gray-500'}`}>{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const DASHBOARDS = [
  { title: 'Suivi automatisé', stats: [{ label: 'Commissions', value: '2 506€' }, { label: 'Total annuel', value: '204 850' }, { label: 'Montant AN', value: '204 850' }] },
  { title: 'Suivi automatisé', stats: [{ label: 'Commissions', value: '2 506€' }, { label: 'Annual', value: '204 850' }] },
  { title: 'Dashboard', stats: [{ label: 'Opportunités', value: '12' }, { label: 'Contrats', value: '8' }, { label: 'DAS2', value: '100%' }] },
  { title: 'Suivi automatisé', stats: [{ label: 'Montant', value: '2 506€' }, { label: 'Annual', value: '204 850' }] },
  { title: 'Suivi avancé', stats: [{ label: 'Total', value: '100%' }, { label: 'Validés', value: '14/14' }] },
]

export default function WhyOpus() {
  return (
    <section id="temoignages" className="bg-white py-[clamp(60px,7vw,90px)] px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto">

        <div className="text-center mb-12">
          <div className="overflow-hidden mb-3">
            <motion.h2
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="text-[clamp(24px,3.5vw,38px)] font-extrabold text-opus-ink tracking-[-0.02em] m-0"
            >
              Pourquoi vous allez adorer utiliser OPUS
            </motion.h2>
          </div>
          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            transition={{ delay: 0.15 }}
            className="text-[15px] text-gray-500 max-w-[520px] mx-auto leading-relaxed"
          >
            Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal.
            Parce que votre entreprise ne devrait pas se limiter à un contrôle fiscal.
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 items-stretch"
        >
          {DASHBOARDS.slice(0, 3).map((d, i) => (
            <MiniDash key={i} title={d.title} stats={d.stats} />
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch"
        >
          {DASHBOARDS.slice(3).map((d, i) => (
            <MiniDash key={i} title={d.title} stats={d.stats} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
