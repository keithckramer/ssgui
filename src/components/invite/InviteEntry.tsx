import type { LocalPaymentType } from '@/entities/buySticks'

export interface LocalPlayerRowState {
  id: string
  name: string
  phone?: string
  paymentType: LocalPaymentType
  errors?: Partial<Record<'name' | 'phone', string>>
}

interface InviteEntryProps {
  index: number
  player: LocalPlayerRowState
  onChange(player: LocalPlayerRowState): void
  onRemove(): void
  disabled?: boolean
}

export default function InviteEntry({
  index,
  player,
  onChange,
  onRemove,
  disabled = false,
}: InviteEntryProps) {
  const updateField = (key: 'name' | 'phone' | 'paymentType', value: string | LocalPaymentType) => {
    onChange({
      ...player,
      [key]: value,
    })
  }

  const paymentOptions: { label: string; value: LocalPaymentType; description: string }[] = [
    { label: 'Cash', value: 'cash', description: 'Collect payment in person.' },
    { label: 'Text Invite', value: 'text', description: 'We’ll send them a payment link.' },
  ]

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-inner shadow-slate-950/30">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-slate-300">Player {index + 1}</div>
        <button
          type="button"
          className="text-xs font-medium text-slate-400 transition hover:text-red-300"
          onClick={onRemove}
          disabled={disabled}
        >
          Remove
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`player-${player.id}-name`}>
            Name
          </label>
          <input
            id={`player-${player.id}-name`}
            type="text"
            className={`mt-1 w-full rounded-lg border bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              player.errors?.name ? 'border-red-500/70' : 'border-slate-700'
            }`}
            value={player.name}
            onChange={(event) => updateField('name', event.target.value)}
            disabled={disabled}
          />
          {player.errors?.name ? <p className="mt-1 text-xs text-red-300">{player.errors.name}</p> : null}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor={`player-${player.id}-phone`}>
            Phone (optional)
          </label>
          <input
            id={`player-${player.id}-phone`}
            type="tel"
            className={`mt-1 w-full rounded-lg border bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              player.errors?.phone ? 'border-red-500/70' : 'border-slate-700'
            }`}
            placeholder="(555) 555-1234"
            value={player.phone ?? ''}
            onChange={(event) => updateField('phone', event.target.value)}
            disabled={disabled}
          />
          {player.errors?.phone ? <p className="mt-1 text-xs text-red-300">{player.errors.phone}</p> : null}
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payment preference</legend>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {paymentOptions.map((option) => {
            const isActive = player.paymentType === option.value
            return (
              <button
                key={option.value}
                type="button"
                className={`rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200'
                    : 'border-slate-700 bg-slate-950/40 text-slate-200 hover:border-indigo-400/70 hover:text-indigo-200'
                }`}
                onClick={() => updateField('paymentType', option.value)}
                disabled={disabled}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-slate-400">{option.description}</div>
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
