export interface GitHubStats {
  repos: number;
  commits: number;
  trackedRepos: TrackedRepo[];
}

export interface TrackedRepo {
  owner: string;
  name: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastUpdated: string;
  url: string;
}

export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags?: string[];
}

export interface DashboardSettings {
  githubUsername: string;
  trackedRepos: string[]; // Format: "owner/repo"
}
