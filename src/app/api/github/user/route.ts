import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github/service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const githubService = new GitHubService(process.env.GITHUB_TOKEN);
  const stats = await githubService.getUserStats(username);
  
  return NextResponse.json(stats);
}
