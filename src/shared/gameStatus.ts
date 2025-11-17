import type { Game, GameStatus } from '@/entities/game'

export type EffectiveGameStatus = GameStatus

export function getEffectiveGameStatus(game: Game, now: Date = new Date()): EffectiveGameStatus {
  // Final always wins
  if (game.status === 'FINAL') {
    return 'FINAL'
  }

  // Pending and explicit Closed are taken as-is
  if (game.status === 'PENDING' || game.status === 'CLOSED') {
    return game.status
  }

  // From here, status is OPEN in the stored data.
  // If we've passed kickoff time, it's effectively CLOSED.
  const kickoff = new Date(game.eventDateTime)
  if (!Number.isNaN(kickoff.getTime()) && now >= kickoff) {
    return 'CLOSED'
  }

  return 'OPEN'
}
