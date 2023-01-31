#[cfg(test)]
mod tests {
    // Outlining aspects of the Casper test support crate to include.
    use casper_engine_test_support::{
        ExecuteRequestBuilder, InMemoryWasmTestBuilder, DEFAULT_ACCOUNT_ADDR,
        DEFAULT_RUN_GENESIS_REQUEST,
    };

    // Custom Casper types that will be used within this test.
    use casper_types::{runtime_args, ContractHash, RuntimeArgs};

    const HIGHSCORE_WASM: &str = "highscore.wasm";

    const CONTRACT_KEY: &str = "highscore";

    // Name of keys to store highest overall score and name
    const HIGHSCORE_KEY: &str = "highest_score";
    const HIGHSCORE_USER_KEY: &str = "highest_score_user";

    const ENTRY_POINT_HIGHSCORE_SET: &str = "highscore_set"; // Entry point to set the highscore
    const ENTRY_POINT_HIGHSCORE_GET: &str = "highscore_get"; // Entry point to get the highscore

    #[test]
    // Check the initial contract conditions
    /// Test summary:
    /// - Install the highscore.wasm contract.
    /// - Check the contract hash.
    /// - Verify the initial highscore is 0.
    /// - Verify the initial user with the highest score is "".
    fn check_initial_conditions() {
        let mut builder = InMemoryWasmTestBuilder::default();
        builder.run_genesis(&*DEFAULT_RUN_GENESIS_REQUEST).commit();

        // Install the contract.
        let highscore_installation_request = ExecuteRequestBuilder::standard(
            *DEFAULT_ACCOUNT_ADDR,
            HIGHSCORE_WASM,
            runtime_args! {},
        )
        .build();

        builder.exec(highscore_installation_request).expect_success().commit();

        // Check the contract hash
        let highscore_hash = builder
            .get_expected_account(*DEFAULT_ACCOUNT_ADDR)
            .named_keys()
            .get(CONTRACT_KEY)
            .expect("must have contract hash key as part of contract creation")
            .into_hash()
            .map(ContractHash::new)
            .expect("must get contract hash");

        // Verify the initial value of highscore is 0
        let contract = builder
            .get_contract(highscore_hash)
            .expect("this contract should exist");

        let score_value_key = *contract
            .named_keys()
            .get(HIGHSCORE_KEY)
            .expect("highest_score uref should exist in the contract named keys");

        let count = builder
            .query(None, score_value_key, &[])
            .expect("should be stored value.")
            .as_cl_value()
            .expect("should be cl value.")
            .clone()
            .into_t::<i32>()
            .expect("should be i32.");

        // make assertions
        assert_eq!(count, 0);

        // Verify the name of highscore user is blank
        let score_name_key = *contract
            .named_keys()
            .get(HIGHSCORE_USER_KEY)
            .expect("highest_score_user uref should exist in the contract named keys");

        let user = builder
            .query(None, score_name_key, &[])
            .expect("Value should exist")
            .as_cl_value()
            .expect("should be cl value.")
            .clone();

        let s1 = user.inner_bytes();
        let s2 = String::from_utf8_lossy(s1);
        let s3 = s2.trim_matches(char::from(0));

        // make assertions
        assert_eq!(s3, "");
    }
	
    #[test]
    #[should_panic]
    /// Test getting the highest score for a non existent user
    /// Test summary:
    /// - Install the highscore.wasm contract
    /// - Call the highscore_get entry point with an unknown username
	/// - Verify that contract panics since the name does not exist
    fn get_high_score_for_none_user() {
        let mut builder = InMemoryWasmTestBuilder::default();
        builder.run_genesis(&*DEFAULT_RUN_GENESIS_REQUEST).commit();

        // Install the contract.
        let highscore_installation_request = ExecuteRequestBuilder::standard(
            *DEFAULT_ACCOUNT_ADDR,
            HIGHSCORE_WASM,
            runtime_args! {},
        )
        .build();

        builder.exec(highscore_installation_request).expect_success().commit();

        // Check the contract hash.
        let highscore_hash = builder
            .get_expected_account(*DEFAULT_ACCOUNT_ADDR)
            .named_keys()
            .get(CONTRACT_KEY)
            .expect("must have contract hash key as part of contract creation")
            .into_hash()
            .map(ContractHash::new)
            .expect("must get contract hash");

        // Call the highscore_get entry point
        let _get_highscore_request = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_GET,
            runtime_args! {
                "name" => "Alan"		// Invalid username
            },
        )
        .build();

