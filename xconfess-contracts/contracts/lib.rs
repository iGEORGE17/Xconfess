use soroban_sdk::{Env, Symbol};

// Define deterministic errors
pub const ERR_DUPLICATE_REPORT: &str = "duplicate_report";
pub const ERR_COOLDOWN_ACTIVE: &str = "cooldown_active";

// Helper for generating a key for actor-confession mapping
pub fn report_key(actor: &Symbol, confession_id: &Symbol) -> Vec<u8> {
    [actor.as_bytes(), confession_id.as_bytes()].concat()
}