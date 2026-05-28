const STATS = [
  { value: '500+', label: 'entreprises BTP' },
  { value: '12 000+', label: 'documents générés' },
  { value: '98%', label: 'satisfaction client' },
  { value: '0€', label: 'de redressement fiscal' },
]

export default function ProofStrip() {
  return (
    <section style={{
      backgroundColor: 'var(--opus-bg-tint)',
      borderTop: '1px solid var(--opus-border)',
      borderBottom: '1px solid var(--opus-border)',
      padding: '36px 24px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '32px',
        textAlign: 'center',
      }}>
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <div style={{
              fontSize: 'clamp(28px, 3.5vw, 38px)',
              fontWeight: 800,
              color: 'var(--opus-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              fontFamily: 'var(--font-rubik)',
            }}>
              {value}
            </div>
            <div style={{
              marginTop: '6px',
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--opus-muted)',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
