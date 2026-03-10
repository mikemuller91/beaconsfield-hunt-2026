import { AnimalType } from '@prisma/client'

// Animal scores mapping
export const ANIMAL_SCORES: Record<AnimalType, number> = {
  KUDU_OVER_45: 35,
  KUDU_UNDER_45: 25,
  KUDU_COW: 15,
  BUSHBUCK_OVER_12: 25,
  BUSHBUCK_UNDER_12: 15,
  IMPALA_RAM: 10,
  IMPALA_EWE: 5,
  BLESBUCK: 5,
  PIG: 5,
  BABOON: 15,
  MONKEY: 1,
  DUCK: 0.5,
}

// Miss penalty (individual score only)
export const MISS_PENALTY = -5

// Get display name for animal type
export const ANIMAL_DISPLAY_NAMES: Record<AnimalType, string> = {
  KUDU_OVER_45: 'Kudu (over 45")',
  KUDU_UNDER_45: 'Kudu (under 45")',
  KUDU_COW: 'Kudu Cow',
  BUSHBUCK_OVER_12: 'Bushbuck (over 12")',
  BUSHBUCK_UNDER_12: 'Bushbuck (under 12")',
  IMPALA_RAM: 'Impala Ram',
  IMPALA_EWE: 'Impala Ewe',
  BLESBUCK: 'Blesbuck Ram/Ewe',
  PIG: 'Pig',
  BABOON: 'Baboon',
  MONKEY: 'Monkey',
  DUCK: 'Duck',
}

// Get score for a submission
export function getSubmissionScore(type: 'ANIMAL' | 'MISS', animalType?: AnimalType): number {
  if (type === 'MISS') {
    return MISS_PENALTY
  }
  if (animalType && animalType in ANIMAL_SCORES) {
    return ANIMAL_SCORES[animalType]
  }
  return 0
}

// Session display names
export const SESSION_DISPLAY_NAMES = {
  DAY1_MORNING: 'Day 1 - Morning',
  DAY1_EVENING: 'Day 1 - Evening',
  DAY2_MORNING: 'Day 2 - Morning',
  DAY2_EVENING: 'Day 2 - Evening',
} as const

// Status display names and colors
export const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-amber-500', textColor: 'text-amber-500' },
  APPROVED: { label: 'Approved', color: 'bg-green-600', textColor: 'text-green-600' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500', textColor: 'text-red-500' },
} as const
