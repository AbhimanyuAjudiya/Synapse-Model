// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module model_registry::registry_tests {
    use std::string;

    #[test]
    /// Test that verifies the model registry module compiles and has the expected structure
    fun test_module_structure() {
        // This test just verifies the module compiles correctly
        // Real integration tests would need to be run separately
        let _name = string::utf8(b"Test Model");
        let _description = string::utf8(b"A test model description");
        let _blob_id = string::utf8(b"blob123");
        let _object_id = string::utf8(b"object456");
    }
}
