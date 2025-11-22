// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module synapsemodel::enclave_registry_tests {
    use sui::test_scenario;
    use synapsemodel::enclave_registry;
    use std::string;

    const ADMIN: address = @0xAD;

    public struct TEST has drop {}

    #[test]
    fun test_create_enclave() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        let pk = x"1234567890123456789012345678901234567890123456789012345678901234";
        let enclave = enclave_registry::create_test_enclave<TEST>(pk, scenario.ctx());
        
        assert!(enclave_registry::get_enclave_pk(&enclave) == pk, 0);
        assert!(enclave_registry::get_enclave_owner(&enclave) == ADMIN, 1);
        
        enclave_registry::destroy_test_enclave(enclave);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_config_management() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        let config = enclave_registry::create_test_config<TEST>(
            string::utf8(b"Test Config"),
            scenario.ctx()
        );
        
        assert!(enclave_registry::get_config_name(&config) == string::utf8(b"Test Config"), 0);
        assert!(enclave_registry::get_config_version(&config) == 0, 1);
        
        enclave_registry::destroy_test_config(config);
        test_scenario::end(scenario);
    }
}
