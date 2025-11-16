import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Game } from '@/entities/game'
import type { InviteRequest, LocalPlayer } from '@/entities/buySticks'
import MultiChipInput, { type InviteChipItem } from '@/components/invite/MultiChipInput'
import InviteEntry, { type LocalPlayerRowState } from '@/components/invite/InviteEntry'
import { hasAnyInvites, validateLocalPlayer } from '@/components/invite/inviteUtils'
import { randomId } from '@/shared/randomId'
import { postInvites, postPurchase } from '@/lib/api'

interface BuySticksModalProps {
  isOpen: boolean
  matchup: Game | null
  onClose(): void
}

type InviteTab = 'digital' | 'local'

const focusableSelectors = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })

export default function BuySticksModal({ isOpen, matchup, onClose }: BuySticksModalProps) {
  const [buyerName, setBuyerName] = useState('')
  const [buyerNameError, setBuyerNameError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [inviteTab, setInviteTab] = useState<InviteTab>('digital')
  const [chips, setChips] = useState<InviteChipItem[]>([])
  const [localPlayers, setLocalPlayers] = useState<LocalPlayerRowState[]>([])
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)

  const isBusy = purchaseLoading || inviteLoading
  const pricePerStick = matchup?.stickPrice ?? 10
  const total = useMemo(() => quantity * pricePerStick, [quantity, pricePerStick])

  useEffect(() => {
    if (!isOpen) return

    const previousFocus = document.activeElement as HTMLElement | null

    const focusFirst = () => {
      requestAnimationFrame(() => {
        if (!containerRef.current) return
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
        if (focusables.length > 0) {
          focusables[0].focus()
        } else {
          containerRef.current?.focus()
        }
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) return
      if (event.key === 'Escape') {
        if (!isBusy) {
          event.preventDefault()
          onClose()
        }
        return
      }

      if (event.key === 'Tab') {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors),
        ).filter((element) => !element.hasAttribute('disabled'))

        if (focusables.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    focusFirst()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [isOpen, isBusy, onClose])

  useEffect(() => {
    if (!isOpen || !matchup) return
    setBuyerName('')
    setBuyerNameError(null)
    setQuantity(1)
    setPurchaseMessage(null)
    setPurchaseError(null)
    setInviteTab('digital')
    setChips([])
    setLocalPlayers([])
    setInviteMessage(null)
    setInviteError(null)
  }, [isOpen, matchup])

  if (!isOpen || !matchup) {
    return null
  }

  const formattedDate = new Date(matchup.eventDateTime).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const summaryParts = [
    `${matchup.awayTeam} @ ${matchup.homeTeam}`,
    matchup.league,
    matchup.sport,
    formattedDate,
  ].filter(Boolean)

  const handleQuantityChange = (next: number) => {
    if (Number.isNaN(next)) return
    const clamped = Math.max(1, Math.min(100, next))
    setQuantity(clamped)
  }

  const adjustQuantity = (delta: number) => {
    handleQuantityChange(quantity + delta)
  }

  const handlePurchaseSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!buyerName.trim()) {
      setBuyerNameError('Your name is required to complete the purchase.')
      return
    }

    setBuyerNameError(null)
    setPurchaseError(null)
    setPurchaseLoading(true)
    try {
      const response = await postPurchase({
        matchupId: matchup.id,
        buyerName: buyerName.trim(),
        quantity,
      })
      setPurchaseMessage(
        response.boardId
          ? `Purchase confirmed! Board ${response.boardId} is ready.`
          : 'Purchase confirmed! Your sticks are ready.',
      )
    } catch (error) {
      console.error(error)
      setPurchaseError('We could not complete the purchase. Please try again.')
    } finally {
      setPurchaseLoading(false)
    }
  }

  const addLocalPlayer = () => {
    setLocalPlayers((prev) => {
      if (prev.length >= 10) {
        setInviteError('You can add up to 10 local players.')
        return prev
      }
      const next: LocalPlayerRowState = {
        id: randomId('player'),
        name: '',
        phone: '',
        paymentType: 'cash',
      }
      return [...prev, next]
    })
  }

  const updateLocalPlayer = (id: string, value: LocalPlayerRowState) => {
    setLocalPlayers((prev) => prev.map((player) => (player.id === id ? value : player)))
  }

  const removeLocalPlayer = (id: string) => {
    setLocalPlayers((prev) => prev.filter((player) => player.id !== id))
  }

  const handleSendInvites = async () => {
    setInviteError(null)
    setInviteMessage(null)

    const validatedPlayers = localPlayers.map((player) => {
      const { valid, errors, normalized } = validateLocalPlayer(player)
      return {
        state: { ...player, errors },
        valid,
        normalized,
      }
    })

    const nextLocalStates = validatedPlayers.map((entry) => entry.state)
    setLocalPlayers(nextLocalStates)

    const validTargets = chips.filter((chip) => chip.target && !chip.error).map((chip) => chip.target!)
    const validLocalPlayers: LocalPlayer[] = validatedPlayers
      .filter((entry): entry is { valid: true; normalized: LocalPlayer } => Boolean(entry.valid && entry.normalized))
      .map((entry) => entry.normalized)

    const inviteRequest: InviteRequest = {
      matchupId: matchup.id,
      emailOrSms: validTargets,
      localPlayers: validLocalPlayers,
    }

    if (!hasAnyInvites(inviteRequest)) {
      setInviteError('Add at least one email, phone number, or local player before sending invites.')
      return
    }

    setInviteLoading(true)
    try {
      const response = await postInvites(inviteRequest)
      setInviteMessage(`Invites sent: ${response.sent}. Skipped: ${response.skipped}.`)
      setInviteError(null)
      setChips([])
      setLocalPlayers([])
    } catch (error) {
      console.error(error)
      setInviteError('Unable to send invites. Please review the details and try again.')
    } finally {
      setInviteLoading(false)
    }
  }

  const validInviteCount = chips.filter((chip) => chip.target && !chip.error).length
  const totalLocalPlayers = localPlayers.length
  const disableSendInvites = isBusy || (validInviteCount === 0 && totalLocalPlayers === 0)

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur"
        onMouseDown={(event) => {
          if (isBusy) return
          if (event.currentTarget === event.target) {
            onClose()
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="buy-sticks-heading"
        ref={containerRef}
        tabIndex={-1}
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col gap-6 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl"
      >
        <header className="space-y-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="buy-sticks-heading" className="text-2xl font-semibold text-white">
                Buy Sticks
              </h2>
              <p className="text-sm text-slate-400">{summaryParts.join(' • ')}</p>
            </div>
            <button
              type="button"
              onClick={() => (!isBusy ? onClose() : undefined)}
              className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              disabled={isBusy}
              aria-label="Close modal"
            >
              Close
            </button>
          </div>
          {purchaseMessage ? (
            <div className="rounded-xl border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-200">
              {purchaseMessage}
            </div>
          ) : null}
          {purchaseError ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {purchaseError}
            </div>
          ) : null}
        </header>

        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-800/50 p-5">
          <h3 className="text-lg font-semibold text-white">Purchase</h3>
          <form className="grid gap-4 md:grid-cols-[1.5fr_1fr]" onSubmit={handlePurchaseSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Price per stick</label>
                <div className="mt-1 text-xl font-semibold text-indigo-300">{currency.format(pricePerStick)}</div>
              </div>

              <div>
                <label htmlFor="buyer-name" className="block text-sm font-medium text-slate-200">
                  Your name
                </label>
                <input
                  id="buyer-name"
                  type="text"
                  className={`mt-1 w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    buyerNameError ? 'border-red-500/70' : 'border-slate-700'
                  }`}
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                  disabled={purchaseLoading}
                />
                {buyerNameError ? <p className="mt-1 text-xs text-red-300">{buyerNameError}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">Quantity</label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-lg text-slate-200 transition hover:border-indigo-400 hover:text-indigo-200 disabled:opacity-40"
                    onClick={() => adjustQuantity(-1)}
                    disabled={purchaseLoading || quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(event) => handleQuantityChange(Number(event.target.value))}
                    className="h-9 w-16 rounded-lg border border-slate-700 bg-slate-950/70 text-center text-base text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    disabled={purchaseLoading}
                    aria-label="Stick quantity"
                  />
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-lg text-slate-200 transition hover:border-indigo-400 hover:text-indigo-200 disabled:opacity-40"
                    onClick={() => adjustQuantity(1)}
                    disabled={purchaseLoading || quantity >= 100}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <dl className="grid gap-2 rounded-lg border border-slate-700 bg-slate-950/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-400">Boards</dt>
                  <dd className="font-semibold text-white">{quantity}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-400">Total charged</dt>
                  <dd className="font-semibold text-white">{currency.format(total)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-400">Possible winnings</dt>
                  <dd className="font-semibold text-slate-500">Coming soon</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col justify-between gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                disabled={purchaseLoading}
              >
                {purchaseLoading ? 'Processing…' : 'Confirm Purchase'}
              </button>
              <p className="text-xs text-slate-400">
                Your card will be charged immediately. Stick purchases are final.
              </p>
            </div>
          </form>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-800/50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Invite Others</h3>
            <div className="flex rounded-full border border-slate-700 p-1 text-xs text-slate-300">
              <button
                type="button"
                className={`rounded-full px-3 py-1 font-medium transition ${
                  inviteTab === 'digital' ? 'bg-slate-900 text-white' : 'hover:text-white'
                }`}
                onClick={() => setInviteTab('digital')}
                disabled={inviteLoading}
              >
                Email / SMS
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 font-medium transition ${
                  inviteTab === 'local' ? 'bg-slate-900 text-white' : 'hover:text-white'
                }`}
                onClick={() => setInviteTab('local')}
                disabled={inviteLoading}
              >
                In-Person ({localPlayers.length}/10)
              </button>
            </div>
          </div>

          {inviteMessage ? (
            <div className="rounded-xl border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-200">
              {inviteMessage}
            </div>
          ) : null}
          {inviteError ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {inviteError}
            </div>
          ) : null}

          <div className="space-y-4">
            {inviteTab === 'digital' ? (
              <MultiChipInput
                label="Email or mobile number"
                placeholder="Add email or phone and press Enter"
                items={chips}
                onItemsChange={setChips}
                disabled={inviteLoading}
              />
            ) : null}

            {inviteTab === 'local' ? (
              <Fragment>
                {localPlayers.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Add the fans who are with you. We’ll track cash payments or send them a text to pay.
                  </p>
                ) : null}
                <div className="space-y-3">
                  {localPlayers.map((player, index) => (
                    <InviteEntry
                      key={player.id}
                      index={index}
                      player={player}
                      onChange={(updated) => updateLocalPlayer(player.id, updated)}
                      onRemove={() => removeLocalPlayer(player.id)}
                      disabled={inviteLoading}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addLocalPlayer}
                  className="inline-flex items-center justify-center rounded-full border border-dashed border-indigo-400/60 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-300 hover:text-white disabled:opacity-50"
                  disabled={inviteLoading || localPlayers.length >= 10}
                >
                  Add player
                </button>
              </Fragment>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Cash players will appear as pending until you confirm their payment.
            </div>
            <button
              type="button"
              className="rounded-full bg-slate-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:opacity-60"
              onClick={handleSendInvites}
              disabled={disableSendInvites}
            >
              {inviteLoading ? 'Sending…' : 'Send Invites'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
