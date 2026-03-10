import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()

    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: session.isAuthenticated || false,
        isAdmin: session.isAdmin || false,
        hunterId: session.hunterId,
        hunterName: session.hunterName,
        teamId: session.teamId,
        teamName: session.teamName,
      }
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { success: false, error: 'Session check failed' },
      { status: 500 }
    )
  }
}
