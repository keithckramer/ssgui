import type { Board } from '@/entities/board'
import type { Game } from '@/entities/game'

export interface BoardWinner {
  digit: number
  ownerName: string | null
}

/**
 * Given a game (with winningNumber) and a board,
 * determine which digit is the winner and who owns it, if anyone.
 *
 * Returns:
 * - null          → game has no winningNumber yet (not finalized)
 * - { digit, ownerName: null } → winning digit exists but is unowned on this board
 * - { digit, ownerName }       → winning digit owned by "ownerName" on this board
 */
export function getBoardWinner(game: Game, board: Board): BoardWinner | null {
  if (game.winningNumber === undefined || game.winningNumber === null) {
    return null
  }

  const digit = game.winningNumber
  const winningStick = board.sticks.find((stick) => stick.digit === digit)

  if (!winningStick) {
    // This should be rare if boards always have digits 0–9, but we handle it anyway.
    return { digit, ownerName: null }
  }

  if (!winningStick.owner || !winningStick.owner.name) {
    return { digit, ownerName: null }
  }

  return {
    digit,
    ownerName: winningStick.owner.name,
  }
}
