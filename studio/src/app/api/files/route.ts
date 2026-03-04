import { NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { getFileTree } from '@/lib/files';

export async function GET() {
  try {
    const repoPath = getRepoPath();
    const tree = await getFileTree(repoPath);

    return NextResponse.json({ tree });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read file tree';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
