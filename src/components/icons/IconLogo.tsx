export default function IconLogo({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2" fill="white" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.55" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.55" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1.2" fill="white" />
    </svg>
  )
}
