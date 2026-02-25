use soroban_sdk::{Address, Env};

use crate::access_control::{get_admin, require_admin};
use crate::storage::DataKey;

use super::model::AdminTransfer;
use super::events::*;

const DEFAULT_TIMELOCK: u64 = 86400;

pub fn propose(e: &Env, new_admin: Address) {
    require_admin(e);

    let current = get_admin(e);

    let transfer = AdminTransfer {
        proposed_admin: new_admin.clone(),
        proposed_at: e.ledger().timestamp(),
    };

    e.storage()
        .instance()
        .set(&DataKey::PendingAdmin, &transfer);

    proposed(e, current, new_admin);
}

pub fn cancel(e: &Env) {
    require_admin(e);

    e.storage().instance().remove(&DataKey::PendingAdmin);

    let admin = get_admin(e);
    cancelled(e, admin);
}

pub fn accept(e: &Env) {
    let transfer: AdminTransfer = e
        .storage()
        .instance()
        .get(&DataKey::PendingAdmin)
        .expect("no pending transfer");

    transfer.proposed_admin.require_auth();

    let now = e.ledger().timestamp();

    let timelock: u64 = e
        .storage()
        .instance()
        .get(&DataKey::AdminTransferTimelock)
        .unwrap_or(DEFAULT_TIMELOCK);

    if now < transfer.proposed_at + timelock {
        panic!("timelock not expired");
    }

    let old_admin = get_admin(e);

    e.storage()
        .instance()
        .set(&DataKey::Admin, &transfer.proposed_admin);

    e.storage().instance().remove(&DataKey::PendingAdmin);

    accepted(e, old_admin, transfer.proposed_admin);
}