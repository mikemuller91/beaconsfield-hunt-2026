'use client'

import { useState, useRef } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onUpload: (base64: string, mimeType: string) => void
  currentImage?: string
  onRemove?: () => void
}

export function ImageUpload({ onUpload, currentImage, onRemove }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    setIsProcessing(true)

    try {
      // Compress and convert to base64
      const base64 = await compressAndConvert(file)
      const mimeType = file.type

      setPreview(base64)
      onUpload(base64, mimeType)
    } catch (err) {
      console.error('Processing error:', err)
      setError('Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const compressAndConvert = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1200px on longest side)
        const maxSize = 1200
        let { width, height } = img

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to JPEG base64 with quality 0.8
        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        resolve(base64)
      }

      img.onerror = () => reject(new Error('Failed to load image'))

      // Read file as data URL
      const reader = new FileReader()
      reader.onload = () => {
        img.src = reader.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleRemove = () => {
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onRemove?.()
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[var(--secondary)]">
            <img
              src={preview}
              alt="Uploaded photo"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--camo-sage)] transition-colors flex flex-col items-center justify-center gap-3 bg-[var(--input)]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-10 h-10 text-[var(--muted-foreground)] animate-spin" />
              <span className="text-sm text-[var(--muted-foreground)]">Processing...</span>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                <Camera className="w-7 h-7 text-[var(--camo-tan)]" />
              </div>
              <div className="text-center">
                <p className="font-medium">Tap to add photo</p>
                <p className="text-sm text-[var(--muted-foreground)]">Take photo or choose from library</p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
