'use client'

interface BuckIconProps {
  className?: string
}

export function BuckIcon({ className = 'w-6 h-6' }: BuckIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {/* Kudu head silhouette with spiral horns */}
      <path d="
        M12 22
        C10.5 22 9.5 21 9 20
        C8.5 19 8.5 18 9 17
        L9 16
        C8 16 7 15.5 6.5 15
        C6 14.5 6 14 6.5 13.5
        L7 13
        C6.5 12.5 6 12 6 11
        C6 10 7 9 8 9
        L8 8.5
        C7 8 6.5 7 7 6
        C7.5 5 8.5 5 9 5.5
        C8.5 4.5 8 3 8.5 2
        C9 1.5 9.5 2 10 3
        C10.5 4 10 5 9.5 5.5
        L10 6
        C10.5 5.5 11 5.5 12 5.5
        C13 5.5 13.5 5.5 14 6
        L14.5 5.5
        C14 5 13.5 4 14 3
        C14.5 2 15 1.5 15.5 2
        C16 3 15.5 4.5 15 5.5
        C15.5 5 16.5 5 17 6
        C17.5 7 17 8 16 8.5
        L16 9
        C17 9 18 10 18 11
        C18 12 17.5 12.5 17 13
        L17.5 13.5
        C18 14 18 14.5 17.5 15
        C17 15.5 16 16 15 16
        L15 17
        C15.5 18 15.5 19 15 20
        C14.5 21 13.5 22 12 22
        Z
      " />
      {/* Left spiral horn */}
      <path
        d="M9 5.5 Q7 4 5.5 2 Q4 0.5 3 1 Q3.5 2 4.5 3.5 Q5 5 5 6.5 Q5 8 6.5 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Right spiral horn */}
      <path
        d="M15 5.5 Q17 4 18.5 2 Q20 0.5 21 1 Q20.5 2 19.5 3.5 Q19 5 19 6.5 Q19 8 17.5 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
