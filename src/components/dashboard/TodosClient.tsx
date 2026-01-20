"use client";

import { useState } from "react";
import { TodoItem } from "@/types";
import { TodoViewToggle } from "@/components/dashboard/TodoViewToggle";
import { TodoListView } from "@/components/dashboard/TodoListView";
import { TodoKanbanView } from "@/components/dashboard/TodoKanbanView";
import useSWR from "swr";

interface TodosClientProps {
  initialTodos: TodoItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TodosClient({ initialTodos }: TodosClientProps) {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const { data: todos, mutate } = useSWR<TodoItem[]>('/api/todos', fetcher, {
    fallbackData: initialTodos,
    refreshInterval: 5000,
    revalidateOnFocus: true,
    dedupingInterval: 4000,
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">TODO</h1>
        <TodoViewToggle view={view} onViewChange={setView} />
      </div>

      {view === 'list' ? (
        <TodoListView todos={todos || []} mutate={mutate} />
      ) : (
        <TodoKanbanView todos={todos || []} mutate={mutate} />
      )}
    </div>
  );
}
