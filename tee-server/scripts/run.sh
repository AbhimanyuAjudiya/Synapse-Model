#!/bin/bash
# Run script for SynapseModel TEE Server

set -e

echo "========================================="
echo "SynapseModel TEE Server - Run Script"
echo "========================================="
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
    echo ""
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "Starting TEE Server..."
echo "Host: ${HOST:-0.0.0.0}"
echo "Port: ${PORT:-3000}"
echo "Log Level: ${RUST_LOG:-info}"
echo ""

# Run the server
cargo run
