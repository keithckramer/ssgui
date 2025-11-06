// src/app/Layout.tsx
import { Outlet, Link } from "react-router-dom";
export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="p-4 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/matchups">Matchups</Link>
        <Link to="/games">Games</Link>
        <Link to="/login">Login</Link>
        <Link to="/admin">Admin</Link>
      </nav>
      <main className="p-6"><Outlet /></main>
    </div>
  );
}
