use soroban_sdk::{
    contracttype, symbol_short, Address, Env, Symbol,
};

/// ===========================================
/// GLOBAL EVENT VERSIONING
/// ===========================================
pub const EVENT_VERSION_V1: u32 = 1;

/// Stable discriminators (NEVER CHANGE)
pub const CONFESSION_EVENT: Symbol = symbol_short!("confess");
pub const REACTION_EVENT: Symbol = symbol_short!("react");
pub const REPORT_EVENT: Symbol = symbol_short!("report");
pub const ROLE_EVENT: Symbol = symbol_short!("role");
pub const BADGE_EVENT: Symbol = symbol_short!("badge");

/// ===========================================
/// EVENT NONCE STORAGE
/// ===========================================
///
/// Nonces are monotonic counters used by indexers to:
/// - detect gaps (missing events)
/// - detect duplicates/replays
/// - enforce deterministic in-stream ordering
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
enum EventNonceKey {
    Confession(u64),
    Reaction(u64),
    Report(u64),
    Role(Address, Symbol),
    Governance(Symbol),
    Badge(u64),
}

fn read_nonce(env: &Env, key: &EventNonceKey) -> u64 {
    env.storage().instance().get(key).unwrap_or(0u64)
}

fn bump_nonce(env: &Env, key: EventNonceKey) -> u64 {
    let next = read_nonce(env, &key)
        .checked_add(1)
        .expect("event nonce overflow");
    env.storage().instance().set(&key, &next);
    next
}

pub fn latest_confession_nonce(env: &Env, confession_id: u64) -> u64 {
    read_nonce(env, &EventNonceKey::Confession(confession_id))
}

pub fn latest_reaction_nonce(env: &Env, confession_id: u64) -> u64 {
    read_nonce(env, &EventNonceKey::Reaction(confession_id))
}

pub fn latest_report_nonce(env: &Env, confession_id: u64) -> u64 {
    read_nonce(env, &EventNonceKey::Report(confession_id))
}

pub fn latest_role_nonce(env: &Env, user: Address, role: Symbol) -> u64 {
    read_nonce(env, &EventNonceKey::Role(user, role))
}

pub fn latest_governance_nonce(env: &Env, stream: Symbol) -> u64 {
    read_nonce(env, &EventNonceKey::Governance(stream))
}

pub fn latest_badge_nonce(env: &Env, badge_id: u64) -> u64 {
    read_nonce(env, &EventNonceKey::Badge(badge_id))
}

pub fn next_governance_nonce(env: &Env, stream: Symbol) -> u64 {
    bump_nonce(env, EventNonceKey::Governance(stream))
}

/// ===========================================
/// CONFESSION EVENT (V1) WITH OPTIONAL CORRELATION ID
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ConfessionEvent {
    pub event_version: u32,
    pub confession_id: u64,
    pub author: Address,
    pub content_hash: Symbol,
    pub nonce: u64,
    pub timestamp: u64,
    pub correlation_id: Option<Symbol>, // new optional field
}

pub fn emit_confession(
    env: &Env,
    confession_id: u64,
    author: Address,
    content_hash: Symbol,
    correlation_id: Option<Symbol>, // optional parameter
) {
    let nonce = bump_nonce(env, EventNonceKey::Confession(confession_id));

    let payload = ConfessionEvent {
        event_version: EVENT_VERSION_V1,
        confession_id,
        author,
        content_hash,
        nonce,
        timestamp: env.ledger().timestamp(),
        correlation_id,
    };

    env.events().publish((CONFESSION_EVENT,), payload);
}

/// ===========================================
/// REACTION EVENT (V1) WITH OPTIONAL CORRELATION ID
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReactionEvent {
    pub event_version: u32,
    pub confession_id: u64,
    pub reactor: Address,
    pub reaction_type: Symbol,
    pub nonce: u64,
    pub timestamp: u64,
    pub correlation_id: Option<Symbol>,
}

