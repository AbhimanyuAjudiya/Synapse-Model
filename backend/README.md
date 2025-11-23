# SynapseModel Backend

Backend API for SynapseModel - Verifiable AI Inference on Sui blockchain.

## Features

- **Job Management**: Submit, track, and manage ML inference jobs
- **TEE Integration**: Communicate with Trusted Execution Environment servers
- **Blockchain Verification**: Build and manage on-chain verification transactions
- **Queue Processing**: Asynchronous job processing with BullMQ
- **RESTful API**: Clean REST API with Express.js
- **Type Safety**: Full TypeScript implementation
- **Monitoring**: Health checks and metrics endpoints

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 6.0
- Running TEE server (Nautilus enclave)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Configuration

Required environment variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/synapsemodel

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Sui Network
SUI_NETWORK=testnet
SUI_PACKAGE_ID=0x...
SUI_ENCLAVE_CONFIG_ID=0x...
SUI_ENCLAVE_ID=0x...

# TEE Server
TEE_SERVER_URL=http://localhost:3000
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run worker separately
npm run worker

# Build for production
npm run build

# Run production build
npm start
```

## API Endpoints

### Health & Monitoring

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health with dependencies
- `GET /api/metrics` - System metrics

### Jobs

- `POST /api/jobs` - Submit new job
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/process` - Manually process job
- `DELETE /api/jobs/:id` - Cancel job
- `GET /api/jobs/stats` - Get job statistics

### Verification

- `POST /api/verification/verify` - Verify job on-chain
- `POST /api/verification/update` - Update verification status
- `GET /api/verification/status/:jobId` - Get verification status
- `GET /api/verification/transaction/:txHash` - Get transaction details

## Job Flow

1. **Submit Job**: Client submits inference request
2. **Queue Job**: Job added to Redis queue
3. **Process Job**: Worker picks up job and sends to TEE
4. **TEE Processing**: Enclave performs inference and signs result
5. **Store Result**: Result and signature stored in database
6. **Verification**: Client can verify result on-chain
7. **Certificate**: Trust certificate issued on Sui blockchain

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────┐
│  Express    │────▶│  Redis   │
│   API       │     │  Queue   │
└──────┬──────┘     └────┬─────┘
       │                 │
       ▼                 ▼
┌─────────────┐     ┌──────────┐
│  MongoDB    │     │  Worker  │
│  Storage    │     │ Process  │
└─────────────┘     └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │   TEE    │
                    │  Server  │
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │   Sui    │
                    │Blockchain│
                    └──────────┘
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Docker

```bash
# Build image
docker build -t synapsemodel-backend .

# Run container
docker run -p 4000:4000 \
  -e MONGODB_URI=mongodb://host:27017/synapsemodel \
  -e REDIS_HOST=host \
  synapsemodel-backend
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB
- [ ] Configure production Redis
- [ ] Set strong `API_KEY`
- [ ] Enable rate limiting
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Set up backup strategy
- [ ] Enable HTTPS
- [ ] Configure firewall rules

## Monitoring

Metrics available at `/api/metrics`:

- Queue metrics (waiting, active, completed, failed jobs)
- System metrics (memory, CPU, uptime)

Health check at `/api/health/detailed`:

- Database connectivity
- Redis connectivity
- TEE server status
- Queue status

## Troubleshooting

### Database Connection Issues

```bash
# Check MongoDB is running
systemctl status mongod

# Test connection
mongo mongodb://localhost:27017/synapsemodel
```

### Redis Connection Issues

```bash
# Check Redis is running
systemctl status redis

# Test connection
redis-cli ping
```

### TEE Server Unreachable

```bash
# Check TEE server health
curl http://localhost:3000/health_check

# Check network connectivity
telnet localhost 3000
```

## License

MIT

## Author

Created by AbhimanyuAjudiya
Date: 2025-11-22

## API Endpoints

### Health

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check with service status
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

### Jobs

- `POST /api/jobs` - Submit new inference job
- `GET /api/jobs/:jobId` - Get job details
- `GET /api/jobs` - List user jobs (requires API key)
- `GET /api/jobs/stats` - Get job statistics
- `POST /api/jobs/:jobId/cancel` - Cancel job (requires API key)

### Verification

- `POST /api/verification` - Create verification record
- `GET /api/verification/:jobId` - Get verification details
- `GET /api/verification` - List verifications
- `GET /api/verification/stats` - Get verification statistics

## Usage Examples

### Submit Job

```bash
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "mnist",
    "inputData": {
      "image": [0, 0, 0, ...]
    }
  }'
```

### Get Job Status

```bash
curl http://localhost:3001/api/jobs/{jobId}
```

### Create Verification

```bash
curl -X POST http://localhost:3001/api/verification \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "your-job-id",
    "txHash": "your-transaction-hash"
  }'
```

## Architecture

```
backend/
├── src/
│   ├── config/         # Configuration (DB, Redis, Sui)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utility functions
│   ├── workers/        # Background job processors
│   ├── index.ts        # API server entry point
│   └── worker.ts       # Worker entry point
├── package.json
└── tsconfig.json
```

## Job Lifecycle

1. **Submit** - Job created with status `PENDING`
2. **Queue** - Job added to BullMQ queue
3. **Process** - Worker picks up job, status → `PROCESSING`
4. **TEE** - Inference executed in TEE environment
5. **Complete** - Result stored, status → `COMPLETED`
6. **Verify** (Optional) - Blockchain verification transaction

## Error Handling

All errors are handled by centralized middleware:

- `ValidationError` - 400 Bad Request
- `NotFoundError` - 404 Not Found
- `TEEError` - 502 Bad Gateway
- `BlockchainError` - 503 Service Unavailable
- `AppError` - Custom status codes

## Logging

Structured JSON logging with Pino:

```javascript
logger.info({ jobId, modelId }, 'Processing job');
logger.error({ error }, 'Job failed');
```

## Security

- Rate limiting on all endpoints
- API key authentication for sensitive operations
- Input validation with express-validator
- Helmet security headers
- CORS configuration

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure MongoDB replica set
3. Use Redis cluster for high availability
4. Set up proper CORS origins
5. Use environment variables for secrets
6. Enable monitoring and logging
7. Run API server and worker as separate processes

```bash
# Production
npm run build
npm start  # API server
npm run worker  # Background worker
```

## Monitoring

Health endpoints for container orchestration:

- `/api/health/ready` - Readiness probe (DB + Redis ready)
- `/api/health/live` - Liveness probe (server alive)
- `/api/health/detailed` - Full service status

## License

MIT
