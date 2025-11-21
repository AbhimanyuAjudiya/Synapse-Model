// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

use axum::{
    extract::State,
    http::{header, Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use fastcrypto::ed25519::Ed25519KeyPair;
use fastcrypto::traits::{KeyPair, ToFromBytes};
use std::net::SocketAddr;
use std::sync::Arc;
use synapsemodel_tee_server::{
    common::{AttestationResponse, HealthResponse, PublicKeyResponse},
    AppState,
};
use tower_http::cors::{Any, CorsLayer};
use tracing::{info, warn};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load environment variables
    dotenv::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,synapsemodel_tee_server=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting SynapseModel TEE Server v1.0.0");

    // Generate ephemeral keypair
    let eph_kp = Ed25519KeyPair::generate(&mut rand::thread_rng());
    let public_key_hex = hex::encode(eph_kp.public().as_bytes());
    info!("Ephemeral public key: {}", public_key_hex);

    // Create application state
    let state = Arc::new(AppState::new(eph_kp));

    // Build router
    let app = create_router(state);

    // Get server address
    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()
        .unwrap_or(3000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    info!("Server listening on {}:{}", host, port);
    info!("Health check: http://{}:{}/health_check", host, port);
    info!("Inference endpoint: http://{}:{}/process_data", host, port);

    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

/// Create the application router
fn create_router(state: Arc<AppState>) -> Router {
    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    Router::new()
        // Health check
        .route("/health_check", get(health_check))
        // Public key endpoint
        .route("/get_pk", get(public_key))
        // Attestation endpoint
        .route("/get_attestation", get(attestation))
        // Root endpoint
        .route("/", get(root))
        // 404 handler
        .fallback(not_found)
        .layer(cors)
        .with_state(state)
}

/// Root endpoint (ping)
async fn root() -> &'static str {
    "Pong!"
}

/// Health check endpoint
async fn health_check() -> impl IntoResponse {
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    Json(HealthResponse {
        status: "healthy".to_string(),
        timestamp,
        version: "1.0.0".to_string(),
    })
}

/// Public key endpoint
async fn public_key(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let public_key_hex = hex::encode(state.eph_kp.public().as_bytes());

    Json(PublicKeyResponse {
        public_key: public_key_hex,
        format: "ed25519-hex".to_string(),
    })
}

/// Attestation endpoint
async fn attestation() -> impl IntoResponse {
    use synapsemodel_tee_server::common::get_attestation_document;

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    match get_attestation_document() {
        Ok(doc) => {
            let attestation_hex = hex::encode(doc);
            (
                StatusCode::OK,
                Json(AttestationResponse {
                    attestation: attestation_hex,
                    timestamp,
                }),
            )
        }
        Err(e) => {
            warn!("Attestation not available: {}", e);
            (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(AttestationResponse {
                    attestation: "Attestation not available in development mode".to_string(),
                    timestamp,
                }),
            )
        }
    }
}

/// 404 handler
async fn not_found() -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        Json(serde_json::json!({
            "error": "Not found"
        })),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_health_check() {
        let response = health_check().await.into_response();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
