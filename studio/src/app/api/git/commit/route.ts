import { NextRequest, NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { commitFiles } from '@/lib/git';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, message } = body;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'files must be a non-empty array of file paths' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message must be a non-empty string' },
        { status: 400 }
      );
    }

    const repoPath = getRepoPath();
    const commit = await commitFiles(repoPath, files, message);

    return NextResponse.json({ commit });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to commit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
