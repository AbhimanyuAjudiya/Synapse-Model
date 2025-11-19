// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

/// Utility functions for SynapseModel contracts

module synapsemodel::utils {
    use std::string::String;
    use sui::hash;

    // ===== Hash Utilities =====

    /// Compute Blake2b-256 hash
    public fun blake2b256(data: &vector<u8>): vector<u8> {
        hash::blake2b256(data)
    }

    /// Hash a string
    public fun hash_string(s: &String): vector<u8> {
        hash::blake2b256(s.as_bytes())
    }

    // ===== Validation Utilities =====

    /// Validate Ed25519 public key format
    public fun is_valid_ed25519_pk(pk: &vector<u8>): bool {
        pk.length() == 32
    }

    /// Validate Ed25519 signature format
    public fun is_valid_ed25519_signature(sig: &vector<u8>): bool {
        sig.length() == 64
    }

    /// Validate SHA-256 hash format
    public fun is_valid_sha256_hash(hash_val: &vector<u8>): bool {
        hash_val.length() == 32
    }

    // ===== Test-only Functions =====

    #[test_only]
    public fun create_test_hash(): vector<u8> {
        let data = b"test data";
        blake2b256(&data)
    }
}