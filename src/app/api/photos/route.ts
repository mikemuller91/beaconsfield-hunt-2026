import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, getSession } from '@/lib/session'
import { z } from 'zod'

const photoSchema = z.object({
  photoData: z.string().min(1, 'Photo is required'),
  photoMimeType: z.string().min(1, 'Photo mime type is required'),
  caption: z.string().max(500).optional(),
})

// GET all photos for memory reel (includes approved submissions + manual uploads)
export async function GET() {
  try {
    await requireAuth()

    // Get photos from PhotoReel table
    const reelPhotos = await prisma.photoReel.findMany({
      include: {
        hunter: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get photos from approved submissions
    const approvedSubmissions = await prisma.submission.findMany({
      where: {
        status: 'APPROVED',
        type: 'ANIMAL',
        photoData: { not: '' }
      },
      include: {
        hunter: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Convert submissions to photo format
    const submissionPhotos = approvedSubmissions.map(sub => ({
      id: `submission-${sub.id}`,
      photoData: sub.photoData,
      photoMimeType: sub.photoMimeType,
      caption: `${sub.animalType?.replace(/_/g, ' ')} - ${sub.location}`,
      createdAt: sub.createdAt.toISOString(),
      hunter: sub.hunter,
      isSubmission: true
    }))

    // Convert reel photos to same format
    const manualPhotos = reelPhotos.map(photo => ({
      id: photo.id,
      photoData: photo.photoData,
      photoMimeType: photo.photoMimeType,
      caption: photo.caption,
      createdAt: photo.createdAt.toISOString(),
      hunter: photo.hunter,
      isSubmission: false
    }))

    // Combine and sort by date (newest first)
    const allPhotos = [...submissionPhotos, ...manualPhotos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ success: true, data: allPhotos })
  } catch (error) {
    console.error('Get photos error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch photos'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// POST add photo to memory reel
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await request.json()
    const parsed = photoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const photo = await prisma.photoReel.create({
      data: {
        hunterId: session.hunterId || null,
        photoData: parsed.data.photoData,
        photoMimeType: parsed.data.photoMimeType,
        caption: parsed.data.caption,
      },
      include: {
        hunter: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: photo }, { status: 201 })
  } catch (error) {
    console.error('Create photo error:', error)
    const message = error instanceof Error ? error.message : 'Failed to add photo'
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
