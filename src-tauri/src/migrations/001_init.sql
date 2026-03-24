-- Lists (e.g. Inbox, Work, Personal)
CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT NOT NULL DEFAULT 'inbox',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'this_week', 'today', 'done')),
  estimated_minutes INTEGER,
  actual_minutes INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  recurrence_rule TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Focus sessions / time log
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_minutes INTEGER,
  session_type TEXT NOT NULL DEFAULT 'focus' CHECK (session_type IN ('focus', 'break')),
  notes TEXT
);

-- App settings (key/value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6B7280'
);

-- Task <-> Tag join
CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('theme', 'dark'),
  ('pomodoro_focus_minutes', '25'),
  ('pomodoro_short_break_minutes', '5'),
  ('pomodoro_long_break_minutes', '15'),
  ('pomodoro_cycles_before_long_break', '4'),
  ('week_start', '1'),
  ('notifications_enabled', 'true');

-- Default Inbox list
INSERT OR IGNORE INTO lists (id, name, color, icon, position)
VALUES ('inbox-default', 'Inbox', '#F97316', 'inbox', 0);
