'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { BuckIcon } from '@/components/ui/BuckIcon'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.data?.isAuthenticated) {
          router.replace('/dashboard')
        }
      } catch (e) {
        // Not authenticated
      } finally {
        setIsChecking(false)
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen camo-pattern flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen camo-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl camo-accent mb-4">
            <BuckIcon className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Beaconsfield Hunt</h1>
          <p className="text-[var(--camo-tan)] text-lg">2026</p>
        </div>

        {/* Login card */}
        <div className="card-camo p-6">
          <div className="flex items-center gap-3 mb-6 p-3 bg-[var(--secondary)] rounded-lg">
            <Lock className="w-5 h-5 text-[var(--camo-tan)]" />
            <p className="text-sm text-[var(--muted-foreground)]">
              Enter the site password to access the scoreboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="label">
                Site Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--secondary)] rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-[var(--muted-foreground)]" />
                  ) : (
                    <Eye className="w-5 h-5 text-[var(--muted-foreground)]" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entering...</span>
                </>
              ) : (
                <>
                  <BuckIcon className="w-5 h-5" />
                  <span>Enter Hunt</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
          South Africa • 2026
        </p>
      </div>
    </div>
  )
}
