use std::sync::atomic::AtomicU64;

/// Disambiguates fixtures created within the same clock tick and process.
pub(super) static NEXT_FIXTURE: AtomicU64 = AtomicU64::new(0);
