'use client'

import { useEffect, useState } from 'react'
import { Trophy, Users, Target } from 'lucide-react'

interface TeamLeaderEntry {
  id: string
  name: string
  totalScore: number
  approvedSubmissions: number
  hunterCount: number
}

export default function TeamLeaderboardPage() {
  const [teams, setTeams] = useState<TeamLeaderEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard/teams')
        const data = await res.json()
        setTeams(data.data || [])
      } catch (e) {
        console.error('Failed to fetch leaderboard:', e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-amber-500" />
        <h1 className="text-xl font-bold">Team Leaderboard</h1>
      </div>

      {teams.length === 0 ? (
        <div className="card-camo p-8 text-center">
          <Trophy className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No team scores yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className={`card-camo p-4 ${
                index === 0 ? 'ring-2 ring-amber-500 bg-amber-900/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? 'bg-amber-500 text-black'
                        : index === 1
                        ? 'bg-gray-400 text-black'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {team.hunterCount} hunters
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {team.approvedSubmissions} kills
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold score ${team.totalScore >= 0 ? 'score-positive' : 'score-negative'}`}>
                    {team.totalScore}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-[var(--muted-foreground)] text-center mt-6">
        Team scores include approved animal submissions only (no misses)
      </p>
    </div>
  )
}
