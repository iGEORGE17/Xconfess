use soroban_sdk::{contractimpl, symbol, Env, Symbol, Storage};
use crate::lib::{report_key, ERR_DUPLICATE_REPORT, ERR_COOLDOWN_ACTIVE};

pub struct ReportContract;

#[contractimpl]
impl ReportContract {
    // Cooldown window in seconds
    pub const COOLDOWN: u64 = 3600; // 1 hour

    // Submit a report
    pub fn submit_report(env: Env, actor: Symbol, confession_id: Symbol) -> Result<(), Symbol> {
        let storage = env.storage();
        let key = report_key(&actor, &confession_id);

        if let Some(last_timestamp) = storage.get::<_, u64>(&key) {
            let now = env.ledger().timestamp();
            if now - last_timestamp < Self::COOLDOWN {
                return Err(symbol!(ERR_COOLDOWN_ACTIVE));
            } else {
                return Err(symbol!(ERR_DUPLICATE_REPORT));
            }
        }

        // Save current timestamp for this actor-confession
        storage.set(&key, &env.ledger().timestamp());

        Ok(())
    }
}