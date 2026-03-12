import { NextRequest, NextResponse } from 'next/server'

// Route segment config for larger payloads
export const maxDuration = 30 // seconds
import { prisma } from '@/lib/db'
import { requireAuth, requireHunter, getSession } from '@/lib/session'
import { getSubmissionScore } from '@/lib/scores'
import { SubmissionStatus, HuntingSession, SubmissionType, AnimalType } from '@prisma/client'
import { z } from 'zod'

const submissionSchema = z.object({
  type: z.nativeEnum(SubmissionType),
  animalType: z.nativeEnum(AnimalType).optional(),
  session: z.nativeEnum(HuntingSession),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  photoData: z.string().optional(),
  photoMimeType: z.string().optional(),
}).refine(
  (data) => data.type === 'MISS' || data.animalType !== undefined,
  { message: 'Animal type is required for animal submissions', path: ['animalType'] }
).refine(
  (data) => data.type === 'MISS' || (data.photoData && data.photoData.length > 0),
  { message: 'Photo is required for animal submissions', path: ['photoData'] }
)

// GET submissions
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const session = await getSession()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') as SubmissionStatus | null
    const hunterId = searchParams.get('hunterId')
    const teamId = searchParams.get('teamId')
    const huntingSession = searchParams.get('session') as HuntingSession | null

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (hunterId) where.hunterId = hunterId
    if (teamId) where.teamId = teamId
    if (huntingSession) where.session = huntingSession

    // Non-admins can only see their own pending/rejected submissions
    if (!session.isAdmin && status !== 'APPROVED') {
      if (session.hunterId) {
        where.hunterId = session.hunterId
      }
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        hunter: true,
        team: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: submissions })
  } catch (error) {
    console.error('Get submissions error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch submissions'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// POST create new submission
export async function POST(request: NextRequest) {
  try {
    const session = await requireHunter()

    const body = await request.json()
    const parsed = submissionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { type, animalType, session: huntingSession, date, time, location, photoData, photoMimeType } = parsed.data

    // Calculate score
    const score = getSubmissionScore(type, animalType)

    const submission = await prisma.submission.create({
      data: {
        hunterId: session.hunterId!,
        teamId: session.teamId!,
        type,
        animalType: type === 'ANIMAL' ? animalType : null,
        session: huntingSession,
        date: new Date(date),
        time,
        location,
        photoData: photoData || '',
        photoMimeType: photoMimeType || '',
        score,
        status: 'PENDING',
      },
      include: {
        hunter: true,
        team: true,
      }
    })

    return NextResponse.json({ success: true, data: submission }, { status: 201 })
  } catch (error) {
    console.error('Create submission error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create submission'
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
