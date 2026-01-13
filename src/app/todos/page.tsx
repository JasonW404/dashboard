import { format } from "date-fns";
import { getTodos } from "@/actions/todos";
import { TodoList } from "@/components/dashboard/TodoList";
import { TodoItem } from "@/types";

export default async function TodosPage() {
  const todos = await getTodos();

  // Map Prisma Todo to our TodoItem type
  const typedTodos: TodoItem[] = todos.map((todo: any) => ({
    id: todo.id,
    content: todo.content,
    completed: todo.completed,
    priority: todo.priority as 'low' | 'medium' | 'high',
    createdAt: todo.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Tasks</h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </p>
      </div>

      <TodoList initialTodos={typedTodos} />
    </div>
  );
}
