import { NextRequest, NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { createSnapshot } from '@/lib/git';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, message } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'name must be a non-empty string' },
        { status: 400 }
      );
    }

    // Sanitize the snapshot name — only allow alphanumeric, hyphens, underscores, and dots
    const sanitized = name.replace(/[^a-zA-Z0-9\-_.]/g, '-');
    if (sanitized !== name) {
      return NextResponse.json(
        { error: 'Snapshot name may only contain letters, numbers, hyphens, underscores, and dots' },
        { status: 400 }
      );
    }

    const repoPath = getRepoPath();
    const snapshot = await createSnapshot(repoPath, name, message);

    return NextResponse.json({ snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create snapshot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
