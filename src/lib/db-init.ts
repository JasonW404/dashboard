import { PrismaClient } from '@prisma/client';

/**
 * Database initialization utility
 * Automatically applies pending migrations and optionally seeds the database
 */

const logLevel = process.env.DB_INIT_LOG_LEVEL ?? 'info';

function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const logLevels = ['error', 'warn', 'info'];
  if (logLevels.indexOf(logLevel) >= logLevels.indexOf(level)) {
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
    console.log(`[DB Init] ${prefix} ${message}`);
  }
}

/**
 * Initialize the database by applying pending migrations
 *
 * In production: Uses `prisma migrate deploy` to apply migrations safely
 * In development: Uses `prisma migrate dev` to apply pending migrations
 *
 * @returns Promise<void>
 */
export async function initializeDatabase(prisma: PrismaClient, seed = false): Promise<void> {
  try {
    log('Starting database initialization...');

    await prisma.$connect();
    log('Database connection established.');

    const requiredTables = ['Settings', 'Todo', 'Post'];
    const existingTables = await checkExistingTables(prisma);

    log(`Found tables: ${existingTables.join(', ') || 'none'}`);

    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      log(`Missing tables: ${missingTables.join(', ')}`);

      if (process.env.NODE_ENV === 'production') {
        log('Running prisma migrate deploy in production mode...');
        await runMigrateDeploy();
      } else {
        log('Running prisma migrate dev in development mode...');
        await runMigrateDev();
      }
    } else {
      log('All required tables exist. Skipping migration.');
    }

    if (seed || process.env.DB_SEED === 'true') {
      log('Seeding database...');
      await seedDatabase(prisma);
    }

    log('Database initialization completed successfully.');
  } catch (error) {
    log(`Database initialization failed: ${error}`, 'error');
    throw error;
  }
}

/**
 * Check which tables already exist in the database
 */
async function checkExistingTables(prisma: PrismaClient): Promise<string[]> {
  const existingTables: string[] = [];

  const tableChecks = [
    { name: 'Settings', query: () => prisma.settings.count() },
    { name: 'Todo', query: () => prisma.todo.count() },
    { name: 'Post', query: () => prisma.post.count() },
  ];

  for (const { name, query } of tableChecks) {
    try {
      await query();
      existingTables.push(name);
    } catch (e) {
    }
  }

  return existingTables;
}

/**
 * Run prisma migrate deploy (production-safe)
 * Applies already generated migrations without creating new ones
 */
async function runMigrateDeploy(): Promise<void> {
  const { execSync } = await import('child_process');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    log('Migrations applied successfully.');
  } catch (error) {
    log(`Migration deploy failed: ${error}`, 'error');
    throw error;
  }
}

/**
 * Run prisma migrate dev (development only)
 * Applies pending migrations and creates new ones if schema changed
 */
async function runMigrateDev(): Promise<void> {
  const { execSync } = await import('child_process');
  try {
    execSync('npx prisma migrate dev --skip-generate', { stdio: 'inherit' });
    log('Migrations applied successfully.');
  } catch (error) {
    log(`Migration dev failed: ${error}`, 'error');
    throw error;
  }
}

/**
 * Seed the database with initial data
 */
async function seedDatabase(prisma: PrismaClient): Promise<void> {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        githubUsername: 'vercel',
        trackedRepos: ['vercel/next.js', 'facebook/react'],
      },
    });
    log(`Settings ${settings.id ? 'updated' : 'created'}.`);

    const todoCount = await prisma.todo.count();
    if (todoCount === 0) {
      const todos = [
        { content: 'Star Jason Dashboard on GitHub', priority: 'high', completed: false },
        { content: 'Deploy to Vercel', priority: 'medium', completed: false },
        { content: 'Write first blog post', priority: 'medium', completed: true },
      ];

      for (const todo of todos) {
        await prisma.todo.create({ data: todo });
      }
      log(`Created ${todos.length} todos.`);
    } else {
      log(`Skipping todo seeding (already exists: ${todoCount} todos).`);
    }

    const postCount = await prisma.post.count();
    if (postCount === 0) {
      const posts = [
        {
          slug: 'hello-world',
          title: 'Hello World',
          excerpt: 'Welcome to my new personal dashboard built with Next.js.',
          content: `
# Hello World

This is my first post on my new **Personal Dashboard**.

It is built with:
- Next.js (App Router)
- PostgreSQL
- Tailwind CSS
- Shadcn UI

## Features

1. **GitHub Stats**: Real-time overview of my open source contributions.
2. **Daily Todos**: A simple list to keep me focused.
3. **Blog**: A place to share my thoughts.

Stay tuned for more updates!
          `,
          tags: ['Next.js', 'Personal', 'Update'],
          date: new Date(),
        },
        {
          slug: 'building-with-prisma',
          title: 'Building with Prisma',
          excerpt: 'Why I chose Prisma ORM for this project.',
          content: `
# Why Prisma?

Prisma is an amazing ORM for TypeScript. It provides:

- **Type Safety**: Auto-generated types from your schema.
- **Easy Migrations**: managing DB changes is a breeze.
- **Great DX**: The VS Code extension is top notch.

\`\`\`typescript
const users = await prisma.user.findMany();
\`\`\`

Highly recommended!
          `,
          tags: ['Tech', 'Prisma', 'Database'],
          date: new Date(Date.now() - 86400000),
        },
      ];

      for (const post of posts) {
        await prisma.post.upsert({
          where: { slug: post.slug },
          update: {},
          create: post,
        });
      }
      log(`Created ${posts.length} blog posts.`);
    } else {
      log(`Skipping post seeding (already exists: ${postCount} posts).`);
    }

    log('Database seeding completed.');
  } catch (error) {
    log(`Seeding failed: ${error}`, 'error');
    throw error;
  }
}
