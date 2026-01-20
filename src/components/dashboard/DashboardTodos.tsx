"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TodoItem } from "@/types";
import { toggleTodo } from "@/actions/todos";
import Link from "next/link";
import { motion } from "framer-motion";
import useSWR from "swr";

interface DashboardTodosProps {
    initialTodos: TodoItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardTodos({ initialTodos }: DashboardTodosProps) {
    const { data: todos, mutate } = useSWR<TodoItem[]>('/api/todos', fetcher, {
        fallbackData: initialTodos,
        refreshInterval: 5000, // Poll every 5 seconds
        revalidateOnFocus: true,
        dedupingInterval: 4000,
    });

    const pendingTodos = (todos || []).filter(t => !t.completed).slice(0, 5);

    const handleToggleTodo = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        const optimisticTodos = todos?.map(t =>
            t.id === id ? { ...t, completed: !currentStatus } : t
        );
        mutate(optimisticTodos, false);

        await toggleTodo(id, !currentStatus);
        mutate(); // Revalidate from server
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="h-full hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Quick Todos</CardTitle>
                    <Link href="/todos">
                        <Button variant="ghost" size="sm" className="gap-2 group">
                            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {pendingTodos.length > 0 ? (
                            pendingTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group border border-transparent hover:border-border"
                                    onClick={() => handleToggleTodo(todo.id, todo.completed)}
                                >
                                    <button className="text-muted-foreground group-hover:text-primary transition-colors relative">
                                        <Circle className={cn("h-5 w-5 transition-all", todo.completed ? "scale-0 opacity-0" : "scale-100 opacity-100")} />
                                        <CheckCircle className={cn("h-5 w-5 absolute inset-0 transition-all text-primary", todo.completed ? "scale-100 opacity-100" : "scale-0 opacity-0")} />
                                    </button>
                                    <span className={cn("text-sm truncate transition-colors", todo.completed ? "text-muted-foreground line-through" : "group-hover:text-foreground")}>{todo.content}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No pending tasks. Great job!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
