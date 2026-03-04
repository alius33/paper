import { NextRequest, NextResponse } from 'next/server';
import { getRepoPath } from '@/lib/repo-config';
import { readFileContent, writeFileContent } from '@/lib/files';
import { commitFiles } from '@/lib/git';

interface RouteParams {
  params: Promise<{ filePath: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filePath } = await params;
    const relativePath = filePath.join('/');
    const repoPath = getRepoPath();
    const fileContent = await readFileContent(repoPath, relativePath);

    return NextResponse.json(fileContent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read file';

    if (message.includes('Path traversal')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message.includes('ENOENT') || message.includes('no such file')) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { filePath } = await params;
    const relativePath = filePath.join('/');
    const repoPath = getRepoPath();
    const body = await request.json();
    const { content, autoCommit, commitMessage } = body;

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content must be a string' },
        { status: 400 }
      );
    }

    await writeFileContent(repoPath, relativePath, content);

    // Optionally auto-commit the change
    if (autoCommit) {
      const message = commitMessage || `Update ${relativePath}`;
      const commit = await commitFiles(repoPath, [relativePath], message);
      return NextResponse.json({ success: true, commit });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to write file';

    if (message.includes('Path traversal')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
