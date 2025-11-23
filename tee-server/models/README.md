# SynapseModel ONNX Models

This directory contains ONNX model files for inference.

## Available Models

### 1. MNIST Classifier (`mnist.onnx`)

- **Description**: Handwritten digit classification (0-9)
- **Input**: 784 float values (28x28 grayscale image, flattened)
- **Output**: 10 probabilities (one per digit class)
- **Size**: ~50KB

**Example Input:**
```json
{
  "pixels": [0.0, 0.1, ..., 0.9]  // 784 values
}
```

### 2. Sentiment Analysis (`sentiment.onnx`)

- **Description**: Text sentiment classification
- **Input**: Text string
- **Output**: 3 probabilities (negative, positive, neutral)
- **Size**: ~500KB

**Example Input:**
```json
{
  "text": "This is a great product!"
}
```

## Adding New Models

1. **Export your model to ONNX format:**
   ```python
   import torch.onnx
   torch.onnx.export(model, dummy_input, "model.onnx")
   ```

2. **Place the `.onnx` file in this directory**

3. **Update model registry** in `src/models/model_loader.rs`:
   ```rust
   fn get_model_path(&self, model_id: &str) -> Result<PathBuf> {
       let path = match model_id {
           "mnist-classifier" => self.models_dir.join("mnist.onnx"),
           "your-model" => self.models_dir.join("your-model.onnx"),
           // ...
       };
       Ok(path)
   }
   ```

4. **Add inference logic** in `src/apps/synapsemodel/inference.rs`

## Model Requirements

- **Format**: ONNX (.onnx file)
- **Opset**: Compatible with ONNX Runtime 1.16+
- **Size**: Recommended < 100MB for faster loading
- **Quantization**: Consider quantizing large models for TEE efficiency

## Testing Models Locally

```bash
# Install ONNX Runtime
pip install onnxruntime

# Test model
python test_model.py mnist.onnx
```

## Production Deployment

For production in AWS Nitro Enclaves:
1. Models are loaded at server startup
2. Models are cached in memory
3. Inference is performed inside the secure enclave
4. Results are cryptographically signed

## Security Considerations

- Models are integrity-checked on load
- Model hashes can be included in attestation
- Sensitive models should be encrypted at rest
