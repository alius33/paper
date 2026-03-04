import fs from 'fs';
import path from 'path';

/**
 * Candidate paths to check when REPO_PATH is not set.
 * Ordered by likelihood: Railway container, local dev, workspace fallback.
 */
const CANDIDATE_PATHS = [
  '/repo',
  '/home/user/paper',
  path.resolve(process.cwd(), '..'),
  '/workspace/repo',
];

let resolvedPath: string | null = null;

/**
 * Validates that a directory looks like the manuscript repository
 * by checking for the presence of the chapters/ directory.
 */
function isRepoRoot(dir: string): boolean {
  try {
    return fs.statSync(path.join(dir, 'chapters')).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Returns the configured repository path. Checks REPO_PATH env var first,
 * then probes known candidate paths for the manuscript content.
 */
export function getRepoPath(): string {
  if (resolvedPath) return resolvedPath;

  // 1. Explicit env var
  const envPath = process.env.REPO_PATH;
  if (envPath && isRepoRoot(envPath)) {
    resolvedPath = envPath;
    return resolvedPath;
  }

  // 2. Probe candidate paths
  for (const candidate of CANDIDATE_PATHS) {
    if (isRepoRoot(candidate)) {
      resolvedPath = candidate;
      return resolvedPath;
    }
  }

  // 3. Fallback to env var even if validation failed (may produce better error messages)
  resolvedPath = envPath || '/repo';
  return resolvedPath;
}
