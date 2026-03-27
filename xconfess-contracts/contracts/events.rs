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
/// GOVERNANCE METADATA LIMITS
/// ===========================================
pub const MAX_REASON_LENGTH: u32 = 64;
pub const MAX_OPERATION_LENGTH: u32 = 32;

/// ===========================================
/// CUSTOM ERRORS
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GovernanceError {
    ReasonTooLong,
    OperationTooLong,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EventDecodeError {
    UnsupportedEventVersion(u32),
    // Add other potential decoding errors if necessary, e.g., MalformedData
}

/// ===========================================
/// VERSIONED EVENT DECODING TRAIT
/// ===========================================
// This trait provides a pattern for safely decoding events based on their version.
// Implement this for each event type that needs versioning.
pub trait VersionedEvent: Sized {
    const CURRENT_VERSION: u32;

    // This method will handle the actual decoding logic.
    // It takes the raw bytes (or whatever format the event is stored in)
    // and the event_version specified in the event data.
    // For simplicity, we'll assume the `event_version` is part of the encoded data.
    // In a real scenario, `raw_data` would likely be `soroban_sdk::Bytes` or similar
    // which needs to be deserialized based on the version.
    fn try_decode_versioned(event_version: u32, raw_data: soroban_sdk::Bytes) -> Result<Self, EventDecodeError>;
}

/// ===========================================
/// GOVERNANCE ERROR
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GovernanceError {
    ReasonTooLong,
    OperationTooLong,
}

/// ===========================================
/// GOVERNANCE METADATA
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GovernanceMetadata {
    pub reason: Symbol,
    pub operation: Symbol,
}

/// ===========================================
/// VALIDATION (NO PANICS)
/// ===========================================
fn validate_metadata(env: &Env, meta: &GovernanceMetadata) -> Result<(), GovernanceError> {
    if meta.reason.to_string().len() as u32 > MAX_REASON_LENGTH {
        return Err(GovernanceError::ReasonTooLong);
    }

    if meta.operation.to_string().len() as u32 > MAX_OPERATION_LENGTH {
        return Err(GovernanceError::OperationTooLong);
    }

    Ok(())
}

/// ===========================================
/// EVENT NONCE STORAGE
/// ===========================================
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

pub fn latest_governance_nonce(env: &Env, stream: Symbol) -> u64 {
    read_nonce(env, &EventNonceKey::Governance(stream))
}

pub fn next_governance_nonce(env: &Env, stream: Symbol) -> u64 {
    bump_nonce(env, EventNonceKey::Governance(stream))
}

/// ===========================================
/// GOVERNANCE EVENT
/// ===========================================
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GovernanceEvent {
    pub event_version: u32,
    pub metadata: GovernanceMetadata,
    pub nonce: u64,
    pub timestamp: u64,
}

pub fn emit_governance_event(
    env: &Env,
    stream: Symbol,
    metadata: GovernanceMetadata,
) -> Result<(), GovernanceError> {
    validate_metadata(env, &metadata)?;

    let nonce = bump_nonce(env, EventNonceKey::Governance(stream.clone()));

    let payload = GovernanceEvent {
        event_version: EVENT_VERSION_V1,
        metadata,
        nonce,
        timestamp: env.ledger().timestamp(),
    };

    env.events().publish((stream,), payload);

    Ok(())
}

/// ===========================================
/// CONFESSION EVENT
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
    pub correlation_id: Option<Symbol>,
}

