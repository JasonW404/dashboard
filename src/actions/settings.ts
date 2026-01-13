'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Ensure a settings record exists
async function ensureSettings() {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    return await prisma.settings.create({
      data: {
        githubUsername: '',
        trackedRepos: [],
      },
    });
  }
  return settings;
}

export async function getSettings() {
  const settings = await ensureSettings();
  return {
    githubUsername: settings.githubUsername,
    trackedRepos: settings.trackedRepos,
  };
}

export async function updateSettings(data: { githubUsername?: string; trackedRepos?: string[] }) {
  const current = await ensureSettings();
  const settings = await prisma.settings.update({
    where: { id: current.id },
    data,
  });
  revalidatePath('/');
  revalidatePath('/settings');
  return {
    githubUsername: settings.githubUsername,
    trackedRepos: settings.trackedRepos,
  };
}
