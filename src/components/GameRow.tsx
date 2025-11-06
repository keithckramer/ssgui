import type { Game } from '@/entities/game'

interface GameRowProps {
  game: Game
  isSelected: boolean
  onSelect(): void
}

const formatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export default function GameRow({ game, isSelected, onSelect }: GameRowProps) {
  const eventDate = new Date(game.eventDateTime)
  const matchLabel = `${game.awayTeam} @ ${game.homeTeam}`

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-3 text-left transition ${
        isSelected
          ? 'border-blue-500/60 bg-slate-800/80 shadow-lg shadow-blue-900/30'
          : 'bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      <div>
        <div className="text-sm font-semibold text-white">{matchLabel}</div>
        <div className="mt-1 text-xs uppercase tracking-wide text-blue-300">{game.sport}</div>
        <div className="mt-1 text-xs text-slate-400">{formatter.format(eventDate)}</div>
        {game.venue ? (
          <div className="mt-1 text-xs text-slate-500">{game.venue}</div>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-1 text-xs">
        <span
          className={`rounded-full px-2 py-1 font-medium ${
            game.status === 'PUBLISHED'
              ? 'bg-emerald-500/20 text-emerald-300'
              : game.status === 'IN_PROGRESS'
                ? 'bg-amber-500/20 text-amber-300'
                : game.status === 'DRAFT'
                  ? 'bg-slate-600/30 text-slate-200'
                  : 'bg-slate-500/30 text-slate-200'
          }`}
        >
          {game.status.replace(/_/g, ' ')}
        </span>
        {game.league ? <span className="text-slate-500">{game.league}</span> : null}
      </div>
    </button>
  )
}