        // Try executing the highscore_get entry point
        builder.exec(_get_highscore_request).expect_success().commit();
    }
	
    #[test]
    /// Test getting the highscore for a new user
    /// Test summary:
    /// - Install the highscore.wasm contract
    /// - Call the highscore_set entry point with a new username and score
	/// - Retrieve the highscore by name and verify that contract does not panic since the name does exist
    fn get_high_score_for_valid_user() {
        let mut builder = InMemoryWasmTestBuilder::default();
        builder.run_genesis(&*DEFAULT_RUN_GENESIS_REQUEST).commit();

        // Install the contract.
        let highscore_installation_request = ExecuteRequestBuilder::standard(
            *DEFAULT_ACCOUNT_ADDR,
            HIGHSCORE_WASM,
            runtime_args! {},
        )
        .build();

        builder.exec(highscore_installation_request).expect_success().commit();

        // Check the contract hash.
        let highscore_hash = builder
            .get_expected_account(*DEFAULT_ACCOUNT_ADDR)
            .named_keys()
            .get(CONTRACT_KEY)
            .expect("must have contract hash key as part of contract creation")
            .into_hash()
            .map(ContractHash::new)
            .expect("must get contract hash");

        // Call the highscore_set entry point
        let _set_highscore_request = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_SET,
            runtime_args! {
                "name" => "Alan",
				"value" => 10
            },
        )
        .build();

        // Try executing the highscore_set entry point
        builder.exec(_set_highscore_request).expect_success().commit();
		
        // Call the highscore_set entry point
        let _get_highscore_request = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_GET,
            runtime_args! {
                "name" => "Alan"
            },
        )
        .build();

        // Try executing the highscore_get entry point
        builder.exec(_get_highscore_request).expect_success().commit();		
    }	
	
    #[test]
    /// Test setting the highscore for a new user
    /// Test summary:
    /// - Install the highscore.wasm contract
    /// - Call the highscore_set entry point with a new username and score
	/// - Retrieve the highscore verify that it matches what was set
    fn set_high_score_for_new_user() {
        let mut builder = InMemoryWasmTestBuilder::default();
        builder.run_genesis(&*DEFAULT_RUN_GENESIS_REQUEST).commit();

        // Install the contract.
        let highscore_installation_request = ExecuteRequestBuilder::standard(
            *DEFAULT_ACCOUNT_ADDR,
            HIGHSCORE_WASM,
            runtime_args! {},
        )
        .build();

        builder.exec(highscore_installation_request).expect_success().commit();

        // Check the contract hash.
        let highscore_hash = builder
            .get_expected_account(*DEFAULT_ACCOUNT_ADDR)
            .named_keys()
            .get(CONTRACT_KEY)
            .expect("must have contract hash key as part of contract creation")
            .into_hash()
            .map(ContractHash::new)
            .expect("must get contract hash");

        // Call the highscore_set entry point
        let _set_highscore_request = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_SET,
            runtime_args! {
                "name" => "Alan",
				"value" => 10
            },
        )
        .build();

        // Try executing the highscore_set entry point
        builder.exec(_set_highscore_request).expect_success().commit();
		
        // Verify the new highscore is 10.
        let contract = builder
            .get_contract(highscore_hash)
            .expect("this contract should exist");

        let score_value_key = *contract
            .named_keys()
            .get(HIGHSCORE_KEY)
            .expect("highest_score uref should exist in the contract named keys");

        let count = builder
            .query(None, score_value_key, &[])
            .expect("should be stored value.")
            .as_cl_value()
            .expect("should be cl value.")
            .clone()
            .into_t::<i32>()
            .expect("should be i32.");

        // make assertions
        assert_eq!(count, 10);
    }
	
    #[test]
    /// Test setting users new score to lower value than user's previous highscore
    /// Test summary:
    /// - Install the highscore.wasm contract
    /// - Call the highscore_set entry point with a new username and score
    /// - Call the highscore_set entry point with same username but lower score than before
	/// - Retrieve the highscore verify that it matches the first score that was set	
    fn set_score_for_same_user_lower_than_highscore() {
        let mut builder = InMemoryWasmTestBuilder::default();
        builder.run_genesis(&*DEFAULT_RUN_GENESIS_REQUEST).commit();

        // Install the contract.
        let highscore_installation_request = ExecuteRequestBuilder::standard(
            *DEFAULT_ACCOUNT_ADDR,
            HIGHSCORE_WASM,
            runtime_args! {},
        )
        .build();

        builder.exec(highscore_installation_request).expect_success().commit();

        // Check the contract hash.
        let highscore_hash = builder
            .get_expected_account(*DEFAULT_ACCOUNT_ADDR)
            .named_keys()
            .get(CONTRACT_KEY)
            .expect("must have contract hash key as part of contract creation")
            .into_hash()
            .map(ContractHash::new)
            .expect("must get contract hash");

        // Call the highscore_set entry point
        let _set_highscore_request = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_SET,
            runtime_args! {
                "name" => "Alan",
				"value" => 10
            },
        )
        .build();

        // Try executing the highscore_set entry point
        builder.exec(_set_highscore_request).expect_success().commit();
		
        // Call the highscore_set entry point
        let _set_highscore_request_2 = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_SET,
            runtime_args! {
                "name" => "Alan",
				"value" => 2
            },
        )
        .build();

        // Try executing the highscore_set entry point
        builder.exec(_set_highscore_request_2).expect_success().commit();		
		
        // Verify the highscore is still 10.
        let contract = builder
            .get_contract(highscore_hash)
            .expect("this contract should exist");

        let score_value_key = *contract
            .named_keys()
            .get(HIGHSCORE_KEY)
            .expect("highest_score uref should exist in the contract named keys");

        let count = builder
            .query(None, score_value_key, &[])
            .expect("should be stored value.")
            .as_cl_value()
            .expect("should be cl value.")
            .clone()
            .into_t::<i32>()
            .expect("should be i32.");

        // make assertions
        assert_eq!(count, 10);
    }

    #[test]
    /// Test setting users new score to higher value than user's previous highscore
    /// Test summary:
    /// - Install the highscore.wasm contract
    /// - Call the highscore_set entry point with a new username and score
    /// - Call the highscore_set entry point with the same username but higher score than before
	/// - Retrieve the highscore verify that it matches the second score that was set	
    fn set_score_for_same_user_higher_than_highscore() {
        let mut builder = InMemoryWasmTestBuilder::default();
        builder.run_genesis(&*DEFAULT_RUN_GENESIS_REQUEST).commit();

        // Install the contract.
        let highscore_installation_request = ExecuteRequestBuilder::standard(
            *DEFAULT_ACCOUNT_ADDR,
            HIGHSCORE_WASM,
            runtime_args! {},
        )
        .build();

        builder.exec(highscore_installation_request).expect_success().commit();

        // Check the contract hash.
        let highscore_hash = builder
            .get_expected_account(*DEFAULT_ACCOUNT_ADDR)
            .named_keys()
            .get(CONTRACT_KEY)
            .expect("must have contract hash key as part of contract creation")
            .into_hash()
            .map(ContractHash::new)
            .expect("must get contract hash");

        // Call the highscore_set entry point
        let _set_highscore_request = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_SET,
            runtime_args! {
                "name" => "Alan",
				"value" => 10
            },
        )
        .build();

        // Try executing the highscore_set entry point
        builder.exec(_set_highscore_request).expect_success().commit();
		
        // Call the highscore_set entry point
        let _set_highscore_request_2 = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_SET,
            runtime_args! {
                "name" => "Alan",
				"value" => 12
            },
        )
        .build();

        // Try executing the highscore_set entry point
        builder.exec(_set_highscore_request_2).expect_success().commit();		
		
        // Verify the highscore now 12
        let contract = builder
            .get_contract(highscore_hash)
            .expect("this contract should exist");

        let score_value_key = *contract
            .named_keys()
            .get(HIGHSCORE_KEY)
            .expect("highest_score uref should exist in the contract named keys");

        let count = builder
            .query(None, score_value_key, &[])
            .expect("should be stored value.")
            .as_cl_value()
            .expect("should be cl value.")
            .clone()
            .into_t::<i32>()
            .expect("should be i32.");

        // make assertions
        assert_eq!(count, 12);
    }

    #[test]
    /// Test setting new users score to higher value than previous user's highscore
    /// Test summary:
    /// - Install the highscore.wasm contract
    /// - Call the highscore_set entry point with a new username and score
    /// - Call the highscore_set entry point with another new username and higher score than before
	/// - Retrieve the highscore verify that it matches the second score that was set	
    fn set_score_for_new_user_higher_than_other_user_highscore() {
        let mut builder = InMemoryWasmTestBuilder::default();
        builder.run_genesis(&*DEFAULT_RUN_GENESIS_REQUEST).commit();

        // Install the contract.
        let highscore_installation_request = ExecuteRequestBuilder::standard(
            *DEFAULT_ACCOUNT_ADDR,
            HIGHSCORE_WASM,
            runtime_args! {},
        )
        .build();

        builder.exec(highscore_installation_request).expect_success().commit();

        // Check the contract hash.
        let highscore_hash = builder
            .get_expected_account(*DEFAULT_ACCOUNT_ADDR)
            .named_keys()
            .get(CONTRACT_KEY)
            .expect("must have contract hash key as part of contract creation")
            .into_hash()
            .map(ContractHash::new)
            .expect("must get contract hash");

        // Call the highscore_set entry point
        let _set_highscore_request = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_SET,
            runtime_args! {
                "name" => "Alan",
				"value" => 10
            },
        )
        .build();

        // Try executing the highscore_set entry point
        builder.exec(_set_highscore_request).expect_success().commit();
		
        // Call the highscore_get entry point
        let _set_highscore_request_2 = ExecuteRequestBuilder::contract_call_by_hash(
            *DEFAULT_ACCOUNT_ADDR,
            highscore_hash,
            ENTRY_POINT_HIGHSCORE_SET,
            runtime_args! {
                "name" => "Peter",
				"value" => 12
            },
        )
        .build();

        // Try executing the highscore_set entry point
        builder.exec(_set_highscore_request_2).expect_success().commit();		
		
        // Verify the highscore is still 10.
        let contract = builder
            .get_contract(highscore_hash)
            .expect("this contract should exist");

        let score_value_key = *contract
            .named_keys()
            .get(HIGHSCORE_KEY)
            .expect("highest_score uref should exist in the contract named keys");

        let count = builder
            .query(None, score_value_key, &[])
            .expect("should be stored value.")
            .as_cl_value()
            .expect("should be cl value.")
            .clone()
            .into_t::<i32>()
            .expect("should be i32.");

        // make assertions
        assert_eq!(count, 12);
    }
}

fn main() {
    panic!("Execute \"cargo test\" to test the contract, not \"cargo run\".");
}

