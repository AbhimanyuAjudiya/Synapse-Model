// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

pub mod attestation;
pub mod signing;
pub mod types;

pub use attestation::*;
pub use signing::*;
pub use types::*;

use serde::{Deserialize, Serialize};

/// Intent scopes for different message types
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[repr(u8)]
pub enum IntentScope {
    ProcessData = 0,
    ParameterLoad = 1,
}

/// Intent message wrapper for signatures
#[derive(Debug, Serialize, Deserialize)]
pub struct IntentMessage<T> {
    pub intent: u8,
    pub timestamp_ms: u64,
    pub data: T,
}

impl<T> IntentMessage<T> {
    pub fn new(data: T, timestamp_ms: u64, scope: IntentScope) -> Self {
        Self {
            intent: scope as u8,
            timestamp_ms,
            data,
        }
    }
}

/// Create signed response
pub fn to_signed_response<T: Serialize>(
    keypair: &fastcrypto::ed25519::Ed25519KeyPair,
    data: T,
    timestamp_ms: u64,
    scope: IntentScope,
) -> ProcessedDataResponse<IntentMessage<T>> {
    use fastcrypto::traits::Signer;
    
    let intent_message = IntentMessage::new(data, timestamp_ms, scope);
    
    // Serialize the message
    let message_bytes = bcs::to_bytes(&intent_message).expect("BCS serialization failed");
    
    // Sign the message
    let signature = keypair.sign(&message_bytes);
    let signature_bytes = signature.as_ref();
    
    ProcessedDataResponse {
        response: intent_message,
        signature: hex::encode(signature_bytes),
    }
}

/// Generic processed data response
#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessedDataResponse<T> {
    pub response: T,
    pub signature: String,
}

/// Generic request wrapper
#[derive(Debug, Deserialize)]
pub struct ProcessDataRequest<T> {
    pub payload: T,
}
