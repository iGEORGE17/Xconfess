use soroban_sdk::{Env, String as SorobanString, symbol};
use xconfess_contract::report::ReportContract;

#[test]
fn test_report_deduplication() {
    let env = Env::default();

    let actor_a = symbol!("actor_a");
    let actor_b = symbol!("actor_b");
    let confession = symbol!("confession_1");

    // First report by A → success
    assert!(ReportContract::submit_report(env.clone(), actor_a.clone(), confession.clone()).is_ok());
    assert_eq!(
        ReportContract::latest_report_nonce(env.clone(), confession.clone()),
        1
    );

    // Duplicate report by A → fail
    let err = ReportContract::submit_report(env.clone(), actor_a.clone(), confession.clone());
    assert_eq!(err.unwrap_err().as_str(), "cooldown_active");
    assert_eq!(
        ReportContract::latest_report_nonce(env.clone(), confession.clone()),
        1
    );

    // Report by B → success
    assert!(ReportContract::submit_report(env.clone(), actor_b.clone(), confession.clone()).is_ok());
    assert_eq!(
        ReportContract::latest_report_nonce(env, confession),
        2
    );
}

#[test]
fn test_report_reason_boundary_exact_limit_succeeds() {
    let env = Env::default();
    let actor = symbol!("actor_a");
    let confession = symbol!("confession_2");

    let reason_text = "x".repeat(ReportContract::MAX_REPORT_REASON_LEN as usize);
    let reason = SorobanString::from_str(&env, &reason_text);

    let result = ReportContract::submit_report_with_reason(
        env.clone(),
        actor,
        confession.clone(),
        reason,
    );

    assert!(result.is_ok());
    assert_eq!(ReportContract::latest_report_nonce(env, confession), 1);
}

#[test]
fn test_report_reason_over_limit_rejected() {
    let env = Env::default();
    let actor = symbol!("actor_a");
    let confession = symbol!("confession_3");

    let reason_text = "x".repeat((ReportContract::MAX_REPORT_REASON_LEN + 1) as usize);
    let reason = SorobanString::from_str(&env, &reason_text);

    let result = ReportContract::submit_report_with_reason(
        env.clone(),
        actor,
        confession.clone(),
        reason,
    );

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().as_str(), "reason_too_long");
    assert_eq!(ReportContract::latest_report_nonce(env, confession), 0);
}
