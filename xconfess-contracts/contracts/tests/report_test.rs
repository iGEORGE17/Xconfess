use soroban_sdk::{Env, symbol};
use xconfess_contract::report::ReportContract;

#[test]
fn test_report_deduplication() {
    let env = Env::default();

    let actor_a = symbol!("actor_a");
    let actor_b = symbol!("actor_b");
    let confession = symbol!("confession_1");

    // First report by A → success
    assert!(ReportContract::submit_report(env.clone(), actor_a.clone(), confession.clone()).is_ok());

    // Duplicate report by A → fail
    let err = ReportContract::submit_report(env.clone(), actor_a.clone(), confession.clone());
    assert_eq!(err.unwrap_err().as_str(), "cooldown_active");

    // Report by B → success
    assert!(ReportContract::submit_report(env.clone(), actor_b.clone(), confession.clone()).is_ok());
}