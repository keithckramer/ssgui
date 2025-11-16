import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '@/app/routes'
import MatchupsCard from '@/components/MatchupsCard'
import type { Game } from '@/entities/game'
import BuySticksModal from '@/features/buy/BuySticksModal'
import { useGames } from '@/features/games/useGames'

export default function MatchupsPage() {
  const { publishedGames, loading } = useGames()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [buyOpen, setBuyOpen] = useState(false)
  const navigate = useNavigate()

  const handleOpenBuy = (game: Game) => {
    setSelectedGame(game)
    setBuyOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-3 text-slate-300">
          Loading matchups…
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Matchups</h1>
      <MatchupsCard games={publishedGames} onBuy={handleOpenBuy} />

      <BuySticksModal
        isOpen={buyOpen}
        game={selectedGame}
        onClose={() => {
          setBuyOpen(false)
          setSelectedGame(null)
        }}
        onPurchaseSuccess={(boardId) => {
          setBuyOpen(false)
          setSelectedGame(null)
          const path = routes.board.replace(':boardId', boardId)
          navigate(path)
        }}
      />
    </div>
  )
}
