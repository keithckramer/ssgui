import type { Game } from '@/entities/game'

interface GameRowProps {
  game: Game
  onBuy?(game: Game): void
  onToggleExpand?(gameId: string): void
  isExpanded?: boolean
}

export default function GameRow({ game, onBuy, onToggleExpand, isExpanded }: GameRowProps) {
  const canBuy = game.isPublished && game.status !== 'FINAL'

  return (
    <div className="border-b border-slate-800">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-800/60"
        onClick={() => onToggleExpand?.(game.id)}
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-100">
            {game.awayTeam} @ {game.homeTeam}
          </span>
          <span className="text-xs text-slate-400">
            {game.sport} • {game.league} • {new Date(game.eventDateTime).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {canBuy && onBuy && (
            <button
              type="button"
              className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              onClick={(event) => {
                event.stopPropagation()
                if (canBuy) {
                  onBuy(game)
                }
              }}
              disabled={!canBuy}
            >
              Buy
            </button>
          )}

          <span className="text-xs text-slate-400">{isExpanded ? 'Hide boards ▲' : 'Show boards ▼'}</span>
        </div>
      </button>
    </div>
  )
}
