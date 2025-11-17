// Core domain model for Sports Stick Game boards.
//
// A Board:
// - Belongs to a single game (gameId)
// - Contains exactly 10 sticks, one for each digit 0–9
// - Has a status to indicate if it is open, full, or closed
//
// A Stick:
// - Belongs to a single board
// - Has a digit 0–9 (each digit appears at most once per board)
// - May have an owner (the buyer of that stick)

export const BOARD_DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export type BoardDigit = (typeof BOARD_DIGITS)[number]

export type BoardStatus = 'OPEN' | 'FULL' | 'CLOSED'

export interface StickOwner {
  /** Identifier of the user who owns this stick */
  playerId: string
  /** Display name of the person who owns this stick (from the Buy flow) */
  name: string
}

export interface Stick {
  /** Unique identifier for this stick (within the board) */
  id: string
  /** Digit on this stick, always 0–9, unique per board */
  digit: BoardDigit
  /** Owner of this stick, or undefined if it is still available */
  owner?: StickOwner
  /** When this stick was created (ISO string) */
  createdAt: string
}

/**
 * A single 10-digit board for a particular game.
 *
 * - Each board belongs to exactly one game (gameId).
 * - Each board has exactly 10 sticks, with digits 0–9.
 * - Each digit appears at most once per board.
 * - There is exactly one winner per board, determined by the game result.
 */
export interface Board {
  /** Unique identifier for this board */
  id: string
  /** The game this board belongs to */
  gameId: string
  /**
   * Sequential number of this board for the game (1, 2, 3, ...)
   * This is mainly for display: "Board #1", "Board #2", etc.
   */
  boardNumber: number
  /** All 10 sticks on this board (digits 0–9) */
  sticks: Stick[]
  /** Whether this board is open for new sticks, full, or closed out */
  status: BoardStatus
  /** Timestamps (ISO strings) */
  createdAt: string
  updatedAt: string
}

/**
 * Helper to create an empty 10-digit board for a game.
 * All digits 0–9 are available (no owners yet).
 */
export function createEmptyBoard(params: {
  id: string
  gameId: string
  boardNumber: number
  now?: string
}): Board {
  const now = params.now ?? new Date().toISOString()

  const sticks: Stick[] = BOARD_DIGITS.map((digit) => ({
    id: `${params.id}:${digit}`,
    digit,
    owner: undefined,
    createdAt: now,
  }))

  return {
    id: params.id,
    gameId: params.gameId,
    boardNumber: params.boardNumber,
    sticks,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * A board is considered FULL when all 10 digits have an owner.
 */
export function isBoardFull(board: Board): boolean {
  return board.sticks.every((stick) => !!stick.owner)
}
