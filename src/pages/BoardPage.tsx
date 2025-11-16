import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import type { Board } from '@/entities/board'
import { boardsRepo } from '@/shared/boardsRepo'

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const location = useLocation()
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [ownedIndexes, setOwnedIndexes] = useState<number[]>([])

  useEffect(() => {
    if (!boardId) return

    let isMounted = true

    ;(async () => {
      setLoading(true)
      const found = await boardsRepo.getById(boardId)
      if (isMounted) {
        setBoard(found ?? null)
        setLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [boardId])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const owned = params.get('owned')
    if (!owned) {
      setOwnedIndexes([])
      return
    }

    const indexes = owned
      .split(',')
      .map((value) => parseInt(value, 10))
      .filter((n) => !Number.isNaN(n))

    setOwnedIndexes(indexes)
  }, [location.search])

  if (!boardId) {
    return <div className="text-sm text-red-300">Missing board id in URL.</div>
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-3 text-slate-300">
          Loading board…
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Board not found</h1>
        <p className="text-sm text-slate-400">
          We couldn&apos;t find a board with id <span className="font-mono text-slate-200">{boardId}</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Board</h1>
        <p className="text-sm text-slate-400">
          {board.title} • Game ID:{' '}
          <span className="font-mono text-slate-200">{board.gameId}</span>
        </p>
      </header>

      <div className="flex gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-600" /> Your sticks
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-indigo-600" /> Other players
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-slate-800" /> Available
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
        {board.sticks.map((stick) => {
          const isOwned = ownedIndexes.includes(stick.index)
          return (
            <div
              key={stick.id}
              className={`flex h-10 items-center justify-center rounded border text-xs ${
                stick.owner
                  ? isOwned
                    ? 'border-emerald-400 bg-emerald-600/90 text-white'
                    : 'border-indigo-400 bg-indigo-600/80 text-white'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              {stick.index + 1}
            </div>
          )
        })}
      </div>
    </div>
  )
}
