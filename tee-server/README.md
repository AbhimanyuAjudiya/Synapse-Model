# SynapseModel TEE Server

Production-ready Trusted Execution Environment (TEE) server for secure AI inference with cryptographic proofs.

## Overview

The TEE Server runs ML models inside a secure enclave (AWS Nitro Enclaves) and produces cryptographically signed inference results that can be verified on-chain. This ensures:

- **Confidentiality**: Input data and models are protected in hardware
- **Integrity**: Inference results are cryptographically signed
- **Attestation**: Remote parties can verify the enclave's identity
- **Verifiability**: Results can be verified on Sui blockchain

## Features

- 🔒 **Secure Enclave Execution** - Runs in AWS Nitro Enclaves
- 🔐 **Cryptographic Signing** - Ed25519 signatures on all responses
- 📜 **Remote Attestation** - Verifiable enclave identity
- 🤖 **ML Inference** - ONNX Runtime for model execution
- 🔗 **Blockchain Integration** - Compatible with Sui smart contracts
- 📊 **Production Ready** - Comprehensive logging and error handling

## Prerequisites

- Rust 1.75+
- Docker (for containerization)
- AWS Nitro CLI (for enclave builds, optional)
- ONNX models (see `models/README.md`)

## Quick Start

### 1. Development Mode

```bash
# Clone and navigate
cd tee-server

# Copy environment file
cp .env.example .env

# Build and run
cargo build
cargo run

# Or use the helper script
chmod +x scripts/run.sh
./scripts/run.sh
```

The server will start on `http://localhost:3000`

### 2. Test the Server

```bash
# Health check
curl http://localhost:3000/health_check

# Get public key
curl http://localhost:3000/public_key

# Submit inference request
curl -X POST http://localhost:3000/process_data \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "job_id": "test-123",
      "model_id": "mnist-classifier",
      "input_data": {
        "pixels": [0.0, 0.1, ...]
      }
    }
  }'
```

### 3. Run Tests

```bash
# Unit tests
cargo test

# Integration tests (server must be running)
cargo test --test integration_test
```

## Project Structure

```
tee-server/
├── src/
│   ├── main.rs              # Server entry point
│   ├── lib.rs               # Library root
│   ├── common/              # Common utilities
│   │   ├── attestation.rs   # Nitro attestation
│   │   ├── signing.rs       # Cryptographic signing
│   │   └── types.rs         # Shared types
│   ├── apps/
│   │   └── synapsemodel/    # SynapseModel application
│   │       ├── endpoints.rs # API handlers
│   │       ├── inference.rs # Inference logic
│   │       └── types.rs     # Request/response types
│   └── models/              # Model management
│       ├── model_loader.rs  # Model registry
│       └── onnx_runtime.rs  # ONNX wrapper
├── models/                  # ONNX model files
├── configs/                 # Configuration files
├── scripts/                 # Build/run scripts
└── tests/                   # Integration tests
```

## API Endpoints

### Health Check
```
GET /health_check
```

Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1700000000,
  "version": "1.0.0"
}
```

### Public Key
```
GET /public_key
```

Returns the enclave's ephemeral public key for signature verification.

**Response:**
```json
{
  "public_key": "a1b2c3...",
  "format": "ed25519-hex"
}
```

### Attestation
```
GET /attestation
```

Returns the Nitro attestation document (production only).

**Response:**
```json
{
  "attestation": "hex_encoded_document",
  "timestamp": 1700000000
}
```

### Process Inference
```
POST /process_data
```

Main endpoint for ML inference.

**Request:**
```json
{
  "payload": {
    "job_id": "unique-job-id",
    "model_id": "mnist-classifier",
    "input_data": {
      "pixels": [0.0, 0.1, ..., 0.9]
    }
  }
}
```

**Response:**
```json
{
  "response": {
    "intent": 0,
    "timestamp_ms": 1700000000000,
    "data": {
      "job_id": "unique-job-id",
      "model_id": "mnist-classifier",
      "result": {
        "prediction": 7,
        "confidence": 0.95,
        "probabilities": [0.01, 0.02, ..., 0.95]
      },
      "input_hash": "0xabc123...",
      "computation_metadata": {
        "timestamp": 1700000000000,
        "model_version": "v1.0.0",
        "inference_time_ms": 45
      }
    }
  },
  "signature": "ed25519_signature_hex"
}
```

## Supported Models

### MNIST Classifier
- **ID**: `mnist-classifier`
- **Input**: 784 floats (28x28 image)
- **Output**: 10 probabilities (digits 0-9)

### Sentiment Analysis
- **ID**: `sentiment-analysis`
- **Input**: Text string
- **Output**: 3 probabilities (negative/positive/neutral)

See `models/README.md` for details on adding new models.

## Building for Production

### Docker Image

```bash
# Build Docker image
make docker

