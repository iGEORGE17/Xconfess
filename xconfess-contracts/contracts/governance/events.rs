use soroban_sdk::{symbol_short, Address, Env};

pub fn action_proposed(e: &Env, proposal_id: u64, proposer: Address) {
    e.events().publish(
        (symbol_short!("gov_prop"), proposal_id),
        proposer,
    );
}

pub fn action_approved(e: &Env, proposal_id: u64, approver: Address) {
    e.events().publish(
        (symbol_short!("gov_app"), proposal_id),
        approver,
    );
}

pub fn approval_revoked(e: &Env, proposal_id: u64, actor: Address) {
    e.events().publish(
        (symbol_short!("gov_rev"), proposal_id),
        actor,
    );
}

pub fn action_executed(e: &Env, proposal_id: u64, executor: Address) {
    e.events().publish(
        (symbol_short!("gov_exec"), proposal_id),
        executor,
    );
}

pub fn proposed(e: &Env, current: Address, proposed: Address) {
    e.events().publish(
        (symbol_short!("adm_prop"),),
        (current, proposed),
    );
}

pub fn accepted(e: &Env, old: Address, new_admin: Address) {
    e.events().publish(
        (symbol_short!("adm_acc"),),
        (old, new_admin),
    );
}

pub fn cancelled(e: &Env, admin: Address) {
    e.events().publish(
        (symbol_short!("adm_can"),),
        admin,
    );
}

pub fn invariant_violation(e: &Env, operation: &str, reason: &str, attempted_by: Address) {
    e.events().publish(
        (symbol_short!("gov_inv"),),
        (operation, reason, attempted_by),
    );
}