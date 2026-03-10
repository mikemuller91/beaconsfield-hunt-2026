'use client'

import { useState, useRef } from 'react'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onUpload: (url: string, publicId: string) => void
  currentImage?: string
  onRemove?: () => void
}

export function ImageUpload({ onUpload, currentImage, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'beaconsfield-hunt')

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onUpload(data.secure_url, data.public_id)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {currentImage ? (
        <div className="relative">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[var(--secondary)]">
            <Image
              src={currentImage}
              alt="Uploaded photo"
              fill
              className="object-cover"
            />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--camo-sage)] transition-colors flex flex-col items-center justify-center gap-3 bg-[var(--input)]"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-[var(--muted-foreground)] animate-spin" />
              <span className="text-sm text-[var(--muted-foreground)]">Uploading...</span>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                <Camera className="w-7 h-7 text-[var(--camo-tan)]" />
              </div>
              <div className="text-center">
                <p className="font-medium">Tap to upload photo</p>
                <p className="text-sm text-[var(--muted-foreground)]">Required for submission</p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
