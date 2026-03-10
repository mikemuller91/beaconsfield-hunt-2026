import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireAdmin } from '@/lib/session'
import { z } from 'zod'

const hunterSchema = z.object({
  name: z.string().min(1, 'Hunter name is required').max(100),
  teamId: z.string().min(1, 'Team is required'),
})

// GET all hunters
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    const hunters = await prisma.hunter.findMany({
      where: teamId ? { teamId } : undefined,
      include: { team: true },
      orderBy: [{ team: { name: 'asc' } }, { name: 'asc' }]
    })

    return NextResponse.json({ success: true, data: hunters })
  } catch (error) {
    console.error('Get hunters error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch hunters'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// POST create new hunter (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const parsed = hunterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: parsed.data.teamId }
    })

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      )
    }

    const hunter = await prisma.hunter.create({
      data: {
        name: parsed.data.name,
        teamId: parsed.data.teamId,
      },
      include: { team: true }
    })

    return NextResponse.json({ success: true, data: hunter }, { status: 201 })
  } catch (error) {
    console.error('Create hunter error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create hunter'
    if (message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Hunter already exists in this team' },
        { status: 400 }
      )
    }
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
