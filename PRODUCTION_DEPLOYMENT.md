# 🚀 SynapseModel - Production Deployment Guide (AWS Nitro Enclave)

## Prerequisites Checklist

✅ EC2 instance with Nitro Enclave support  
✅ AWS Nitro CLI installed  
✅ Docker installed on EC2  
✅ MongoDB accessible (local or cloud)  
✅ Redis accessible (local or cloud)  
✅ Sui wallet with testnet SUI  

---

## 📋 Step-by-Step Deployment

### **PHASE 1: Prepare EC2 Instance**

#### Step 1.1: SSH into your EC2 instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 1.2: Install dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ and pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install MongoDB (optional if using local)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Redis (optional if using local)
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify installations
node --version
pnpm --version
cargo --version
mongod --version
redis-cli --version
```

#### Step 1.3: Clone your project

```bash
cd ~
git clone <your-repo-url> SynapseModel-sui
cd SynapseModel-sui
```

---

### **PHASE 2: Deploy Smart Contracts (If Not Done)**

#### Step 2.1: Install Sui CLI on EC2

```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
```

#### Step 2.2: Configure Sui wallet

```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
sui client new-address ed25519
# Get testnet SUI from faucet
```

#### Step 2.3: Deploy contracts (if needed)

```bash
cd ~/SynapseModel-sui/contracts
sui client publish --gas-budget 500000000

# Save the output
# Package ID: 0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f
# Job Registry ID: 0xba83e185b6e2c164294aeeb12ea74cdb5d7387192f96fb8ba13d07ad152a0411
```

---

### **PHASE 3: Build TEE Server for Nitro Enclave**

#### Step 3.1: Build Docker image

```bash
cd ~/SynapseModel-sui/tee-server

# Build Docker image
docker build -f Containerfile -t synapsemodel-tee:latest .
```

#### Step 3.2: Build Nitro Enclave Image (.eif)

```bash
# Convert Docker image to Nitro Enclave Image
nitro-cli build-enclave \
  --docker-uri synapsemodel-tee:latest \
  --output-file synapsemodel.eif

# This will output PCR values - SAVE THEM!
# Example output:
# PCR0: abc123...
# PCR1: def456...
# PCR2: ghi789...
```

#### Step 3.3: Save PCR values

```bash
# Extract and save PCR values
nitro-cli describe-eif --eif-path synapsemodel.eif > pcr_values.json

# Extract PCR values
PCR0=$(jq -r '.Measurements.PCR0' pcr_values.json)
PCR1=$(jq -r '.Measurements.PCR1' pcr_values.json)
PCR2=$(jq -r '.Measurements.PCR2' pcr_values.json)

echo "PCR0: $PCR0"
echo "PCR1: $PCR1"
echo "PCR2: $PCR2"

# Save for later
cat > pcrs.txt << EOF
PCR0=$PCR0
PCR1=$PCR1
PCR2=$PCR2
EOF
```

---

### **PHASE 4: Register Enclave On-Chain**

#### Step 4.1: Create Enclave Configuration

```bash
export PACKAGE_ID=0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f
export ADMIN_CAP=<YOUR_ADMIN_CAP_ID>  # From deployment output

# Create enclave config with real PCR values
sui client call \
  --package $PACKAGE_ID \
  --module enclave_registry \
  --function create_enclave_config \
  --args $ADMIN_CAP \
    "SynapseModel Production v1" \
    "0x$PCR0" \
    "0x$PCR1" \
    "0x$PCR2" \
  --gas-budget 100000000

# Save the Enclave Config ID from output
export ENCLAVE_CONFIG_ID=<CONFIG_ID_FROM_OUTPUT>
```

#### Step 4.2: Run Enclave and Get Public Key

```bash
# Start the enclave
nitro-cli run-enclave \
  --eif-path synapsemodel.eif \
  --cpu-count 2 \
  --memory 4096 \
  --enclave-cid 16 \
  --debug-mode

# Check enclave is running
nitro-cli describe-enclaves

# Set up port forwarding (vsock to TCP)
# In a new terminal:
sudo socat TCP4-LISTEN:3000,reuseaddr,fork VSOCK-CONNECT:16:3000 &

