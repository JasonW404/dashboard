"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, GitBranch, Star, GitFork, AlertCircle, ArrowRight } from "lucide-react";
import { useGitHubStats } from "@/hooks/useGitHubStats";
import { useDashboardStore } from "@/lib/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GitHubCalendar } from "react-github-calendar";
import { BlogPost } from "@/types";
import { Circle } from "lucide-react";
import { format } from "date-fns";

interface DashboardViewProps {
  initialPosts: BlogPost[];
}

export default function DashboardView({ initialPosts }: DashboardViewProps) {
  const { userStats, repoStats, isLoading } = useGitHubStats();
  const { settings, todos, toggleTodo } = useDashboardStore();

  const totalStars = repoStats?.reduce((acc, repo) => acc + repo.stars, 0) || 0;
  const recentPosts = initialPosts.slice(0, 3);
  const pendingTodos = todos.filter(t => !t.completed).slice(0, 5);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!settings.githubUsername) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center space-y-4 py-12 text-center"
      >
        <h2 className="text-2xl font-bold">Welcome to Jason Dashboard</h2>
        <p className="text-muted-foreground">
          Configure your GitHub username in settings to see your stats.
        </p>
        <Link href="/settings">
          <Button>Go to Settings</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview for {settings.githubUsername}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Stats Blocks */}
        <motion.div variants={item} className="md:col-span-4 flex flex-col gap-4">
          <Card className="flex-1 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
            <CardContent className="flex flex-row items-center justify-between p-6 h-full">
              <div className="flex flex-row items-center gap-4">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Total Repositories</span>
              </div>
              <div className="text-2xl font-bold leading-none">
                {isLoading ? "..." : userStats?.repos}
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
            <CardContent className="flex flex-row items-center justify-between p-6 h-full">
              <div className="flex flex-row items-center gap-4">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Recent Activity</span>
              </div>
              <div className="text-2xl font-bold leading-none">
                {isLoading ? "..." : userStats?.commits}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
            <CardContent className="flex flex-row items-center justify-between p-6 h-full">
              <div className="flex flex-row items-center gap-4">
                <Star className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Tracked Stars</span>
              </div>
              <div className="text-2xl font-bold leading-none">
                {isLoading ? "..." : totalStars}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: GitHub Contributions Graph */}
        <motion.div variants={item} className="md:col-span-8">
          <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Contributions</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-4 overflow-x-auto h-[calc(100%-4rem)]">
              <GitHubCalendar 
                username={settings.githubUsername}
                colorScheme="light"
                fontSize={12}
                blockSize={12}
                blockMargin={4}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tracked Repositories */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Tracked Repositories</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repoStats?.map((repo) => (
            <Card key={`${repo.owner}/${repo.name}`} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-2"
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
      </motion.div>

      {/* Content Previews: Todos and Blog */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Todo List Preview */}
        <motion.div variants={item}>
          <Card className="h-full hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quick Todos</CardTitle>
              <Link href="/todos">
                <Button variant="ghost" size="sm" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingTodos.length > 0 ? (
                  pendingTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => toggleTodo(todo.id)}
                    >
                      <button className="text-muted-foreground group-hover:text-primary transition-colors">
                        <Circle className="h-4 w-4" />
                      </button>
                      <span className="text-sm truncate group-hover:text-foreground transition-colors">{todo.content}</span>
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

        {/* Blog Preview */}
        <motion.div variants={item}>
          <Card className="h-full hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Latest Posts</CardTitle>
              <Link href="/blog">
                <Button variant="ghost" size="sm" className="gap-2">
                  Read Blog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`}>
                      <div className="group space-y-1 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-medium group-hover:text-primary transition-colors">
                            {post.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.date), "MMM d")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No posts yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
