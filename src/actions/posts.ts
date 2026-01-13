'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { BlogPost } from '@/types';

export async function getPosts(): Promise<BlogPost[]> {
  const posts = await prisma.post.findMany({
    orderBy: { date: 'desc' },
  });

  return posts.map((post: any) => ({
    ...post,
    date: post.date.toISOString(),
    tags: post.tags || [],
  }));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) return null;

  return {
    ...post,
    date: post.date.toISOString(),
    tags: post.tags || [],
  };
}

export async function createPost(data: { title: string; slug: string; excerpt: string; content: string; tags?: string[] }) {
  const post = await prisma.post.create({
    data: {
      ...data,
      date: new Date(),
      tags: data.tags || [],
    },
  });
  revalidatePath('/blog');
  revalidatePath('/');
  return post;
}
