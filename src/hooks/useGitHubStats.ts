import useSWR from 'swr';
import { GitHubService } from '@/lib/github/service';
import { useDashboardStore } from '@/lib/store';

const githubService = new GitHubService();

export function useGitHubStats() {
  const { settings } = useDashboardStore();

  const { data: userStats, isLoading: isLoadingUser } = useSWR(
    settings.githubUsername ? `github/user/${settings.githubUsername}` : null,
    () => githubService.getUserStats(settings.githubUsername)
  );

  const { data: repoStats, isLoading: isLoadingRepos } = useSWR(
    settings.trackedRepos.length > 0 ? `github/repos/${settings.trackedRepos.join(',')}` : null,
    async () => {
      const promises = settings.trackedRepos.map((repoString) => {
        const [owner, repo] = repoString.split('/');
        return githubService.getRepoStats(owner, repo);
      });
      const results = await Promise.all(promises);
      return results.filter((r): r is NonNullable<typeof r> => r !== null);
    }
  );

  return {
    userStats,
    repoStats,
    isLoading: isLoadingUser || isLoadingRepos,
  };
}
