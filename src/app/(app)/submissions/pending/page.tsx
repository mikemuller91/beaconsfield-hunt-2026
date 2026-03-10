'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { SubmissionCard } from '@/components/ui/SubmissionCard'

interface Submission {
  id: string
  type: 'ANIMAL' | 'MISS'
  animalType: string | null
  session: string
  date: string
  time: string
  location: string
  photoUrl: string
  score: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string | null
  hunter: { id: string; name: string }
  team: { id: string; name: string }
  createdAt: string
}

interface SessionData {
  isAdmin: boolean
  hunterId?: string
}

export default function PendingSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [sessionRes, submissionsRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/submissions?status=PENDING'),
      ])

      const sessionData = await sessionRes.json()
      const submissionsData = await submissionsRes.json()

      setSession(sessionData.data)
      setSubmissions(submissionsData.data || [])
    } catch (e) {
      console.error('Failed to fetch data:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' }),
    })
    if (res.ok) {
      setSubmissions(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleReject = async (id: string, reason?: string) => {
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason }),
    })
    if (res.ok) {
      setSubmissions(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSubmissions(prev => prev.filter(s => s.id !== id))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-amber-500" />
        <h1 className="text-xl font-bold">Pending Submissions</h1>
        <span className="badge badge-pending">{submissions.length}</span>
      </div>

      {submissions.length === 0 ? (
        <div className="card-camo p-8 text-center">
          <Clock className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No pending submissions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              isAdmin={session?.isAdmin}
              isOwner={submission.hunter.id === session?.hunterId}
              onApprove={session?.isAdmin ? handleApprove : undefined}
              onReject={session?.isAdmin ? handleReject : undefined}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
