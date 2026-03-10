'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Settings,
  Users,
  UsersRound,
  Clock,
  Shield,
  Key,
  Loader2,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  X
} from 'lucide-react'

interface Team {
  id: string
  name: string
  _count: { hunters: number }
}

interface Hunter {
  id: string
  name: string
  team: { id: string; name: string }
}

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminPin, setAdminPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const [teams, setTeams] = useState<Team[]>([])
  const [hunters, setHunters] = useState<Hunter[]>([])
  const [pendingCount, setPendingCount] = useState(0)

  // Form states
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showHunterForm, setShowHunterForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editingHunter, setEditingHunter] = useState<Hunter | null>(null)
  const [teamName, setTeamName] = useState('')
  const [hunterName, setHunterName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setIsAdmin(data.data?.isAdmin || false)

        if (data.data?.isAdmin) {
          await fetchData()
        }
      } catch (e) {
        console.error('Failed to check admin:', e)
      } finally {
        setIsLoading(false)
      }
    }
    checkAdmin()
  }, [])

  const fetchData = async () => {
    try {
      const [teamsRes, huntersRes, pendingRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/hunters'),
        fetch('/api/submissions?status=PENDING'),
      ])

      const teamsData = await teamsRes.json()
      const huntersData = await huntersRes.json()
      const pendingData = await pendingRes.json()

      setTeams(teamsData.data || [])
      setHunters(huntersData.data || [])
      setPendingCount((pendingData.data || []).length)
    } catch (e) {
      console.error('Failed to fetch data:', e)
    }
  }

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError('')
    setIsAuthenticating(true)

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin }),
      })

      const data = await res.json()

      if (data.success) {
        setIsAdmin(true)
        await fetchData()
      } else {
        setPinError(data.error || 'Invalid PIN')
      }
    } catch (e) {
      setPinError('Something went wrong')
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Team CRUD
  const handleSaveTeam = async () => {
    if (!teamName.trim()) return
    setFormLoading(true)
    setFormError('')

    try {
      const url = editingTeam ? `/api/teams/${editingTeam.id}` : '/api/teams'
      const method = editingTeam ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName }),
      })

      const data = await res.json()

      if (data.success) {
        await fetchData()
        setShowTeamForm(false)
        setEditingTeam(null)
        setTeamName('')
      } else {
        setFormError(data.error)
      }
    } catch (e) {
      setFormError('Failed to save team')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Delete this team? All hunters and submissions will be deleted.')) return

    try {
      await fetch(`/api/teams/${id}`, { method: 'DELETE' })
      await fetchData()
    } catch (e) {
      console.error('Failed to delete team:', e)
    }
  }

  // Hunter CRUD
  const handleSaveHunter = async () => {
    if (!hunterName.trim() || !selectedTeamId) return
    setFormLoading(true)
    setFormError('')

    try {
      const url = editingHunter ? `/api/hunters/${editingHunter.id}` : '/api/hunters'
      const method = editingHunter ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: hunterName, teamId: selectedTeamId }),
      })

      const data = await res.json()

      if (data.success) {
        await fetchData()
        setShowHunterForm(false)
        setEditingHunter(null)
        setHunterName('')
        setSelectedTeamId('')
      } else {
        setFormError(data.error)
      }
    } catch (e) {
      setFormError('Failed to save hunter')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteHunter = async (id: string) => {
    if (!confirm('Delete this hunter? All their submissions will be deleted.')) return

    try {
      await fetch(`/api/hunters/${id}`, { method: 'DELETE' })
      await fetchData()
    } catch (e) {
      console.error('Failed to delete hunter:', e)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    )
  }

  // Admin PIN entry
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card-camo p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-xl font-bold">Admin Access</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Enter your admin PIN</p>
            </div>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="label">Admin PIN</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="input pl-11"
                  required
                />
              </div>
            </div>

            {pinError && (
              <p className="text-sm text-red-400">{pinError}</p>
            )}

            <button
              type="submit"
              disabled={isAuthenticating || !adminPin}
              className="btn btn-primary w-full"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-[var(--camo-tan)]" />
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/submissions/pending" className="card-camo p-4 flex items-center justify-between hover:bg-[var(--secondary)] transition-colors">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Pending Submissions</span>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="badge badge-pending">{pendingCount}</span>
            )}
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </Link>
      </div>

      {/* Teams section */}
      <div className="card-camo p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-[var(--camo-tan)]" />
            <h2 className="font-semibold">Teams ({teams.length})</h2>
          </div>
          <button
            onClick={() => {
              setShowTeamForm(true)
              setEditingTeam(null)
              setTeamName('')
            }}
            className="btn btn-primary btn-sm py-2 px-3 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Team
          </button>
        </div>

        {teams.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-center py-4">No teams yet</p>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                <div>
                  <span className="font-medium">{team.name}</span>
                  <span className="text-sm text-[var(--muted-foreground)] ml-2">
                    ({team._count.hunters} hunters)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTeam(team)
                      setTeamName(team.name)
                      setShowTeamForm(true)
                    }}
                    className="p-2 hover:bg-[var(--camo-olive)] rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="p-2 hover:bg-red-900/50 rounded transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hunters section */}
      <div className="card-camo p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--camo-tan)]" />
            <h2 className="font-semibold">Hunters ({hunters.length})</h2>
          </div>
          <button
            onClick={() => {
              setShowHunterForm(true)
              setEditingHunter(null)
              setHunterName('')
              setSelectedTeamId(teams[0]?.id || '')
            }}
            disabled={teams.length === 0}
            className="btn btn-primary btn-sm py-2 px-3 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Hunter
          </button>
        </div>

        {hunters.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-center py-4">
            {teams.length === 0 ? 'Create a team first' : 'No hunters yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {hunters.map((hunter) => (
              <div key={hunter.id} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                <div>
                  <span className="font-medium">{hunter.name}</span>
                  <span className="text-sm text-[var(--muted-foreground)] ml-2">
                    ({hunter.team.name})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingHunter(hunter)
                      setHunterName(hunter.name)
                      setSelectedTeamId(hunter.team.id)
                      setShowHunterForm(true)
                    }}
                    className="p-2 hover:bg-[var(--camo-olive)] rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHunter(hunter.id)}
                    className="p-2 hover:bg-red-900/50 rounded transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team form modal */}
      {showTeamForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card-camo w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingTeam ? 'Edit Team' : 'Add Team'}
              </h2>
              <button
                onClick={() => setShowTeamForm(false)}
                className="p-2 hover:bg-[var(--secondary)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="input"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTeamForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTeam}
                  disabled={formLoading || !teamName.trim()}
                  className="btn btn-primary flex-1"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hunter form modal */}
      {showHunterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card-camo w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingHunter ? 'Edit Hunter' : 'Add Hunter'}
              </h2>
              <button
                onClick={() => setShowHunterForm(false)}
                className="p-2 hover:bg-[var(--secondary)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Hunter Name</label>
                <input
                  type="text"
                  value={hunterName}
                  onChange={(e) => setHunterName(e.target.value)}
                  placeholder="Enter hunter name"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Team</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="input select"
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowHunterForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHunter}
                  disabled={formLoading || !hunterName.trim() || !selectedTeamId}
                  className="btn btn-primary flex-1"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
