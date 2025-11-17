export type SportType = 'NFL' | 'NBA' | 'NHL' | 'MLB' | 'MLS' | 'OTHER'
export type GameStatus = 'PENDING' | 'OPEN' | 'CLOSED' | 'FINAL'

export interface Game {
  id: string
  sport: SportType
  league?: string
  homeTeam: string
  awayTeam: string
  eventDateTime: string
  venue?: string
  status: GameStatus
  isPublished: boolean
  homeScore?: number
  awayScore?: number
  winningNumber?: number
  createdAt: string
  updatedAt: string
}
