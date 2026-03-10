import { Team, Hunter, Submission, PhotoReel, HuntingSession, SubmissionType, AnimalType, SubmissionStatus } from '@prisma/client'

// Re-export Prisma types
export type { Team, Hunter, Submission, PhotoReel }
export { HuntingSession, SubmissionType, AnimalType, SubmissionStatus }

// Extended types with relations
export type HunterWithTeam = Hunter & {
  team: Team
}

export type SubmissionWithRelations = Submission & {
  hunter: Hunter
  team: Team
}

// Leaderboard types
export type TeamLeaderboardEntry = {
  id: string
  name: string
  totalScore: number
  approvedSubmissions: number
  hunterCount: number
}

export type HunterLeaderboardEntry = {
  id: string
  name: string
  teamName: string
  teamId: string
  totalScore: number
  animalScore: number
  missCount: number
  approvedSubmissions: number
}

// Form types
export type SubmissionFormData = {
  type: SubmissionType
  animalType?: AnimalType
  session: HuntingSession
  date: string
  time: string
  location: string
  photoUrl: string
  photoPublicId: string
}

// API Response types
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}
