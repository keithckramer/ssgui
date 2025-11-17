import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Game } from '@/entities/game'
import { gamesRepo } from '@/shared/gamesRepo'
import { getEffectiveGameStatus } from '@/shared/gameStatus'

interface GamesContextValue {
  games: Game[]
  publishedGames: Game[]
  loading: boolean
  createGame(input: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<Game>
  updateGame(id: string, patch: Partial<Game>): Promise<Game>
  deleteGame(id: string): Promise<void>
  finalizeGame(id: string, input: Required<Pick<Game, 'homeScore' | 'awayScore'>>): Promise<Game>
}

const GamesContext = createContext<GamesContextValue | null>(null)

export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    gamesRepo
      .getAll()
      .then((allGames) => {
        if (!isMounted) return
        setGames(allGames)
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const createGame = useCallback(async (input: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await gamesRepo.create(input)
    setGames((prev) => [...prev, created])
    return created
  }, [])

  const updateGame = useCallback(async (id: string, patch: Partial<Game>) => {
    const updated = await gamesRepo.update(id, patch)
    setGames((prev) => prev.map((game) => (game.id === id ? updated : game)))
    return updated
  }, [])

  const deleteGame = useCallback(async (id: string) => {
    await gamesRepo.remove(id)
    setGames((prev) => prev.filter((game) => game.id !== id))
  }, [])

  const finalizeGame = useCallback(async (id: string, input: Required<Pick<Game, 'homeScore' | 'awayScore'>>) => {
    const updated = await gamesRepo.finalize({
      gameId: id,
      ...input,
    })
    setGames((prev) => prev.map((game) => (game.id === id ? updated : game)))
    return updated
  }, [])

  const publishedGames = useMemo(
    () =>
      games.filter(
        (game) => game.isPublished && getEffectiveGameStatus(game) !== 'PENDING',
      ),
    [games],
  )

  const value: GamesContextValue = useMemo(
    () => ({ games, publishedGames, loading, createGame, updateGame, deleteGame, finalizeGame }),
    [games, publishedGames, loading, createGame, updateGame, deleteGame, finalizeGame],
  )

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export function useGames() {
  const context = useContext(GamesContext)
  if (!context) {
    throw new Error('useGames must be used within a GamesProvider')
  }

  return context
}
