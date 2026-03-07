FROM node:22-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY studio/package.json ./
# npm 10 errors on cross-platform optional deps (@tailwindcss/oxide-win32-*).
# --force is the ONLY flag that actually bypasses EBADPLATFORM.
# Tested locally: full Docker build succeeds with this command.
RUN npm install --force
COPY studio/ .
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache git
WORKDIR /app

# Copy standalone Next.js build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x start.sh

# Copy manuscript content into /repo
COPY chapters/ /repo/chapters/
COPY research/ /repo/research/
COPY CLAUDE.md /repo/CLAUDE.md
COPY series_plot.md /repo/series_plot.md
COPY research-index.md /repo/research-index.md

# Initialize a git repo so simple-git operations don't crash
RUN cd /repo && git init && \
    git config user.email "studio@paperhouse" && \
    git config user.name "Paper House Studio" && \
    git add -A && git commit -m "init" --allow-empty || true

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV REPO_PATH=/repo

EXPOSE 3000
CMD ["sh", "start.sh"]
