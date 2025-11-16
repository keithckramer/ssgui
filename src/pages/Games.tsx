import { useEffect, useMemo, useState } from 'react'

import type { Board } from '@/entities/board'
import type { Game } from '@/entities/game'
import { boardsRepo } from '@/shared/boardsRepo'
import { gamesRepo } from '@/shared/gamesRepo'
import { getStoredPlayerName, setStoredPlayerName } from '@/shared/playerProfile'

interface GameBoardsGroup {
  game: Game
  boards: Board[]
}

export default function Games() {
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<GameBoardsGroup[]>([])
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null)

  // Load stored player name on mount
  useEffect(() => {
    const stored = getStoredPlayerName()
    if (stored) {
      setPlayerName(stored)
    } else {
      setLoading(false)
    }
  }, [])

  // Load boards whenever playerName changes
  useEffect(() => {
    const activeName = playerName.trim()
    if (!activeName) {
      setGroups([])
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const [games, boards] = await Promise.all([
          gamesRepo.getAll(),
          boardsRepo.getBoardsForOwnerName(activeName),
        ])

        if (cancelled) return

        const boardsByGameId = new Map<string, Board[]>()
        for (const board of boards) {
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
        if (expandedGameId && !boardsByGameId.has(expandedGameId)) {
          setExpandedGameId(null)
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
  }, [playerName]) // eslint-disable-line react-hooks/exhaustive-deps

  const normalizedPlayerName = useMemo(
    () => playerName.trim().toLowerCase(),
    [playerName],
  )

  const handlePlayerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setPlayerName(value)
    setStoredPlayerName(value)
  }

  if (loading && !playerName) {
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
          See matchups where you have at least one stick. We&apos;re using your name as your
          player identity for now.
        </p>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <label className="flex flex-1 min-w-[220px] flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your name
            <input
              type="text"
              className="mt-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter the same name you use when buying sticks"
              value={playerName}
              onChange={handlePlayerNameChange}
            />
          </label>
          <div className="text-xs text-slate-400">
            This is stored only in your browser. Use the exact same name in the purchase modal to
            see your boards here.
          </div>
        </div>
      </header>

      {loading && playerName.trim() ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
          Loading boards for <span className="font-semibold text-white">{playerName.trim()}</span>…
        </div>
      ) : null}

      {!loading && playerName.trim() && groups.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
          No boards found for{' '}
          <span className="font-semibold text-white">{playerName.trim()}</span>. Try buying a
          stick on the Matchups page first, or double-check the spelling of your name.
        </div>
      ) : null}

      {!playerName.trim() && !loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
          Enter your name above to see the matchups and boards where you already have sticks.
        </div>
      ) : null}

      {groups.length > 0 && (
        <div className="space-y-4">
          {groups.map(({ game, boards }) => {
            const isExpanded = expandedGameId === game.id

            const summaryParts = [
              `${game.awayTeam} @ ${game.homeTeam}`,
              game.sport,
              game.league,
              new Date(game.eventDateTime).toLocaleString(),
            ].filter(Boolean)

            const totalSticksForPlayer = boards.reduce((sum, board) => {
              return (
                sum +
                board.sticks.filter(
                  (stick) =>
                    stick.owner &&
                    stick.owner.name &&
                    stick.owner.name.trim().toLowerCase() === normalizedPlayerName,
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
                      {boards.map((board) => (
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
                                {board.status}
                              </span>
                            </span>
                          </div>

                          <div className="grid grid-cols-10 gap-1 text-[0.7rem]">
                            {board.sticks.map((stick) => {
                              const isMine =
                                !!stick.owner &&
                                !!stick.owner.name &&
                                stick.owner.name.trim().toLowerCase() === normalizedPlayerName

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
                      ))}
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
