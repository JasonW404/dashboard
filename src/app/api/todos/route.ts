import { NextResponse } from 'next/server';
import { getObjectives } from '@/actions/okr';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const objectives = await getObjectives();
        return NextResponse.json(objectives);
    } catch (error) {
        console.error('Failed to fetch objectives:', error);
        return NextResponse.json({ error: 'Failed to fetch objectives' }, { status: 500 });
    }
}
