import { NextRequest, NextResponse } from 'next/server';
import { generateCommand } from '@/lib/claude-commands';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, instruction, filePath, contextFiles } = body;

    if (!instruction || typeof instruction !== 'string') {
      return NextResponse.json(
        { error: 'instruction must be a non-empty string' },
        { status: 400 }
      );
    }

    const command = generateCommand(
      templateId || null,
      instruction,
      filePath || '',
      contextFiles
    );

    return NextResponse.json({ command });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate command';

    if (message.includes('Unknown template')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
