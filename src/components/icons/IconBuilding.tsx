export default function IconBuilding({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <path d="M6 6h.5M9.5 6H10M6 9h.5M9.5 9H10M6 12h.5M9.5 12H10" />
      <path d="M2 5h12" />
    </svg>
  )
}
