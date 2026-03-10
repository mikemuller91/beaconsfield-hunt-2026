'use client'

import { useEffect, useState } from 'react'
import { Users, Target, XCircle } from 'lucide-react'

interface HunterLeaderEntry {
  id: string
  name: string
  teamName: string
  teamId: string
  totalScore: number
  animalScore: number
  missCount: number
  approvedSubmissions: number
}

export default function HunterLeaderboardPage() {
  const [hunters, setHunters] = useState<HunterLeaderEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard/hunters')
        const data = await res.json()
        setHunters(data.data || [])
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
        <Users className="w-6 h-6 text-blue-500" />
        <h1 className="text-xl font-bold">Hunter Leaderboard</h1>
      </div>

      {hunters.length === 0 ? (
        <div className="card-camo p-8 text-center">
          <Users className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No hunter scores yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hunters.map((hunter, index) => (
            <div
              key={hunter.id}
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
                    <h3 className="font-semibold text-lg">{hunter.name}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{hunter.teamName}</p>
                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] mt-1">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-green-500" />
                        +{hunter.animalScore}
                      </span>
                      {hunter.missCount > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-4 h-4" />
                          {hunter.missCount} miss{hunter.missCount !== 1 ? 'es' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold score ${hunter.totalScore >= 0 ? 'score-positive' : 'score-negative'}`}>
                    {hunter.totalScore}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-[var(--muted-foreground)] text-center mt-6">
        Individual scores include animals (+pts) and misses (-5 each)
      </p>
    </div>
  )
}
