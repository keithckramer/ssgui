// src/app/Protected.tsx
import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/app/AuthContext'
import { routes } from '@/app/routes'

export default function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Remember where we came from so we can send the user back after login
    return (
      <Navigate
        to={routes.login}
        replace
        state={{ from: location.pathname || routes.home }}
      />
    )
  }

  return <>{children}</>
}
