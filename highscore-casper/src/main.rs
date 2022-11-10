#![no_main] 
#![no_std]

#[cfg(not(target_arch = "wasm32"))]
compile_error!("target arch should be wasm32: compile with '--target wasm32-unknown-unknown'");

extern crate alloc;
use alloc::string::String;
use alloc::vec;
use core::convert::TryInto;
use alloc::collections::BTreeMap;

use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};

use casper_types::{
    api_error::ApiError,
    contracts::{EntryPoint, EntryPointAccess, EntryPointType, EntryPoints},
    CLType, CLValue, Key, URef, Parameter, 
};

// Name of keys to store highest overall score and name
const HIGHSCORE_KEY: &str = "highest_score";
const HIGHSCORE_USER_KEY: &str = "highest_score_user";

// Names for entry points
const HIGHSCORE_SET: &str = "highscore_set";
const HIGHSCORE_GET: &str = "highscore_get";

// Contract name
const CONTRACT_KEY: &str = "highscore";

#[no_mangle]
pub extern "C" fn highscore_set() {
    // Retrieve the values from the user
    let key: String = runtime::get_named_arg("name");    
    let value: i32 = runtime::get_named_arg("value");

    // Retrieve the current highest score
    let score_uref: URef = runtime::get_key(HIGHSCORE_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    let highest_score: i32 = storage::read(score_uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);

    // Compare the new score with the highest score
    if value > highest_score {
        // We have a new highest score so update the score
        storage::write(score_uref, value);

        // Update the highscorers name
        let user_uref: URef = runtime::get_key(HIGHSCORE_USER_KEY)
            .unwrap_or_revert_with(ApiError::MissingKey)
            .into_uref()
            .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

        storage::write(user_uref, key.as_str());
    }

    // Check to see if a record is alreay present for this user to store their
    // individual score
    match runtime::get_key(key.as_str()) {
        Some(key) => {
            // The user has played this game before
            let key_ref = key.try_into().unwrap_or_revert();
            let users_highest_score: i32 = storage::read(key_ref)
                .unwrap_or_revert_with(ApiError::Read)            
                .unwrap_or_revert_with(ApiError::ValueNotFound);

            // Check if they have beaten their current highscore
            if value > users_highest_score {
                // A new highscore for this player, so we update
                storage::write(key_ref, value);
            }
        }
        None => {
            // First time this user has played the game, so store their score
            let value_ref = storage::new_uref(value);
            let value_key = Key::URef(value_ref);
            runtime::put_key(key.as_str(), value_key);
        }
    }
}

#[no_mangle]
pub extern "C" fn highscore_get() {
    // Retrieve the name of the player
    let name: String = runtime::get_named_arg("name");

    // Check if they have a score and if so, return the value
    let uref: URef = runtime::get_key(&name)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    let result: i32 = storage::read(uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);
    runtime::ret(CLValue::from_t(result).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn call() {
    // Initialize the overall highscore to 0.
    let highscore_local_key = storage::new_uref(0_i32);
    // Initialize the name for the overall highscoring user
    let highscore_user_key = storage::new_uref("");

    // Create initial named keys of the contract.
    let mut highscore_named_keys: BTreeMap<String, Key> = BTreeMap::new();
    let key_name = String::from(HIGHSCORE_KEY);
    highscore_named_keys.insert(key_name, highscore_local_key.into());
    let key_user_name = String::from(HIGHSCORE_USER_KEY);
    highscore_named_keys.insert(key_user_name, highscore_user_key.into());

    // Create entry points to set the highscore value
    let mut highscore_entry_points = EntryPoints::new();
    highscore_entry_points.add_entry_point(EntryPoint::new(
        HIGHSCORE_SET,
        vec![
            Parameter::new("name", CLType::String),
            Parameter::new("value", CLType::I32)
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Create entry points to get the highscore value
    highscore_entry_points.add_entry_point(EntryPoint::new(
        HIGHSCORE_GET,
        vec![
            Parameter::new("name", CLType::String)
        ],
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    let (stored_contract_hash, _) = storage::new_locked_contract(highscore_entry_points, Some(highscore_named_keys), None, None);
    runtime::put_key(CONTRACT_KEY, stored_contract_hash.into());
}
