'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { accepterOpportunite, refuserOpportunite } from '@/lib/actions/opportunite'

export default function ActionButtons({ opportuniteId }: { opportuniteId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'refuse' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMontantForm, setShowMontantForm] = useState(false)
  const [montant, setMontant] = useState('')

  const handleConfirmerAcceptation = async () => {
    const montantNumber = Number(montant)
    if (!montant || montantNumber <= 0) {
      setError('Le montant doit être positif.')
      return
    }

    setLoading('accept')
    setError(null)
    const result = await accepterOpportunite(opportuniteId, montantNumber)
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

      {showMontantForm ? (
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min="0"
            step="1"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="Montant estimé (€)"
            autoFocus
            className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm"
            disabled={loading !== null}
          />
          <button
            type="button"
            onClick={handleConfirmerAcceptation}
            disabled={loading !== null}
            className="py-2.5 px-6 bg-[#4648D4] text-white rounded-lg text-sm font-semibold hover:bg-[#3533B0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'accept' ? 'En cours…' : 'Confirmer'}
          </button>
        </div>
      ) : (
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
            onClick={() => setShowMontantForm(true)}
            disabled={loading !== null}
            className="flex-1 py-2.5 px-6 bg-[#4648D4] text-white rounded-lg text-sm font-semibold hover:bg-[#3533B0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accepter
          </button>
        </div>
      )}
    </div>
  )
}
