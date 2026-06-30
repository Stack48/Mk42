'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { accepterOpportunite, refuserOpportunite } from '@/lib/actions/opportunite'

export default function ActionButtons({ opportuniteId }: { opportuniteId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'refuse' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAccepter = async () => {
    setLoading('accept')
    setError(null)
    const result = await accepterOpportunite(opportuniteId)
    if (result.success) {
      router.push('/opportunites')
      router.refresh()
    } else {
      setError(result.error)
      setLoading(null)
    }
  }

  const handleRefuser = async () => {
    setLoading('refuse')
    setError(null)
    const result = await refuserOpportunite(opportuniteId)
    if (result.success) {
      router.push('/opportunites')
      router.refresh()
    } else {
      setError(result.error)
      setLoading(null)
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
      {error && (
        <div className="mb-4 px-4 py-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-sm text-[#B91C1C]">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleRefuser}
          disabled={loading !== null}
          className="flex-1 py-2.5 px-6 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] hover:border-[#FECACA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'refuse' ? 'En cours…' : 'Refuser'}
        </button>
        <button
          type="button"
          onClick={handleAccepter}
          disabled={loading !== null}
          className="flex-1 py-2.5 px-6 bg-[#4648D4] text-white rounded-lg text-sm font-semibold hover:bg-[#3533B0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'accept' ? 'En cours…' : 'Accepter'}
        </button>
      </div>
    </div>
  )
}
