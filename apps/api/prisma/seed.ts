import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed data will be added here when needed.
  // Example: create a test player, a completed session, etc.
  console.log('Seed script ran — nothing to seed yet.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