pub fn emit_reaction(
    env: &Env,
    confession_id: u64,
    reactor: Address,
    reaction_type: Symbol,
    correlation_id: Option<Symbol>,
) {
    let nonce = bump_nonce(env, EventNonceKey::Reaction(confession_id));

    let payload = ReactionEvent {
        event_version: EVENT_VERSION_V1,
        confession_id,
        reactor,
        reaction_type,
        nonce,
        timestamp: env.ledger().timestamp(),
        correlation_id,
    };

    env.events().publish((REACTION_EVENT,), payload);
}

/// ===========================================
/// REPORT EVENT (V1) WITH OPTIONAL CORRELATION ID
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReportEvent {
    pub event_version: u32,
    pub confession_id: u64,
    pub reporter: Address,
    pub reason: Symbol,
    pub nonce: u64,
    pub timestamp: u64,
    pub correlation_id: Option<Symbol>,
}

pub fn emit_report(
    env: &Env,
    confession_id: u64,
    reporter: Address,
    reason: Symbol,
    correlation_id: Option<Symbol>,
) {
    let nonce = bump_nonce(env, EventNonceKey::Report(confession_id));

    let payload = ReportEvent {
        event_version: EVENT_VERSION_V1,
        confession_id,
        reporter,
        reason,
        nonce,
        timestamp: env.ledger().timestamp(),
        correlation_id,
    };

    env.events().publish((REPORT_EVENT,), payload);
}

/// ===========================================
/// ROLE EVENT (V1) WITH OPTIONAL CORRELATION ID
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RoleEvent {
    pub event_version: u32,
    pub user: Address,
    pub role: Symbol,
    pub granted: bool,
    pub nonce: u64,
    pub timestamp: u64,
    pub correlation_id: Option<Symbol>,
}

pub fn emit_role(
    env: &Env,
    user: Address,
    role: Symbol,
    granted: bool,
    correlation_id: Option<Symbol>,
) {
    let nonce = bump_nonce(env, EventNonceKey::Role(user.clone(), role.clone()));

    let payload = RoleEvent {
        event_version: EVENT_VERSION_V1,
        user,
        role,
        granted,
        nonce,
        timestamp: env.ledger().timestamp(),
        correlation_id,
    };

    env.events().publish((ROLE_EVENT,), payload);
}

/// ===========================================
/// BADGE EVENT (V1)
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BadgeAction {
    Grant,
    Revoke,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BadgeEvent {
    pub event_version: u32,
    pub badge_id: u64,
    pub badge_type: u32,
    pub owner: Address,
    pub action: BadgeAction,
    pub nonce: u64,
    pub timestamp: u64,
}

pub fn emit_badge_event(
    env: &Env,
    badge_id: u64,
    badge_type: u32,
    owner: Address,
    action: BadgeAction,
) {
    let nonce = bump_nonce(env, EventNonceKey::Badge(badge_id));

    let payload = BadgeEvent {
        event_version: EVENT_VERSION_V1,
        badge_id,
        badge_type,
        owner,
        action,
        nonce,
        timestamp: env.ledger().timestamp(),
    };

    env.events().publish((BADGE_EVENT,), payload);
}

/// ===========================================
/// BACKWARD COMPATIBLE DECODERS
/// ===========================================
pub fn decode_confession_event(event: &ConfessionEvent) {
    match event.event_version {
        1 => {} // V1 decode
        _ => panic!("Unsupported confession event version"),
    }
}

pub fn decode_reaction_event(event: &ReactionEvent) {
    match event.event_version {
        1 => {}
        _ => panic!("Unsupported reaction event version"),
    }
}

pub fn decode_report_event(event: &ReportEvent) {
    match event.event_version {
        1 => {}
        _ => panic!("Unsupported report event version"),
    }
}

pub fn decode_role_event(event: &RoleEvent) {
    match event.event_version {
        1 => {}
        _ => panic!("Unsupported role event version"),
    }
}

pub fn decode_badge_event(event: &BadgeEvent) {
    match event.event_version {
        1 => {}
        _ => panic!("Unsupported badge event version"),
    }
}
