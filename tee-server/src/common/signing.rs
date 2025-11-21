// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

use fastcrypto::ed25519::Ed25519KeyPair;
use fastcrypto::traits::{KeyPair, Signer, ToFromBytes};
use sha2::{Sha256, Digest};

/// Generate new Ed25519 keypair
pub fn generate_keypair() -> Ed25519KeyPair {
    Ed25519KeyPair::generate(&mut rand::thread_rng())
}

/// Get public key as hex string
pub fn get_public_key_hex(keypair: &Ed25519KeyPair) -> String {
    hex::encode(keypair.public().as_bytes())
}

/// Sign data with keypair
pub fn sign_data(keypair: &Ed25519KeyPair, data: &[u8]) -> Vec<u8> {
    keypair.sign(data).as_ref().to_vec()
}

/// Compute SHA-256 hash
pub fn compute_hash(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

/// Compute input hash for verification
pub fn compute_input_hash(input_data: &serde_json::Value) -> String {
    let input_bytes = serde_json::to_vec(input_data).unwrap_or_default();
    let hash = compute_hash(&input_bytes);
    format!("0x{}", hex::encode(hash))
}
