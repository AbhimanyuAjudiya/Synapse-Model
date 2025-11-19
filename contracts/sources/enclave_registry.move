// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

/// Enclave Registry Module
/// 
/// Manages TEE enclave registration and lifecycle on Sui blockchain.
/// Provides capability-based access control for enclave configuration management.

module synapsemodel::enclave_registry {
    use std::string::String;
    use sui::ed25519;
    use sui::bcs;
    use sui::event;

    // ===== Error Codes =====
    
    const EInvalidCapability: u64 = 1;
    const EInvalidPCR: u64 = 2;
    const EInvalidPublicKey: u64 = 4;
    const EConfigVersionMismatch: u64 = 6;

    // ===== Constants =====
    
    const PCR_LENGTH: u64 = 48; // 384 bits = 48 bytes

    // ===== Structs =====

    /// Platform Configuration Registers from enclave attestation
    public struct Pcrs has store, copy, drop {
        pcr0: vector<u8>,
        pcr1: vector<u8>,
        pcr2: vector<u8>,
    }

    /// Capability to manage an enclave configuration
    public struct Cap<phantom T> has key, store {
        id: UID,
    }

    /// Enclave configuration with expected PCR values
    public struct EnclaveConfig<phantom T> has key, store {
        id: UID,
        name: String,
        pcrs: Pcrs,
        capability_id: ID,
        version: u64,
    }

    /// Registered enclave instance
    public struct Enclave<phantom T> has key, store {
        id: UID,
        pk: vector<u8>,
        config_version: u64,
        owner: address,
    }

    /// Intent message wrapper for signature verification
    public struct IntentMessage<T: drop> has drop {
        intent: u8,
        timestamp_ms: u64,
        data: T,
    }

    // ===== Events =====

    public struct ConfigCreated has copy, drop {
        config_id: ID,
        name: String,
        version: u64,
    }

    public struct EnclaveRegistered has copy, drop {
        enclave_id: ID,
        config_id: ID,
        public_key: vector<u8>,
        owner: address,
    }

    public struct ConfigUpdated has copy, drop {
        config_id: ID,
        old_version: u64,
        new_version: u64,
    }

    // ===== Public Functions =====

    /// Create a new capability
    public fun new_cap<T: drop>(_witness: T, ctx: &mut TxContext): Cap<T> {
        Cap { id: object::new(ctx) }
    }

    /// Create enclave configuration
    public fun create_enclave_config<T: drop>(
        cap: &Cap<T>,
        name: String,
        pcr0: vector<u8>,
        pcr1: vector<u8>,
        pcr2: vector<u8>,
        ctx: &mut TxContext,
    ) {
        assert!(pcr0.length() == PCR_LENGTH, EInvalidPCR);
        assert!(pcr1.length() == PCR_LENGTH, EInvalidPCR);
        assert!(pcr2.length() == PCR_LENGTH, EInvalidPCR);

        let enclave_config = EnclaveConfig<T> {
            id: object::new(ctx),
            name,
            pcrs: Pcrs { pcr0, pcr1, pcr2 },
            capability_id: object::id(cap),
            version: 0,
        };

        event::emit(ConfigCreated {
            config_id: object::id(&enclave_config),
            name: enclave_config.name,
            version: 0,
        });

        transfer::share_object(enclave_config);
    }

    /// Register an enclave with public key
    /// Note: In production, this should verify attestation documents
    /// For MVP/testing, accepts pre-verified public key
    public fun register_enclave<T>(
        enclave_config: &EnclaveConfig<T>,
        pk: vector<u8>,
        ctx: &mut TxContext,
    ) {
        assert!(pk.length() == 32, EInvalidPublicKey);

        let enclave = Enclave<T> {
            id: object::new(ctx),
            pk,
            config_version: enclave_config.version,
            owner: tx_context::sender(ctx),
        };

        event::emit(EnclaveRegistered {
            enclave_id: object::id(&enclave),
            config_id: object::id(enclave_config),
            public_key: enclave.pk,
            owner: tx_context::sender(ctx),
        });

        transfer::share_object(enclave);
    }

