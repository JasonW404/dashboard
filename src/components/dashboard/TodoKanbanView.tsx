"use client";

import { CheckCircle, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TodoItem } from "@/types";
import { format } from "date-fns";
import { updateTodo } from "@/actions/todos";
import { toast } from "sonner";

interface TodoKanbanViewProps {
  todos: TodoItem[];
  mutate: (data?: TodoItem[] | Promise<TodoItem[]>, shouldRevalidate?: boolean) => Promise<TodoItem[] | undefined>;
}

export function TodoKanbanView({ todos, mutate }: TodoKanbanViewProps) {
  const handleStatusChange = async (id: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      const optimisticTodos = todos?.map(t =>
        t.id === id ? { ...t, status: newStatus, completed: newStatus === 'done' } : t
      );
      mutate(optimisticTodos, false);
      await updateTodo(id, { status: newStatus, completed: newStatus === 'done' });
      mutate();
    } catch {
      toast.error("Failed to update status");
      mutate();
    }
  };

  const todoItems = todos?.filter(t => t.status === 'todo') || [];
  const inProgressItems = todos?.filter(t => t.status === 'in-progress') || [];
  const doneItems = todos?.filter(t => t.status === 'done') || [];

  const renderTodoCard = (todo: TodoItem) => (
    <Card key={todo.id} className="cursor-move hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="font-medium text-sm">{todo.content}</div>
          {todo.description && (
            <div className="text-xs text-muted-foreground">{todo.description}</div>
          )}
          <div className="flex gap-2 items-center">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              todo.priority === 'high' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              todo.priority === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
              todo.priority === 'low' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            )}>
              {todo.priority}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {todo.category === 'short-term' ? 'Short-term' : 'Future Aims'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(todo.createdAt), 'MMM d, yyyy')}
          </div>
          <div className="flex gap-1 pt-2">
            {todo.status !== 'todo' && (
              <button
                onClick={() => handleStatusChange(todo.id, 'todo')}
                className="text-xs px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                ← To Do
              </button>
            )}
            {todo.status !== 'in-progress' && (
              <button
                onClick={() => handleStatusChange(todo.id, 'in-progress')}
                className="text-xs px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                → In Progress
              </button>
            )}
            {todo.status !== 'done' && (
              <button
                onClick={() => handleStatusChange(todo.id, 'done')}
                className="text-xs px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                → Done
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-4">
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Circle className="h-5 w-5 text-blue-500" />
              To Do
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {todoItems.length}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="space-y-3">
          {todoItems.map(renderTodoCard)}
          {todoItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tasks
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              In Progress
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {inProgressItems.length}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="space-y-3">
          {inProgressItems.map(renderTodoCard)}
          {inProgressItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tasks in progress
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Done
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {doneItems.length}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="space-y-3">
          {doneItems.map(renderTodoCard)}
          {doneItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No completed tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
