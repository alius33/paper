import simpleGit, { SimpleGit } from 'simple-git';
import { SNAPSHOT_PREFIX } from './constants';
import type { Commit, Snapshot } from '@/types/git';

/**
 * Creates a simple-git instance configured for the given repo path.
 *
 * @param repoPath - The root repository path
 * @returns A configured SimpleGit instance
 */
export function getGit(repoPath: string): SimpleGit {
  return simpleGit(repoPath, {
    maxConcurrentProcesses: 6,
    trimmed: true,
  });
}

/**
 * Stages the specified files and creates a commit.
 *
 * @param repoPath - The root repository path
 * @param files - Array of relative file paths to stage
 * @param message - The commit message
 * @returns The created Commit object
 */
export async function commitFiles(
  repoPath: string,
  files: string[],
  message: string
): Promise<Commit> {
  const git = getGit(repoPath);

  await git.add(files);
  const result = await git.commit(message, files);

  // Get the commit details
  const log = await git.log({ maxCount: 1 });
  const latest = log.latest;

  if (!latest) {
    throw new Error('Failed to retrieve commit details after committing');
  }

  return {
    hash: latest.hash,
    shortHash: latest.hash.substring(0, 7),
    message: latest.message,
    date: latest.date,
    author: latest.author_name,
    files,
  };
}

/**
 * Pushes committed changes to the origin remote.
 *
 * @param repoPath - The root repository path
 */
export async function pushToRemote(repoPath: string): Promise<void> {
  const git = getGit(repoPath);
  await git.push('origin');
}

/**
 * Pulls changes from the origin remote.
 *
 * @param repoPath - The root repository path
 * @returns Object with the number of changed files
 */
export async function pullFromRemote(repoPath: string): Promise<{ changes: number }> {
  const git = getGit(repoPath);
  const result = await git.pull('origin');

  return {
    changes: result.summary.changes,
  };
}

/**
 * Returns the commit history, optionally filtered to a specific file.
 *
 * @param repoPath - The root repository path
 * @param file - Optional file path to filter history
 * @param limit - Maximum number of commits to return (default 50)
 * @returns Array of Commit objects
 */
export async function getLog(
  repoPath: string,
  file?: string,
  limit: number = 50
): Promise<Commit[]> {
  const git = getGit(repoPath);

  const options: Record<string, string | number | undefined> = {
    maxCount: limit,
    format: {
      hash: '%H',
      shortHash: '%h',
      message: '%s',
      date: '%aI',
      author: '%aN',
    } as unknown as string,
  };

  if (file) {
    options.file = file;
  }

  const log = await git.log(options);

  return log.all.map((entry) => ({
    hash: entry.hash,
    shortHash: entry.hash.substring(0, 7),
    message: entry.message,
    date: entry.date,
    author: entry.author_name,
  }));
}

/**
 * Returns a unified diff between two commits, optionally for a specific file.
 *
 * @param repoPath - The root repository path
 * @param from - The starting commit hash
 * @param to - The ending commit hash
 * @param file - Optional file path to limit the diff
 * @returns The unified diff as a string
 */
export async function getDiff(
  repoPath: string,
  from: string,
  to: string,
  file?: string
): Promise<string> {
  const git = getGit(repoPath);
  const args = [from, to];

  if (file) {
    args.push('--', file);
  }

  return git.diff(args);
}

/**
 * Returns the content of a file at a specific commit.
 *
 * @param repoPath - The root repository path
 * @param hash - The commit hash
 * @param file - The file path relative to the repo root
 * @returns The file content at that commit
 */
export async function getFileAtCommit(
  repoPath: string,
  hash: string,
  file: string
): Promise<string> {
  const git = getGit(repoPath);
  return git.show([`${hash}:${file}`]);
}

/**
 * Restores a file to its state at a specific commit and creates a new commit.
 *
 * @param repoPath - The root repository path
 * @param hash - The commit hash to restore from
 * @param file - The file path to restore
 * @returns The new Commit object
 */
export async function restoreFile(
  repoPath: string,
  hash: string,
  file: string
): Promise<Commit> {
  const git = getGit(repoPath);

  // Checkout the file from the specified commit
  await git.checkout([hash, '--', file]);

  // Commit the restored file
  const message = `Restore ${file} to version from ${hash.substring(0, 7)}`;
  return commitFiles(repoPath, [file], message);
}

/**
 * Creates a named snapshot by tagging the current HEAD.
 *
 * @param repoPath - The root repository path
 * @param name - The snapshot name (will be prefixed with SNAPSHOT_PREFIX)
 * @param message - Optional message for the tag
 * @returns The created Snapshot object
 */
export async function createSnapshot(
  repoPath: string,
  name: string,
  message?: string
): Promise<Snapshot> {
  const git = getGit(repoPath);
  const tagName = `${SNAPSHOT_PREFIX}${name}`;

  if (message) {
    await git.tag(['-a', tagName, '-m', message]);
  } else {
    await git.tag([tagName]);
  }

  // Get the commit hash for the tag
  const hash = await git.revparse([tagName]);
  const log = await git.log({ maxCount: 1 });

  return {
    name,
    hash: hash.trim(),
    date: log.latest?.date || new Date().toISOString(),
    message,
  };
}

/**
 * Lists all snapshots (tags with the snapshot/ prefix).
 *
 * @param repoPath - The root repository path
 * @returns Array of Snapshot objects
 */
export async function listSnapshots(repoPath: string): Promise<Snapshot[]> {
  const git = getGit(repoPath);
  const tags = await git.tags();

  const snapshots: Snapshot[] = [];

  for (const tag of tags.all) {
    if (!tag.startsWith(SNAPSHOT_PREFIX)) {
      continue;
    }

    try {
      const hash = await git.revparse([tag]);
      // Get the date from the tagged commit
      const log = await git.log({ maxCount: 1, from: hash.trim(), to: hash.trim() });
      const date = log.latest?.date || '';

      // Try to get annotated tag message
      let message: string | undefined;
      try {
        const tagInfo = await git.raw(['tag', '-l', '--format=%(contents:subject)', tag]);
        if (tagInfo && tagInfo.trim()) {
          message = tagInfo.trim();
        }
      } catch {
        // Not an annotated tag, no message
      }

      snapshots.push({
        name: tag.substring(SNAPSHOT_PREFIX.length),
        hash: hash.trim(),
        date,
        message,
      });
    } catch {
      // Skip tags we can't resolve
    }
  }

  return snapshots;
}
