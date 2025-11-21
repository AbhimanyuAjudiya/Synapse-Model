// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

// Temporarily comment out unimplemented modules
// pub mod apps;
pub mod common;
// pub mod models;

/// Application state shared across handlers
pub struct AppState {
    /// Ephemeral keypair for signing responses
    pub eph_kp: fastcrypto::ed25519::Ed25519KeyPair,
}

impl AppState {
    pub fn new(eph_kp: fastcrypto::ed25519::Ed25519KeyPair) -> Self {
        Self { eph_kp }
    }
}

/// Custom error types
#[derive(Debug, thiserror::Error)]
pub enum EnclaveError {
    #[error("Generic error: {0}")]
    GenericError(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Model not found: {0}")]
    ModelNotFound(String),

    #[error("Inference error: {0}")]
    InferenceError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Cryptography error: {0}")]
    CryptoError(String),
}

// Implement conversion from EnclaveError to HTTP response
impl axum::response::IntoResponse for EnclaveError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match self {
            EnclaveError::ValidationError(msg) => (axum::http::StatusCode::BAD_REQUEST, msg),
            EnclaveError::ModelNotFound(msg) => (axum::http::StatusCode::NOT_FOUND, msg),
            _ => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
        };

        let body = serde_json::json!({
            "error": message
        });

        (status, axum::Json(body)).into_response()
    }
}

pub type Result<T> = std::result::Result<T, EnclaveError>;
