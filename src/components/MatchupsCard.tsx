import { useEffect, useMemo, useState } from 'react'

import GameRow from '@/components/GameRow'
import type { Game } from '@/entities/game'
import type { Board } from '@/entities/board'
import { getBoardWinner } from '@/shared/boardWinners'
import { boardsRepo } from '@/shared/boardsRepo'

function GameBoardsSection({ game, refreshTrigger }: { game: Game; refreshTrigger?: unknown }) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const result = await boardsRepo.getBoardsForGame(game.id)
        if (!cancelled) {
          setBoards(result)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [game.id, refreshTrigger])

  if (loading) {
    return (
      <div className="px-4 pb-4 text-xs text-slate-400">
        Loading boards…
      </div>
    )
  }

  if (boards.length === 0) {
    return (
      <div className="px-4 pb-4 text-xs text-slate-400">
        No boards for this game yet. Be the first to create one by buying a stick.
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <div className="space-y-3">
        {boards.map((board) => {
          const winner = getBoardWinner(game, board)

          return (
            <div
              key={board.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-slate-100">
                  Board #{board.boardNumber}
                </span>
                <span>
                  Status:{' '}
                  <span className="uppercase tracking-wide text-[0.65rem] text-slate-400">
                    {game.status}
                  </span>
                </span>
              </div>

              {/* Show winning info if game has a winningNumber */}
              {game.winningNumber !== undefined && game.winningNumber !== null && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[0.7rem]">
                  <span className="text-slate-300">
                    Winning number:{' '}
                    <span className="font-semibold text-indigo-300">
                      {game.winningNumber}
                    </span>
                  </span>
                  {winner && (
                    <span className="text-slate-300">
                      {winner.ownerName ? (
                        <>
                          Winner:{' '}
                          <span className="font-semibold text-emerald-300">
                            {winner.ownerName}
                          </span>{' '}
                          (digit {winner.digit})
                        </>
                      ) : (
                        <>No winner (digit {winner.digit} unowned)</>
                      )}
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-10 gap-1 text-[0.7rem]">
                {board.sticks.map((stick) => (
                  <div
                    key={stick.id}
                    className={`flex h-10 flex-col items-center justify-center rounded border text-center ${
                      stick.owner
                        ? 'border-indigo-400 bg-indigo-600/80 text-white'
                        : 'border-slate-700 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">{stick.digit}</div>
                    <div className="truncate text-[0.6rem]">
                      {stick.owner ? stick.owner.name : 'Available'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface MatchupsCardProps {
  games: Game[]
  onBuy?(game: Game): void
  expandedGameId?: string | null
  onToggleExpand?(gameId: string): void
  refreshTrigger?: unknown
}

export default function MatchupsCard({ games, onBuy, expandedGameId, onToggleExpand, refreshTrigger }: MatchupsCardProps) {
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
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-2">
          {displayGames.map((game) => (
            <div key={game.id}>
              <GameRow
                game={game}
                onBuy={onBuy}
                onToggleExpand={onToggleExpand}
                isExpanded={expandedGameId === game.id}
              />
              {expandedGameId === game.id && (
                <GameBoardsSection game={game} refreshTrigger={refreshTrigger} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
