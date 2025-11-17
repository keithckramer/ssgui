import type { Game } from '@/entities/game'
import { computeWinningNumber } from '@/shared/computeWinningNumber'

const STORAGE_KEY = 'ssg.games'

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `game_${Math.random().toString(36).slice(2, 10)}`
}

const nowIso = () => new Date().toISOString()

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readGames = (): Game[] => {
  if (!isBrowser) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seedGames()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }

    const parsed = JSON.parse(raw) as Game[]
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid data shape')
    }

    return parsed.map((game) => ({
      ...game,
      createdAt: game.createdAt ?? nowIso(),
      updatedAt: game.updatedAt ?? nowIso(),
    }))
  } catch (error) {
    console.error('Failed to read games from storage', error)
    const seeded = seedGames()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
}

const writeGames = (games: Game[]) => {
  if (!isBrowser) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

const seedGames = (): Game[] => {
  const base = nowIso()
  const future = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()

  return [
    {
      id: generateId(),
      sport: 'NFL',
      league: 'AFC East',
      homeTeam: 'New York Jets',
      awayTeam: 'Buffalo Bills',
      eventDateTime: future(24),
      venue: 'MetLife Stadium',
      status: 'OPEN',
      isPublished: true,
      createdAt: base,
      updatedAt: base,
    },
    {
      id: generateId(),
      sport: 'NBA',
      league: 'Western Conference',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Golden State Warriors',
      eventDateTime: future(48),
      venue: 'Crypto.com Arena',
      status: 'OPEN',
      isPublished: true,
      createdAt: base,
      updatedAt: base,
    },
    {
      id: generateId(),
      sport: 'NHL',
      league: 'Atlantic Division',
      homeTeam: 'Toronto Maple Leafs',
      awayTeam: 'Boston Bruins',
      eventDateTime: future(72),
      venue: 'Scotiabank Arena',
      status: 'PENDING',
      isPublished: false,
      createdAt: base,
      updatedAt: base,
    },
  ]
}

export interface GamesRepo {
  getAll(): Promise<Game[]>
  getById(id: string): Promise<Game>
  create(input: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<Game>
  update(id: string, patch: Partial<Game>): Promise<Game>
  remove(id: string): Promise<void>
  finalize(options: { gameId: string; homeScore: number; awayScore: number }): Promise<Game>
}

export const gamesRepo: GamesRepo = {
  async getAll() {
    return readGames()
  },

  async getById(id) {
    const games = readGames()
    const game = games.find((item) => item.id === id)

    if (!game) {
      throw new Error(`Game with id ${id} not found`)
    }

    return game
  },

  async create(input) {
    const games = readGames()
    const timestamp = nowIso()
    const game: Game = {
      ...input,
      id: generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    games.push(game)
    writeGames(games)
    return game
  },

  async update(id, patch) {
    const games = readGames()
    const index = games.findIndex((game) => game.id === id)
    if (index === -1) {
      throw new Error('Game not found')
    }

    const updated: Game = {
      ...games[index],
      ...patch,
      id,
      updatedAt: nowIso(),
    }

    games[index] = updated
    writeGames(games)
    return updated
  },

  async remove(id) {
    const games = readGames()
    const filtered = games.filter((game) => game.id !== id)
    writeGames(filtered)
  },

  async finalize(options) {
    return finalizeGame(options)
  },
}

export async function finalizeGame(options: {
  gameId: string
  homeScore: number
  awayScore: number
}): Promise<Game> {
  const { gameId, homeScore, awayScore } = options

  const games = readGames()
  const index = games.findIndex((game) => game.id === gameId)

  if (index === -1) {
    throw new Error(`Game with id ${gameId} not found`)
  }

  const game = games[index]
  const winningNumber = computeWinningNumber(homeScore, awayScore)
  const now = nowIso()

  const updated: Game = {
    ...game,
    homeScore,
    awayScore,
    winningNumber,
    status: 'FINAL',
    isPublished: game.isPublished,
    updatedAt: now,
  }

  games[index] = updated
  writeGames(games)

  return updated
}
