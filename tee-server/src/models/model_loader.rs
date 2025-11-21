// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

use crate::models::ONNXModel;
use crate::{EnclaveError, Result};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::RwLock;
use tracing::info;

/// Model registry and loader
pub struct ModelLoader {
    models_dir: PathBuf,
    cache: RwLock<HashMap<String, ONNXModel>>,
}

impl ModelLoader {
    /// Create new model loader
    pub fn new() -> Self {
        let models_dir = std::env::var("MODELS_DIR")
            .unwrap_or_else(|_| "/app/models".to_string())
            .into();
        
        info!("Model loader initialized with directory: {:?}", models_dir);
        
        Self {
            models_dir,
            cache: RwLock::new(HashMap::new()),
        }
    }
    
    /// Load model by ID
    pub fn load_model(&self, model_id: &str) -> Result<ONNXModel> {
        // Check cache first
        {
            let cache = self.cache.read().unwrap();
            if let Some(_model) = cache.get(model_id) {
                info!("Model {} loaded from cache", model_id);
                // Note: In production, return a clone or Arc reference
                // For now, we'll reload
            }
        }
        
        // Get model path
        let model_path = self.get_model_path(model_id)?;
        
        // Load model
        let model = ONNXModel::load(&model_path)?;
        
        // Cache model
        {
            let mut cache = self.cache.write().unwrap();
            cache.insert(model_id.to_string(), model);
        }
        
        // Return model (in production, return from cache)
        ONNXModel::load(&model_path)
    }
    
    /// Get model file path
    fn get_model_path(&self, model_id: &str) -> Result<PathBuf> {
        let path = match model_id {
            "mnist-classifier" => self.models_dir.join("mnist.onnx"),
            "sentiment-analysis" => self.models_dir.join("sentiment.onnx"),
            _ => {
                return Err(EnclaveError::ModelNotFound(
                    format!("Unknown model ID: {}", model_id)
                ))
            }
        };
        
        Ok(path)
    }
    
    /// List available models
    pub fn list_models(&self) -> Vec<String> {
        vec![
            "mnist-classifier".to_string(),
            "sentiment-analysis".to_string(),
        ]
    }
}

impl Default for ModelLoader {
    fn default() -> Self {
        Self::new()
    }
}
