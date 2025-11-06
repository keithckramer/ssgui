import { useState } from 'react'
import reactLogo from '@/assets/react.svg'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="bg-red-500 text-white p-4">Tailwind is working!</div>

      <div className="min-h-screen grid place-items-center bg-slate-900 text-white">
      <div className="rounded-2xl bg-slate-800/70 p-8 shadow-xl border-4 border-green-500">
        <h1 className="text-3xl font-bold">Tailwind is LIVE ✅</h1>
        <p className="mt-2 text-slate-300">If this box has a green border and the page is dark, you’re good.</p>
      </div>
    </div>
    </>
  )
}

export default App