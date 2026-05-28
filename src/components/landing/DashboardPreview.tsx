export default function DashboardPreview() {
  const primary = '#4648D4'

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
            { label: 'Factures', active: false },
            { label: 'Contrats', active: false },
            { label: 'Paramètres', active: false },
          ].map(item => (
            <div key={item.label} style={{
              padding: '8px 16px', fontSize: 12, fontWeight: item.active ? 600 : 400,
              color: item.active ? primary : '#6B7280',
              background: item.active ? '#EEEEFF' : 'transparent',
              borderLeft: item.active ? `3px solid ${primary}` : '3px solid transparent',
              cursor: 'default',
            }}>{item.label}</div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '20px 24px', background: '#fff', overflow: 'hidden' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Tableau de bord</p>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Commissions', value: '2 506€' },
              { label: 'Total annuel', value: '204 850€' },
              { label: 'Apporteurs', value: '8' },
              { label: 'Documents', value: '14' },
            ].map(k => (
              <div key={k.label} style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>{k.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{k.value}</p>
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
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>Aujourd'hui</span>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Dernières transactions</p>
              {[
                { name: 'M. Martin', amount: '1 200€' },
                { name: 'Mme Bernard', amount: '850€' },
                { name: 'SCI Lebrun', amount: '3 400€' },
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
