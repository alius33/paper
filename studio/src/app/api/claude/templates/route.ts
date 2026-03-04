import { NextResponse } from 'next/server';
import { getCommandTemplates } from '@/lib/claude-commands';

export async function GET() {
  try {
    const templates = getCommandTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get templates';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
