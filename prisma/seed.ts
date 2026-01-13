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

  // Seed Todos
  const todos = [
    { content: 'Star Jason Dashboard on GitHub', priority: 'high', completed: false },
    { content: 'Deploy to Vercel', priority: 'medium', completed: false },
    { content: 'Write first blog post', priority: 'medium', completed: true },
  ];

  for (const todo of todos) {
    await prisma.todo.create({ data: todo });
  }
  console.log(`Created ${todos.length} todos`);

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
