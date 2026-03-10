'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Camera, Plus, X, Loader2, User, Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'

interface Photo {
  id: string
  photoUrl: string
  caption: string | null
  createdAt: string
  hunter: { id: string; name: string } | null
}

interface SessionData {
  isAdmin: boolean
  hunterId?: string
}

export default function PhotoReelPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  // Upload form state
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPublicId, setPhotoPublicId] = useState('')
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const fetchData = async () => {
    try {
      const [sessionRes, photosRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/photos'),
      ])

      const sessionData = await sessionRes.json()
      const photosData = await photosRes.json()

      setSession(sessionData.data)
      setPhotos(photosData.data || [])
    } catch (e) {
      console.error('Failed to fetch data:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpload = async () => {
    if (!photoUrl) return
    setIsUploading(true)

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl, photoPublicId, caption }),
      })

      if (res.ok) {
        const data = await res.json()
        setPhotos(prev => [data.data, ...prev])
        setShowUpload(false)
        setPhotoUrl('')
        setPhotoPublicId('')
        setCaption('')
      }
    } catch (e) {
      console.error('Upload failed:', e)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this photo?')) return

    const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== id))
      setSelectedPhoto(null)
    }
  }

  const canDelete = (photo: Photo) => {
    return session?.isAdmin || photo.hunter?.id === session?.hunterId
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-purple-500" />
          <h1 className="text-xl font-bold">Photo Reel</h1>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Photo</span>
        </button>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="card-camo w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add to Photo Reel</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 hover:bg-[var(--secondary)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
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

              <div>
                <label className="label">Caption (optional)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="input"
                  maxLength={500}
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={!photoUrl || isUploading}
                className="btn btn-primary w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Add Photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full aspect-video">
              <Image
                src={selectedPhoto.photoUrl}
                alt={selectedPhoto.caption || 'Photo'}
                fill
                className="object-contain"
              />
            </div>

            <div className="bg-[var(--card)] p-4 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div>
                  {selectedPhoto.caption && (
                    <p className="text-lg mb-2">{selectedPhoto.caption}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                    {selectedPhoto.hunter && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedPhoto.hunter.name}
                      </span>
                    )}
                    <span>{format(new Date(selectedPhoto.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                {canDelete(selectedPhoto) && (
                  <button
                    onClick={() => handleDelete(selectedPhoto.id)}
                    className="btn btn-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="card-camo p-8 text-center">
          <Camera className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No photos yet</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Be the first to add a memory!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-[var(--secondary)] cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedPhoto(photo)}
            >
              <Image
                src={photo.photoUrl}
                alt={photo.caption || 'Photo'}
                fill
                className="object-cover"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-sm text-white truncate">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
