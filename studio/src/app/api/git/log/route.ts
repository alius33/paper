import { NextRequest, NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { getLog } from '@/lib/git';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'limit must be a positive integer' },
        { status: 400 }
      );
    }

    const repoPath = getRepoPath();
    const commits = await getLog(repoPath, file, limit);

    return NextResponse.json({ commits });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get log';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
