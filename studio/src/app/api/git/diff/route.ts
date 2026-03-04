import { NextRequest, NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { getDiff } from '@/lib/git';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const file = searchParams.get('file') || undefined;

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Both "from" and "to" commit hashes are required' },
        { status: 400 }
      );
    }

    const repoPath = getRepoPath();
    const diff = await getDiff(repoPath, from, to, file);

    return NextResponse.json({ diff });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get diff';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
