'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Target, X as XMark, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { ANIMAL_DISPLAY_NAMES, ANIMAL_SCORES, SESSION_DISPLAY_NAMES } from '@/lib/scores'

type SubmissionType = 'ANIMAL' | 'MISS'
type AnimalType = keyof typeof ANIMAL_DISPLAY_NAMES
type HuntingSession = keyof typeof SESSION_DISPLAY_NAMES

export default function SubmitPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [hasHunter, setHasHunter] = useState(false)

  // Form state
  const [type, setType] = useState<SubmissionType>('ANIMAL')
  const [animalType, setAnimalType] = useState<AnimalType | ''>('')
  const [session, setSession] = useState<HuntingSession>('DAY1_MORNING')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5))
  const [location, setLocation] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPublicId, setPhotoPublicId] = useState('')

  useEffect(() => {
    const checkHunter = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setHasHunter(!!data.data?.hunterId)
      } catch (e) {
        console.error('Failed to check session:', e)
      }
    }
    checkHunter()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          animalType: type === 'ANIMAL' ? animalType : undefined,
          session,
          date,
          time,
          location,
          photoUrl,
          photoPublicId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/submissions/pending')
        }, 1500)
      } else {
        setError(data.error || 'Failed to submit. Please try again.')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hasHunter) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card-camo p-6 text-center">
          <Target className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Select Your Identity First</h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            You need to select your hunter profile before making submissions.
          </p>
          <Link href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card-camo p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Submission Received!</h2>
          <p className="text-[var(--muted-foreground)]">
            Your entry is pending approval from the Master PH.
          </p>
        </div>
      </div>
    )
  }

  const currentScore = type === 'MISS' ? -5 : (animalType ? ANIMAL_SCORES[animalType as AnimalType] : 0)

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">New Submission</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Submission type */}
        <div className="card-camo p-4">
          <label className="label">What are you logging?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('ANIMAL')}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                type === 'ANIMAL'
                  ? 'border-green-600 bg-green-900/30'
                  : 'border-[var(--border)] hover:border-[var(--camo-sage)]'
              }`}
            >
              <Target className="w-8 h-8" />
              <span className="font-medium">Animal Shot</span>
            </button>
            <button
              type="button"
              onClick={() => setType('MISS')}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                type === 'MISS'
                  ? 'border-red-600 bg-red-900/30'
                  : 'border-[var(--border)] hover:border-[var(--camo-sage)]'
              }`}
            >
              <XMark className="w-8 h-8" />
              <span className="font-medium">Miss</span>
            </button>
          </div>
        </div>

        {/* Animal type (only for animal shots) */}
        {type === 'ANIMAL' && (
          <div className="card-camo p-4">
            <label className="label">Animal Type</label>
            <select
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value as AnimalType)}
              className="input select"
              required
            >
              <option value="">Select animal...</option>
              {Object.entries(ANIMAL_DISPLAY_NAMES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({ANIMAL_SCORES[key as AnimalType]} pts)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Photo upload */}
        <div className="card-camo p-4">
          <label className="label">Photo Evidence</label>
          <ImageUpload
            onUpload={(url, publicId) => {
              setPhotoUrl(url)
              setPhotoPublicId(publicId)
            }}
            currentImage={photoUrl}
            onRemove={() => {
              setPhotoUrl('')
              setPhotoPublicId('')
            }}
          />
        </div>

        {/* Session */}
        <div className="card-camo p-4">
          <label className="label">Hunting Session</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value as HuntingSession)}
            className="input select"
            required
          >
            {Object.entries(SESSION_DISPLAY_NAMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="card-camo p-4 grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="card-camo p-4">
          <label className="label">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., North Ridge, Block 4"
            className="input"
            required
          />
        </div>

        {/* Score preview */}
        <div className="card-camo p-4 flex items-center justify-between">
          <span className="text-[var(--muted-foreground)]">Score Value:</span>
          <span className={`text-2xl font-bold score ${currentScore >= 0 ? 'score-positive' : 'score-negative'}`}>
            {currentScore >= 0 ? '+' : ''}{currentScore}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !photoUrl || (type === 'ANIMAL' && !animalType)}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              <span>Submit for Approval</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
