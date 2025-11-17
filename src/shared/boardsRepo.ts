import type { Board, BoardDigit, StickOwner } from '@/entities/board'
import { BOARD_DIGITS, createEmptyBoard, isBoardFull } from '@/entities/board'
import type { Game } from '@/entities/game'
import { gamesRepo } from '@/shared/gamesRepo'
import { getEffectiveGameStatus } from '@/shared/gameStatus'

const STORAGE_KEY = 'ssg.boards.v2'

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`
}

function readBoards(): Board[] {
  if (!isBrowser) return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Board[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function writeBoards(boards: Board[]): void {
  if (!isBrowser) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boards))
}

async function getAll(): Promise<Board[]> {
  return readBoards()
}

async function getById(id: string): Promise<Board | undefined> {
  return readBoards().find((board) => board.id === id)
}

async function getBoardsForGame(gameId: string): Promise<Board[]> {
  return readBoards()
    .filter((board) => board.gameId === gameId)
    .sort((a, b) => a.boardNumber - b.boardNumber)
}

/**
 * Get all boards where at least one stick owner has the given name.
 * This is a simple way to power "My Boards" based on a display name.
 */
async function getBoardsForOwnerName(ownerName: string): Promise<Board[]> {
  const normalized = ownerName.trim().toLowerCase()
  if (!normalized) return []

  return readBoards().filter((board) =>
    board.sticks.some((stick) => stick.owner && stick.owner.name.trim().toLowerCase() === normalized),
  )
}

function getNextBoardNumberForGame(gameId: string, boards: Board[]): number {
  const gameBoards = boards.filter((board) => board.gameId === gameId)
  if (gameBoards.length === 0) return 1
  const max = Math.max(...gameBoards.map((b) => b.boardNumber))
  return max + 1
}

function createBoardForGame(gameId: string, boards: Board[]): Board {
  const id = generateId('board')
  const boardNumber = getNextBoardNumberForGame(gameId, boards)
  const board = createEmptyBoard({ id, gameId, boardNumber })
  boards.push(board)
  return board
}

function saveBoards(boards: Board[]): void {
  writeBoards(boards)
}

export interface StickPurchase {
  boardId: string
  boardNumber: number
  digit: BoardDigit
  owner: StickOwner
}

interface BuySticksOptions {
  /** If true, try to put each stick on a different board. If false, pack into as few boards as possible. */
  separateBoards?: boolean
}

export interface BuySticksResult {
  purchases: StickPurchase[]
  boards: Board[] // updated boards snapshot
}

/**
 * Allocate a single stick to a board for a given buyer.
 * Caller is responsible for persisting boards afterward.
 */
function allocateSingleStickToBoard(
  board: Board,
  owner: StickOwner,
): StickPurchase | null {
  const now = new Date().toISOString()
  const available = board.sticks.filter((stick) => !stick.owner)

  if (available.length === 0) {
    board.status = 'FULL'
    board.updatedAt = now
    return null
  }

  // Pick a random available stick (digit) instead of always taking the first
  const randomIndex = Math.floor(Math.random() * available.length)
  const stick = available[randomIndex]
  stick.owner = owner
  board.updatedAt = now

  if (isBoardFull(board)) {
    board.status = 'FULL'
  }

  return {
    boardId: board.id,
    boardNumber: board.boardNumber,
    digit: stick.digit,
    owner,
  }
}

/**
 * Core purchase function.
 *
 * - If separateBoards is false (default):
 *   - Packs sticks into as few boards as possible, filling boards before creating new ones.
 *
 * - If separateBoards is true:
 *   - Tries to add at most one new stick per board for this purchase, creating new boards as needed.
 */
async function buySticksForGame(
  gameId: string,
  buyerName: string,
  quantity: number,
  options: BuySticksOptions = {},
): Promise<BuySticksResult> {
  // Load the game and enforce status + kickoff rules
  const game: Game = await gamesRepo.getById(gameId)
  const effectiveStatus = getEffectiveGameStatus(game)

  if (effectiveStatus === 'PENDING') {
    throw new Error('This matchup is not open for purchases yet.')
  }

  if (effectiveStatus === 'CLOSED') {
    throw new Error('This matchup has started. You can no longer buy sticks.')
  }

  if (effectiveStatus === 'FINAL') {
    throw new Error('This matchup is final. You can no longer buy sticks.')
  }

  // From here, effectiveStatus is OPEN and now < eventDateTime

  const trimmedName = buyerName.trim()
  if (!trimmedName) {
    return Promise.reject(new Error('Buyer name is required'))
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return Promise.reject(new Error('Quantity must be greater than zero'))
  }

  const separateBoards = options.separateBoards === true
  const owner: StickOwner = { name: trimmedName }

  const boards = readBoards()
  const purchases: StickPurchase[] = []

  if (!separateBoards) {
    // Pack into as few boards as possible
    let remaining = quantity

    while (remaining > 0) {
      // Prefer existing OPEN boards for this game with free sticks
      let board =
        boards.find(
          (b) =>
            b.gameId === gameId &&
            b.status === 'OPEN' &&
            b.sticks.some((stick) => !stick.owner),
        ) ?? createBoardForGame(gameId, boards)

      const purchase = allocateSingleStickToBoard(board, owner)

      if (purchase) {
        purchases.push(purchase)
        remaining -= 1
      } else {
        // Board is full; loop will find or create the next OPEN board
        continue
      }
    }
  } else {
    // SeparateBoards: try to put each new stick on a different board in this purchase
    const usedBoardIdsThisPurchase = new Set<string>()

    for (let i = 0; i < quantity; i++) {
      // Find an OPEN board for this game that:
      // - has a free stick
      // - we haven't already used in this purchase iteration
      let board =
        boards.find(
          (b) =>
            b.gameId === gameId &&
            b.status === 'OPEN' &&
            !usedBoardIdsThisPurchase.has(b.id) &&
            b.sticks.some((stick) => !stick.owner),
        ) ?? createBoardForGame(gameId, boards)

      const purchase = allocateSingleStickToBoard(board, owner)
      if (purchase) {
        purchases.push(purchase)
        usedBoardIdsThisPurchase.add(board.id)
      }
    }
  }

  saveBoards(boards)

  return {
    purchases,
    boards,
  }
}

export const boardsRepo = {
  getAll,
  getById,
  getBoardsForGame,
  getBoardsForOwnerName,
  buySticksForGame,
}
