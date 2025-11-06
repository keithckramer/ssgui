import { useEffect, useMemo, useState } from 'react'
import type { Game } from '@/entities/game'
import GameRow from '@/components/GameRow'

interface MatchupsCardProps {
  games: Game[]
}

export default function MatchupsCard({ games }: MatchupsCardProps) {
  const sortedGames = useMemo(
    () => [...games].sort((a, b) => new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime()),
    [games],
  )
  const [selectedId, setSelectedId] = useState<string | null>(sortedGames[0]?.id ?? null)

  useEffect(() => {
    if (sortedGames.length === 0) {
      setSelectedId(null)
      return
    }

    if (!sortedGames.some((game) => game.id === selectedId)) {
      setSelectedId(sortedGames[0]?.id ?? null)
    }
  }, [sortedGames, selectedId])

  const selectedGame = sortedGames.find((game) => game.id === selectedId) ?? null

  return (
    <section className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-900/70">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Available Matchups</h2>
          <p className="text-sm text-slate-400">Choose a matchup to view details and buy sticks.</p>
        </div>
        {selectedGame ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-right text-xs text-slate-300">
            <div className="font-semibold text-white">{selectedGame.awayTeam} @ {selectedGame.homeTeam}</div>
            <div>{new Date(selectedGame.eventDateTime).toLocaleString()}</div>
            {selectedGame.venue ? <div className="text-slate-500">{selectedGame.venue}</div> : null}
          </div>
        ) : null}
      </header>

      {sortedGames.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
          No upcoming matchups are currently available. Please check back soon.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-2">
            {sortedGames.map((game) => (
              <GameRow
                key={game.id}
                game={game}
                isSelected={selectedId === game.id}
                onSelect={() => setSelectedId(game.id)}
              />
            ))}
          </div>

          {selectedGame ? (
            <aside className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <div className="text-xs uppercase tracking-wide text-blue-300">Sport</div>
                  <div className="text-lg font-semibold text-white">{selectedGame.sport}</div>
                </div>
                {selectedGame.league ? (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-blue-300">League</div>
                    <div className="text-white">{selectedGame.league}</div>
                  </div>
                ) : null}
                <div>
                  <div className="text-xs uppercase tracking-wide text-blue-300">Matchup</div>
                  <div className="text-white">
                    {selectedGame.awayTeam} <span className="text-slate-500">at</span> {selectedGame.homeTeam}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-blue-300">Date &amp; Time</div>
                  <div className="text-white">
                    {new Date(selectedGame.eventDateTime).toLocaleString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                {selectedGame.venue ? (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-blue-300">Venue</div>
                    <div className="text-white">{selectedGame.venue}</div>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="mt-6 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
              >
                Buy Sticks
              </button>
            </aside>
          ) : null}
        </div>
      )}
    </section>
  )
}
