import Image from 'next/image'

export default function DashboardPreview() {
  return (
    <div style={{
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(34,116,165,0.18), 0 8px 24px rgba(34,116,165,0.08)',
      border: '1px solid var(--opus-border)',
      background: '#fff',
    }}>
      {/* Browser chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '10px 14px',
        background: '#F1F5F9',
        borderBottom: '1px solid #E2EBF3',
      }}>
        <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#FC5F57', display: 'inline-block' }} />
        <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#FDBC2C', display: 'inline-block' }} />
        <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#25CC40', display: 'inline-block' }} />
        <div style={{
          flex: 1, marginLeft: '8px',
          background: 'white',
          borderRadius: '5px',
          padding: '4px 10px',
          fontSize: '11px',
          color: '#8EA3B3',
          fontFamily: 'var(--font-dm-mono, monospace)',
          border: '1px solid #DDE8F0',
        }}>
          app.opus-btp.fr/dashboard
        </div>
      </div>

      {/* Dashboard screenshot */}
      <Image
        src="/dashboard-preview.png"
        alt="Dashboard Opus — tableau de bord apporteurs d'affaires"
        width={1240}
        height={880}
        style={{ display: 'block', width: '100%', height: 'auto' }}
        priority
      />
    </div>
  )
}
