use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone)]
pub struct AdminTransfer {
    pub proposed_admin: Address,
    pub proposed_at: u64,
}