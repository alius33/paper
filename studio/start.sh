#!/bin/sh
REPO_DIR="${REPO_PATH:-/repo}"
GIT_BRANCH_NAME="${GIT_BRANCH:-main}"

# If a remote URL is configured, clone or pull the latest content
if [ -n "$GIT_REPO_URL" ]; then
  if [ ! -d "$REPO_DIR/.git" ]; then
    echo "Cloning repository to $REPO_DIR..."
    git clone "$GIT_REPO_URL" "$REPO_DIR"
  else
    echo "Pulling latest from $GIT_BRANCH_NAME..."
    cd "$REPO_DIR" && git fetch origin "$GIT_BRANCH_NAME" && git reset --hard "origin/$GIT_BRANCH_NAME" || true
    cd /app
  fi
fi

echo "Starting Paper House Studio (REPO_PATH=$REPO_DIR)..."
exec node server.js
