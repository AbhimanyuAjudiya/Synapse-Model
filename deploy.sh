#!/bin/bash

set -e

echo "========================================="
echo "SynapseModel - Full Stack Deployment"
echo "========================================="
echo ""

# Colors
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/abhimanyu/Documents/Programming/SynapseModel-sui"

# Step 1: Verify Docker containers
echo "${GREEN}Step 1: Checking Docker containers...${NC}"
docker ps | grep synapsemodel-mongodb || echo "MongoDB not running!"
docker ps | grep synapsemodel-redis || echo "Redis not running!"
echo ""

# Step 2: Display deployed contracts
echo "${GREEN}Step 2: Deployed Smart Contracts${NC}"
echo "Package ID: 0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f"
echo "Job Registry ID: 0xba83e185b6e2c164294aeeb12ea74cdb5d7387192f96fb8ba13d07ad152a0411"
echo ""

# Step 3: Build and start TEE server
echo "${GREEN}Step 3: Building TEE Server...${NC}"
cd "$PROJECT_ROOT/tee-server"

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

echo "Building Rust TEE server..."
cargo build --release 2>&1 | grep -E "(Compiling|Finished|error)" || true

if [ -f "target/release/synapsemodel-tee-server" ]; then
    echo "${GREEN}✓ TEE Server built successfully${NC}"
    echo "Starting TEE server on port 3000..."
    RUST_LOG=info ./target/release/synapsemodel-tee-server &
    TEE_PID=$!
    echo "TEE Server PID: $TEE_PID"
    sleep 3
    
    # Get public key
    echo "Fetching TEE public key..."
    curl -s http://localhost:3000/get_pk | jq '.public_key' || echo "Server not ready yet"
else
    echo "${YELLOW}⚠ TEE Server build may have issues, check build.log${NC}"
fi
echo ""

# Step 4: Start Backend
echo "${GREEN}Step 4: Starting Backend API...${NC}"
cd "$PROJECT_ROOT/backend"

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    pnpm install
fi

echo "Starting backend on port 4000..."
pnpm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 5
echo ""

# Step 5: Start Frontend
echo "${GREEN}Step 5: Starting Frontend...${NC}"
cd "$PROJECT_ROOT/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install
fi

echo "Starting frontend on port 3001..."
PORT=3001 pnpm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
echo ""

# Summary
echo "========================================="
echo "${GREEN}✓ Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "📦 Services Running:"
echo "  - MongoDB:     localhost:27017"
echo "  - Redis:       localhost:6379"
echo "  - TEE Server:  http://localhost:3000"
echo "  - Backend API: http://localhost:4000"
echo "  - Frontend:    http://localhost:3001"
echo ""
echo "📋 Smart Contracts (Testnet):"
echo "  - Package:      0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f"
echo "  - Job Registry: 0xba83e185b6e2c164294aeeb12ea74cdb5d7387192f96fb8ba13d07ad152a0411"
echo ""
echo "🔑 Process IDs:"
echo "  - TEE Server:  $TEE_PID"
echo "  - Backend:     $BACKEND_PID"
echo "  - Frontend:    $FRONTEND_PID"
echo ""
echo "To stop all services:"
echo "  kill $TEE_PID $BACKEND_PID $FRONTEND_PID"
echo ""
echo "To view logs:"
echo "  tail -f $PROJECT_ROOT/tee-server/logs/*.log"
echo "  tail -f $PROJECT_ROOT/backend/logs/*.log"
echo ""