# Wait a few seconds, then get public key
curl http://localhost:3000/get_pk

# Save the public key
export TEE_PUBLIC_KEY=<PUBLIC_KEY_FROM_RESPONSE>
```

#### Step 4.3: Register Enclave

```bash
# Register the enclave with its public key
sui client call \
  --package $PACKAGE_ID \
  --module enclave_registry \
  --function register_enclave \
  --args $ENCLAVE_CONFIG_ID \
    "0x$TEE_PUBLIC_KEY" \
  --gas-budget 100000000

# Save the Enclave ID from output
export ENCLAVE_ID=<ENCLAVE_ID_FROM_OUTPUT>
```

---

### **PHASE 5: Configure Backend**

#### Step 5.1: Update backend .env

```bash
cd ~/SynapseModel-sui/backend

# Create .env from example
cp .env.example .env

# Edit .env with your values
nano .env
```

Update these values:

```bash
# Server Configuration
NODE_ENV=production
PORT=4000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/synapsemodel
# Or use cloud MongoDB:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/synapsemodel

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
# Or use cloud Redis

# Sui Network Configuration
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Smart Contract Addresses
SUI_PACKAGE_ID=0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f
SUI_ENCLAVE_CONFIG_ID=<YOUR_ENCLAVE_CONFIG_ID>
SUI_JOB_REGISTRY_ID=0xba83e185b6e2c164294aeeb12ea74cdb5d7387192f96fb8ba13d07ad152a0411
SUI_ENCLAVE_ID=<YOUR_ENCLAVE_ID>

# TEE Server Configuration (internal IP or localhost)
TEE_SERVER_URL=http://localhost:3000
TEE_SERVER_TIMEOUT=30000

# Security
JWT_SECRET=<GENERATE_RANDOM_SECRET>
API_KEY=<GENERATE_RANDOM_KEY>
```

#### Step 5.2: Install dependencies and build

```bash
pnpm install
pnpm run build
```

#### Step 5.3: Create systemd service for backend

```bash
sudo nano /etc/systemd/system/synapsemodel-backend.service
```

Add:

```ini
[Unit]
Description=SynapseModel Backend API
After=network.target mongod.service redis.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/SynapseModel-sui/backend
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable synapsemodel-backend
sudo systemctl start synapsemodel-backend
sudo systemctl status synapsemodel-backend
```

---

### **PHASE 6: Configure Frontend**

#### Step 6.1: Update frontend config

```bash
cd ~/SynapseModel-sui/frontend

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://your-backend-ip:4000
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x870b6a8a841e69a56795877ae9461ba715a4100f6e1a218ff9734c7bf8732e9f
EOF
```

#### Step 6.2: Install dependencies and build

```bash
pnpm install
pnpm run build
```

#### Step 6.3: Create systemd service for frontend

```bash
sudo nano /etc/systemd/system/synapsemodel-frontend.service
```

Add:

```ini
[Unit]
Description=SynapseModel Frontend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/SynapseModel-sui/frontend
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

Start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable synapsemodel-frontend
sudo systemctl start synapsemodel-frontend
sudo systemctl status synapsemodel-frontend
```

---

### **PHASE 7: Configure Nginx (Optional but Recommended)**

#### Step 7.1: Install Nginx

```bash
sudo apt install -y nginx
```

#### Step 7.2: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/synapsemodel
```

Add:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/synapsemodel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7.3: Setup SSL with Let's Encrypt (Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com
```

---

### **PHASE 8: Manage Nitro Enclave**

#### Create enclave management script

```bash
cd ~/SynapseModel-sui/tee-server

cat > manage-enclave.sh << 'EOF'
#!/bin/bash

case "$1" in
  start)
    echo "Starting Nitro Enclave..."
    nitro-cli run-enclave \
      --eif-path synapsemodel.eif \
      --cpu-count 2 \
      --memory 4096 \
      --enclave-cid 16
    
    # Wait for enclave to start
    sleep 3
    
    # Setup port forwarding
    sudo socat TCP4-LISTEN:3000,reuseaddr,fork VSOCK-CONNECT:16:3000 &
    echo "Enclave started and port forwarding enabled"
    ;;
    
  stop)
    echo "Stopping Nitro Enclave..."
    ENCLAVE_ID=$(nitro-cli describe-enclaves | jq -r '.[0].EnclaveID')
    nitro-cli terminate-enclave --enclave-id $ENCLAVE_ID
    sudo pkill socat
    echo "Enclave stopped"
    ;;
    
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
    
  status)
    nitro-cli describe-enclaves
    ;;
    
  console)
    nitro-cli console --enclave-id $(nitro-cli describe-enclaves | jq -r '.[0].EnclaveID')
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|status|console}"
    exit 1
    ;;
