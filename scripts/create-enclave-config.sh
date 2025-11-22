#!/bin/bash
# Create enclave configuration on-chain

set -e

if [ "$#" -ne 5 ]; then
    echo "Usage: $0 <package_id> <name> <pcr0> <pcr1> <pcr2>"
    echo "Example: $0 0x123... 'SynapseModel v1' 0xabc... 0xdef... 0x789..."
    exit 1
fi

PACKAGE_ID=$1
NAME=$2
PCR0=$3
PCR1=$4
PCR2=$5

echo "Creating enclave configuration..."
echo "Package ID: $PACKAGE_ID"
echo "Name: $NAME"
echo ""

# First create the capability (using init function creates OTW)
# This requires the module to have been published with an init function

# Create config
sui client call \
    --package $PACKAGE_ID \
    --module enclave_registry \
    --function create_enclave_config \
    --args $NAME $PCR0 $PCR1 $PCR2 \
    --gas-budget 10000000

echo "Enclave configuration created successfully!"
