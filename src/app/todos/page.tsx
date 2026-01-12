"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export default function TodosPage() {
  const [newTodo, setNewTodo] = useState("");
  const { todos, addTodo, toggleTodo, deleteTodo } = useDashboardStore();

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    addTodo({
      id: uuidv4(),
      content: newTodo,
      completed: false,
      priority: "medium",
      createdAt: new Date().toISOString(),
    });
    setNewTodo("");
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.completed ? 1 : -1;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Tasks</h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </p>
      </div>

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
                    onClick={() => toggleTodo(todo.id)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {todo.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-sm",
                      todo.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {todo.content}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {todos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No tasks for today. Enjoy your day!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
