"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDashboardStore } from "@/lib/store";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/actions/settings";

export default function SettingsPage() {
  const { settings: storeSettings, updateSettings: updateStoreSettings } = useDashboardStore();
  const [username, setUsername] = useState("");
  const [repoInput, setRepoInput] = useState("");
  const [trackedRepos, setTrackedRepos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state from server
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setUsername(data.githubUsername);
        setTrackedRepos(data.trackedRepos);
        updateStoreSettings(data);
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [updateStoreSettings]);

  const handleSaveProfile = async () => {
    try {
      const updated = await updateSettings({ githubUsername: username });
      updateStoreSettings(updated);
      toast.success("Profile settings saved");
    } catch (error) {
      toast.error("Failed to save profile settings");
    }
  };

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim()) return;

    if (!repoInput.includes("/")) {
      toast.error("Invalid format. Use 'owner/repo'");
      return;
    }

    if (trackedRepos.includes(repoInput)) {
      toast.error("Repository already tracked");
      return;
    }

    const newRepos = [...trackedRepos, repoInput];
    
    try {
      const updated = await updateSettings({ trackedRepos: newRepos });
      setTrackedRepos(updated.trackedRepos);
      updateStoreSettings(updated);
      setRepoInput("");
      toast.success("Repository added");
    } catch (error) {
      toast.error("Failed to add repository");
    }
  };

  const handleRemoveRepo = async (repoToRemove: string) => {
    const newRepos = trackedRepos.filter(repo => repo !== repoToRemove);
    
    try {
      const updated = await updateSettings({ trackedRepos: newRepos });
      setTrackedRepos(updated.trackedRepos);
      updateStoreSettings(updated);
      toast.success("Repository removed");
    } catch (error) {
      toast.error("Failed to remove repository");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid gap-8">
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your dashboard configuration.
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Profile</CardTitle>
            <CardDescription>
              Enter your GitHub username to fetch your contribution stats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 max-w-md">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. jason-doe"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracked Repositories</CardTitle>
            <CardDescription>
              Add public repositories you want to monitor (format: owner/repo).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddRepo} className="flex gap-4 max-w-md">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="repo">Repository</Label>
                <Input
                  id="repo"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="e.g. vercel/next.js"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </form>

            <div className="space-y-2 mt-4">
              {trackedRepos.map((repo) => (
                <div
                  key={repo}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <span className="font-medium">{repo}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRepo(repo)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {trackedRepos.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No repositories tracked yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
