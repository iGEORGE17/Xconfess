use super::actions::Action;

#[derive(Clone, Debug)]
pub struct Lcg {
    state: u64,
}

impl Lcg {
    pub fn new(seed: u64) -> Self {
        Self { state: seed }
    }

    fn next_u32(&mut self) -> u32 {
        // Deterministic LCG; stable across platforms.
        self.state = self
            .state
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1);
        (self.state >> 32) as u32
    }

    fn bounded(&mut self, max_exclusive: u32) -> u32 {
        if max_exclusive == 0 {
            0
        } else {
            self.next_u32() % max_exclusive
        }
    }
}

pub fn generate_actions(seed: u64, steps: usize) -> Vec<Action> {
    let mut rng = Lcg::new(seed);
    let mut actions = Vec::with_capacity(steps);
    let mut max_conf_id_seen = 0_u32;

    for _ in 0..steps {
        let pick = rng.bounded(4);
        let actor = rng.bounded(6);
        let confession_id = rng.bounded(max_conf_id_seen.saturating_add(3));

        let action = match pick {
            0 => {
                max_conf_id_seen = max_conf_id_seen.saturating_add(1);
                Action::Create { actor }
            }
            1 => Action::React {
                actor,
                confession_id,
            },
            2 => Action::Report {
                actor,
                confession_id,
                reason_len: rng.bounded(160),
            },
            _ => Action::Resolve {
                admin: rng.bounded(3),
                confession_id,
            },
        };

        actions.push(action);
    }

    actions
}
