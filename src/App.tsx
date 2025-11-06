import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/app/Layout'
import Protected from '@/app/Protected'
import { routes } from '@/app/routes'
import { GamesProvider } from '@/features/games/useGames'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Matchups from '@/pages/Matchups'
import Games from '@/pages/Games'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <GamesProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.matchups} element={<Matchups />} />
            <Route
              path={routes.games}
              element={
                <Protected>
                  <Games />
                </Protected>
              }
            />
            <Route path={routes.login} element={<Login />} />
            <Route path={routes.admin} element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GamesProvider>
    </BrowserRouter>
  )
}

export default App
