#!/bin/bash
set -e

API_PORT=${API_PORT:-3001}
PORT=${PORT:-5000}
BASE_PATH=${BASE_PATH:-/}

export API_PORT PORT BASE_PATH

cleanup() {
  kill 0
}
trap cleanup EXIT

PORT=$API_PORT BASE_PATH=$BASE_PATH pnpm --filter @workspace/api-server run dev &
API_PID=$!

sleep 3

PORT=$PORT BASE_PATH=$BASE_PATH pnpm --filter @workspace/global-enterprise run dev &
FRONTEND_PID=$!

wait $FRONTEND_PID
