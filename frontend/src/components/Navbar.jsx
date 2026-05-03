import { Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <header className="h-14 bg-[#0d0d17] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1 lg:flex-none" />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:block">
          {user?.name}
        </span>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
          {initials}
        </div>
      </div>
    </header>
  )
}
