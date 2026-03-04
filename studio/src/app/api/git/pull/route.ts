import { NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { pullFromRemote } from '@/lib/git';

export async function POST() {
  try {
    const repoPath = getRepoPath();
    const result = await pullFromRemote(repoPath);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to pull';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
