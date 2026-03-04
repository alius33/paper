import { NextRequest, NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { getFileAtCommit } from '@/lib/git';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');
    const file = searchParams.get('file');

    if (!hash || !file) {
      return NextResponse.json(
        { error: 'Both "hash" and "file" parameters are required' },
        { status: 400 }
      );
    }

    const repoPath = getRepoPath();
    const content = await getFileAtCommit(repoPath, hash, file);

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get file at commit';

    if (message.includes('exists on disk') || message.includes('does not exist')) {
      return NextResponse.json({ error: 'File not found at specified commit' }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
