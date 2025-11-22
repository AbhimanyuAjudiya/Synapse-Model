#!/bin/bash

# SynapseModel - System Check & Startup Helper

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================="
echo "  SynapseModel - System Check"
echo "========================================="
echo ""

# Check Docker containers
echo -e "${GREEN}1. Checking Docker Services...${NC}"
if docker ps | grep -q synapsemodel-mongodb; then
    echo "  ✓ MongoDB running on localhost:27017"
else
    echo -e "  ${RED}✗ MongoDB not running${NC}"
    echo "    Run: docker start synapsemodel-mongodb"
fi

if docker ps | grep -q synapsemodel-redis; then
    echo "  ✓ Redis running on localhost:6379"
else
    echo -e "  ${RED}✗ Redis not running${NC}"
    echo "    Run: docker start synapsemodel-redis"
fi
echo ""

# Check smart contracts
echo -e "${GREEN}2. Smart Contracts (Testnet)${NC}"
echo "  ✓ Package ID: 0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f"
echo "  ✓ Job Registry: 0xba83e185b6e2c164294aeeb12ea74cdb5d7387192f96fb8ba13d07ad152a0411"
echo ""

# Check if services are running
echo -e "${GREEN}3. Checking Running Services...${NC}"

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "  ✓ TEE Server running on port 3000"
else
    echo -e "  ${YELLOW}○ TEE Server not running${NC}"
    echo "    Start: cd tee-server && ./start.sh"
fi

if lsof -ti:4000 > /dev/null 2>&1; then
    echo "  ✓ Backend API running on port 4000"
else
    echo -e "  ${YELLOW}○ Backend not running${NC}"
    echo "    Start: cd backend && ./start.sh"
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "  ✓ Frontend running on port 3001"
else
    echo -e "  ${YELLOW}○ Frontend not running${NC}"
    echo "    Start: cd frontend && ./start.sh"
fi
echo ""

# Test services
echo -e "${GREEN}4. Testing Active Services...${NC}"

if lsof -ti:3000 > /dev/null 2>&1; then
    if curl -s http://localhost:3000/health_check > /dev/null 2>&1; then
        echo "  ✓ TEE Server responding"
    else
        echo -e "  ${YELLOW}⚠ TEE Server not responding${NC}"
    fi
fi

if lsof -ti:4000 > /dev/null 2>&1; then
    if curl -s http://localhost:4000/api/v1/health > /dev/null 2>&1; then
        echo "  ✓ Backend API responding"
    else
        echo -e "  ${YELLOW}⚠ Backend not responding${NC}"
    fi
fi
echo ""

# Summary
echo "========================================="
echo -e "${GREEN}  Next Steps${NC}"
echo "========================================="
echo ""
echo "To start all services, open 3 terminal windows:"
echo ""
echo -e "${YELLOW}Terminal 1:${NC} cd tee-server && ./start.sh"
echo -e "${YELLOW}Terminal 2:${NC} cd backend && ./start.sh"
echo -e "${YELLOW}Terminal 3:${NC} cd frontend && ./start.sh"
echo ""
echo "Then open: http://localhost:3001"
echo ""
echo "For detailed instructions, see: START.md"
echo ""
