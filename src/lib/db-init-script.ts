import { prisma } from './prisma'
import { initializeDatabase } from './db-init'

const seed = process.argv.includes('--seed') || process.env.DB_SEED === 'true'

initializeDatabase(prisma, seed)
  .then(() => {
    console.log('Database initialization completed successfully.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Database initialization failed:', error)
    process.exit(1)
  })
