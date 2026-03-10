import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { pin } = await request.json()

    if (pin !== process.env.ADMIN_PIN) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin PIN' },
        { status: 401 }
      )
    }

    session.isAdmin = true
    await session.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Admin authentication failed' },
      { status: 500 }
    )
  }
}
