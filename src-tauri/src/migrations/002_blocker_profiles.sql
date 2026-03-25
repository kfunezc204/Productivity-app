CREATE TABLE IF NOT EXISTS blocker_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blocker_domains (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES blocker_profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('locker_during_breaks', 'false');
