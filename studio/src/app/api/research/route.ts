import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getRepoPath } from '@/lib/repo-config';

export interface ResearchGap {
  topic: string;
  resolved: boolean;
}

export interface ResearchSession {
  date: string;
  title: string;
  query: string;
  existingCoverage: string;
  actionTaken: string;
  newFile: string;
  findings: string[];
  gaps: string;
  crossReferences: string;
  relevance: string;
}

/**
 * Parses research gaps from research-index.md.
 * Looks for lines matching "- [ ] **topic**" or "- [x] **topic**"
 */
function parseResearchGaps(content: string): ResearchGap[] {
  const gaps: ResearchGap[] = [];
  const lines = content.split('\n');
  let inGapsSection = false;

  for (const line of lines) {
    if (line.startsWith('## Research Gaps')) {
      inGapsSection = true;
      continue;
    }
    if (inGapsSection && line.startsWith('## ')) {
      break;
    }
    if (!inGapsSection) continue;

    const unchecked = line.match(/^- \[ \] \*\*(.+?)\*\*/);
    if (unchecked) {
      gaps.push({ topic: unchecked[1], resolved: false });
      continue;
    }

    const checked = line.match(/^- \[x\] \*\*(.+?)\*\*/);
    if (checked) {
      gaps.push({ topic: checked[1], resolved: true });
    }
  }

  return gaps;
}

/**
 * Parses session entries from research-log.md.
 * Each session starts with "### Session YYYY-MM-DD — Title"
 */
function parseResearchSessions(content: string): ResearchSession[] {
  const sessions: ResearchSession[] = [];
  const sessionBlocks = content.split(/(?=### Session )/);

  for (const block of sessionBlocks) {
    const headerMatch = block.match(/### Session (\d{4}-\d{2}-\d{2}) — (.+)/);
    if (!headerMatch) continue;

    const session: ResearchSession = {
      date: headerMatch[1],
      title: headerMatch[2].trim(),
      query: '',
      existingCoverage: '',
      actionTaken: '',
      newFile: '',
      findings: [],
      gaps: '',
      crossReferences: '',
      relevance: '',
    };

    const queryMatch = block.match(/\*\*Query:\*\* (.+)/);
    if (queryMatch) session.query = queryMatch[1].trim();

    const coverageMatch = block.match(/\*\*Existing coverage found:\*\* (.+)/);
    if (coverageMatch) session.existingCoverage = coverageMatch[1].trim();

    const actionMatch = block.match(/\*\*Action taken:\*\* (.+)/);
    if (actionMatch) session.actionTaken = actionMatch[1].trim();

    const fileMatch = block.match(/\*\*New file created:\*\* (.+)/);
    if (fileMatch) session.newFile = fileMatch[1].trim();

    // Parse findings bullets
    const findingsSection = block.match(/\*\*Key findings:\*\*\n((?:- .+\n?)+)/);
    if (findingsSection) {
      session.findings = findingsSection[1]
        .split('\n')
        .filter(l => l.startsWith('- '))
        .map(l => l.replace(/^- /, '').trim());
    }

    const gapsMatch = block.match(/\*\*New research gaps identified:\*\* (.+)/);
    if (gapsMatch) session.gaps = gapsMatch[1].trim();

    const crossRefMatch = block.match(/\*\*Cross-references:\*\* (.+)/);
    if (crossRefMatch) session.crossReferences = crossRefMatch[1].trim();

    const relevanceMatch = block.match(/\*\*Relevance:\*\* (.+)/);
    if (relevanceMatch) session.relevance = relevanceMatch[1].trim();

    sessions.push(session);
  }

  return sessions;
}

export async function GET() {
  try {
    const repoPath = getRepoPath();

    // Read research-index.md and research-log.md in parallel
    const [indexContent, logContent] = await Promise.all([
      fs.readFile(path.join(repoPath, 'research-index.md'), 'utf-8').catch(() => ''),
      fs.readFile(path.join(repoPath, 'research', 'research-log.md'), 'utf-8').catch(() => ''),
    ]);

    const gaps = parseResearchGaps(indexContent);
    const sessions = parseResearchSessions(logContent);

    // Count files by subdirectory
    const researchDir = path.join(repoPath, 'research');
    const subdirs = ['world-building', 'characters', 'journeys', 'finance', 'craft', 'plot', 'digests'];
    const counts: Record<string, number> = {};

    for (const subdir of subdirs) {
      try {
        const files = await fs.readdir(path.join(researchDir, subdir));
        counts[subdir] = files.filter(f => f.endsWith('.md')).length;
      } catch {
        counts[subdir] = 0;
      }
    }

    return NextResponse.json({
      gaps,
      sessions,
      counts,
      totalResearchFiles: Object.values(counts).reduce((a, b) => a + b, 0),
      hasIndex: indexContent.length > 0,
      hasLog: logContent.length > 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load research data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
