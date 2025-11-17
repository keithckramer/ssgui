import { useState } from 'react'
import type { Game } from '@/entities/game'

interface FinalizeGameFormProps {
  game: Game
  onSubmit(values: { homeScore: number; awayScore: number }): Promise<void> | void
  onCancel(): void
  disabled?: boolean
}

export default function FinalizeGameForm({ game, onSubmit, onCancel, disabled = false }: FinalizeGameFormProps) {
  const [homeScore, setHomeScore] = useState<number | ''>(game.homeScore ?? '')
  const [awayScore, setAwayScore] = useState<number | ''>(game.awayScore ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}

    if (homeScore === '' || Number.isNaN(homeScore)) nextErrors.homeScore = 'Home score is required'
    if (awayScore === '' || Number.isNaN(awayScore)) nextErrors.awayScore = 'Away score is required'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await onSubmit({
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
    })
  }

  const inputClassName =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Finalize {game.awayTeam} @ {game.homeTeam}</h3>
      <p className="text-sm text-slate-400">
        Post the final scores to complete this matchup. The winning number is calculated automatically. Finalized games are hidden
        from buyers.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="final-home-score" className="block text-sm font-medium text-slate-300">
            Home Score
          </label>
          <input
            id="final-home-score"
            type="number"
            className={inputClassName}
            value={homeScore}
            onChange={(event) => setHomeScore(event.target.value === '' ? '' : Number.parseInt(event.target.value, 10))}
            disabled={disabled}
          />
          {errors.homeScore ? <p className="text-xs text-red-400">{errors.homeScore}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="final-away-score" className="block text-sm font-medium text-slate-300">
            Away Score
          </label>
          <input
            id="final-away-score"
            type="number"
            className={inputClassName}
            value={awayScore}
            onChange={(event) => setAwayScore(event.target.value === '' ? '' : Number.parseInt(event.target.value, 10))}
            disabled={disabled}
          />
          {errors.awayScore ? <p className="text-xs text-red-400">{errors.awayScore}</p> : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
        >
          Finalize Game
        </button>
      </div>
    </form>
  )
}
