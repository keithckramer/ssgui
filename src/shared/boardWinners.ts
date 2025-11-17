import type { Board } from '@/entities/board'
import type { Game } from '@/entities/game'

export interface BoardWinner {
  digit: number
  ownerName: string | null
}

/**
 * Determine the winning digit + owner for a board.
 *
 * Uses:
 *  - game.winningNumber   → the winning digit (0–9)
 *  - board.sticks         → digits + owners on this board
 *
 * Returns:
 *  - null                  → game has no winningNumber yet
 *  - { digit, ownerName: null } → winning digit exists but is unowned on this board
 *  - { digit, ownerName }       → winning digit owned by "ownerName"
 */
export function getBoardWinner(game: Game, board: Board): BoardWinner | null {
  if (game.winningNumber === undefined || game.winningNumber === null) {
    return null
  }

  const digit = game.winningNumber
  const winningStick = board.sticks.find((stick) => stick.digit === digit)

  if (!winningStick) {
    // Should be rare if boards always have 0–9, but we handle it anyway.
    return { digit, ownerName: null }
  }

  const ownerName = winningStick.owner?.name?.trim()
  if (!ownerName) {
    return { digit, ownerName: null }
  }

  return { digit, ownerName }
}
