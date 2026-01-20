import { NextResponse } from 'next/server';
import { getTodos } from '@/actions/todos';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const todos = await getTodos();
        return NextResponse.json(todos);
    } catch (error) {
        console.error('Failed to fetch todos:', error);
        return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
    }
}
