import useSWR from 'swr';
import { useDashboardStore } from '@/lib/store';
import { GitHubStats, TrackedRepo, DashboardSettings } from '@/types';

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export function useGitHubStats(externalSettings?: DashboardSettings) {
  const { settings: storeSettings } = useDashboardStore();
  const settings = externalSettings || storeSettings;

  const { data: userStats, isLoading: isLoadingUser } = useSWR<GitHubStats>(
    settings.githubUsername ? `/api/github/user?username=${settings.githubUsername}` : null,
    fetcher
  );

  const { data: repoStats, isLoading: isLoadingRepos } = useSWR<TrackedRepo[]>(
    settings.trackedRepos.length > 0 ? `/api/github/repo?repos=${settings.trackedRepos.join(',')}` : null,
    async () => {
      const promises = settings.trackedRepos.map(async (repoString) => {
        const [owner, repo] = repoString.split('/');
        try {
          const res = await fetch(`/api/github/repo?owner=${owner}&repo=${repo}`);
          if (!res.ok) return null;
          return await res.json();
        } catch (error) {
          console.error(`Error fetching repo stats for ${repoString}:`, error);
          return null;
        }
      });
      const results = await Promise.all(promises);
      return results.filter((r): r is TrackedRepo => r !== null);
    }
  );

  return {
    userStats,
    repoStats,
    isLoading: isLoadingUser || isLoadingRepos,
  };
}
