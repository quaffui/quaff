use std::time::Duration;

/// Delay between attempts to acquire a lock held by another docgen process.
pub(super) const LOCK_POLL_INTERVAL: Duration = Duration::from_millis(50);
/// Maximum time to wait for another generation run to release its lock.
pub(super) const LOCK_WAIT_TIMEOUT: Duration = Duration::from_secs(10 * 60);
