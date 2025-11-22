#!/bin/bash
# Extract PCR values from Nitro enclave build

set -e

BUILD_LOG="${1:-out/build.log}"

if [ ! -f "$BUILD_LOG" ]; then
    echo "❌ Build log not found: $BUILD_LOG"
    echo "Usage: $0 <build_log_file>"
    echo "Example: $0 out/build.log"
    exit 1
fi

echo "Extracting PCR values from: $BUILD_LOG"
echo ""

# Extract measurements section
grep -A 15 "Measurements:" "$BUILD_LOG" | grep "PCR" | while read -r line; do
    echo "$line"
done

echo ""
echo "✅ PCR values extracted successfully"
echo ""
echo "Copy these PCR values to:"
echo "  1. configs/enclave_config.yaml"
echo "  2. Your smart contract (SUI_ENCLAVE_CONFIG_ID)"
