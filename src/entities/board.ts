export interface StickOwner {
  name: string;
}

export interface Stick {
  id: string;
  index: number;
  owner?: StickOwner;
}

export interface Board {
  id: string;
  gameId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  sticks: Stick[];
}

function generateId(prefix: string): string {
  const globalCrypto =
    typeof globalThis !== 'undefined' && 'crypto' in globalThis
      ? (globalThis.crypto as { randomUUID?: () => string })
      : undefined;

  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID();
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export function createEmptyBoard(gameId: string, title: string, size = 100): Board {
  const now = new Date().toISOString();

  return {
    id: generateId('board'),
    gameId,
    title,
    createdAt: now,
    updatedAt: now,
    size,
    sticks: Array.from({ length: size }, (_, index) => ({
      id: `stick_${index}`,
      index,
    })),
  };
}