pub fn emit_confession(
    env: &Env,
    confession_id: u64,
    author: Address,
    content_hash: Symbol,
    correlation_id: Option<Symbol>,
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
/// REACTION EVENT
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
/// REPORT EVENT
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
/// ROLE EVENT
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
/// BADGE EVENT
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
/// TESTS ( BOUNDARY TESTS )
/// ===========================================
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{Env, Symbol};

    fn make_symbol(env: &Env, len: u32) -> Symbol {
        let s = "a".repeat(len as usize);
        Symbol::new(env, &s)
    }

    #[test]
    fn reason_max_ok() {
        let env = Env::default();

        let meta = GovernanceMetadata {
            reason: make_symbol(&env, MAX_REASON_LENGTH),
            operation: make_symbol(&env, 10),
        };

        assert_eq!(validate_metadata(&env, &meta), Ok(()));
    }

    #[test]
    fn reason_over_limit_fails() {
        let env = Env::default();

        let meta = GovernanceMetadata {
            reason: make_symbol(&env, MAX_REASON_LENGTH + 1),
            operation: make_symbol(&env, 10),
        };

        assert_eq!(
            validate_metadata(&env, &meta),
            Err(GovernanceError::ReasonTooLong)
        );
    }

    #[test]
    fn operation_max_ok() {
        let env = Env::default();

        let meta = GovernanceMetadata {
            reason: make_symbol(&env, 10),
            operation: make_symbol(&env, MAX_OPERATION_LENGTH),
        };

        assert_eq!(validate_metadata(&env, &meta), Ok(()));
    }

    #[test]
    fn operation_over_limit_fails() {
        let env = Env::default();

        let meta = GovernanceMetadata {
            reason: make_symbol(&env, 10),
            operation: make_symbol(&env, MAX_OPERATION_LENGTH + 1),
        };

        assert_eq!(
            validate_metadata(&env, &meta),
            Err(GovernanceError::OperationTooLong)
        );
    }

        // --- NEW COMPATIBILITY TESTS ---

    #[test]
    fn decode_governance_event_supported_version_ok() {
        let env = Env::default();
        let current_version = GovernanceEvent::CURRENT_VERSION;
        let dummy_data = soroban_sdk::Bytes::new(&env); // In a real scenario, this would be actual serialized data

        let result = GovernanceEvent::try_decode_versioned(current_version, dummy_data.clone());
        assert!(result.is_ok());
        assert_eq!(result.unwrap().event_version, current_version);
    }

    #[test]
    fn decode_governance_event_unsupported_version_returns_error() {
        let env = Env::default();
        let unsupported_version = 999; // A version that is not EVENT_VERSION_V1
        let dummy_data = soroban_sdk::Bytes::new(&env);

        let result = GovernanceEvent::try_decode_versioned(unsupported_version, dummy_data.clone());
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), EventDecodeError::UnsupportedEventVersion(unsupported_version));
    }

    #[test]
    fn decode_confession_event_unsupported_version_returns_error() {
        let env = Env::default();
        let unsupported_version = 42;
        let dummy_data = soroban_sdk::Bytes::new(&env);

        let result = ConfessionEvent::try_decode_versioned(unsupported_version, dummy_data.clone());
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), EventDecodeError::UnsupportedEventVersion(unsupported_version));
    }

    // Add similar tests for ReactionEvent, ReportEvent, RoleEvent, and BadgeEvent
    // to ensure all event types handle unsupported versions gracefully.
    #[test]
    fn decode_reaction_event_unsupported_version_returns_error() {
        let env = Env::default();
        let unsupported_version = 123;
        let dummy_data = soroban_sdk::Bytes::new(&env);
        let result = ReactionEvent::try_decode_versioned(unsupported_version, dummy_data.clone());
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), EventDecodeError::UnsupportedEventVersion(unsupported_version));
    }

    #[test]
    fn decode_report_event_unsupported_version_returns_error() {
        let env = Env::default();
        let unsupported_version = 456;
        let dummy_data = soroban_sdk::Bytes::new(&env);
        let result = ReportEvent::try_decode_versioned(unsupported_version, dummy_data.clone());
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), EventDecodeError::UnsupportedEventVersion(unsupported_version));
    }

    #[test]
    fn decode_role_event_unsupported_version_returns_error() {
        let env = Env::default();
        let unsupported_version = 789;
        let dummy_data = soroban_sdk::Bytes::new(&env);
        let result = RoleEvent::try_decode_versioned(unsupported_version, dummy_data.clone());
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), EventDecodeError::UnsupportedEventVersion(unsupported_version));
    }

    #[test]
    fn decode_badge_event_unsupported_version_returns_error() {
        let env = Env::default();
        let unsupported_version = 1011;
        let dummy_data = soroban_sdk::Bytes::new(&env);
        let result = BadgeEvent::try_decode_versioned(unsupported_version, dummy_data.clone());
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), EventDecodeError::UnsupportedEventVersion(unsupported_version));
    }
}
