#!/bin/bash
# Build script for SynapseModel TEE Server

set -e

echo "========================================="
echo "SynapseModel TEE Server - Build Script"
echo "========================================="
echo ""

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo not found. Please install Rust: https://rustup.rs/"
    exit 1
fi

echo "✅ Rust/Cargo found: $(cargo --version)"
echo ""

# Parse arguments
BUILD_TYPE="${1:-debug}"

if [ "$BUILD_TYPE" = "release" ]; then
    echo "Building release binary..."
    cargo build --release
    echo ""
    echo "✅ Release binary built: target/release/synapsemodel-tee-server"
else
    echo "Building debug binary..."
    cargo build
    echo ""
    echo "✅ Debug binary built: target/debug/synapsemodel-tee-server"
fi

echo ""
echo "Build completed successfully!"
