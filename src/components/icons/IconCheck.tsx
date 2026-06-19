export default function IconCheck({ className, stroke = 'white' }: { className?: string; stroke?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}
