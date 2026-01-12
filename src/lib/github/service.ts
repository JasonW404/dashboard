import { Octokit } from 'octokit';
import { GitHubStats, TrackedRepo } from '@/types';

export class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getUserStats(username: string): Promise<GitHubStats> {
    if (!username) {
      return { repos: 0, commits: 0, trackedRepos: [] };
    }

    try {
      const { data: user } = await this.octokit.rest.users.getByUsername({
        username,
      });

      // Get events for commit count (simplified estimation)
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });

      const pushEvents = events.filter((e) => e.type === 'PushEvent');
      const commitCount = pushEvents.reduce((acc, event: any) => {
        return acc + (event.payload?.commits?.length || 0);
      }, 0);

      return {
        repos: user.public_repos,
        commits: commitCount,
        trackedRepos: [],
      };
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      return { repos: 0, commits: 0, trackedRepos: [] };
    }
  }

  async getRepoStats(owner: string, repo: string): Promise<TrackedRepo | null> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        owner: data.owner.login,
        name: data.name,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        lastUpdated: data.updated_at,
        url: data.html_url,
      };
    } catch (error) {
      console.error(`Error fetching repo stats for ${owner}/${repo}:`, error);
      return null;
    }
  }
}
