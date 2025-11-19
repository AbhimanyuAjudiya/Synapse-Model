// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

/// Job Record Module
/// 
/// Optional module for storing job metadata on-chain.
/// Creates permanent records of inference jobs.

module synapsemodel::job_record {
    use sui::clock::Clock;
    use sui::event;
    use std::string::String;

    // ===== Error Codes =====
    
    const EInvalidJobId: u64 = 1;
    const EInvalidModelId: u64 = 2;
    const EUnauthorized: u64 = 4;

    // ===== Structs =====

    /// On-chain job record
    public struct JobRecord has key, store {
        id: UID,
        job_id: vector<u8>,
        model_id: vector<u8>,
        input_hash: vector<u8>,
        submitter: address,
        submitted_at: u64,
        certificate_id: Option<ID>,
        metadata: String,
    }

    /// Job registry (shared object)
    public struct JobRegistry has key {
        id: UID,
        total_jobs: u64,
    }

    // ===== Events =====

    public struct JobRecordCreated has copy, drop {
        record_id: ID,
        job_id: vector<u8>,
        model_id: vector<u8>,
        submitter: address,
        timestamp: u64,
    }

    public struct JobRecordVerified has copy, drop {
        record_id: ID,
        job_id: vector<u8>,
        certificate_id: ID,
        timestamp: u64,
    }

    // ===== Initialization =====

    fun init(ctx: &mut TxContext) {
        let registry = JobRegistry {
            id: object::new(ctx),
            total_jobs: 0,
        };
        transfer::share_object(registry);
    }

    // ===== Public Functions =====

    /// Create job record
    public entry fun create_job_record(
        registry: &mut JobRegistry,
        clock: &Clock,
        job_id: vector<u8>,
        model_id: vector<u8>,
        input_hash: vector<u8>,
        metadata: String,
        ctx: &mut TxContext
    ) {
        assert!(job_id.length() > 0, EInvalidJobId);
        assert!(model_id.length() > 0, EInvalidModelId);

        let record = JobRecord {
            id: object::new(ctx),
            job_id,
            model_id,
            input_hash,
            submitter: tx_context::sender(ctx),
            submitted_at: clock.timestamp_ms(),
            certificate_id: std::option::none(),
            metadata,
        };

        let record_id = object::id(&record);
        registry.total_jobs = registry.total_jobs + 1;

        event::emit(JobRecordCreated {
            record_id,
            job_id: record.job_id,
            model_id: record.model_id,
            submitter: record.submitter,
            timestamp: record.submitted_at,
        });

        transfer::transfer(record, tx_context::sender(ctx));
    }

    /// Link certificate to job
    public entry fun link_certificate(
        record: &mut JobRecord,
        certificate_id: ID,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(record.submitter == tx_context::sender(ctx), EUnauthorized);
        record.certificate_id = std::option::some(certificate_id);

        event::emit(JobRecordVerified {
            record_id: object::id(record),
            job_id: record.job_id,
            certificate_id,
            timestamp: clock.timestamp_ms(),
        });
    }

    /// Update metadata
    public entry fun update_metadata(
        record: &mut JobRecord,
        new_metadata: String,
        ctx: &TxContext
    ) {
        assert!(record.submitter == tx_context::sender(ctx), EUnauthorized);
        record.metadata = new_metadata;
    }

    // ===== View Functions =====

    public fun get_job_id(record: &JobRecord): vector<u8> {
        record.job_id
    }

    public fun get_model_id(record: &JobRecord): vector<u8> {
        record.model_id
    }

    public fun get_input_hash(record: &JobRecord): vector<u8> {
        record.input_hash
    }

    public fun get_submitter(record: &JobRecord): address {
        record.submitter
    }

    public fun get_submitted_at(record: &JobRecord): u64 {
        record.submitted_at
    }

    public fun get_certificate_id(record: &JobRecord): Option<ID> {
        record.certificate_id
    }

    public fun get_metadata(record: &JobRecord): String {
        record.metadata
    }

    public fun is_verified(record: &JobRecord): bool {
        std::option::is_some(&record.certificate_id)
    }

    public fun get_total_jobs(registry: &JobRegistry): u64 {
        registry.total_jobs
    }
}