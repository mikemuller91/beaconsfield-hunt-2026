import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { z } from 'zod'

const hunterSchema = z.object({
  name: z.string().min(1, 'Hunter name is required').max(100),
  teamId: z.string().min(1, 'Team is required'),
})

// PUT update hunter (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

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

    const hunter = await prisma.hunter.update({
      where: { id },
      data: {
        name: parsed.data.name,
        teamId: parsed.data.teamId,
      },
      include: { team: true }
    })

    return NextResponse.json({ success: true, data: hunter })
  } catch (error) {
    console.error('Update hunter error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update hunter'
    if (message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Hunter not found' },
        { status: 404 }
      )
    }
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// DELETE hunter (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await prisma.hunter.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete hunter error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete hunter'
    if (message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Hunter not found' },
        { status: 404 }
      )
    }
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
