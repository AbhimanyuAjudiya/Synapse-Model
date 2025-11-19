// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

/// Trust Certificate Module
/// 
/// Verifies TEE-generated proofs and issues trust certificates.
/// Main entry point: verify_and_issue_certificate

module synapsemodel::trust_certificate {
    use sui::hash::blake2b256;
    use sui::clock::Clock;
    use sui::event;
    use synapsemodel::enclave_registry::{Self, Enclave, EnclaveConfig};

    // ===== Error Codes =====
    
    const EInvalidSignature: u64 = 1;
    const EInvalidInputHash: u64 = 2;
    const ETimestampTooOld: u64 = 3;
    const ETimestampTooFuture: u64 = 4;
    const EInvalidModelId: u64 = 7;
    const EInvalidJobId: u64 = 8;
    const EResultTooLarge: u64 = 9;

    // ===== Constants =====
    
    const INTENT_PROCESS_DATA: u8 = 0;
    const MAX_TIMESTAMP_DRIFT_MS: u64 = 60000; // 1 minute
    const MAX_JOB_ID_LENGTH: u64 = 128;
    const MAX_MODEL_ID_LENGTH: u64 = 64;
    const MAX_RESULT_SIZE: u64 = 102400; // 100KB

    // ===== Structs =====

    /// Trust certificate NFT proving verified computation
    public struct TrustCertificate has key, store {
        id: UID,
        job_id: vector<u8>,
        model_id: vector<u8>,
        input_hash: vector<u8>,
        result_hash: vector<u8>,
        enclave_id: ID,
        timestamp_ms: u64,
        verified_at: u64,
        verifier: address,
    }

    /// Inference response from TEE
    public struct InferenceResponse has drop {
        job_id: vector<u8>,
        model_id: vector<u8>,
        result: vector<u8>,
        input_hash: vector<u8>,
        computation_metadata: ComputationMetadata,
    }

    /// Computation metadata
    public struct ComputationMetadata has drop {
        timestamp: u64,
        model_version: vector<u8>,
        inference_time_ms: u64,
    }

    // ===== Events =====

    public struct CertificateIssued has copy, drop {
        certificate_id: ID,
        job_id: vector<u8>,
        model_id: vector<u8>,
        enclave_id: ID,
        verifier: address,
        timestamp: u64,
    }

    public struct CertificateBurned has copy, drop {
        certificate_id: ID,
        job_id: vector<u8>,
        timestamp: u64,
    }

    // ===== Public Functions =====

    /// Verify TEE signature and issue certificate
    /// Returns the certificate for composability
    public fun verify_and_issue_certificate<T: drop>(
        enclave: &Enclave<T>,
        config: &EnclaveConfig<T>,
        clock: &Clock,
        job_id: vector<u8>,
        model_id: vector<u8>,
        result: vector<u8>,
        input_hash: vector<u8>,
        timestamp_ms: u64,
        model_version: vector<u8>,
        inference_time_ms: u64,
        signature: vector<u8>,
        ctx: &mut TxContext
    ): TrustCertificate {
        // Validate inputs
        assert!(job_id.length() > 0 && job_id.length() <= MAX_JOB_ID_LENGTH, EInvalidJobId);
        assert!(model_id.length() > 0 && model_id.length() <= MAX_MODEL_ID_LENGTH, EInvalidModelId);
        assert!(validate_input_hash(&input_hash), EInvalidInputHash);
        assert!(result.length() <= MAX_RESULT_SIZE, EResultTooLarge);

        // Validate timestamp
        let current_time = clock.timestamp_ms();
        assert!(timestamp_ms + MAX_TIMESTAMP_DRIFT_MS >= current_time, ETimestampTooOld);
        assert!(timestamp_ms <= current_time + MAX_TIMESTAMP_DRIFT_MS, ETimestampTooFuture);

        // Reconstruct signed message
        let inference_response = InferenceResponse {
            job_id,
            model_id,
            result,
            input_hash,
            computation_metadata: ComputationMetadata {
                timestamp: timestamp_ms,
                model_version,
                inference_time_ms,
            },
        };

        // Verify signature
        let is_valid = enclave_registry::verify_signature(
            enclave,
            INTENT_PROCESS_DATA,
            timestamp_ms,
            inference_response,
            &signature
        );

        assert!(is_valid, EInvalidSignature);

        // Verify enclave config version
        enclave_registry::verify_enclave_config(enclave, config);

        // Create certificate
        let certificate = TrustCertificate {
            id: object::new(ctx),
            job_id,
            model_id,
            input_hash,
            result_hash: blake2b256(&result),
            enclave_id: object::id(enclave),
            timestamp_ms,
            verified_at: current_time,
            verifier: tx_context::sender(ctx),
        };

        event::emit(CertificateIssued {
            certificate_id: object::id(&certificate),
            job_id,
            model_id,
            enclave_id: object::id(enclave),
            verifier: tx_context::sender(ctx),
            timestamp: current_time,
        });

        certificate // Return instead of transfer
    }

