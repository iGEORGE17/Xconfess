use soroban_sdk::{contracttype, Env, Vec};

// #403: explicit bounds to keep storage/event payloads predictable.
pub const MAX_CONFESSION_CONTENT_LEN: u32 = 2048;

#[contracttype]
#[derive(Clone)]
pub struct Confession {
    pub id: u64,
    pub created_seq: u64,
    pub content: soroban_sdk::String,
}

#[contracttype]
#[derive(Clone)]
pub enum ConfessionKey {
    Counter,
    Registry(u64),         // id → Confession
    Index((u64, u64)),     // (created_seq, id) → id
}

pub fn create(env: &Env, content: soroban_sdk::String) -> u64 {
    if content.len() == 0 {
        panic!("confession content empty");
    }
    if content.len() > MAX_CONFESSION_CONTENT_LEN {
        panic!("confession content too long");
    }

    let mut id: u64 = env
        .storage()
        .instance()
        .get(&ConfessionKey::Counter)
        .unwrap_or(0);

    id += 1;
    let created_seq = env.ledger().sequence();

    let confession = Confession {
        id,
        created_seq,
        content,
    };

    env.storage()
        .instance()
        .set(&ConfessionKey::Registry(id), &confession);

    env.storage()
        .instance()
        .set(&ConfessionKey::Index((created_seq, id)), &id);

    env.storage()
        .instance()
        .set(&ConfessionKey::Counter, &id);

    id
}
