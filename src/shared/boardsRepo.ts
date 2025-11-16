import type { Board } from '@/entities/board'
import { createEmptyBoard } from '@/entities/board'

const STORAGE_KEY = 'ssg.boards'

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

function readBoards(): Board[] {
  if (!isBrowser) return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Board[]
    return Array.isArray(parsed) ? parsed : []
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

async function getByGameId(gameId: string): Promise<Board | undefined> {
  return readBoards().find((board) => board.gameId === gameId)
}

async function save(board: Board): Promise<Board> {
  const boards = readBoards()
  const index = boards.findIndex((b) => b.id === board.id)
  const next = [...boards]

  if (index === -1) {
    next.push(board)
  } else {
    next[index] = board
  }

  writeBoards(next)
  return board
}

async function createForGame(gameId: string, title: string, size = 100): Promise<Board> {
  const board = createEmptyBoard(gameId, title, size)
  return save(board)
}

interface BuySticksResult {
  board: Board
  purchasedStickIndexes: number[]
}

async function buySticksForGame(
  gameId: string,
  buyerName: string,
  quantity: number,
): Promise<BuySticksResult> {
  if (quantity <= 0) {
    return Promise.reject(new Error('Quantity must be greater than zero'))
  }

  const allBoards = readBoards()
  let board = allBoards.find((b) => b.gameId === gameId)

  if (!board) {
    board = createEmptyBoard(gameId, `Board for game ${gameId}`)
    allBoards.push(board)
  }

  const availableSticks = board.sticks.filter((s) => !s.owner)
  if (availableSticks.length === 0) {
    return Promise.reject(new Error('No sticks available on this board'))
  }

  const takeCount = Math.min(quantity, availableSticks.length)
  const purchasedStickIndexes: number[] = []

  for (let i = 0; i < takeCount; i++) {
    const stick = availableSticks[i]
    if (!stick) continue
    stick.owner = { name: buyerName }
    purchasedStickIndexes.push(stick.index)
  }

  board.updatedAt = new Date().toISOString()

  const idx = allBoards.findIndex((b) => b.id === board!.id)
  allBoards[idx] = board
  writeBoards(allBoards)

  return { board, purchasedStickIndexes }
}

export const boardsRepo = {
  getAll,
  getById,
  getByGameId,
  save,
  createForGame,
  buySticksForGame,
}
