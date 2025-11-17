import { useState } from 'react'

import MatchupsCard from '@/components/MatchupsCard'
import type { Game } from '@/entities/game'
import BuySticksModal from '@/features/buy/BuySticksModal'
import { useGames } from '@/features/games/useGames'
import { boardsRepo, type StickPurchase } from '@/shared/boardsRepo'
import { getEffectiveGameStatus } from '@/shared/gameStatus'

void boardsRepo

export default function MatchupsPage() {
  const { publishedGames, loading } = useGames()
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [buyOpen, setBuyOpen] = useState(false)
  const [recentPurchases, setRecentPurchases] = useState<StickPurchase[] | null>(null)

  const handleOpenBuy = (game: Game) => {
    setSelectedGame(game)
    setBuyOpen(true)
  }

  const handleToggleExpand = (gameId: string) => {
    setExpandedGameId((current) => (current === gameId ? null : gameId))
  }

  const handlePurchaseSuccess = (purchases: StickPurchase[]) => {
    setRecentPurchases(purchases)

    if (selectedGame) {
      setExpandedGameId(selectedGame.id)
    }

    setBuyOpen(false)
    setSelectedGame(null)
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
      <MatchupsCard
        games={publishedGames.filter((game) => getEffectiveGameStatus(game) !== 'PENDING')}
        onBuy={handleOpenBuy}
        expandedGameId={expandedGameId}
        onToggleExpand={handleToggleExpand}
        refreshTrigger={recentPurchases}
      />

      <BuySticksModal
        isOpen={buyOpen}
        game={selectedGame}
        onClose={() => {
          setBuyOpen(false)
          setSelectedGame(null)
        }}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  )
}