esac
EOF

chmod +x manage-enclave.sh
```

---

## 🧪 **Testing the Deployment**

### Test 1: TEE Server

```bash
curl http://localhost:3000/health_check
curl http://localhost:3000/get_pk
curl http://localhost:3000/get_attestation
```

### Test 2: Backend API

```bash
curl http://localhost:4000/api/v1/health
```

### Test 3: Frontend

Open browser: `http://your-ec2-ip:3001` or `http://app.yourdomain.com`

### Test 4: End-to-End

1. Open frontend in browser
2. Connect Sui wallet (Testnet)
3. Submit a test job
4. Check job processing in backend logs
5. Verify certificate minted on Sui

---

## 📊 **Monitoring & Logs**

### View service logs

```bash
# Backend logs
sudo journalctl -u synapsemodel-backend -f

# Frontend logs
sudo journalctl -u synapsemodel-frontend -f

# Enclave console
cd ~/SynapseModel-sui/tee-server
./manage-enclave.sh console

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Service status

```bash
# Check all services
sudo systemctl status synapsemodel-backend
sudo systemctl status synapsemodel-frontend
sudo systemctl status mongod
sudo systemctl status redis-server
sudo systemctl status nginx

# Check enclave
./manage-enclave.sh status
```

---

## 🔧 **Troubleshooting**

### Enclave won't start

```bash
# Check if Nitro is enabled
nitro-cli describe-enclaves

# Check resources
free -h
cat /proc/cpuinfo | grep processor | wc -l

# Rebuild enclave with debug
nitro-cli build-enclave \
  --docker-uri synapsemodel-tee:latest \
  --output-file synapsemodel.eif \
  --debug-mode
```

### Backend can't connect to TEE

```bash
# Check port forwarding
sudo netstat -tlnp | grep 3000

# Restart socat
sudo pkill socat
sudo socat TCP4-LISTEN:3000,reuseaddr,fork VSOCK-CONNECT:16:3000 &

# Test connection
curl http://localhost:3000/health_check
```

### MongoDB connection issues

```bash
# Check MongoDB is running
sudo systemctl status mongod

# Test connection
mongo --eval "db.adminCommand('ping')"

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 🚀 **Quick Commands Reference**

```bash
# Start all services
sudo systemctl start mongod redis-server
cd ~/SynapseModel-sui/tee-server && ./manage-enclave.sh start
sudo systemctl start synapsemodel-backend synapsemodel-frontend nginx

# Stop all services
sudo systemctl stop synapsemodel-backend synapsemodel-frontend nginx
cd ~/SynapseModel-sui/tee-server && ./manage-enclave.sh stop
sudo systemctl stop mongod redis-server

# Restart backend after code update
cd ~/SynapseModel-sui/backend
git pull
pnpm install
pnpm run build
sudo systemctl restart synapsemodel-backend

# Rebuild and restart enclave
cd ~/SynapseModel-sui/tee-server
docker build -f Containerfile -t synapsemodel-tee:latest .
nitro-cli build-enclave --docker-uri synapsemodel-tee:latest --output-file synapsemodel.eif
./manage-enclave.sh restart
```

---

## 📝 **Production Checklist**

- [ ] Enclave built and PCRs registered on-chain
- [ ] All environment variables configured
- [ ] MongoDB and Redis secured with passwords
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured (only open necessary ports)
- [ ] Backup strategy in place
- [ ] Monitoring and alerting setup
- [ ] Log rotation configured
- [ ] Auto-restart on failure enabled
- [ ] Documentation updated with IP addresses/domains

---

**Your production deployment is complete!** 🎉

Access your app at: `https://app.yourdomain.com`
