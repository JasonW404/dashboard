import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github/service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
  }

  const githubService = new GitHubService(process.env.GITHUB_TOKEN);
  const stats = await githubService.getRepoStats(owner, repo);
  
  if (!stats) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
  }

  return NextResponse.json(stats);
}
