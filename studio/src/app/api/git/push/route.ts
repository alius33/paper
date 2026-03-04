import { NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { pushToRemote } from '@/lib/git';

export async function POST() {
  try {
    const repoPath = getRepoPath();
    await pushToRemote(repoPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to push';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
