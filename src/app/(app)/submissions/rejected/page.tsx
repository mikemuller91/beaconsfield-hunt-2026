'use client'

import { useEffect, useState } from 'react'
import { XCircle } from 'lucide-react'
import { SubmissionCard } from '@/components/ui/SubmissionCard'

interface Submission {
  id: string
  type: 'ANIMAL' | 'MISS'
  animalType: string | null
  session: string
  date: string
  time: string
  location: string
  photoData: string
  photoMimeType: string
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

export default function RejectedSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [sessionRes, submissionsRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/submissions?status=REJECTED'),
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
        <XCircle className="w-6 h-6 text-red-500" />
        <h1 className="text-xl font-bold">Rejected Submissions</h1>
        <span className="badge badge-rejected">{submissions.length}</span>
      </div>

      {submissions.length === 0 ? (
        <div className="card-camo p-8 text-center">
          <XCircle className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No rejected submissions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              isAdmin={session?.isAdmin}
              isOwner={submission.hunter.id === session?.hunterId}
              onDelete={session?.isAdmin ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
