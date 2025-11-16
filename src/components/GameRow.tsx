import type { Game } from '@/entities/game'

interface GameRowProps {
  game: Game
  onBuy?(game: Game): void
}

export default function GameRow({ game, onBuy }: GameRowProps) {
  const canBuy = game.isPublished && game.status !== 'FINAL'
  const metaParts = [game.sport, game.league, formatDateTime(game.eventDateTime), game.venue].filter(
    (part): part is string => Boolean(part),
  )

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 transition hover:bg-slate-900">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white">
          {game.homeTeam} <span className="opacity-70">@</span> {game.awayTeam}
        </div>
        <div className="mt-1 truncate text-xs text-slate-400">{metaParts.join(' • ')}</div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* <button
          type="button"
          onClick={() => (canBuy ? onBuy?.(game.id) : undefined)}
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            canBuy
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : 'cursor-not-allowed bg-slate-800 text-slate-400'
          }`}
          disabled={!canBuy}
          title={!canBuy ? (game.status === 'FINAL' ? 'Closed' : 'Unavailable') : undefined}
        >
          Invite
        </button> */}
        {/* <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusClasses(game.status)}`}>
          {game.status.replace(/_/g, ' ')}
        </span> */}

        <button
          type="button"
          onClick={() => (canBuy ? onBuy?.(game) : undefined)}
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            canBuy
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : 'cursor-not-allowed bg-slate-800 text-slate-400'
          }`}
          disabled={!canBuy}
          title={!canBuy ? (game.status === 'FINAL' ? 'Closed' : 'Unavailable') : undefined}
        >
          Buy Sticks
        </button>
      </div>
    </li>
  )
}

function statusClasses(status: Game['status']) {
  switch (status) {
    case 'PUBLISHED':
      return 'border-emerald-700/40 bg-emerald-900/30 text-emerald-300'
    case 'IN_PROGRESS':
      return 'border-amber-700/40 bg-amber-900/30 text-amber-300'
    case 'FINAL':
      return 'border-slate-700 bg-slate-800 text-slate-400'
    default:
      return 'border-slate-700/70 bg-slate-800/80 text-slate-300'
  }
}

function formatDateTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
