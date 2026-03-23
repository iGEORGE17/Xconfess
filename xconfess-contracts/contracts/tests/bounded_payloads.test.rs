use soroban_sdk::{Env, String as SorobanString};
use xconfess_contract::pagination::confession::{create, MAX_CONFESSION_CONTENT_LEN};

#[test]
fn confession_content_exact_limit_succeeds() {
    let env = Env::default();
    let content = SorobanString::from_str(
        &env,
        &"a".repeat(MAX_CONFESSION_CONTENT_LEN as usize),
    );

    let id = create(&env, content);
    assert_eq!(id, 1);
}

#[test]
#[should_panic(expected = "confession content too long")]
fn confession_content_limit_plus_one_rejected() {
    let env = Env::default();
    let content = SorobanString::from_str(
        &env,
        &"a".repeat((MAX_CONFESSION_CONTENT_LEN + 1) as usize),
    );

    let _ = create(&env, content);
}
