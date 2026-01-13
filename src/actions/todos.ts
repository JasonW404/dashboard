'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTodos() {
  return await prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTodo(content: string, priority: 'low' | 'medium' | 'high' = 'medium') {
  const todo = await prisma.todo.create({
    data: {
      content,
      priority,
    },
  });
  revalidatePath('/todos');
  revalidatePath('/'); // Revalidate dashboard preview
  return todo;
}

export async function toggleTodo(id: string, completed: boolean) {
  const todo = await prisma.todo.update({
    where: { id },
    data: { completed },
  });
  revalidatePath('/todos');
  revalidatePath('/');
  return todo;
}

export async function deleteTodo(id: string) {
  await prisma.todo.delete({
    where: { id },
  });
  revalidatePath('/todos');
  revalidatePath('/');
}
