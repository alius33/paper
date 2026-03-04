import { NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { listSnapshots } from '@/lib/git';

export async function GET() {
  try {
    const repoPath = getRepoPath();
    const snapshots = await listSnapshots(repoPath);

    return NextResponse.json({ snapshots });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list snapshots';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
