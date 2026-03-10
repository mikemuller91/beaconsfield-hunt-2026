import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { hunterId } = await request.json()

    const hunter = await prisma.hunter.findUnique({
      where: { id: hunterId },
      include: { team: true }
    })

    if (!hunter) {
      return NextResponse.json(
        { success: false, error: 'Hunter not found' },
        { status: 404 }
      )
    }

    session.hunterId = hunter.id
    session.hunterName = hunter.name
    session.teamId = hunter.team.id
    session.teamName = hunter.team.name
    await session.save()

    return NextResponse.json({
      success: true,
      data: {
        hunterId: hunter.id,
        hunterName: hunter.name,
        teamId: hunter.team.id,
        teamName: hunter.team.name
      }
    })
  } catch (error) {
    console.error('Hunter selection error:', error)
    return NextResponse.json(
      { success: false, error: 'Hunter selection failed' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getSession()

    session.hunterId = undefined
    session.hunterName = undefined
    session.teamId = undefined
    session.teamName = undefined
    await session.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hunter deselection error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear hunter selection' },
      { status: 500 }
    )
  }
}
