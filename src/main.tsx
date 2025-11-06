import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
//import '@/index.css'
import App from '@/App'
import Layout from "./app/Layout";
import { routes } from "./app/routes";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Matchups from "./pages/Matchups";
import Games from "./pages/Games";
import NotFound from "./pages/NotFound";
import Protected from "./app/Protected";
import Admin from "./pages/Admin";
createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={routes.home} element={<Home />} />
          <Route path={routes.matchups} element={<Matchups />} />
          <Route path={routes.games} element={<Protected><Games/></Protected>} />
          <Route path={routes.login} element={<Login />} />
          <Route path={routes.admin} element={<Admin/>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
