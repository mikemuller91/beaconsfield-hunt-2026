import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { TeamLeaderboardEntry } from '@/lib/types'

// GET team leaderboard
export async function GET() {
  try {
    await requireAuth()

    // Get all teams with their approved animal submissions
    const teams = await prisma.team.findMany({
      include: {
        hunters: true,
        submissions: {
          where: {
            status: 'APPROVED',
            type: 'ANIMAL', // Exclude misses from team scores
          }
        }
      }
    })

    const leaderboard: TeamLeaderboardEntry[] = teams.map(team => ({
      id: team.id,
      name: team.name,
      totalScore: team.submissions.reduce((sum, s) => sum + s.score, 0),
      approvedSubmissions: team.submissions.length,
      hunterCount: team.hunters.length,
    }))

    // Sort by total score descending
    leaderboard.sort((a, b) => b.totalScore - a.totalScore)

    return NextResponse.json({ success: true, data: leaderboard })
  } catch (error) {
    console.error('Get team leaderboard error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch team leaderboard'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
