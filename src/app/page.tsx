"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, GitBranch, Star, GitFork, AlertCircle } from "lucide-react";
import { useGitHubStats } from "@/hooks/useGitHubStats";
import { useDashboardStore } from "@/lib/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { userStats, repoStats, isLoading } = useGitHubStats();
  const { settings } = useDashboardStore();

  const totalStars = repoStats?.reduce((acc, repo) => acc + repo.stars, 0) || 0;

  if (!settings.githubUsername) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Welcome to Jason Dashboard</h2>
        <p className="text-muted-foreground">
          Configure your GitHub username in settings to see your stats.
        </p>
        <Link href="/settings">
          <Button>Go to Settings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview for {settings.githubUsername}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : userStats?.repos}
            </div>
            <p className="text-xs text-muted-foreground">Public repositories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : userStats?.commits}
            </div>
            <p className="text-xs text-muted-foreground">Recent push events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracked Stars</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : totalStars}
            </div>
            <p className="text-xs text-muted-foreground">Across {repoStats?.length || 0} tracked repos</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Tracked Repositories</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repoStats?.map((repo) => (
            <Card key={`${repo.owner}/${repo.name}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {repo.owner}/{repo.name}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {repo.stars}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {repo.forks}
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {repo.openIssues}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!repoStats || repoStats.length === 0) && (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No repositories tracked yet. Add them in settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
