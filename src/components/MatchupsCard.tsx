import { useMemo } from 'react'
import type { Game } from '@/entities/game'
import GameRow from '@/components/GameRow'

interface MatchupsCardProps {
  games: Game[]
  onBuy?(game: Game): void
}

export default function MatchupsCard({ games, onBuy }: MatchupsCardProps) {
  const displayGames = useMemo(
    () =>
      games
        .filter((game) => game.isPublished)
        .sort((a, b) => new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime()),
    [games],
  )

  return (
    <section className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-900/70">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-white">Available Matchups</h2>
        <p className="text-sm text-slate-400">Grab your sticks for the latest action.</p>
      </header>

      {displayGames.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
          No upcoming matchups are currently available. Please check back soon.
        </div>
      ) : (
        <ul className="max-h-[420px] list-none space-y-2 overflow-y-auto pr-2">
          {displayGames.map((game) => (
            <GameRow key={game.id} game={game} onBuy={onBuy} />
          ))}
        </ul>
      )}
    </section>
  )
}
