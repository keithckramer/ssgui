import { useId, useState } from 'react'
import type { InviteTarget } from '@/entities/buySticks'
import { randomId } from '@/shared/randomId'
import { normalizeInviteValue } from './inviteUtils'

export interface InviteChipItem {
  id: string
  input: string
  target?: InviteTarget
  error?: string
}

interface MultiChipInputProps {
  label: string
  placeholder?: string
  items: InviteChipItem[]
  onItemsChange(items: InviteChipItem[]): void
  disabled?: boolean
}

const separators = [',', ';']

export default function MultiChipInput({
  label,
  placeholder,
  items,
  onItemsChange,
  disabled = false,
}: MultiChipInputProps) {
  const inputId = useId()
  const [value, setValue] = useState('')

  const commitValue = (raw: string) => {
    if (!raw.trim()) {
      setValue('')
      return
    }

    const parts = raw
      .split(/[\n,;]/)
      .map((part) => part.trim())
      .filter(Boolean)

    if (parts.length === 0) {
      setValue('')
      return
    }

    const nextItems = [...items]
    parts.forEach((part) => {
      const normalized = normalizeInviteValue(part)
      nextItems.push({
        id: randomId('invite'),
        input: normalized.input || part,
        target: normalized.target,
        error: normalized.error,
      })
    })

    onItemsChange(nextItems)
    setValue('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === 'Tab' || separators.includes(event.key)) {
      if (value.trim()) {
        event.preventDefault()
        commitValue(value)
      }
    } else if (event.key === 'Backspace' && !value && items.length > 0) {
      event.preventDefault()
      onItemsChange(items.slice(0, -1))
    }
  }

  const handleBlur = () => {
    if (disabled) return
    if (value.trim()) {
      commitValue(value)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const pasted = event.clipboardData.getData('text')
    if (!pasted) return
    event.preventDefault()
    commitValue(`${value}${pasted}`)
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <div
        className={`mt-2 flex min-h-[3rem] flex-wrap gap-2 rounded-xl border bg-slate-900 px-3 py-2 text-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 ${
          items.some((item) => item.error) ? 'border-red-500/70' : 'border-slate-700'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        {items.map((item) => (
          <span
            key={item.id}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
              item.error
                ? 'border-red-500/60 bg-red-500/10 text-red-200'
                : 'border-slate-700 bg-slate-800/70 text-slate-200'
            }`}
          >
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {item.target?.channel === 'sms' ? 'SMS' : 'Email'}
            </span>
            <span className="max-w-[160px] truncate text-sm">{item.input}</span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="rounded-full p-1 text-xs text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-200"
              aria-label={`Remove ${item.input}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={items.length === 0 ? placeholder : undefined}
          className="flex-1 min-w-[140px] border-none bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>
      {items.some((item) => item.error) ? (
        <div className="mt-2 space-y-1 text-xs text-red-300">
          {items
            .filter((item) => item.error)
            .map((item) => (
              <div key={`${item.id}-error`}>{item.error}</div>
            ))}
        </div>
      ) : null}
      <p className="mt-1 text-xs text-slate-500">Press Enter after each email or phone number.</p>
    </div>
  )
}
