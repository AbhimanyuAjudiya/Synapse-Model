// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

use reqwest::Client;
use serde_json::json;

#[tokio::test]
async fn test_health_check() {
    let client = Client::new();
    
    let response = client
        .get("http://localhost:3000/health_check")
        .send()
        .await;
    
    assert!(response.is_ok(), "Health check should succeed");
    
    let response = response.unwrap();
    assert_eq!(response.status(), 200);
    
    let body: serde_json::Value = response.json().await.unwrap();
    assert_eq!(body["status"], "healthy");
}

#[tokio::test]
async fn test_public_key() {
    let client = Client::new();
    
    let response = client
        .get("http://localhost:3000/public_key")
        .send()
        .await;
    
    assert!(response.is_ok(), "Public key endpoint should succeed");
    
    let response = response.unwrap();
    assert_eq!(response.status(), 200);
    
    let body: serde_json::Value = response.json().await.unwrap();
    assert!(body["public_key"].is_string());
    assert_eq!(body["format"], "ed25519-hex");
}

#[tokio::test]
async fn test_mnist_inference() {
    let client = Client::new();
    
    // Create MNIST input (784 zeros)
    let pixels = vec![0.0f32; 784];
    
    let request_body = json!({
        "payload": {
            "job_id": "test-job-1",
            "model_id": "mnist-classifier",
            "input_data": {
                "pixels": pixels
            }
        }
    });
    
    let response = client
        .post("http://localhost:3000/process_data")
        .json(&request_body)
        .send()
        .await;
    
    assert!(response.is_ok(), "Inference request should succeed");
    
    let response = response.unwrap();
    assert_eq!(response.status(), 200);
    
    let body: serde_json::Value = response.json().await.unwrap();
    
    // Check response structure
    assert!(body["response"].is_object());
    assert!(body["signature"].is_string());
    
    // Check inference response
    let inference_response = &body["response"]["data"];
    assert_eq!(inference_response["job_id"], "test-job-1");
    assert_eq!(inference_response["model_id"], "mnist-classifier");
    assert!(inference_response["result"].is_object());
    assert!(inference_response["input_hash"].is_string());
}

#[tokio::test]
async fn test_invalid_model() {
    let client = Client::new();
    
    let request_body = json!({
        "payload": {
            "job_id": "test-job-2",
            "model_id": "nonexistent-model",
            "input_data": {}
        }
    });
    
    let response = client
        .post("http://localhost:3000/process_data")
        .json(&request_body)
        .send()
        .await;
    
    assert!(response.is_ok());
    
    let response = response.unwrap();
    assert_eq!(response.status(), 404); // Not found
}

#[tokio::test]
async fn test_invalid_input() {
    let client = Client::new();
    
    // MNIST requires 784 pixels, provide only 100
    let pixels = vec![0.0f32; 100];
    
    let request_body = json!({
        "payload": {
            "job_id": "test-job-3",
            "model_id": "mnist-classifier",
            "input_data": {
                "pixels": pixels
            }
        }
    });
    
    let response = client
        .post("http://localhost:3000/process_data")
        .json(&request_body)
        .send()
        .await;
    
    assert!(response.is_ok());
    
    let response = response.unwrap();
    assert_eq!(response.status(), 400); // Bad request
}
