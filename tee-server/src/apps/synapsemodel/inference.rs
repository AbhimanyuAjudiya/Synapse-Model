// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

use crate::apps::synapsemodel::types::*;
use crate::models::ModelLoader;
use crate::{EnclaveError, Result};
use tracing::{info, debug};

/// Run inference on input data
pub async fn run_inference(
    model_loader: &ModelLoader,
    model_id: &str,
    input_data: &serde_json::Value,
) -> Result<serde_json::Value> {
    info!("Running inference with model: {}", model_id);
    
    match model_id {
        "mnist-classifier" => run_mnist_inference(model_loader, input_data).await,
        "sentiment-analysis" => run_sentiment_inference(input_data).await,
        _ => Err(EnclaveError::ModelNotFound(format!("Unknown model: {}", model_id))),
    }
}

/// MNIST digit classification
async fn run_mnist_inference(
    model_loader: &ModelLoader,
    input_data: &serde_json::Value,
) -> Result<serde_json::Value> {
    // Parse input
    let mnist_input: MNISTInput = serde_json::from_value(input_data.clone())
        .map_err(|e| EnclaveError::ValidationError(format!("Invalid MNIST input: {}", e)))?;
    
    // Validate input dimensions
    if mnist_input.pixels.len() != 784 {
        return Err(EnclaveError::ValidationError(
            format!("MNIST input must have 784 pixels, got {}", mnist_input.pixels.len())
        ));
    }
    
    debug!("MNIST input validated: {} pixels", mnist_input.pixels.len());
    
    // Load model
    let model = model_loader.load_model("mnist-classifier")?;
    
    // Prepare input tensor (1, 1, 28, 28)
    let input_tensor = prepare_mnist_tensor(&mnist_input.pixels);
    
    // Run inference
    let start_time = std::time::Instant::now();
    let output = model.run_inference(&input_tensor)?;
    let inference_time = start_time.elapsed().as_millis() as u64;
    
    debug!("Inference completed in {}ms", inference_time);
    
    // Parse output
    let probabilities = output.to_vec();
    let prediction = probabilities
        .iter()
        .enumerate()
        .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
        .map(|(idx, _)| idx)
        .unwrap_or(0);
    
    let confidence = probabilities[prediction];
    
    let result = ClassificationResult {
        prediction,
        confidence,
        probabilities,
    };
    
    Ok(serde_json::to_value(result).unwrap())
}

/// Prepare MNIST tensor
fn prepare_mnist_tensor(pixels: &[f32]) -> Vec<f32> {
    // Normalize pixels to [0, 1] range if needed
    pixels.iter()
        .map(|&p| {
            if p > 1.0 {
                p / 255.0 // Normalize from [0, 255] to [0, 1]
            } else {
                p
            }
        })
        .collect()
}

/// Sentiment analysis (placeholder implementation)
async fn run_sentiment_inference(input_data: &serde_json::Value) -> Result<serde_json::Value> {
    // Parse input
    let sentiment_input: SentimentInput = serde_json::from_value(input_data.clone())
        .map_err(|e| EnclaveError::ValidationError(format!("Invalid sentiment input: {}", e)))?;
    
    debug!("Sentiment input: {} characters", sentiment_input.text.len());
    
    // Simple rule-based sentiment (placeholder)
    let text_lower = sentiment_input.text.to_lowercase();
    let positive_words = ["good", "great", "excellent", "amazing", "wonderful"];
    let negative_words = ["bad", "terrible", "awful", "horrible", "poor"];
    
    let positive_count = positive_words.iter()
        .filter(|&word| text_lower.contains(word))
        .count();
    
    let negative_count = negative_words.iter()
        .filter(|&word| text_lower.contains(word))
        .count();
    
    let (prediction, confidence) = if positive_count > negative_count {
        (1, 0.75) // Positive
    } else if negative_count > positive_count {
        (0, 0.75) // Negative
    } else {
        (2, 0.5) // Neutral
    };
    
    let result = ClassificationResult {
        prediction,
        confidence,
        probabilities: vec![
            if prediction == 0 { confidence } else { 1.0 - confidence },
            if prediction == 1 { confidence } else { 1.0 - confidence },
            if prediction == 2 { confidence } else { 1.0 - confidence },
        ],
    };
    
    Ok(serde_json::to_value(result).unwrap())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_prepare_mnist_tensor() {
        let pixels = vec![255.0; 784];
        let tensor = prepare_mnist_tensor(&pixels);
        assert_eq!(tensor.len(), 784);
        assert!(tensor.iter().all(|&p| p >= 0.0 && p <= 1.0));
    }
}
