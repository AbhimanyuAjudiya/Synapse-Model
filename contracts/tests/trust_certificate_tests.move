// Copyright (c) 2025, SynapseModel Team
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module synapsemodel::trust_certificate_tests {
    use sui::test_scenario;
    use synapsemodel::trust_certificate;

    const USER: address = @0xB0B;

    public struct SYNAPSEMODEL has drop {}

    #[test]
    fun test_certificate_getters() {
        let mut scenario = test_scenario::begin(USER);
        
        let cert = trust_certificate::create_test_certificate(scenario.ctx());
        
        assert!(trust_certificate::get_certificate_job_id(&cert) == b"test-job-123", 0);
        assert!(trust_certificate::get_certificate_model_id(&cert) == b"mnist-classifier", 1);
        
        trust_certificate::destroy_test_certificate(cert);
        test_scenario::end(scenario);
    }
}
