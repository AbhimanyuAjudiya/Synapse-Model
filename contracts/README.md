# SynapseModel Smart Contracts

Move smart contracts for verifiable AI inference on Sui blockchain.

## Overview

The SynapseModel contracts provide on-chain verification of TEE-generated proofs for AI inference. The system consists of three main modules:

1. **enclave_registry** - Manages enclave registration and configuration
2. **trust_certificate** - Verifies proofs and issues certificates
3. **job_record** - Optional on-chain job tracking

## Modules

### Enclave Registry (`enclave_registry.move`)

Handles TEE enclave lifecycle:
- Create enclave configurations with expected PCR values
- Register enclaves with Nitro attestation verification
- Verify signatures against registered enclave keys
- Update enclave configurations

### Trust Certificate (`trust_certificate.move`)

Main verification module:
- Verify TEE signatures on-chain
- Issue trust certificates as NFTs
- Validate computation proofs
- Track verification history

### Job Record (`job_record.move`)

Optional job tracking:
- Create on-chain job records
- Link jobs to certificates
- Query job history

### Utils (`utils.move`)

Helper functions:
- Hash utilities (SHA-256, Blake2b)
- Vector operations
- String formatting
- Validation helpers

## Deployment

### Prerequisites

- Sui CLI installed
- Wallet with SUI tokens
- Sui network configured (testnet/mainnet)

### Deploy Contracts

```bash
# Build contracts
cd contracts
sui move build

# Publish to testnet
sui client publish --gas-budget 100000000

# Or use deployment script
cd ..
./scripts/deploy-contracts.sh testnet
```

### Create Enclave Config

```bash
# Get PCR values from your enclave build
cat out/nitro.pcrs

# Create config on-chain
./scripts/create-enclave-config.sh \
    <PACKAGE_ID> \
    "SynapseModel v1.0" \
    <PCR0> \
    <PCR1> \
    <PCR2>
```

### Register Enclave

```bash
# Get attestation from running enclave
curl http://<ENCLAVE_URL>:3000/get_attestation

# Register on-chain (see ../scripts/register-enclave.sh)
```

## Testing

Run Move tests:

```bash
sui move test
```

Run specific test:

```bash
sui move test test_create_and_verify_certificate
```

## Usage Examples

### Verify Computation and Issue Certificate

```move
// In your application Move code
use synapsemodel::trust_certificate;
use synapsemodel::enclave_registry;

public entry fun verify_my_job<T: drop>(
    enclave: &Enclave<T>,
    config: &EnclaveConfig<T>,
    clock: &Clock,
    job_id: vector<u8>,
    model_id: vector<u8>,
    result: vector<u8>,
    input_hash: vector<u8>,
    timestamp_ms: u64,
    model_version: vector<u8>,
    inference_time_ms: u64,
    signature: vector<u8>,
    ctx: &mut TxContext
) {
    trust_certificate::verify_and_issue_certificate(
        enclave,
        config,
        clock,
        job_id,
        model_id,
        result,
        input_hash,
        timestamp_ms,
        model_version,
        inference_time_ms,
        signature,
        ctx
    );
}
```

### Query Certificate

```move
// Get certificate details
let job_id = trust_certificate::get_certificate_job_id(&cert);
let result_hash = trust_certificate::get_certificate_result_hash(&cert);
let verified_at = trust_certificate::get_certificate_verified_at(&cert);
```

## Security Considerations

1. **PCR Values**: Ensure PCR values match your reproducible build
2. **Timestamp Validation**: 5-minute drift tolerance for network latency
3. **Signature Verification**: Ed25519 signatures verified on-chain
4. **Config Versioning**: Track enclave updates with version numbers
5. **Attestation**: Nitro attestation verified during registration

## Gas Costs (Approximate)

- Deploy contracts: ~0.1 SUI
- Create enclave config: ~0.001 SUI
- Register enclave: ~0.005 SUI (includes attestation verification)
- Verify and issue certificate: ~0.002 SUI
- Create job record: ~0.001 SUI

## License

MIT

## Author

Created by AbhimanyuAjudiya
Date: 2025-11-21
