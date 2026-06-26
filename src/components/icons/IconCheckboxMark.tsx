export default function IconCheckboxMark({ className }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 m-auto w-3 h-3 text-white pointer-events-none${className ? ` ${className}` : ''}`}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 6l3 3 5-5" />
    </svg>
  )
}
