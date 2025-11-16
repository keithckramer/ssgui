import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import type { Board } from '@/entities/board'
import { boardsRepo } from '@/shared/boardsRepo'

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)

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

      <div className="grid grid-cols-10 gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
        {board.sticks.map((stick) => (
          <div
            key={stick.id}
            className={`flex h-10 items-center justify-center rounded border text-xs ${
              stick.owner
                ? 'border-indigo-400 bg-indigo-600/80 text-white'
                : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            {stick.index + 1}
          </div>
        ))}
      </div>
    </div>
  )
}
