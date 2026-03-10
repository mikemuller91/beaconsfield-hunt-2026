import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  isAuthenticated: boolean
  isAdmin: boolean
  hunterId?: string
  hunterName?: string
  teamId?: string
  teamName?: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'beaconsfield-hunt-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session.isAuthenticated) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session.isAuthenticated || !session.isAdmin) {
    throw new Error('Unauthorized - Admin access required')
  }
  return session
}

export async function requireHunter() {
  const session = await getSession()
  if (!session.isAuthenticated || !session.hunterId) {
    throw new Error('Unauthorized - Hunter selection required')
  }
  return session
}
