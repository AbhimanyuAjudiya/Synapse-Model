#!/bin/bash
# Start Backend Server

set -e

cd "$(dirname "$0")"

echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

echo ""
echo "Starting Backend Server on port 4000..."
echo ""

pnpm run dev
