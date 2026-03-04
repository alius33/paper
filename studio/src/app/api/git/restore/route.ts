import { NextRequest, NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { restoreFile } from '@/lib/git';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash, file } = body;

    if (!hash || typeof hash !== 'string') {
      return NextResponse.json(
        { error: 'hash must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!file || typeof file !== 'string') {
      return NextResponse.json(
        { error: 'file must be a non-empty string' },
        { status: 400 }
      );
    }

    const repoPath = getRepoPath();
    const commit = await restoreFile(repoPath, hash, file);

    return NextResponse.json({ commit });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to restore file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
