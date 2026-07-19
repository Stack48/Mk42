import Link from 'next/link'

type Props = {
  page: number
  totalPages: number
  searchParams: Record<string, string>
}

function buildHref(params: Record<string, string>, page: number) {
  const p = new URLSearchParams(params)
  p.set('page', String(page))
  return `/discovery?${p.toString()}`
}

export function DiscoveryPagination({ page, totalPages, searchParams }: Props) {
  if (totalPages <= 1) return null

  const prevHref = buildHref(searchParams, page - 1)
  const nextHref = buildHref(searchParams, page + 1)

  return (
    <div className="flex items-center justify-center gap-4 pt-6">
      {page > 1 ? (
        <Link
          href={prevHref}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Précédent
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#D1D5DB] border border-[#F3F4F6] rounded-lg cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Précédent
        </span>
      )}

      <span className="text-sm text-[#6B7280]">
        Page {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={nextHref}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
        >
          Suivant
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#D1D5DB] border border-[#F3F4F6] rounded-lg cursor-not-allowed">
          Suivant
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </div>
  )
}
