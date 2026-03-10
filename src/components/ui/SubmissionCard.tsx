'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Clock,
  MapPin,
  User,
  Target,
  XCircle,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import { ANIMAL_DISPLAY_NAMES, SESSION_DISPLAY_NAMES } from '@/lib/scores'

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

interface SubmissionCardProps {
  submission: Submission
  isAdmin?: boolean
  isOwner?: boolean
  onApprove?: (id: string) => Promise<void>
  onReject?: (id: string, reason?: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function SubmissionCard({
  submission,
  isAdmin,
  isOwner,
  onApprove,
  onReject,
  onDelete,
}: SubmissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleApprove = async () => {
    if (!onApprove) return
    setIsLoading(true)
    try {
      await onApprove(submission.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setIsLoading(true)
    try {
      await onReject(submission.id, rejectReason)
      setShowRejectForm(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('Are you sure you want to delete this submission?')) return
    setIsLoading(true)
    try {
      await onDelete(submission.id)
    } finally {
      setIsLoading(false)
    }
  }

  const canDelete = isAdmin || (isOwner && submission.status === 'PENDING')
  const canApproveReject = isAdmin && submission.status === 'PENDING'

  return (
    <div className="card-camo overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Photo thumbnail */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--secondary)] flex-shrink-0">
            <img
              src={submission.photoData}
              alt="Submission"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {submission.type === 'ANIMAL' ? (
                <Target className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="font-medium truncate">
                {submission.type === 'ANIMAL'
                  ? ANIMAL_DISPLAY_NAMES[submission.animalType as keyof typeof ANIMAL_DISPLAY_NAMES]
                  : 'Miss'}
              </span>
              <span className={`badge badge-${submission.status.toLowerCase()}`}>
                {submission.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <User className="w-3 h-3" />
              <span className="truncate">{submission.hunter.name}</span>
              <span>•</span>
              <span className="truncate">{submission.team.name}</span>
            </div>
          </div>

          {/* Score and expand */}
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold score ${submission.score >= 0 ? 'score-positive' : 'score-negative'}`}>
              {submission.score >= 0 ? '+' : ''}{submission.score}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[var(--border)]">
          {/* Large photo */}
          <div className="relative w-full aspect-video bg-black">
            <img
              src={submission.photoData}
              alt="Submission"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span>{SESSION_DISPLAY_NAMES[submission.session as keyof typeof SESSION_DISPLAY_NAMES]}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="truncate">{submission.location}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-[var(--muted-foreground)]">
                <span>{format(new Date(submission.date), 'MMM d, yyyy')}</span>
                <span>•</span>
                <span>{submission.time}</span>
              </div>
            </div>

            {/* Rejection reason */}
            {submission.status === 'REJECTED' && submission.rejectionReason && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">
                  <strong>Reason:</strong> {submission.rejectionReason}
                </p>
              </div>
            )}

            {/* Reject form */}
            {showRejectForm && (
              <div className="space-y-3">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="input h-24 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={isLoading}
                    className="btn btn-danger flex-1"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Reject'}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!showRejectForm && (canApproveReject || canDelete) && (
              <div className="flex gap-2 pt-2">
                {canApproveReject && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={isLoading}
                      className="btn flex-1 bg-green-700 hover:bg-green-600"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="btn btn-danger flex-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="btn btn-secondary"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
