'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  PlusCircle,
  Trophy,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  Settings,
  Menu,
  X,
  LogOut,
  Crosshair
} from 'lucide-react'

interface NavigationProps {
  isAdmin: boolean
  hunterName?: string
  teamName?: string
  onLogout: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/submit', label: 'Submit', icon: PlusCircle },
  { href: '/leaderboard/teams', label: 'Teams', icon: Trophy },
  { href: '/leaderboard/hunters', label: 'Hunters', icon: Users },
  { href: '/submissions/pending', label: 'Pending', icon: Clock },
  { href: '/submissions/approved', label: 'Approved', icon: CheckCircle },
  { href: '/submissions/rejected', label: 'Rejected', icon: XCircle },
  { href: '/photos', label: 'Photos', icon: Camera },
]

const adminItems = [
  { href: '/admin', label: 'Admin Panel', icon: Settings },
]

export function Navigation({ isAdmin, hunterName, teamName, onLogout }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems

  return (
    <>
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card)] border-b border-[var(--border)] lg:hidden">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Crosshair className="w-6 h-6 text-[var(--camo-tan)]" />
            <span className="font-bold text-lg">BH2026</span>
          </Link>

          {hunterName && (
            <div className="text-sm text-[var(--muted-foreground)] text-center flex-1 mx-4 truncate">
              {hunterName} • {teamName}
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile slide-out menu */}
      <nav
        className={`fixed top-16 right-0 bottom-0 w-64 bg-[var(--card)] border-l border-[var(--border)] z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {allItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--camo-moss)] text-white'
                      : 'hover:bg-[var(--secondary)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="border-t border-[var(--border)] p-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[var(--card)] border-r border-[var(--border)] flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg camo-accent flex items-center justify-center">
              <Crosshair className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Beaconsfield</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Hunt 2026</p>
            </div>
          </Link>
        </div>

        {hunterName && (
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--secondary)]/50">
            <p className="text-sm font-medium truncate">{hunterName}</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">{teamName}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4">
          {allItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[var(--camo-moss)] text-white'
                    : 'hover:bg-[var(--secondary)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="border-t border-[var(--border)] p-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

    </>
  )
}
