import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    // GraphQL query to get contribution calendar data
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

    const response: any = await octokit.graphql(query, {
      username,
    });

    const calendar = response.user.contributionsCollection.contributionCalendar;
    
    // Transform data for react-activity-calendar
    // It expects Array<{ date: string, count: number, level: number }>
    const data = [];
    
    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        // Skip future days if needed, but GitHub API usually handles this
        data.push({
          date: day.date,
          count: day.contributionCount,
          level: getLevel(day.contributionLevel),
        });
      }
    }

    return NextResponse.json({
      total: calendar.totalContributions,
      contributions: data
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

// Map GitHub's contribution levels to 0-4 scale
function getLevel(level: string): number {
  switch (level) {
    case 'NONE': return 0;
    case 'FIRST_QUARTILE': return 1;
    case 'SECOND_QUARTILE': return 2;
    case 'THIRD_QUARTILE': return 3;
    case 'FOURTH_QUARTILE': return 4;
    default: return 0;
  }
}
