#!/bin/bash
# Start Frontend

set -e

cd "$(dirname "$0")"

echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

echo ""
echo "Starting Frontend on port 3001..."
echo ""

PORT=3001 pnpm run dev
