# Model Registry Testing Guide

## Overview

The Model Registry contract has been successfully compiled and basic tests pass. Due to Sui testing framework limitations with shared objects and the Clock module, integration tests are best performed using the Sui CLI or through deployment to testnet/devnet.

## Unit Test Status

✅ **Module Structure Test**: Passes - Verifies that the contract compiles correctly

## Manual Testing Instructions

### Prerequisites

1. Install Sui CLI: `brew install sui` (macOS) or follow [Sui installation guide](https://docs.sui.io/build/install)
2. Set up a Sui wallet: `sui client new-address ed25519`
3. Get testnet SUI tokens from the [faucet](https://discord.gg/sui)

### Building the Contract

```bash
cd contracts
sui move build
```

### Publishing to Testnet

```bash
sui client publish --gas-budget 100000000
```

After publishing, note down:
- Package ID
- ModelRegistry object ID (the shared object)

### Testing Upload Model

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module registry \
  --function upload_model \
  --args \
    <REGISTRY_OBJECT_ID> \
    "blob_id_123" \
    "object_id_456" \
    "My AI Model" \
    "A powerful AI model" \
    0x6 \
  --gas-budget 10000000
```

Note: `0x6` is the shared Clock object on Sui

### Testing Get Metadata

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module registry \
  --function get_metadata \
  --args \
    <REGISTRY_OBJECT_ID> \
    "blob_id_123" \
  --gas-budget 10000000
```

### Testing Update Metadata (as uploader)

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module registry \
  --function update_metadata \
  --args \
    <REGISTRY_OBJECT_ID> \
    "blob_id_123" \
    "Updated Model Name" \
    "Updated description" \
    "new_object_id_789" \
  --gas-budget 10000000
```

### Query Functions (View Only)

To check if a model exists:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module registry \
  --function exists \
  --args \
    <REGISTRY_OBJECT_ID> \
    "blob_id_123" \
  --gas-budget 10000000
```

To get total models count:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module registry \
  --function total_models \
  --args <REGISTRY_OBJECT_ID> \
  --gas-budget 10000000
```

To get all blob IDs:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module registry \
  --function get_all_blob_ids \
  --args <REGISTRY_OBJECT_ID> \
  --gas-budget 10000000
```

## Test Scenarios to Verify

### ✅ Happy Path
1. Upload a new model with unique blob_id
2. Retrieve metadata for the uploaded model
3. Update metadata as the original uploader
4. Verify the update was successful

### ❌ Error Cases to Test
1. Try to upload with empty blob_id (should fail with error code 0)
2. Try to upload with empty object_id (should fail with error code 1)
3. Try to upload duplicate blob_id (should fail with error code 2)
4. Try to get metadata for non-existent blob_id (should fail with error code 3)
5. Try to update metadata as non-uploader (should fail with error code 4)

## Error Codes Reference

- `0` - EBlobIdEmpty: Blob ID cannot be empty
- `1` - EObjectIdEmpty: Object ID cannot be empty
- `2` - EBlobIdAlreadyExists: Blob ID already registered
- `3` - EModelNotFound: Model not found in registry
- `4` - ENotUploader: Only the uploader can update metadata

## Events Emitted

### ModelUploaded
```rust
{
    blob_id: String,
    uploader: address,
    uploaded_at: u64,
    name: String,
    description: String,
    object_id: String,
}
```

### ModelUpdated
```rust
{
    blob_id: String,
    name: String,
    description: String,
    object_id: String,
}
```

## Integration with Frontend

The contract is designed to work with the Walrus storage system:

1. Frontend uploads model to Walrus → gets `object_id`
2. Frontend generates unique `blob_id`
3. Frontend calls `upload_model` with both IDs + metadata
4. Model metadata is stored on-chain, model data in Walrus
5. Users can query/update metadata via the registry

## Notes

- The registry uses a shared object pattern, allowing concurrent access
- Timestamps are in milliseconds (from Sui Clock)
- String fields use Sui's `std::string::String` type (UTF-8)
- Only the original uploader can update a model's metadata
- All models are publicly readable via view functions

## Running Tests

```bash
cd contracts
sui move test
```

This runs the basic compilation test. For full integration testing, deploy to testnet as described above.
