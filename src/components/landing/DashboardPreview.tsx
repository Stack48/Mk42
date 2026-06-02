'use client'
import { motion } from 'framer-motion'

const primary = '#4648D4'

// ── Slot machine pour les KPI ──────────────────────────────────────────────────
const KPI_REEL_H = 20   // px par slot (font 16px + 2px de respiration)
const KPI_DIGITS  = '0123456789'
const KPI_LAPS    = 2   // 2 rotations suffisent, plus rapide

// Démarre en même temps que l'animation d'entrée du dashboard (delay: 0.7 dans TiltDashboard)
const BASE_DELAY  = 0.7

function KpiReel({ digit, totalDelay }: { digit: string; totalDelay: number }) {
  const target = parseInt(digit)
  const finalY  = -((KPI_LAPS * 10 + target) * KPI_REEL_H)

  return (
    <span style={{
      display: 'inline-block',
      width: 11,              // largeur fixe identique pour tous les chiffres
      height: KPI_REEL_H,
      overflow: 'hidden',
      verticalAlign: 'bottom',
      flexShrink: 0,
    }}>
      <motion.span
        style={{ display: 'flex', flexDirection: 'column', willChange: 'transform' }}
        initial={{ y: 0 }}
        animate={{ y: finalY }}
        transition={{
          duration: 0.72,
          ease: [0.04, 0.55, 0.12, 1.0],
          delay: totalDelay,
        }}
      >
        {Array.from({ length: KPI_LAPS + 1 }).flatMap((_, lap) =>
          KPI_DIGITS.split('').map(d => (
            <span key={`${lap}${d}`} style={{
              display: 'block',
              width: 11,
              height: KPI_REEL_H,
              lineHeight: `${KPI_REEL_H}px`,
              fontWeight: 700,
              fontSize: 16,
              color: '#111',
              userSelect: 'none',
              textAlign: 'center',
            }}>
              {d}
            </span>
          ))
        )}
      </motion.span>
    </span>
  )
}

// Valeur KPI complète — chiffres = rouleaux, reste = statique
function KpiValue({ value, kpiIndex }: { value: string; kpiIndex: number }) {
  const kpiBase = BASE_DELAY + kpiIndex * 0.07
  let digitIdx  = 0

  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end' }}>
      {value.split('').map((char, i) => {
        if (/\d/.test(char)) {
          const totalDelay = kpiBase + digitIdx * 0.055
          digitIdx++
          return <KpiReel key={i} digit={char} totalDelay={totalDelay} />
        }
        // espace, €, tout le reste → fondu simple après la fin des rouleaux
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: kpiBase + 0.05, duration: 0.2 }}
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: '#111',
              lineHeight: `${KPI_REEL_H}px`,
            }}
          >
            {char}
          </motion.span>
        )
      })}
    </span>
  )
}

// ── KPI data ───────────────────────────────────────────────────────────────────
const KPIS = [
  { label: 'Commissions',  value: '2 506€'   },
  { label: 'Total annuel', value: '204 850€'  },
  { label: 'Apporteurs',   value: '8'         },
  { label: 'Documents',    value: '14'        },
]

// ── DashboardPreview ───────────────────────────────────────────────────────────
export default function DashboardPreview() {
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid #E5E7EB',
      background: '#fff',
    }}>
      {/* Browser bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FC5F57', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FDBC2C', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#25CC40', display: 'inline-block' }} />
        <div style={{ flex: 1, marginLeft: 8, background: '#fff', borderRadius: 5, padding: '3px 10px', fontSize: 11, color: '#9CA3AF', border: '1px solid #E5E7EB' }}>
          app.opus-btp.fr/dashboard
        </div>
      </div>

      {/* Dashboard layout */}
      <div style={{ display: 'flex', minHeight: 420 }}>

        {/* Sidebar */}
        <div style={{ width: 180, background: '#F9FAFB', borderRight: '1px solid #E5E7EB', padding: '16px 0', flexShrink: 0 }}>
          <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #E5E7EB', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Opus</span>
          </div>
          {[
            { label: 'Tableau de bord', active: true },
            { label: 'Mes Opportunités', active: false },
            { label: 'Factures',         active: false },
            { label: 'Contrats',         active: false },
            { label: 'Paramètres',       active: false },
          ].map(item => (
            <div key={item.label} style={{
              padding: '8px 16px', fontSize: 12, fontWeight: item.active ? 600 : 400,
              color: item.active ? primary : '#6B7280',
              background: item.active ? '#EEEEFF' : 'transparent',
              borderLeft: item.active ? `3px solid ${primary}` : '3px solid transparent',
              cursor: 'default',
            }}>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '20px 24px', background: '#fff', overflow: 'hidden' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Tableau de bord</p>

          {/* KPI row — machine à sous */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {KPIS.map((k, kpiIndex) => (
              <div key={k.label} style={{
                background: '#F9FAFB', borderRadius: 8,
                padding: '12px 14px', border: '1px solid #E5E7EB',
              }}>
                <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>{k.label}</p>
                <KpiValue value={k.value} kpiIndex={kpiIndex} />
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Actions */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Actions classées</p>
              {['Contrat Martin', 'DAS2 Dupont', 'Facture #124'].map((item, i) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: ['#25CC40','#4648D4','#FDBC2C'][i], flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#374151', flex: 1 }}>{item}</span>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>Aujourd&apos;hui</span>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Dernières transactions</p>
              {[
                { name: 'M. Martin',    amount: '1 200€' },
                { name: 'Mme Bernard',  amount: '850€'   },
                { name: 'SCI Lebrun',   amount: '3 400€' },
              ].map((t, i) => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
                  <span style={{ fontSize: 11, color: '#374151' }}>{t.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#111' }}>{t.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
