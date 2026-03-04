#!/bin/sh
REPO_DIR="${REPO_PATH:-/workspace/repo}"
GIT_BRANCH_NAME="${GIT_BRANCH:-main}"

if [ -n "$GIT_REPO_URL" ]; then
  if [ ! -d "$REPO_DIR/.git" ]; then
    echo "Cloning repository..."
    git clone "$GIT_REPO_URL" "$REPO_DIR"
  else
    echo "Pulling latest..."
    cd "$REPO_DIR" && git pull origin "$GIT_BRANCH_NAME" || true
    cd /app
  fi
fi

exec node .next/standalone/server.js
