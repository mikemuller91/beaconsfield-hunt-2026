import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { HunterLeaderboardEntry } from '@/lib/types'

// GET hunter leaderboard
export async function GET() {
  try {
    await requireAuth()

    // Get all hunters with their approved submissions (including misses)
    const hunters = await prisma.hunter.findMany({
      include: {
        team: true,
        submissions: {
          where: {
            status: 'APPROVED',
          }
        }
      }
    })

    const leaderboard = hunters.map(hunter => {
      const animalSubmissions = hunter.submissions.filter(s => s.type === 'ANIMAL')
      const missSubmissions = hunter.submissions.filter(s => s.type === 'MISS')

      const animalScore = animalSubmissions.reduce((sum, s) => sum + s.score, 0)
      const missScore = missSubmissions.reduce((sum, s) => sum + s.score, 0) // Will be negative

      return {
        id: hunter.id,
        name: hunter.name,
        teamName: hunter.team.name,
        teamId: hunter.team.id,
        totalScore: animalScore + missScore,
        animalScore,
        missCount: missSubmissions.length,
        approvedSubmissions: hunter.submissions.length,
        // Include detailed submissions for breakdown
        submissions: hunter.submissions.map(s => ({
          id: s.id,
          type: s.type,
          animalType: s.animalType,
          score: s.score,
          session: s.session,
          date: s.date,
          location: s.location,
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }
    })

    // Sort by total score descending
    leaderboard.sort((a, b) => b.totalScore - a.totalScore)

    return NextResponse.json({ success: true, data: leaderboard })
  } catch (error) {
    console.error('Get hunter leaderboard error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch hunter leaderboard'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
