"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle, Circle, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createTodo, toggleTodo, deleteTodo, updateTodo } from "@/actions/todos";
import { TodoItem } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";

interface TodoListViewProps {
  todos: TodoItem[];
  mutate: (data?: TodoItem[] | Promise<TodoItem[]>, shouldRevalidate?: boolean) => Promise<TodoItem[] | undefined>;
}

type SortOption = 'date' | 'priority' | 'status';

export function TodoListView({ todos, mutate }: TodoListViewProps) {
  const [newTodo, setNewTodo] = useState("");
  const [newCategory, setNewCategory] = useState<'short-term' | 'future-aims'>('short-term');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCategory, setEditCategory] = useState<'short-term' | 'future-aims'>('short-term');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const tempId = Date.now().toString();
    const tempTodo: TodoItem = {
      id: tempId,
      content: newTodo,
      completed: false,
      priority: 'medium',
      category: newCategory,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    try {
      mutate([...(todos || []), tempTodo], false);
      setNewTodo("");
      await createTodo(newTodo, 'medium', newCategory);
      mutate();
      toast.success("Task added");
    } catch {
      toast.error("Failed to add task");
      mutate();
    }
  };

  const handleToggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      const optimisticTodos = todos?.map(t =>
        t.id === id ? { ...t, completed: !currentStatus } : t
      );
      mutate(optimisticTodos, false);
      await toggleTodo(id, !currentStatus);
      mutate();
    } catch {
      toast.error("Failed to update task");
      mutate();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const optimisticTodos = todos?.filter(t => t.id !== id);
      mutate(optimisticTodos, false);
      await deleteTodo(id);
      toast.success("Task deleted");
      mutate();
    } catch {
      toast.error("Failed to delete task");
      mutate();
    }
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditContent(todo.content);
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateTodo(id, {
        content: editContent,
        description: editDescription,
        priority: editPriority,
        category: editCategory,
      });
      setEditingId(null);
      mutate();
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditDescription("");
  };

  const getSortedTodos = (todoList: TodoItem[]) => {
    return [...todoList].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'status') {
        const statusOrder = { 'in-progress': 3, 'todo': 2, 'done': 1 };
        return statusOrder[b.status] - statusOrder[a.status];
      }
      return 0;
    });
  };

  const shortTermTodos = getSortedTodos(todos?.filter(t => t.category === 'short-term') || []);
  const futureAimsTodos = getSortedTodos(todos?.filter(t => t.category === 'future-aims') || []);

  const renderTodoItem = (todo: TodoItem) => {
    const isEditing = editingId === todo.id;

    return (
      <div
        key={todo.id}
        className={cn(
          "flex flex-col gap-2 p-4 rounded-lg border",
          todo.completed ? "bg-muted/50" : "bg-card"
        )}
      >
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Task title..."
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)..."
                rows={2}
              />
              <div className="flex gap-2">
                <Select value={editPriority} onValueChange={(v: 'low' | 'medium' | 'high') => setEditPriority(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={editCategory} onValueChange={(v: 'short-term' | 'future-aims') => setEditCategory(v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short-term">Short-term</SelectItem>
                    <SelectItem value="future-aims">Future Aims</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleSaveEdit(todo.id)}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => handleToggleTodo(todo.id, todo.completed)}
                  className="text-muted-foreground hover:text-primary transition-colors mt-1"
                >
                  {todo.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div
                    className={cn(
                      "text-sm font-medium transition-all",
                      todo.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {todo.content}
                  </div>
                  {todo.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {todo.description}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      todo.priority === 'high' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      todo.priority === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                      todo.priority === 'low' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    )}>
                      {todo.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(todo.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStartEdit(todo)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <Select value={newCategory} onValueChange={(v: 'short-term' | 'future-aims') => setNewCategory(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short-term">Short-term</SelectItem>
                <SelectItem value="future-aims">Future Aims</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </form>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sort by:</h2>
        <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Short-term Todos</h2>
          <div className="space-y-2">
            {shortTermTodos.map(renderTodoItem)}
            {shortTermTodos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No short-term tasks
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Future Aims</h2>
          <div className="space-y-2">
            {futureAimsTodos.map(renderTodoItem)}
            {futureAimsTodos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No future aims
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
