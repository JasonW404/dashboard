'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTodos() {
  return await prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTodo(
  content: string, 
  priority: 'low' | 'medium' | 'high' = 'medium',
  category: 'short-term' | 'future-aims' = 'short-term',
  description?: string,
  dueDate?: Date
) {
  const todo = await prisma.todo.create({
    data: {
      content,
      priority,
      category,
      description,
      dueDate,
    },
  });
  revalidatePath('/todos');
  revalidatePath('/'); // Revalidate dashboard preview
  return todo;
}

export async function updateTodo(
  id: string,
  data: {
    content?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: 'short-term' | 'future-aims';
    description?: string;
    dueDate?: Date | null;
    status?: 'todo' | 'in-progress' | 'done';
    completed?: boolean;
  }
) {
  const todo = await prisma.todo.update({
    where: { id },
    data,
  });
  revalidatePath('/todos');
  revalidatePath('/');
  return todo;
}

export async function toggleTodo(id: string, completed: boolean) {
  const todo = await prisma.todo.update({
    where: { id },
    data: { 
      completed,
      status: completed ? 'done' : 'todo'
    },
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
