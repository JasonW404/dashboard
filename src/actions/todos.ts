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
  description?: string | null,
  dueDate?: Date | null
) {
  const todo = await prisma.todo.create({
    data: {
      content,
      priority,
      category,
      description: description || undefined,
      dueDate: dueDate || undefined,
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
  // Get current todo to preserve its status if it's in-progress
  const currentTodo = await prisma.todo.findUnique({ where: { id } });
  
  const todo = await prisma.todo.update({
    where: { id },
    data: { 
      completed,
      // Only change status to done/todo if not already in-progress
      status: completed ? 'done' : (currentTodo?.status === 'in-progress' ? 'in-progress' : 'todo')
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
