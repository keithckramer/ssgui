import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6">
        <Outlet />
      </main>
    </div>
  )
}
