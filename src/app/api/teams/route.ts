import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireAdmin } from '@/lib/session'
import { z } from 'zod'

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
})

// GET all teams
export async function GET() {
  try {
    await requireAuth()

    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: { hunters: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, data: teams })
  } catch (error) {
    console.error('Get teams error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch teams'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// POST create new team (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const parsed = teamSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const team = await prisma.team.create({
      data: { name: parsed.data.name }
    })

    return NextResponse.json({ success: true, data: team }, { status: 201 })
  } catch (error) {
    console.error('Create team error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create team'
    if (message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Team name already exists' },
        { status: 400 }
      )
    }
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
