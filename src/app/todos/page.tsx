import { getTodos } from "@/actions/todos";
import { TodoItem } from "@/types";
import { TodosClient } from "@/components/dashboard/TodosClient";
import { Todo } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function TodosPage() {
  const todos = await getTodos();

  // Map Prisma Todo to our TodoItem type
  const typedTodos: TodoItem[] = todos.map((todo: Todo) => ({
    id: todo.id,
    content: todo.content,
    completed: todo.completed,
    priority: todo.priority as 'low' | 'medium' | 'high',
    category: (todo.category || 'short-term') as 'short-term' | 'future-aims',
    description: todo.description || undefined,
    dueDate: todo.dueDate?.toISOString(),
    status: (todo.status || 'todo') as 'todo' | 'in-progress' | 'done',
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt?.toISOString(),
  }));

  return <TodosClient initialTodos={typedTodos} />;
}
