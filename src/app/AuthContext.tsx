import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'ssg-auth-user'

export interface AuthUser {
  id: string
  name: string
  initials: string
}

interface AuthContextValue {
  user: AuthUser | null
  login(name: string): void
  logout(): void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      return JSON.parse(stored) as AuthUser
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }, [user])

  const login = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const next: AuthUser = {
      id: `user_${Date.now()}`,
      name: trimmed,
      initials: computeInitials(trimmed),
    }
    setUser(next)
  }

  const logout = () => {
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
