import GitHubView from "@/components/dashboard/github/GitHubView";
import DashboardTodos from "@/components/dashboard/DashboardTodos";
import DashboardPosts from "@/components/dashboard/DashboardPosts";
import { getPosts } from "@/actions/posts";
import { getSettings } from "@/actions/settings";
import { getTodos } from "@/actions/todos";
import { BlogPost, TodoItem } from "@/types";
import { Separator } from "@/components/ui/separator";

export const dynamic = 'force-dynamic';

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
    <div className="space-y-6">
      <GitHubView initialSettings={settings} />

      <Separator className="bg-border" />

      <h2 className="text-2xl font-bold">Activities</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardTodos initialTodos={typedTodos} />
        <DashboardPosts initialPosts={typedPosts} />
      </div>
    </div>
  );
}