# Or manually
docker build -f Containerfile -t synapsemodel-tee:latest .
```

### Nitro Enclave Image

```bash
# Build enclave image (.eif file)
make enclave

# Extract PCR values
make pcrs

# Output: out/synapsemodel.eif and out/nitro.pcrs
```

The PCR values must be registered in your Sui smart contract.

## Deployment

### AWS Nitro Enclaves

1. **Build enclave image:**
   ```bash
   make enclave
   ```

2. **Extract PCR values:**
   ```bash
   make pcrs
   ```

3. **Update smart contract with PCRs**

4. **Run enclave on EC2:**
   ```bash
   nitro-cli run-enclave \
     --eif-path out/synapsemodel.eif \
     --memory 2048 \
     --cpu-count 2 \
     --enclave-cid 16
   ```

5. **Configure vsock proxy for communication**

### Environment Variables

```bash
# Server
HOST=0.0.0.0
PORT=3000

# Logging
RUST_LOG=info,synapsemodel_tee_server=debug

# Models
MODELS_DIR=/app/models

# Security (production)
ENABLE_ATTESTATION=true
```

## Security Considerations

### Cryptographic Operations

- **Signing**: Ed25519 signatures on all responses
- **Hashing**: SHA-256 for input hashing
- **Serialization**: BCS format (matching Sui blockchain)

### Attestation

In production:
1. Server generates attestation document via Nitro NSM
2. Document includes:
   - PCR measurements (enclave identity)
   - Public key
   - Timestamp
   - User data (optional)

3. Clients verify attestation before trusting results

### Key Management

- Ephemeral keypair generated on startup
- Private key never leaves enclave
- Public key available via `/public_key` endpoint
- In production, can integrate with KMS for long-term keys

## Development

### Code Structure

```rust
// Main server
src/main.rs         - HTTP server setup

// Core library
src/lib.rs          - AppState, error types

// Common utilities
src/common/
  ├── signing.rs    - Cryptographic operations
  ├── attestation.rs - Nitro attestation
  └── types.rs      - Shared types

// Application logic
src/apps/synapsemodel/
  ├── endpoints.rs  - HTTP handlers
  ├── inference.rs  - ML inference
  └── types.rs      - Request/response types

// Model management
src/models/
  ├── model_loader.rs - Model registry
  └── onnx_runtime.rs - ONNX wrapper
```

### Adding New Endpoints

1. Define types in `apps/synapsemodel/types.rs`
2. Implement handler in `apps/synapsemodel/endpoints.rs`
3. Register route in `main.rs`

### Adding New Models

1. Export model to ONNX format
2. Place `.onnx` file in `models/`
3. Update `model_loader.rs` registry
4. Add inference logic in `inference.rs`

## Testing

### Unit Tests

```bash
cargo test
```

### Integration Tests

```bash
# Start server
cargo run

# Run integration tests
cargo test --test integration_test
```

### Manual Testing

```bash
# MNIST inference
curl -X POST http://localhost:3000/process_data \
  -H "Content-Type: application/json" \
  -d @test_data/mnist_request.json

# Sentiment analysis
curl -X POST http://localhost:3000/process_data \
  -H "Content-Type: application/json" \
  -d @test_data/sentiment_request.json
```

## Monitoring

### Logging

Uses `tracing` for structured logging:

```bash
# Set log level
export RUST_LOG=debug,synapsemodel_tee_server=trace

# JSON output for production
RUST_LOG=info cargo run
```

### Health Checks

```bash
# Basic health
curl http://localhost:3000/health_check

# Docker health check (automatic)
# Defined in Containerfile
```

## Troubleshooting

### Model Not Found

```bash
# Ensure model file exists
ls -la models/mnist.onnx

# Check MODELS_DIR environment variable
echo $MODELS_DIR
```

### Attestation Errors

```bash
# Attestation only works inside Nitro Enclave
# In development, endpoint returns error (expected)

# Check if running in enclave
cat /dev/nsm  # Should exist in Nitro Enclave
```

### Signature Verification Fails

```bash
# Get public key
curl http://localhost:3000/public_key

# Verify with fastcrypto
# Use the public key in your verification code
```

## Performance

- **Inference Time**: ~50ms for MNIST (CPU)
- **Memory Usage**: ~500MB base + models
- **Throughput**: ~100 req/sec (single core)

Optimize for production:
- Use GPU if available
- Batch inference requests
- Cache loaded models
- Tune ONNX Runtime threading

## License

MIT

## Author

Created by AbhimanyuAjudiya
Date: 2025-11-22

## Support

For issues or questions:
1. Check documentation in `docs/`
2. Review integration tests in `tests/`
3. See example requests in `examples/`
