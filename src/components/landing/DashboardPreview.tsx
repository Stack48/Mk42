'use client'
import { motion } from 'framer-motion'

const KPI_REEL_H = 20
const KPI_DIGITS  = '0123456789'
const KPI_LAPS    = 2
const BASE_DELAY  = 0.7

function KpiReel({ digit, totalDelay }: { digit: string; totalDelay: number }) {
  const target = parseInt(digit)
  const finalY  = -((KPI_LAPS * 10 + target) * KPI_REEL_H)

  return (
    <span className="inline-block w-[11px] overflow-hidden align-bottom shrink-0" style={{ height: KPI_REEL_H }}>
      <motion.span
        className="flex flex-col will-change-transform"
        initial={{ y: 0 }}
        animate={{ y: finalY }}
        transition={{ duration: 0.72, ease: [0.04, 0.55, 0.12, 1.0], delay: totalDelay }}
      >
        {Array.from({ length: KPI_LAPS + 1 }).flatMap((_, lap) =>
          KPI_DIGITS.split('').map(d => (
            <span key={`${lap}${d}`} className="block w-[11px] font-bold text-base text-opus-ink select-none text-center" style={{ height: KPI_REEL_H, lineHeight: `${KPI_REEL_H}px` }}>
              {d}
            </span>
          ))
        )}
      </motion.span>
    </span>
  )
}

function KpiValue({ value, kpiIndex }: { value: string; kpiIndex: number }) {
  const kpiBase = BASE_DELAY + kpiIndex * 0.07
  let digitIdx  = 0

  return (
    <span className="inline-flex items-end">
      {value.split('').map((char, i) => {
        if (/\d/.test(char)) {
          const totalDelay = kpiBase + digitIdx * 0.055
          digitIdx++
          return <KpiReel key={i} digit={char} totalDelay={totalDelay} />
        }
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: kpiBase + 0.05, duration: 0.2 }}
            className="font-bold text-base text-opus-ink"
            style={{ lineHeight: `${KPI_REEL_H}px` }}
          >
            {char}
          </motion.span>
        )
      })}
    </span>
  )
}

const KPIS = [
  { label: 'Commissions',  value: '2 506€'  },
  { label: 'Total annuel', value: '204 850€' },
  { label: 'Apporteurs',   value: '8'        },
  { label: 'Documents',    value: '14'       },
]

const NAV_ITEMS = [
  { label: 'Tableau de bord', active: true  },
  { label: 'Mes Opportunités', active: false },
  { label: 'Factures',         active: false },
  { label: 'Contrats',         active: false },
  { label: 'Paramètres',       active: false },
]

export default function DashboardPreview() {
  return (
    <div className="rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] border border-gray-200 bg-white w-full">

      <div className="flex items-center gap-1.5 px-3 sm:px-3.5 py-[10px] bg-gray-50 border-b border-gray-200">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FC5F57] inline-block shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FDBC2C] inline-block shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#25CC40] inline-block shrink-0" />
        <div className="flex-1 ml-2 bg-white rounded-[5px] px-2.5 py-[3px] text-[10px] sm:text-[11px] text-gray-400 border border-gray-200 truncate min-w-0">
          app.opus-btp.fr/dashboard
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:min-h-[420px]">

        <div className="md:w-[180px] bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 py-3 md:py-4 shrink-0">
          <div className="px-4 pb-3 md:pb-4 border-b border-gray-200 md:mb-2">
            <span className="font-bold text-[15px] text-opus-ink">Opus</span>
          </div>
          <div className="flex md:block overflow-x-auto md:overflow-visible">
            {NAV_ITEMS.map(item => (
              <div
                key={item.label}
                className={`px-3 md:px-4 py-2 text-[11px] md:text-xs cursor-default whitespace-nowrap border-l-0 md:border-l-[3px] border-b-2 md:border-b-0 ${item.active ? 'font-semibold text-opus-primary bg-opus-primary-xl border-b-opus-primary md:border-l-opus-primary' : 'font-normal text-gray-500 bg-transparent border-b-transparent md:border-l-transparent'}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-3.5 sm:p-5 bg-white overflow-hidden min-w-0">
          <p className="text-sm sm:text-base font-bold text-opus-ink mb-3 sm:mb-4">Tableau de bord</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            {KPIS.map((k, kpiIndex) => (
              <div key={k.label} className="bg-gray-50 rounded-lg px-3 sm:px-3.5 py-2.5 sm:py-3 border border-gray-200 min-w-0">
                <p className="text-[10px] text-gray-400 mb-1 truncate">{k.label}</p>
                <KpiValue value={k.value} kpiIndex={kpiIndex} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 mb-2.5">Actions classées</p>
              {['Contrat Martin', 'DAS2 Dupont', 'Facture #124'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 py-[7px] ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ['#25CC40','#4648D4','#FDBC2C'][i] }} />
                  <span className="text-[11px] text-gray-700 flex-1 truncate">{item}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">Aujourd&apos;hui</span>
                </div>
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 mb-2.5">Dernières transactions</p>
              {[
                { name: 'M. Martin',   amount: '1 200€' },
                { name: 'Mme Bernard', amount: '850€'   },
                { name: 'SCI Lebrun',  amount: '3 400€' },
              ].map((t, i) => (
                <div key={t.name} className={`flex items-center justify-between gap-2 py-[7px] ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-[11px] text-gray-700 truncate">{t.name}</span>
                  <span className="text-[11px] font-semibold text-opus-ink shrink-0">{t.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
