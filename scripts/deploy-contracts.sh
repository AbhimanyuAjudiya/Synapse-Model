#!/bin/bash
# Deploy SynapseModel contracts to Sui

set -e

echo "=================================================="
echo "SynapseModel Contract Deployment"
echo "=================================================="
echo ""

# Check if sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "Error: sui CLI not found. Please install Sui CLI first."
    exit 1
fi

# Get network from argument or default to testnet
NETWORK=${1:-testnet}
echo "Network: $NETWORK"
echo ""

# Navigate to contracts directory
cd "$(dirname "$0")/../contracts"

# Build contracts
echo "Building contracts..."
sui move build

if [ $? -ne 0 ]; then
    echo "Error: Contract build failed"
    exit 1
fi

echo "Build successful!"
echo ""

# Publish contracts
echo "Publishing contracts to $NETWORK..."
PUBLISH_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

if [ $? -ne 0 ]; then
    echo "Error: Contract publish failed"
    exit 1
fi

echo "Contracts published successfully!"
echo ""

# Parse output
PACKAGE_ID=$(echo $PUBLISH_OUTPUT | jq -r '.objectChanges[] | select(.type == "published") | .packageId')

echo "=================================================="
echo "Deployment Complete!"
echo "=================================================="
echo ""
echo "Package ID: $PACKAGE_ID"
echo ""
echo "Save this package ID to your .env file:"
echo "NEXT_PUBLIC_APP_PACKAGE_ID=$PACKAGE_ID"
echo ""
echo "Next steps:"
echo "1. Create enclave configuration"
echo "2. Register your enclave with attestation"
echo "3. Update frontend .env with package ID"
echo ""
