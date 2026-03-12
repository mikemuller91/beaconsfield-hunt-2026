'use client'

import { useEffect, useState } from 'react'
import { Users, Target, XCircle, ChevronDown, ChevronUp, MapPin } from 'lucide-react'

interface Submission {
  id: string
  type: 'ANIMAL' | 'MISS'
  animalType: string | null
  score: number
  session: string
  date: string
  location: string
}

interface HunterLeaderEntry {
  id: string
  name: string
  teamName: string
  teamId: string
  totalScore: number
  animalScore: number
  missCount: number
  approvedSubmissions: number
  submissions: Submission[]
}

const ANIMAL_LABELS: Record<string, string> = {
  KUDU_OVER_45: 'Kudu (>45")',
  KUDU_UNDER_45: 'Kudu (<45")',
  KUDU_COW: 'Kudu Cow',
  BUSHBUCK_OVER_12: 'Bushbuck (>12")',
  BUSHBUCK_UNDER_12: 'Bushbuck (<12")',
  IMPALA_RAM: 'Impala Ram',
  IMPALA_EWE: 'Impala Ewe',
  BLESBUCK: 'Blesbuck',
  PIG: 'Pig',
  BABOON: 'Baboon',
  MONKEY: 'Monkey',
  DUCK: 'Duck',
}

const SESSION_LABELS: Record<string, string> = {
  DAY1_MORNING: 'Day 1 Morning',
  DAY1_EVENING: 'Day 1 Evening',
  DAY2_MORNING: 'Day 2 Morning',
  DAY2_EVENING: 'Day 2 Evening',
}

export default function HunterLeaderboardPage() {
  const [hunters, setHunters] = useState<HunterLeaderEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedHunter, setExpandedHunter] = useState<string | null>(null)

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

  const toggleExpand = (hunterId: string) => {
    setExpandedHunter(expandedHunter === hunterId ? null : hunterId)
  }

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
              className={`card-camo overflow-hidden ${
                index === 0 ? 'ring-2 ring-amber-500 bg-amber-900/10' : ''
              }`}
            >
              {/* Main row - clickable */}
              <div
                onClick={() => hunter.submissions.length > 0 && toggleExpand(hunter.id)}
                className={`p-4 ${hunter.submissions.length > 0 ? 'cursor-pointer hover:bg-[var(--secondary)]/30' : ''} transition-colors`}
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
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-3xl font-bold score ${hunter.totalScore >= 0 ? 'score-positive' : 'score-negative'}`}>
                        {hunter.totalScore}
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">points</div>
                    </div>
                    {hunter.submissions.length > 0 && (
                      <div className="text-[var(--muted-foreground)]">
                        {expandedHunter === hunter.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded detail section */}
              {expandedHunter === hunter.id && hunter.submissions.length > 0 && (
                <div className="border-t border-[var(--border)] bg-[var(--secondary)]/20">
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">Score Breakdown</h4>
                    {hunter.submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between py-2 px-3 bg-[var(--secondary)]/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {sub.type === 'ANIMAL' ? (
                            <Target className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <div>
                            <span className="font-medium">
                              {sub.type === 'ANIMAL' && sub.animalType
                                ? ANIMAL_LABELS[sub.animalType] || sub.animalType
                                : 'Miss'}
                            </span>
                            <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                              <span>{SESSION_LABELS[sub.session] || sub.session}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {sub.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`font-bold ${sub.score >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                          {sub.score >= 0 ? '+' : ''}{sub.score}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-3">
                      <span className="font-semibold">Total</span>
                      <span className={`text-xl font-bold ${hunter.totalScore >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {hunter.totalScore >= 0 ? '+' : ''}{hunter.totalScore}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-[var(--muted-foreground)] text-center mt-6">
        Tap a hunter to see their score breakdown
      </p>
    </div>
  )
}
