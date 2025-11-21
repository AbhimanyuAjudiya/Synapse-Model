// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

use crate::apps::synapsemodel::{inference, types::*};
use crate::common::*;
use crate::{AppState, EnclaveError, Result};
use axum::extract::State;
use axum::Json;
use std::sync::Arc;
use tracing::info;

/// Main inference endpoint handler
/// POST /process_data
pub async fn process_inference(
    State(state): State<Arc<AppState>>,
    Json(request): Json<ProcessDataRequest<InferenceRequest>>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<InferenceResponse>>>> {
    let req = request.payload;
    
    info!(
        "Processing inference request - job_id: {}, model_id: {}",
        req.job_id, req.model_id
    );
    
    // Validate request
    if req.job_id.is_empty() {
        return Err(EnclaveError::ValidationError("Job ID cannot be empty".to_string()));
    }
    
    if req.model_id.is_empty() {
        return Err(EnclaveError::ValidationError("Model ID cannot be empty".to_string()));
    }
    
    // Get current timestamp
    let current_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to get timestamp: {}", e)))?
        .as_millis() as u64;
    
    // Compute input hash
    let input_hash = compute_input_hash(&req.input_data);
    
    // Run inference
    let start_time = std::time::Instant::now();
    let result = inference::run_inference(
        &state.model_loader,
        &req.model_id,
        &req.input_data,
    ).await?;
    let inference_time_ms = start_time.elapsed().as_millis() as u64;
    
    // Create response
    let inference_response = InferenceResponse {
        job_id: req.job_id.clone(),
        model_id: req.model_id.clone(),
        result,
        input_hash,
        computation_metadata: ComputationMetadata {
            timestamp: current_timestamp,
            model_version: "v1.0.0".to_string(),
            inference_time_ms,
        },
    };
    
    info!(
        "Inference completed for job {} in {}ms",
        req.job_id, inference_time_ms
    );
    
    // Sign and return response
    Ok(Json(to_signed_response(
        &state.eph_kp,
        inference_response,
        current_timestamp,
        IntentScope::ProcessData,
    )))
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_process_inference_validation() {
        use fastcrypto::ed25519::Ed25519KeyPair;
        use fastcrypto::traits::KeyPair;
        
        let eph_kp = Ed25519KeyPair::generate(&mut rand::thread_rng());
        let state = Arc::new(AppState::new(eph_kp));
        
        // Test empty job ID
        let request = ProcessDataRequest {
            payload: InferenceRequest {
                job_id: "".to_string(),
                model_id: "mnist-classifier".to_string(),
                input_data: serde_json::json!({"pixels": vec![0.0; 784]}),
            },
        };
        
        let result = process_inference(State(state.clone()), Json(request)).await;
        assert!(result.is_err());
    }
}
