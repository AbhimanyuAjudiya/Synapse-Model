.PHONY: build run clean test docker enclave pcrs help

ENCLAVE_APP ?= synapsemodel
OUTPUT_DIR = out
EIF_FILE = $(OUTPUT_DIR)/$(ENCLAVE_APP).eif
DOCKER_IMAGE = synapsemodel-tee:latest

help:
	@echo "SynapseModel TEE Server Build System"
	@echo ""
	@echo "Available targets:"
	@echo "  build           - Build Rust application"
	@echo "  build-release   - Build optimized release binary"
	@echo "  run             - Run server locally"
	@echo "  run-debug       - Run with debug logging"
	@echo "  docker          - Build Docker image"
	@echo "  enclave         - Build Nitro enclave image (.eif)"
	@echo "  pcrs            - Extract PCR values from enclave"
	@echo "  test            - Run tests"
	@echo "  clean           - Clean build artifacts"
	@echo ""
	@echo "Environment variables:"
	@echo "  ENCLAVE_APP     - Application name (default: synapsemodel)"

build:
	@echo "Building application..."
	cargo build

build-release:
	@echo "Building release binary..."
	cargo build --release

run:
	@echo "Starting server..."
	cargo run

run-debug:
	@echo "Starting server with debug logging..."
	RUST_LOG=debug cargo run

docker:
	@echo "Building Docker image..."
	docker build -f Containerfile -t $(DOCKER_IMAGE) .

enclave: docker
	@echo "Building Nitro enclave image..."
	@mkdir -p $(OUTPUT_DIR)
	nitro-cli build-enclave \
		--docker-uri $(DOCKER_IMAGE) \
		--output-file $(EIF_FILE) | tee $(OUTPUT_DIR)/build.log
	@echo ""
	@echo "Enclave image created: $(EIF_FILE)"
	@echo "Extracting PCR values..."
	@$(MAKE) pcrs

pcrs:
	@if [ -f "$(OUTPUT_DIR)/build.log" ]; then \
		echo "Extracting PCR values from build log..."; \
		grep -A 10 "Measurements:" $(OUTPUT_DIR)/build.log > $(OUTPUT_DIR)/nitro.pcrs; \
		cat $(OUTPUT_DIR)/nitro.pcrs; \
	else \
		echo "Error: Build log not found. Run 'make enclave' first."; \
	fi

test:
	@echo "Running tests..."
	cargo test

clean:
	@echo "Cleaning build artifacts..."
	cargo clean
	rm -rf $(OUTPUT_DIR)
	docker rmi $(DOCKER_IMAGE) 2>/dev/null || true

format:
	@echo "Formatting code..."
	cargo fmt

lint:
	@echo "Running clippy..."
	cargo clippy -- -D warnings

check: format lint test
	@echo "All checks passed!"
