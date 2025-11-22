#!/bin/bash
# Quick Test - Verify TEE Server is Running

echo "Testing TEE Server..."
echo ""

# Test health
echo "1. Health Check:"
curl -s http://localhost:3000/health_check | jq . || echo "Server not responding"
echo ""

# Test public key
echo "2. Public Key:"
curl -s http://localhost:3000/get_pk | jq . || echo "Server not responding"
echo ""

# Test attestation
echo "3. Attestation:"
curl -s http://localhost:3000/get_attestation | jq . || echo "Server not responding"
echo ""

echo "✓ Tests complete!"
