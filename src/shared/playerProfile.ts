const STORAGE_KEY = 'ssg.player.name'

const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export function getStoredPlayerName(): string {
  if (!isBrowser) return ''
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ?? ''
  } catch (error) {
    console.error('Failed to read player name from storage', error)
    return ''
  }
}

export function setStoredPlayerName(name: string): void {
  if (!isBrowser) return
  try {
    const trimmed = name.trim()
    if (!trimmed) {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, trimmed)
    }
  } catch (error) {
    console.error('Failed to write player name to storage', error)
  }
}
