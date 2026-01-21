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

export interface Objective {
  id: string;
  title: string;
  why?: string | null;
  how?: string | null;
  what?: string | null;
  completed: boolean;
  deadline?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  keyResults: KeyResult[];
}

export interface KeyResult {
  id: string;
  title: string;
  why?: string | null;
  how?: string | null;
  what?: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date | string | null;
  objectiveId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
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
