#!/bin/bash
# Start TEE Server

set -e

cd "$(dirname "$0")"

echo "Building TEE Server..."
cargo build --release

echo ""
echo "Starting TEE Server on port 3000..."
echo ""

export RUST_LOG=info
export HOST=0.0.0.0
export PORT=3000

./target/release/synapsemodel-tee-server
