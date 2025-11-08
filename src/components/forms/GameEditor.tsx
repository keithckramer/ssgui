import { useEffect, useMemo, useState } from 'react'
import type { Game, GameStatus, SportType } from '@/entities/game'

const sportOptions: SportType[] = ['NFL', 'NBA', 'NHL', 'MLB', 'MLS', 'OTHER']
const statusOptions: GameStatus[] = ['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'FINAL']

export type GameEditorValues = Omit<Game, 'id' | 'createdAt' | 'updatedAt'>

interface GameEditorProps {
  initialValue?: Partial<Game>
  onSubmit(values: GameEditorValues): Promise<void> | void
  onCancel?: () => void
  submitLabel?: string
  title?: string
  disabled?: boolean
}

const toDateTimeLocal = (iso?: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (value: number) => value.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const fromDateTimeLocal = (value: string) => (value ? new Date(value).toISOString() : '')

export default function GameEditor({
  initialValue,
  onSubmit,
  onCancel,
  submitLabel = 'Save Game',
  title,
  disabled = false,
}: GameEditorProps) {
  const [formState, setFormState] = useState<GameEditorValues>({
    sport: initialValue?.sport ?? 'NFL',
    league: initialValue?.league ?? '',
    homeTeam: initialValue?.homeTeam ?? '',
    awayTeam: initialValue?.awayTeam ?? '',
    eventDateTime: initialValue?.eventDateTime ?? new Date().toISOString(),
    venue: initialValue?.venue ?? '',
    stickPrice: initialValue?.stickPrice ?? 5,
    status: initialValue?.status ?? 'DRAFT',
    isPublished: initialValue?.isPublished ?? false,
    homeScore: initialValue?.homeScore,
    awayScore: initialValue?.awayScore,
    winningNumber: initialValue?.winningNumber,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isFinal = formState.status === 'FINAL'

  useEffect(() => {
    if (!initialValue) return
    setFormState({
      sport: initialValue.sport ?? 'NFL',
      league: initialValue.league ?? '',
      homeTeam: initialValue.homeTeam ?? '',
      awayTeam: initialValue.awayTeam ?? '',
      eventDateTime: initialValue.eventDateTime ?? new Date().toISOString(),
      venue: initialValue.venue ?? '',
      stickPrice: initialValue.stickPrice ?? 5,
      status: initialValue.status ?? 'DRAFT',
      isPublished: initialValue.isPublished ?? false,
      homeScore: initialValue.homeScore,
      awayScore: initialValue.awayScore,
      winningNumber: initialValue.winningNumber,
    })
  }, [initialValue])

  const datetimeValue = useMemo(() => toDateTimeLocal(formState.eventDateTime), [formState.eventDateTime])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formState.sport) nextErrors.sport = 'Sport is required'
    if (!formState.homeTeam.trim()) nextErrors.homeTeam = 'Home team is required'
    if (!formState.awayTeam.trim()) nextErrors.awayTeam = 'Away team is required'
    if (!formState.eventDateTime) nextErrors.eventDateTime = 'Date and time are required'
    if (typeof formState.stickPrice !== 'number' || Number.isNaN(formState.stickPrice)) {
      nextErrors.stickPrice = 'Stick price is required'
    } else if (formState.stickPrice <= 0) {
      nextErrors.stickPrice = 'Stick price must be greater than zero'
    }
    if (isFinal) {
      if (typeof formState.homeScore !== 'number') nextErrors.homeScore = 'Home score is required'
      if (typeof formState.awayScore !== 'number') nextErrors.awayScore = 'Away score is required'
      if (typeof formState.winningNumber !== 'number') nextErrors.winningNumber = 'Winning number is required'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (key: keyof GameEditorValues, value: unknown) => {
    setFormState((prev) => {
      if (key === 'status') {
        const statusValue = value as GameStatus
        return {
          ...prev,
          status: statusValue,
          ...(statusValue !== 'FINAL'
            ? { homeScore: undefined, awayScore: undefined, winningNumber: undefined }
            : {}),
        }
      }

      return {
        ...prev,
        [key]: value,
      }
    })
  }

  const handleNumericChange = (key: keyof Pick<GameEditorValues, 'homeScore' | 'awayScore' | 'winningNumber'>, value: string) => {
    const parsed = Number.parseInt(value, 10)
    handleChange(key, Number.isNaN(parsed) ? undefined : parsed)
  }

  const handlePriceChange = (value: string) => {
    const parsed = Number.parseFloat(value)
    handleChange('stickPrice', Number.isNaN(parsed) ? undefined : parsed)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    const payload: GameEditorValues = {
      ...formState,
      league: formState.league?.trim() ? formState.league.trim() : undefined,
      venue: formState.venue?.trim() ? formState.venue.trim() : undefined,
      eventDateTime: formState.eventDateTime,
    }

    if (!isFinal) {
      payload.homeScore = undefined
      payload.awayScore = undefined
      payload.winningNumber = undefined
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="sport">
            Sport
          </label>
          <select
            id="sport"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={formState.sport}
            onChange={(event) => handleChange('sport', event.target.value as SportType)}
            disabled={disabled}
          >
            {sportOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.sport ? <p className="text-xs text-red-400">{errors.sport}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="league">
            League (optional)
          </label>
          <input
            id="league"
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={formState.league ?? ''}
            onChange={(event) => handleChange('league', event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="homeTeam">
            Home Team
          </label>
          <input
            id="homeTeam"
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={formState.homeTeam}
            onChange={(event) => handleChange('homeTeam', event.target.value)}
            disabled={disabled}
          />
          {errors.homeTeam ? <p className="text-xs text-red-400">{errors.homeTeam}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="awayTeam">
            Away Team
          </label>
          <input
            id="awayTeam"
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={formState.awayTeam}
            onChange={(event) => handleChange('awayTeam', event.target.value)}
            disabled={disabled}
          />
          {errors.awayTeam ? <p className="text-xs text-red-400">{errors.awayTeam}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="stickPrice">
            Stick Price ($)
          </label>
          <input
            id="stickPrice"
            type="number"
            min={1}
            step={0.5}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={formState.stickPrice ?? ''}
            onChange={(event) => handlePriceChange(event.target.value)}
            disabled={disabled}
          />
          {errors.stickPrice ? <p className="text-xs text-red-400">{errors.stickPrice}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="eventDateTime">
            Date &amp; Time
          </label>
          <input
            id="eventDateTime"
            type="datetime-local"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={datetimeValue}
            onChange={(event) => handleChange('eventDateTime', fromDateTimeLocal(event.target.value))}
            disabled={disabled}
          />
          {errors.eventDateTime ? <p className="text-xs text-red-400">{errors.eventDateTime}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="venue">
            Venue (optional)
          </label>
          <input
            id="venue"
            type="text"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={formState.venue ?? ''}
            onChange={(event) => handleChange('venue', event.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            value={formState.status}
            onChange={(event) => handleChange('status', event.target.value as GameStatus)}
            disabled={disabled}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="isPublished">
            Published
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
            <input
              id="isPublished"
              type="checkbox"
              className="h-4 w-4 accent-blue-500"
              checked={formState.isPublished}
              onChange={(event) => handleChange('isPublished', event.target.checked)}
              disabled={disabled}
            />
            <span>Visible to users</span>
          </div>
        </div>

        {isFinal ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300" htmlFor="homeScore">
              Home Score
            </label>
            <input
              id="homeScore"
              type="number"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              value={formState.homeScore ?? ''}
              onChange={(event) => handleNumericChange('homeScore', event.target.value)}
              disabled={disabled}
            />
            {errors.homeScore ? <p className="text-xs text-red-400">{errors.homeScore}</p> : null}
          </div>
        ) : null}

        {isFinal ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300" htmlFor="awayScore">
              Away Score
            </label>
            <input
              id="awayScore"
              type="number"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              value={formState.awayScore ?? ''}
              onChange={(event) => handleNumericChange('awayScore', event.target.value)}
              disabled={disabled}
            />
            {errors.awayScore ? <p className="text-xs text-red-400">{errors.awayScore}</p> : null}
          </div>
        ) : null}

        {isFinal ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300" htmlFor="winningNumber">
              Winning Number
            </label>
            <input
              id="winningNumber"
              type="number"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              value={formState.winningNumber ?? ''}
              onChange={(event) => handleNumericChange('winningNumber', event.target.value)}
              disabled={disabled}
            />
            {errors.winningNumber ? <p className="text-xs text-red-400">{errors.winningNumber}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            disabled={disabled}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
