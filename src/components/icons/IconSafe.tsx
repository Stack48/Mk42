export default function IconSafe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="2" y="4" width="16" height="14" rx="2" />
      <circle cx="10" cy="11" r="2.5" />
      <path d="M2 8h16" />
    </svg>
  )
}
