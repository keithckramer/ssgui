import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/app/AuthContext'
import type { Board } from '@/entities/board'
import type { Game } from '@/entities/game'
import { boardsRepo } from '@/shared/boardsRepo'
import { getBoardWinner } from '@/shared/boardWinners'
import { gamesRepo } from '@/shared/gamesRepo'
import { getEffectiveGameStatus } from '@/shared/gameStatus'

interface GameBoardsGroup {
  game: Game
  boards: Board[]
}

export default function Games() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<GameBoardsGroup[]>([])
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null)
  const normalizedPlayerId = useMemo(() => user?.id ?? null, [user])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!normalizedPlayerId) {
        setGroups([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const [games, boards] = await Promise.all([
          gamesRepo.getAll(),
          boardsRepo.getAll(),
        ])

        if (cancelled) return

        const playerBoards = boards.filter((board) =>
          board.sticks.some(
            (stick) => stick.owner && stick.owner.playerId === normalizedPlayerId,
          ),
        )

        const boardsByGameId = new Map<string, Board[]>()
        for (const board of playerBoards) {
          if (!boardsByGameId.has(board.gameId)) {
            boardsByGameId.set(board.gameId, [])
          }
          boardsByGameId.get(board.gameId)!.push(board)
        }

        const grouped: GameBoardsGroup[] = []
        for (const game of games) {
          if (!boardsByGameId.has(game.id)) continue
          grouped.push({
            game,
            boards: boardsByGameId.get(game.id)!,
          })
        }

        grouped.sort((a, b) =>
          a.game.eventDateTime.localeCompare(b.game.eventDateTime),
        )

        setGroups(grouped)

        // Keep expanded game if still present; otherwise clear
        setExpandedGameId((current) =>
          current && boardsByGameId.has(current) ? current : null,
        )
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
  }, [normalizedPlayerId])

  if (loading && !normalizedPlayerId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-3 text-slate-300">
          Loading your boards…
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-white">My Boards</h1>
        <p className="text-sm text-slate-400">
          See matchups where you have at least one stick tied to your logged-in profile.
        </p>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <div className="flex flex-1 min-w-[220px] flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Signed in as</span>
            <span className="mt-1 text-sm text-white">{user ? user.name : 'Not logged in'}</span>
          </div>
          <div className="text-xs text-slate-400">
            Boards are linked to the account you use when buying sticks. Log in to view your sticks here.
          </div>
        </div>
      </header>

      {loading && normalizedPlayerId ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
          Loading boards for <span className="font-semibold text-white">{user?.name}</span>…
        </div>
      ) : null}

      {!loading && normalizedPlayerId && groups.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
          No boards found for{' '}
          <span className="font-semibold text-white">{user?.name}</span>. Try buying a stick on the
          Matchups page first.
        </div>
      ) : null}

      {!normalizedPlayerId && !loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
          Log in to see the matchups and boards where you already have sticks.
        </div>
      ) : null}

      {groups.length > 0 && (
        <div className="space-y-4">
          {groups.map(({ game, boards }) => {
            const isExpanded = expandedGameId === game.id
            const effectiveStatus = getEffectiveGameStatus(game)

            const summaryParts = [
              `${game.awayTeam} @ ${game.homeTeam}`,
              game.sport,
              game.league,
              new Date(game.eventDateTime).toLocaleString(),
            ].filter(Boolean)

            const totalSticksForPlayer = boards.reduce((sum, board) => {
              if (!normalizedPlayerId) return sum
              return (
                sum +
                board.sticks.filter(
                  (stick) => stick.owner && stick.owner.playerId === normalizedPlayerId,
                ).length
              )
            }, 0)

            return (
              <div
                key={game.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-900"
                  onClick={() =>
                    setExpandedGameId((current) => (current === game.id ? null : game.id))
                  }
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {summaryParts[0]}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-400">
                      {summaryParts.slice(1).join(' • ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      You have{' '}
                      <span className="font-semibold text-indigo-300">{totalSticksForPlayer}</span>{' '}
                      stick{totalSticksForPlayer === 1 ? '' : 's'} on this matchup
                    </span>
                    <span className="text-xs text-slate-400">
                      {isExpanded ? 'Hide boards ▲' : 'Show boards ▼'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/80 px-4 py-4">
                    <div className="space-y-3">
                      {boards.map((board) => {
                        const winner = getBoardWinner(game, board)

                        const viewerIsWinner =
                          !!winner &&
                          !!normalizedPlayerId &&
                          board.sticks.some(
                            (stick) =>
                              stick.owner &&
                              stick.owner.playerId === normalizedPlayerId &&
                              stick.digit === winner.digit,
                          )

                        const cardClasses = viewerIsWinner
                          ? 'rounded-xl border border-amber-400 bg-amber-500/15 p-3 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]'
                          : 'rounded-xl border border-slate-800 bg-slate-900/60 p-3'

                        return (
                          <div key={board.id} className={cardClasses}>
                            <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                              <span className="font-semibold text-slate-100">
                                Board #{board.boardNumber}
                              </span>
                              <span className="flex items-center gap-2">
                                {game.winningNumber !== undefined && game.winningNumber !== null && (
                                  <span>
                                    Win #:{' '}
                                    <span className="font-semibold text-indigo-300">
                                      {game.winningNumber}
                                    </span>
                                  </span>
                                )}
                                <span>
                                  Status:{' '}
                                  <span className="uppercase tracking-wide text-[0.65rem] text-slate-400">
                                    {effectiveStatus}
                                  </span>
                                </span>
                              </span>
                            </div>

                            {winner && (
                              <div className="mb-2 text-[0.7rem] text-slate-300">
                                {winner.ownerName ? (
                                  viewerIsWinner ? (
                                    <>
                                      🏆{' '}
                                      <span className="font-semibold text-amber-300">
                                        You won this board
                                      </span>{' '}
                                      (digit {winner.digit})
                                    </>
                                  ) : (
                                    <>
                                      Winner:{' '}
                                      <span className="font-semibold text-emerald-300">
                                        {winner.ownerName}
                                      </span>{' '}
                                      (digit {winner.digit})
                                    </>
                                  )
                                ) : (
                                  <>No winner (digit {winner.digit} unowned)</>
                                )}
                              </div>
                            )}

                            <div className="grid grid-cols-10 gap-1 text-[0.7rem]">
                            {board.sticks.map((stick) => {
                              const isMine =
                                !!stick.owner &&
                                !!normalizedPlayerId &&
                                stick.owner.playerId === normalizedPlayerId

                                return (
                                  <div
                                    key={stick.id}
                                    className={`flex h-10 flex-col items-center justify-center rounded border text-center ${
                                      isMine
                                        ? 'border-emerald-400 bg-emerald-600/80 text-white'
                                        : stick.owner
                                          ? 'border-indigo-400 bg-indigo-600/80 text-white'
                                          : 'border-slate-700 bg-slate-950 text-slate-400'
                                    }`}
                                  >
                                    <div className="font-semibold">{stick.digit}</div>
                                    <div className="truncate text-[0.6rem]">
                                      {stick.owner ? stick.owner.name : 'Available'}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
