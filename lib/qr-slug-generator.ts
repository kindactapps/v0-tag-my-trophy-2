// QR Code Slug Generation System
// Generates nature-themed URL slugs for Tag My Trophy QR codes

const NATURE_WORDS = [
  "mountain",
  "river",
  "forest",
  "sunrise",
  "meadow",
  "canyon",
  "valley",
  "creek",
  "ridge",
  "grove",
  "trail",
  "stone",
  "oak",
  "pine",
  "cedar",
  "willow",
  "sage",
  "bloom",
  "fern",
  "moss",
  "reef",
  "peak",
  "lake",
  "stream",
]

const EMOTION_WORDS = [
  "journey",
  "memory",
  "story",
  "adventure",
  "moment",
  "dream",
  "wonder",
  "peace",
  "joy",
  "hope",
  "spirit",
  "heart",
  "soul",
  "bond",
  "love",
  "life",
  "growth",
  "wisdom",
  "courage",
  "grace",
  "harmony",
  "serenity",
  "bliss",
  "unity",
]

/**
 * Generates a random 4-character alphanumeric code
 */
function generateRandomCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generates a single QR code slug in format: nature-word-emotion-word-code
 */
export function generateQRSlug(): string {
  const natureWord = NATURE_WORDS[Math.floor(Math.random() * NATURE_WORDS.length)]
  const emotionWord = EMOTION_WORDS[Math.floor(Math.random() * EMOTION_WORDS.length)]
  const code = generateRandomCode()

  return `${natureWord}-${emotionWord}-${code}`
}

/**
 * Generates multiple unique QR code slugs
 */
export function generateMultipleQRSlugs(count: number): string[] {
  const slugs = new Set<string>()

  while (slugs.size < count) {
    slugs.add(generateQRSlug())
  }

  return Array.from(slugs)
}

/**
 * Validates if a slug follows the correct format
 */
export function validateQRSlug(slug: string): boolean {
  const parts = slug.split("-")
  if (parts.length !== 3) return false

  const [natureWord, emotionWord, code] = parts

  return NATURE_WORDS.includes(natureWord) && EMOTION_WORDS.includes(emotionWord) && /^[a-z0-9]{4}$/.test(code)
}

/**
 * Generates initial batch of QR slugs for database seeding
 */
export function generateInitialQRSlugs(): string[] {
  return generateMultipleQRSlugs(200)
}

// Types for QR code management
export interface QRCodeSlug {
  id: string
  slug: string
  status: "available" | "claimed" | "reserved"
  createdAt: Date
  claimedAt?: Date
  userId?: string
}

export interface QRCodeStats {
  totalScans: number
  uniqueVisitors: number
  lastScan?: Date
  topLocation?: string
  peakTime?: string
}
