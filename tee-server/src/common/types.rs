// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

use serde::Serialize;

/// Health check response
#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub timestamp: u64,
    pub version: String,
}

/// Attestation response
#[derive(Debug, Serialize)]
pub struct AttestationResponse {
    pub attestation: String,
    pub timestamp: u64,
}

/// Public key response
#[derive(Debug, Serialize)]
pub struct PublicKeyResponse {
    pub public_key: String,
    pub format: String,
}

/// Error response
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
}
