import MatchupsCard from '@/components/MatchupsCard'
import { useGames } from '@/features/games/useGames'

export default function MatchupsPage() {
  const { publishedGames, loading } = useGames()

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
      <MatchupsCard games={publishedGames} />
    </div>
  )
}
