// Script to generate initial QR code slugs for the database
// Run this script to populate the database with 200 pre-generated slugs

import { generateInitialQRSlugs } from "../lib/qr-slug-generator"

console.log("Generating initial QR code slugs...")

const slugs = generateInitialQRSlugs()

console.log(`Generated ${slugs.length} unique QR code slugs:`)
console.log("Sample slugs:")
slugs.slice(0, 10).forEach((slug, index) => {
  console.log(`${index + 1}. ${slug}`)
})

// In a real application, you would save these to your database
// Example database insertion (pseudo-code):
/*
const qrSlugs = slugs.map(slug => ({
  slug,
  status: 'available',
  createdAt: new Date()
}))

await database.qrCodeSlugs.insertMany(qrSlugs)
*/

console.log("\nSlugs ready for database insertion!")
console.log("Format: nature-word-emotion-word-4char-code")
console.log("Example URL: tagmytrophy.com/story/mountain-sunrise-7x9k")
