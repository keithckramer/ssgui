// src/app/AdminProtected.tsx
import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/app/AuthContext'
import { routes } from '@/app/routes'

export default function AdminProtected({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Not logged in at all → send to login
    return (
      <Navigate
        to={routes.login}
        replace
        state={{ from: location.pathname || routes.home }}
      />
    )
  }

  if (user.role !== 'admin') {
    // Logged in but not admin → send them somewhere safe
    return <Navigate to={routes.home} replace />
  }

  return <>{children}</>
}
