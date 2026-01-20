"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createTodo, toggleTodo, deleteTodo } from "@/actions/todos";
import { TodoItem } from "@/types";
import { toast } from "sonner";
import useSWR from "swr";

interface TodoListProps {
  initialTodos: TodoItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TodoList({ initialTodos }: TodoListProps) {
  const [newTodo, setNewTodo] = useState("");
  const { data: todos, mutate } = useSWR<TodoItem[]>('/api/todos', fetcher, {
    fallbackData: initialTodos,
    refreshInterval: 5000, // Poll every 5 seconds
    revalidateOnFocus: true,
    dedupingInterval: 4000,
  });

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const tempId = Date.now().toString();
    const tempTodo: TodoItem = {
      id: tempId,
      content: newTodo,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };

    try {
      // Optimistic update
      mutate([...(todos || []), tempTodo], false);
      setNewTodo("");

      await createTodo(newTodo);
      mutate(); // Revalidate from server
      toast.success("Task added");
    } catch (error) {
      toast.error("Failed to add task");
      mutate(); // Revert to server data
    }
  };

  const handleToggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      const optimisticTodos = todos?.map(t =>
        t.id === id ? { ...t, completed: !currentStatus } : t
      );
      mutate(optimisticTodos, false);

      await toggleTodo(id, !currentStatus);
      mutate(); // Revalidate from server
    } catch (error) {
      toast.error("Failed to update task");
      mutate(); // Revert to server data
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      // Optimistic update
      const optimisticTodos = todos?.filter(t => t.id !== id);
      mutate(optimisticTodos, false);

      await deleteTodo(id);
      toast.success("Task deleted");
      mutate(); // Revalidate from server
    } catch (error) {
      toast.error("Failed to delete task");
      mutate(); // Revert to server data
    }
  };

  const sortedTodos = [...(todos || [])].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.completed ? 1 : -1;
  });

  return (
    <Card>
      <CardHeader>
        <form onSubmit={handleAddTodo} className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
          />
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                todo.completed ? "bg-muted/50" : "bg-card"
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleTodo(todo.id, todo.completed)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={cn(
                    "text-sm transition-all",
                    todo.completed && "text-muted-foreground line-through"
                  )}
                >
                  {todo.content}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {todos && todos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No tasks for today. Enjoy your day!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
