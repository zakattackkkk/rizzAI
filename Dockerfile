# Use Node 23 instead of 20
FROM --platform=linux/amd64 node:23.1.0

# Install node-gyp and node-waf
RUN npm install -g node-gyp node-waf

# Install system dependencies and Playwright dependencies in one layer
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    git \
    curl \
    sqlite3 \
    # Playwright dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable pnpm

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/core/package.json ./packages/core/
COPY packages/agent/package.json ./packages/agent/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --include=optional sharp --frozen-lockfile

# Clean node_modules before copying source
RUN rm -rf packages/*/node_modules

# Copy source files
COPY . .

# Reinstall and build
RUN pnpm install --include=optional sharp

# Build all packages
RUN pnpm build

# Expose ports
EXPOSE 3000

ENV PORT=3000

# Switch to non-root user
USER node

# Start the application
RUN pnpm start