import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <span className="h-1 w-6 bg-blue-600 rounded-full"></span>
            <span className="h-1 w-4 bg-blue-400 rounded-full"></span>
          </div>
          <div>
            <div className="font-bold text-white">SSG</div>
            <div className="text-xs text-slate-400 tracking-wide">SPORTS STICK GAME</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/"className="px-3 py-1.5 rounded-full bg-slate-800 text-blue-400 font-medium hover:bg-slate-700">
            Home
          </Link>
          <Link to="/matchups" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-300">
            Matchups
          </Link>
          <Link to="/games" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-300">
            Boards
          </Link>
          <Link to="/admin" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-300">
            Admin
          </Link>
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            KK
          </div>
        </div>
      </div>
    </header>
  );
}
