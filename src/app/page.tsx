import DashboardView from "@/components/dashboard/DashboardView";
import { getPosts } from "@/actions/posts";
import { getSettings } from "@/actions/settings";
import { getTodos } from "@/actions/todos";
import { BlogPost, TodoItem } from "@/types";

export default async function Home() {
  const [posts, settings, todos] = await Promise.all([
    getPosts(),
    getSettings(),
    getTodos(),
  ]);

  // Convert server data to match types
  const typedPosts = posts as BlogPost[];
  // Map Prisma Todo to our TodoItem type
  const typedTodos = todos.map((todo: any) => ({
    id: todo.id,
    content: todo.content,
    completed: todo.completed,
    priority: todo.priority as 'low' | 'medium' | 'high',
    createdAt: todo.createdAt.toISOString(),
  }));

  return (
    <DashboardView 
      initialPosts={typedPosts} 
      initialSettings={settings} 
      initialTodos={typedTodos} 
    />
  );
}
