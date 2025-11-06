// src/app/Layout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
