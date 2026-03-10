import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { SubmissionStatus } from '@prisma/client'
import { z } from 'zod'

const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
})

// PATCH approve/reject submission (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
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

    const body = await request.json()
    const parsed = approvalSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: parsed.data.status as SubmissionStatus,
        rejectionReason: parsed.data.status === 'REJECTED' ? parsed.data.rejectionReason : null,
      },
      include: {
        hunter: true,
        team: true,
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Approve/reject submission error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update submission status'
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
