import { FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/app/AuthContext'
import { routes } from '@/app/routes'

interface LocationState {
  from?: string
}

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const [name, setName] = useState(user?.name ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a name to continue.')
      return
    }

    login(trimmed)
    setError(null)

    // Go back to where the user tried to go, or default to Boards
    const target = state?.from || routes.games
    navigate(target, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Login</h1>
        <p className="text-sm text-slate-400">
          Enter a display name to join boards and track your sticks.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="space-y-1">
          <label htmlFor="display-name" className="block text-sm font-medium text-slate-200">
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Keith, KK, BengalsFan21"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Continue
        </button>
      </form>

      {user && (
        <p className="text-xs text-slate-500">
          You are currently logged in as{' '}
          <span className="font-semibold text-slate-200">{user.name}</span>{' '}
          (<span className="font-mono text-slate-300">{user.role}</span>).
          You can change this by entering a new name.
        </p>
      )}
    </div>
  )
}
