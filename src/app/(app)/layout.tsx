'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'

interface SessionData {
  isAuthenticated: boolean
  isAdmin: boolean
  hunterId?: string
  hunterName?: string
  teamId?: string
  teamName?: string
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()

        if (!data.data?.isAuthenticated) {
          router.replace('/')
          return
        }

        setSession(data.data)
      } catch (e) {
        router.replace('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/')
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navigation
        isAdmin={session.isAdmin}
        hunterName={session.hunterName}
        teamName={session.teamName}
        onLogout={handleLogout}
      />
      <main className="pt-20 pb-4 px-4 lg:pt-6 lg:pb-6 lg:px-6 lg:ml-64">
        {children}
      </main>
    </div>
  )
}
