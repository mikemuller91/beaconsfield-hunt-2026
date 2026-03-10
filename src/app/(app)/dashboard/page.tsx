'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  Trophy,
  Users,
  Clock,
  Camera,
  Settings,
  ChevronRight,
  Crosshair,
  User,
  Loader2
} from 'lucide-react'

interface SessionData {
  isAuthenticated: boolean
  isAdmin: boolean
  hunterId?: string
  hunterName?: string
  teamId?: string
  teamName?: string
}

interface Hunter {
  id: string
  name: string
  team: {
    id: string
    name: string
  }
}

interface TeamLeaderEntry {
  id: string
  name: string
  totalScore: number
}

interface HunterLeaderEntry {
  id: string
  name: string
  teamName: string
  totalScore: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [hunters, setHunters] = useState<Hunter[]>([])
  const [selectedHunter, setSelectedHunter] = useState('')
  const [topTeams, setTopTeams] = useState<TeamLeaderEntry[]>([])
  const [topHunters, setTopHunters] = useState<HunterLeaderEntry[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoadingHunter, setIsLoadingHunter] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionRes, huntersRes, teamsRes, huntersLeaderRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/hunters'),
          fetch('/api/leaderboard/teams'),
          fetch('/api/leaderboard/hunters'),
        ])

        const sessionData = await sessionRes.json()
        const huntersData = await huntersRes.json()
        const teamsData = await teamsRes.json()
        const huntersLeaderData = await huntersLeaderRes.json()

        setSession(sessionData.data)
        setHunters(huntersData.data || [])
        setTopTeams((teamsData.data || []).slice(0, 3))
        setTopHunters((huntersLeaderData.data || []).slice(0, 3))

        if (sessionData.data?.hunterId) {
          setSelectedHunter(sessionData.data.hunterId)
        }

        // Get pending count for admin
        if (sessionData.data?.isAdmin) {
          const pendingRes = await fetch('/api/submissions?status=PENDING')
          const pendingData = await pendingRes.json()
          setPendingCount((pendingData.data || []).length)
        }
      } catch (e) {
        console.error('Failed to fetch data:', e)
      }
    }

    fetchData()
  }, [])

  const handleHunterSelect = async (hunterId: string) => {
    if (!hunterId) return
    setIsLoadingHunter(true)

    try {
      const res = await fetch('/api/auth/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hunterId }),
      })

      const data = await res.json()
      if (data.success) {
        setSession(prev => prev ? {
          ...prev,
          hunterId: data.data.hunterId,
          hunterName: data.data.hunterName,
          teamId: data.data.teamId,
          teamName: data.data.teamName,
        } : null)
        setSelectedHunter(hunterId)
        router.refresh()
      }
    } catch (e) {
      console.error('Failed to select hunter:', e)
    } finally {
      setIsLoadingHunter(false)
    }
  }

  const quickActions = [
    {
      href: '/submit',
      icon: PlusCircle,
      label: 'New Submission',
      description: 'Log an animal or miss',
      color: 'from-green-700 to-green-900',
    },
    {
      href: '/leaderboard/teams',
      icon: Trophy,
      label: 'Team Scores',
      description: 'View team leaderboard',
      color: 'from-amber-700 to-amber-900',
    },
    {
      href: '/leaderboard/hunters',
      icon: Users,
      label: 'Hunter Scores',
      description: 'View individual scores',
      color: 'from-blue-700 to-blue-900',
    },
    {
      href: '/photos',
      icon: Camera,
      label: 'Photo Reel',
      description: 'Browse hunt photos',
      color: 'from-purple-700 to-purple-900',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="card-camo p-6 camo-accent">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
            <Crosshair className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Beaconsfield Hunt 2026</h1>
            <p className="text-[var(--camo-sand)]">Welcome to the scoreboard</p>
          </div>
        </div>
      </div>

      {/* Hunter selection */}
      {!session?.hunterId && hunters.length > 0 && (
        <div className="card-camo p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-[var(--camo-tan)]" />
            <h2 className="font-semibold">Select Your Identity</h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Choose your hunter profile to submit entries
          </p>
          <div className="flex gap-3">
            <select
              value={selectedHunter}
              onChange={(e) => setSelectedHunter(e.target.value)}
              className="input select flex-1"
            >
              <option value="">Select hunter...</option>
              {hunters.map((hunter) => (
                <option key={hunter.id} value={hunter.id}>
                  {hunter.name} - {hunter.team.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleHunterSelect(selectedHunter)}
              disabled={!selectedHunter || isLoadingHunter}
              className="btn btn-primary"
            >
              {isLoadingHunter ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Current hunter info */}
      {session?.hunterId && (
        <div className="card-camo p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--camo-moss)] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">{session.hunterName}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{session.teamName}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/hunter', { method: 'DELETE' })
              setSession(prev => prev ? { ...prev, hunterId: undefined, hunterName: undefined, teamId: undefined, teamName: undefined } : null)
              setSelectedHunter('')
              router.refresh()
            }}
            className="text-sm text-[var(--muted-foreground)] hover:text-white"
          >
            Change
          </button>
        </div>
      )}

      {/* Admin notice */}
      {session?.isAdmin && pendingCount > 0 && (
        <Link href="/submissions/pending" className="block">
          <div className="card-camo p-4 border-amber-600 bg-amber-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="font-medium">{pendingCount} pending submissions</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </Link>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="card-camo p-4 hover:scale-[1.02] transition-transform"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{action.label}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{action.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Leaderboard previews */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top teams */}
        <div className="card-camo p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Teams
            </h3>
            <Link href="/leaderboard/teams" className="text-sm text-[var(--camo-tan)] hover:underline">
              View all
            </Link>
          </div>
          {topTeams.length > 0 ? (
            <div className="space-y-3">
              {topTeams.map((team, i) => (
                <div key={team.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <span className="score score-positive">{team.totalScore}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">No scores yet</p>
          )}
        </div>

        {/* Top hunters */}
        <div className="card-camo p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Top Hunters
            </h3>
            <Link href="/leaderboard/hunters" className="text-sm text-[var(--camo-tan)] hover:underline">
              View all
            </Link>
          </div>
          {topHunters.length > 0 ? (
            <div className="space-y-3">
              {topHunters.map((hunter, i) => (
                <div key={hunter.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-medium block">{hunter.name}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{hunter.teamName}</span>
                    </div>
                  </div>
                  <span className={`score ${hunter.totalScore >= 0 ? 'score-positive' : 'score-negative'}`}>
                    {hunter.totalScore}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">No scores yet</p>
          )}
        </div>
      </div>

      {/* Admin link */}
      {session?.isAdmin && (
        <Link
          href="/admin"
          className="card-camo p-4 flex items-center justify-between hover:bg-[var(--secondary)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[var(--camo-tan)]" />
            <span className="font-medium">Admin Panel</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
      )}
    </div>
  )
}
