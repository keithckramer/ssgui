import { Link, useLocation } from 'react-router-dom'
import { routes } from '@/app/routes'

const navLinks = [
  { to: routes.home, label: 'Home' },
  { to: routes.matchups, label: 'Matchups' },
  { to: routes.games, label: 'Boards' },
  { to: routes.admin, label: 'Admin' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <span className="h-1 w-6 rounded-full bg-blue-600" />
            <span className="h-1 w-4 rounded-full bg-blue-400" />
          </div>
          <div>
            <div className="font-bold text-white">SSG</div>
            <div className="text-xs tracking-wide text-slate-400">SPORTS STICK GAME</div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          KK
        </div>
      </div>
    </header>
  )
}
