import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed Settings
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      githubUsername: 'vercel',
      trackedRepos: ['vercel/next.js', 'facebook/react'],
    },
  });
  console.log('Created settings:', settings);

  // Seed Objectives and Key Results (if empty)
  const objectiveCount = await prisma.objective.count();
  if (objectiveCount === 0) {
    const objectives = [
      {
        title: 'Ship dashboard MVP',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        keyResults: [
          { title: 'Design navigation and layout', priority: 'high' as const },
          { title: 'Implement OKR CRUD flows', priority: 'medium' as const },
          { title: 'Polish landing dashboard copy', priority: 'medium' as const },
        ],
      },
      {
        title: 'Improve developer experience',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        keyResults: [
          { title: 'Document API routes', priority: 'low' as const },
          { title: 'Add seed data for demos', priority: 'medium' as const },
        ],
      },
    ];

    for (const objective of objectives) {
      await prisma.objective.create({
        data: {
          title: objective.title,
          deadline: objective.deadline,
          keyResults: {
            create: objective.keyResults.map((kr) => ({
              title: kr.title,
              priority: kr.priority,
            })),
          },
        },
      });
    }
    console.log(`Created ${objectives.length} objectives with key results`);
  } else {
    console.log(`Skipping objectives seed (already have ${objectiveCount})`);
  }

  // Seed Blog Posts
  const posts = [
    {
      slug: 'hello-world',
      title: 'Hello World',
      excerpt: 'Welcome to my new personal dashboard built with Next.js 14.',
      content: `
# Hello World

This is my first post on my new **Personal Dashboard**.

It is built with:
- Next.js 14 (App Router)
- PostgreSQL (Supabase)
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
      date: new Date(Date.now() - 86400000), // Yesterday
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`Created ${posts.length} blog posts`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
