import GitHubView from "@/components/dashboard/github/GitHubView";
import DashboardTodos from "@/components/dashboard/DashboardTodos";
import DashboardPosts from "@/components/dashboard/DashboardPosts";
import { getPosts } from "@/actions/posts";
import { getSettings } from "@/actions/settings";
import { getObjectives } from "@/actions/okr";
import { BlogPost, Objective } from "@/types";
import { Separator } from "@/components/ui/separator";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [posts, settings, objectives] = await Promise.all([
    getPosts(),
    getSettings(),
    getObjectives(),
  ]);

  // Convert server data to match types
  const typedPosts = posts as BlogPost[];
  const typedObjectives = objectives as Objective[];

  return (
    <div className="space-y-6">
      <GitHubView initialSettings={settings} />

      <Separator className="bg-border" />

      <h2 className="text-2xl font-bold">Activities</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardTodos initialObjectives={typedObjectives} />
        <DashboardPosts initialPosts={typedPosts} />
      </div>
    </div>
  );
}
