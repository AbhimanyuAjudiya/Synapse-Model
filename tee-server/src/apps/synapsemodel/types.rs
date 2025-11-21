// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

use serde::{Deserialize, Serialize};

/// Inference request from backend
#[derive(Debug, Clone, Deserialize)]
pub struct InferenceRequest {
    pub job_id: String,
    pub model_id: String,
    pub input_data: serde_json::Value,
}

/// Inference response to backend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InferenceResponse {
    pub job_id: String,
    pub model_id: String,
    pub result: serde_json::Value,
    pub input_hash: String,
    pub computation_metadata: ComputationMetadata,
}

/// Computation metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComputationMetadata {
    pub timestamp: u64,
    pub model_version: String,
    pub inference_time_ms: u64,
}

/// MNIST specific types
#[derive(Debug, Deserialize)]
pub struct MNISTInput {
    #[serde(alias = "pixels", alias = "data")]
    pub pixels: Vec<f32>,
}

/// Sentiment analysis input
#[derive(Debug, Deserialize)]
pub struct SentimentInput {
    pub text: String,
}

/// Classification result
#[derive(Debug, Serialize, Deserialize)]
pub struct ClassificationResult {
    pub prediction: usize,
    pub confidence: f32,
    pub probabilities: Vec<f32>,
}
