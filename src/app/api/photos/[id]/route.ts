import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, getSession } from '@/lib/session'

// DELETE photo from memory reel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const photo = await prisma.photoReel.findUnique({
      where: { id }
    })

    if (!photo) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Only admin or the uploader can delete
    const canDelete = session.isAdmin || photo.hunterId === session.hunterId

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own photos' },
        { status: 403 }
      )
    }

    await prisma.photoReel.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete photo error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete photo'
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
