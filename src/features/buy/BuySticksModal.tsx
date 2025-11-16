import { useState } from 'react'
import type { Game } from '@/entities/game'
import { boardsRepo } from '@/shared/boardsRepo'

interface BuySticksModalProps {
  isOpen: boolean
  game: Game | null
  onClose(): void
  onPurchaseSuccess(boardId: string, purchasedStickIndexes: number[]): void
}

export default function BuySticksModal({
  isOpen,
  game,
  onClose,
  onPurchaseSuccess,
}: BuySticksModalProps) {
  const [buyerName, setBuyerName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen || !game) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const trimmedName = buyerName.trim()
    if (!trimmedName) {
      setError('Please enter your name.')
      return
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError('Quantity must be at least 1.')
      return
    }

    try {
      setLoading(true)
      const result = await boardsRepo.buySticksForGame(game.id, trimmedName, quantity)
      onPurchaseSuccess(result.board.id, result.purchasedStickIndexes)
    } catch (err) {
      console.error(err)
      setError('Unable to complete purchase. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value)) return
    const clamped = Math.max(1, Math.min(100, value))
    setQuantity(clamped)
  }

  const formattedDate = new Date(game.eventDateTime).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (loading) return
          if (event.currentTarget === event.target) onClose()
        }}
      />

      {/* modal card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Buy Sticks</h2>
            <p className="text-xs text-slate-400">
              {game.awayTeam} @ {game.homeTeam} • {game.league ?? game.sport} • {formattedDate}
            </p>
          </div>
          <button
            type="button"
            onClick={() => (!loading ? onClose() : undefined)}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            disabled={loading}
          >
            Close
          </button>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor="buyer-name">
              Your name
            </label>
            <input
              id="buyer-name"
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={buyerName}
              onChange={(event) => setBuyerName(event.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Quantity</label>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-base text-slate-200 transition hover:border-indigo-400 hover:text-indigo-200 disabled:opacity-40"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={loading || quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(event) => handleQuantityChange(Number(event.target.value))}
                className="h-9 w-16 rounded-lg border border-slate-700 bg-slate-950/70 text-center text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-base text-slate-200 transition hover:border-indigo-400 hover:text-indigo-200 disabled:opacity-40"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={loading || quantity >= 100}
              >
                +
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">
              Sticks are assigned to available spots on the board for this game.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Processing…' : 'Confirm Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
