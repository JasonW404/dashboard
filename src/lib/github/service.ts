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
      // Get authenticated user info if token is present and username matches
      let user;
      try {
        const { data: authUser } = await this.octokit.rest.users.getAuthenticated();
        if (authUser.login === username) {
          user = authUser;
        } else {
          // Fallback to public user info
          const { data: publicUser } = await this.octokit.rest.users.getByUsername({
            username,
          });
          user = publicUser;
        }
      } catch {
        // Fallback if not authenticated or error
        const { data: publicUser } = await this.octokit.rest.users.getByUsername({
          username,
        });
        user = publicUser;
      }

      // Get events for commit count (simplified estimation)
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });

      const pushEvents = events.filter((e) => e.type === 'PushEvent');
      const commitCount = pushEvents.reduce((acc, event: any) => {
        return acc + (event.payload?.commits?.length || 0);
      }, 0);

      // Use total_private_repos if available (authenticated user), otherwise just public_repos
      const totalRepos = (user as any).total_private_repos !== undefined 
        ? user.public_repos + (user as any).total_private_repos 
        : user.public_repos;

      return {
        repos: totalRepos,
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
