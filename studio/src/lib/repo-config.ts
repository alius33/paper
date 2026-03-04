import { DEFAULT_REPO_PATH } from './constants';

/**
 * Returns the configured repository path from the REPO_PATH environment
 * variable, falling back to the default path.
 */
export function getRepoPath(): string {
  return process.env.REPO_PATH || DEFAULT_REPO_PATH;
}
