'use client'

interface RifleIconProps {
  className?: string
}

export function RifleIcon({ className = 'w-6 h-6' }: RifleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Rifle barrel */}
      <path d="M2 12h14" />
      {/* Barrel tip */}
      <path d="M2 12l1-1v2l-1-1z" fill="currentColor" />
      {/* Scope */}
      <circle cx="10" cy="10" r="2" />
      <path d="M10 8v-2" />
      {/* Stock */}
      <path d="M16 12l4 4" />
      <path d="M18 14l2-1" />
      {/* Trigger guard */}
      <path d="M14 12v3c0 1-1 2-2 2" />
      {/* Grip */}
      <path d="M16 12l1 5" />
    </svg>
  )
}
