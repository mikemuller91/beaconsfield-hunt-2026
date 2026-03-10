import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, getSession } from '@/lib/session'
import { getSubmissionScore } from '@/lib/scores'
import { HuntingSession, SubmissionType, AnimalType } from '@prisma/client'
import { z } from 'zod'

const updateSchema = z.object({
  type: z.nativeEnum(SubmissionType).optional(),
  animalType: z.nativeEnum(AnimalType).optional().nullable(),
  session: z.nativeEnum(HuntingSession).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  photoUrl: z.string().url().optional(),
  photoPublicId: z.string().optional(),
})

// GET single submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        hunter: true,
        team: true,
      }
    })

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: submission })
  } catch (error) {
    console.error('Get submission error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch submission'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// PUT update submission (only pending, by owner or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const submission = await prisma.submission.findUnique({
      where: { id }
    })

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwner = submission.hunterId === session.hunterId
    const canEdit = session.isAdmin || (isOwner && submission.status === 'PENDING')

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own pending submissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (parsed.data.type !== undefined) updateData.type = parsed.data.type
    if (parsed.data.animalType !== undefined) updateData.animalType = parsed.data.animalType
    if (parsed.data.session !== undefined) updateData.session = parsed.data.session
    if (parsed.data.date !== undefined) updateData.date = new Date(parsed.data.date)
    if (parsed.data.time !== undefined) updateData.time = parsed.data.time
    if (parsed.data.location !== undefined) updateData.location = parsed.data.location
    if (parsed.data.photoUrl !== undefined) updateData.photoUrl = parsed.data.photoUrl
    if (parsed.data.photoPublicId !== undefined) updateData.photoPublicId = parsed.data.photoPublicId

    // Recalculate score if type or animal changed
    const newType = (updateData.type as SubmissionType) || submission.type
    const newAnimalType = updateData.animalType !== undefined
      ? (updateData.animalType as AnimalType | null)
      : submission.animalType
    updateData.score = getSubmissionScore(newType, newAnimalType || undefined)

    const updated = await prisma.submission.update({
      where: { id },
      data: updateData,
      include: {
        hunter: true,
        team: true,
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update submission error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update submission'
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// DELETE submission (pending by owner, or any by admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const submission = await prisma.submission.findUnique({
      where: { id }
    })

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwner = submission.hunterId === session.hunterId
    const canDelete = session.isAdmin || (isOwner && submission.status === 'PENDING')

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own pending submissions' },
        { status: 403 }
      )
    }

    await prisma.submission.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete submission error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete submission'
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
