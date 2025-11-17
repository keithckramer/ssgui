import { useEffect, useMemo, useState } from 'react'
import type { Game } from '@/entities/game'
import GameEditor, { type GameEditorValues } from '@/components/forms/GameEditor'
import FinalizeGameForm from '@/components/forms/FinalizeGameForm'
import { useGames } from '@/features/games/useGames'

interface ToastMessage {
  type: 'success' | 'error'
  message: string
}

export default function AdminGamesPage() {
  const { games, createGame, updateGame, deleteGame, finalizeGame, loading } = useGames()
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [finalizingGame, setFinalizingGame] = useState<Game | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createFormKey, setCreateFormKey] = useState(0)

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const sortedGames = useMemo(
    () => [...games].sort((a, b) => new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime()),
    [games],
  )

  const handleCreate = async (values: GameEditorValues) => {
    try {
      setSubmitting(true)
      await createGame(values)
      setToast({ type: 'success', message: 'Game created successfully.' })
      setCreateFormKey((value) => value + 1)
    } catch (error) {
      console.error(error)
      setToast({ type: 'error', message: 'Failed to create the game. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (id: string, values: GameEditorValues) => {
    try {
      setSubmitting(true)
      await updateGame(id, values)
      setToast({ type: 'success', message: 'Game updated successfully.' })
      setEditingGame(null)
    } catch (error) {
      console.error(error)
      setToast({ type: 'error', message: 'Failed to update the game. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this game? This action cannot be undone.')) {
      return
    }

    try {
      setSubmitting(true)
      await deleteGame(id)
      setToast({ type: 'success', message: 'Game deleted.' })
    } catch (error) {
      console.error(error)
      setToast({ type: 'error', message: 'Failed to delete the game.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinalize = async (id: string, values: { homeScore: number; awayScore: number }) => {
    try {
      setSubmitting(true)
      await finalizeGame(id, values)
      setToast({ type: 'success', message: 'Game finalized successfully.' })
      setFinalizingGame(null)
    } catch (error) {
      console.error(error)
      setToast({ type: 'error', message: 'Failed to finalize the game.' })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStatusBadge = (status: Game['status']) => {
    const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold'
    switch (status) {
      case 'OPEN':
        return <span className={`${base} bg-emerald-500/20 text-emerald-300`}>Open</span>
      case 'CLOSED':
        return <span className={`${base} bg-amber-500/20 text-amber-300`}>Closed</span>
      case 'FINAL':
        return <span className={`${base} bg-slate-500/30 text-slate-200`}>Final</span>
      default:
        return <span className={`${base} bg-slate-600/30 text-slate-200`}>Pending</span>
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Manage Games</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create, edit, publish, and finalize matchups across any sport. All changes are stored locally.
        </p>
      </div>

      {toast ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm shadow transition ${
            toast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/40">
        <GameEditor
          key={createFormKey}
          title="Create New Game"
          submitLabel="Create Game"
          onSubmit={handleCreate}
          disabled={submitting}
        />
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">All Games</h2>
          <span className="text-sm text-slate-400">{sortedGames.length} total</span>
        </header>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60 shadow-lg shadow-slate-950/30">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Sport</th>
                <th className="px-4 py-3">Matchup</th>
                <th className="px-4 py-3">Date &amp; Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Loading games…
                  </td>
                </tr>
              ) : sortedGames.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No games found. Create your first matchup above.
                  </td>
                </tr>
              ) : (
                sortedGames.map((game) => (
                  <tr key={game.id} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-semibold text-slate-200">{game.sport}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="font-medium text-white">
                        {game.awayTeam} <span className="text-slate-500">@</span> {game.homeTeam}
                      </div>
                      {game.league ? <div className="text-xs text-slate-500">{game.league}</div> : null}
                      {game.status === 'FINAL' ? (
                        <div className="text-xs text-indigo-200">
                          Final score: {game.awayScore ?? '–'}-{game.homeScore ?? '–'} · Winning number:{' '}
                          {game.winningNumber ?? '–'}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(game.eventDateTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{renderStatusBadge(game.status)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          game.isPublished
                            ? 'bg-blue-500/20 text-blue-200'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {game.isPublished ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          className="rounded-full border border-slate-700 px-3 py-1.5 font-medium text-slate-200 transition hover:bg-slate-800"
                          onClick={() => setEditingGame(game)}
                          disabled={submitting}
                        >
                          Edit
                        </button>
                        {game.status !== 'FINAL' ? (
                          <button
                            type="button"
                            className="rounded-full border border-emerald-500/40 px-3 py-1.5 font-medium text-emerald-200 transition hover:bg-emerald-600/20"
                            onClick={() => setFinalizingGame(game)}
                            disabled={submitting}
                          >
                            Finalize
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="rounded-full border border-red-500/40 px-3 py-1.5 font-medium text-red-200 transition hover:bg-red-600/20"
                          onClick={() => handleDelete(game.id)}
                          disabled={submitting}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editingGame ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/40">
          <GameEditor
            key={editingGame.id}
            title={`Edit ${editingGame.awayTeam} @ ${editingGame.homeTeam}`}
            submitLabel="Save Changes"
            initialValue={editingGame}
            onSubmit={(values) => handleUpdate(editingGame.id, values)}
            onCancel={() => setEditingGame(null)}
            disabled={submitting}
          />
        </section>
      ) : null}

      {finalizingGame ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/40">
          <FinalizeGameForm
            key={finalizingGame.id}
            game={finalizingGame}
            onSubmit={(values) => handleFinalize(finalizingGame.id, values)}
            onCancel={() => setFinalizingGame(null)}
            disabled={submitting}
          />
        </section>
      ) : null}
    </div>
  )
}