    /// Entry function wrapper for simple transfers to sender
    /// This provides backward compatibility and convenience
    public entry fun verify_and_transfer_certificate<T: drop>(
        enclave: &Enclave<T>,
        config: &EnclaveConfig<T>,
        clock: &Clock,
        job_id: vector<u8>,
        model_id: vector<u8>,
        result: vector<u8>,
        input_hash: vector<u8>,
        timestamp_ms: u64,
        model_version: vector<u8>,
        inference_time_ms: u64,
        signature: vector<u8>,
        ctx: &mut TxContext
    ) {
        let certificate = verify_and_issue_certificate(
            enclave,
            config,
            clock,
            job_id,
            model_id,
            result,
            input_hash,
            timestamp_ms,
            model_version,
            inference_time_ms,
            signature,
            ctx
        );
        
        transfer::public_transfer(certificate, tx_context::sender(ctx));
    }

    /// Burn a certificate (owner only)
    public fun burn_certificate(certificate: TrustCertificate) {
        let TrustCertificate {
            id,
            job_id,
            model_id: _,
            input_hash: _,
            result_hash: _,
            enclave_id: _,
            timestamp_ms,
            verified_at: _,
            verifier: _,
        } = certificate;

        event::emit(CertificateBurned {
            certificate_id: object::uid_to_inner(&id),
            job_id,
            timestamp: timestamp_ms,
        });

        object::delete(id);
    }

    // ===== View Functions =====

    public fun get_certificate_job_id(cert: &TrustCertificate): vector<u8> {
        cert.job_id
    }

    public fun get_certificate_model_id(cert: &TrustCertificate): vector<u8> {
        cert.model_id
    }

    public fun get_certificate_input_hash(cert: &TrustCertificate): vector<u8> {
        cert.input_hash
    }

    public fun get_certificate_result_hash(cert: &TrustCertificate): vector<u8> {
        cert.result_hash
    }

    public fun get_certificate_enclave_id(cert: &TrustCertificate): ID {
        cert.enclave_id
    }

    public fun get_certificate_timestamp(cert: &TrustCertificate): u64 {
        cert.timestamp_ms
    }

    public fun get_certificate_verifier(cert: &TrustCertificate): address {
        cert.verifier
    }

    public fun get_certificate_verified_at(cert: &TrustCertificate): u64 {
        cert.verified_at
    }

    // ===== Helper Functions =====

    fun validate_input_hash(input_hash: &vector<u8>): bool {
        let len = input_hash.length();
        len == 32 || len == 64
    }

    // ===== Test-only Functions =====

    #[test_only]
    public fun create_test_certificate(ctx: &mut TxContext): TrustCertificate {
        TrustCertificate {
            id: object::new(ctx),
            job_id: b"test-job-123",
            model_id: b"mnist-classifier",
            input_hash: x"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            result_hash: x"fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
            enclave_id: object::id_from_address(@0x1),
            timestamp_ms: 1700000000000,
            verified_at: 1700000000000,
            verifier: @0x123,
        }
    }

    #[test_only]
    public fun destroy_test_certificate(cert: TrustCertificate) {
        let TrustCertificate {
            id,
            job_id: _,
            model_id: _,
            input_hash: _,
            result_hash: _,
            enclave_id: _,
            timestamp_ms: _,
            verified_at: _,
            verifier: _,
        } = cert;
        object::delete(id);
    }
}