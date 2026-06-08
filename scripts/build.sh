#!/bin/bash
set -e

echo "=== Installing dependencies ==="
pnpm install --frozen-lockfile

echo "=== Building frontend ==="
PORT=5000 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/global-enterprise run build

echo "=== Building API server ==="
pnpm --filter @workspace/api-server run build

echo "=== Build complete ==="