    /// Verify signature from enclave
    public fun verify_signature<T, P: drop>(
        enclave: &Enclave<T>,
        intent_scope: u8,
        timestamp_ms: u64,
        payload: P,
        signature: &vector<u8>,
    ): bool {
        let intent_message = IntentMessage {
            intent: intent_scope,
            timestamp_ms,
            data: payload,
        };

        let message_bytes = bcs::to_bytes(&intent_message);
        ed25519::ed25519_verify(signature, &enclave.pk, &message_bytes)
    }

    /// Verify enclave config version matches
    public fun verify_enclave_config<T>(
        enclave: &Enclave<T>,
        config: &EnclaveConfig<T>,
    ) {
        assert!(enclave.config_version == config.version, EConfigVersionMismatch);
    }

    /// Update PCR values (requires capability)
    public fun update_pcrs<T: drop>(
        config: &mut EnclaveConfig<T>,
        cap: &Cap<T>,
        pcr0: vector<u8>,
        pcr1: vector<u8>,
        pcr2: vector<u8>,
    ) {
        assert!(object::id(cap) == config.capability_id, EInvalidCapability);
        assert!(pcr0.length() == PCR_LENGTH, EInvalidPCR);
        assert!(pcr1.length() == PCR_LENGTH, EInvalidPCR);
        assert!(pcr2.length() == PCR_LENGTH, EInvalidPCR);

        let old_version = config.version;
        config.pcrs = Pcrs { pcr0, pcr1, pcr2 };
        config.version = config.version + 1;

        event::emit(ConfigUpdated {
            config_id: object::id(config),
            old_version,
            new_version: config.version,
        });
    }

    /// Update config name (requires capability)
    public fun update_name<T: drop>(
        config: &mut EnclaveConfig<T>,
        cap: &Cap<T>,
        name: String,
    ) {
        assert!(object::id(cap) == config.capability_id, EInvalidCapability);
        config.name = name;
    }

    // ===== View Functions =====

    public fun get_enclave_pk<T>(enclave: &Enclave<T>): vector<u8> {
        enclave.pk
    }

    public fun get_enclave_config_version<T>(enclave: &Enclave<T>): u64 {
        enclave.config_version
    }

    public fun get_enclave_owner<T>(enclave: &Enclave<T>): address {
        enclave.owner
    }

    public fun get_config_pcrs<T>(config: &EnclaveConfig<T>): (vector<u8>, vector<u8>, vector<u8>) {
        (config.pcrs.pcr0, config.pcrs.pcr1, config.pcrs.pcr2)
    }

    public fun get_config_name<T>(config: &EnclaveConfig<T>): String {
        config.name
    }

    public fun get_config_version<T>(config: &EnclaveConfig<T>): u64 {
        config.version
    }

    // ===== Test-only Functions =====

    #[test_only]
    public fun create_test_enclave<T: drop>(pk: vector<u8>, ctx: &mut TxContext): Enclave<T> {
        Enclave<T> {
            id: object::new(ctx),
            pk,
            config_version: 0,
            owner: tx_context::sender(ctx),
        }
    }

    #[test_only]
    public fun destroy_test_enclave<T: drop>(enclave: Enclave<T>) {
        let Enclave { id, pk: _, config_version: _, owner: _ } = enclave;
        object::delete(id);
    }

    #[test_only]
    public fun create_test_config<T: drop>(name: String, ctx: &mut TxContext): EnclaveConfig<T> {
        let mut pcr0 = vector[];
        let mut pcr1 = vector[];
        let mut pcr2 = vector[];
        let mut i = 0;
        while (i < PCR_LENGTH) {
            pcr0.push_back(0u8);
            pcr1.push_back(0u8);
            pcr2.push_back(0u8);
            i = i + 1;
        };
        
        EnclaveConfig<T> {
            id: object::new(ctx),
            name,
            pcrs: Pcrs { pcr0, pcr1, pcr2 },
            capability_id: object::id_from_address(@0x0),
            version: 0,
        }
    }

    #[test_only]
    public fun destroy_test_config<T: drop>(config: EnclaveConfig<T>) {
        let EnclaveConfig { id, name: _, pcrs: _, capability_id: _, version: _ } = config;
        object::delete(id);
    }
}