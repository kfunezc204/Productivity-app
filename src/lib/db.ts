import Database from "@tauri-apps/plugin-sql";

// Promise singleton — prevents race condition when multiple callers hit getDb()
// before the first Database.load() completes (e.g. React StrictMode double-invoke).
let _dbPromise: Promise<Database> | null = null;

export function getDb(): Promise<Database> {
  if (!_dbPromise) {
    _dbPromise = Database.load("sqlite:blitzdesk.db");
  }
  return _dbPromise;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<Array<{ value: string }>>(
    "SELECT value FROM settings WHERE key = $1",
    [key]
  );
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2",
    [key, value]
  );
}

// ─── Internal row types (snake_case from SQLite) ─────────────────────────────

type ListRow = {
  id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type TaskRow = {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  status: string;
  estimated_minutes: number | null;
  actual_minutes: number;
  position: number;
  due_date: string | null;
  recurrence_rule: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

// ─── List helpers ─────────────────────────────────────────────────────────────

import type { List } from "@/stores/listStore";

function rowToList(row: ListRow): List {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllLists(): Promise<List[]> {
  const db = await getDb();
  const rows = await db.select<ListRow[]>(
    "SELECT * FROM lists ORDER BY position ASC"
  );
  return rows.map(rowToList);
}

export async function createList(
  id: string,
  name: string,
  color: string,
  icon: string,
  position: number
): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO lists (id, name, color, icon, position) VALUES ($1, $2, $3, $4, $5)",
    [id, name, color, icon, position]
  );
}

export async function updateList(
  id: string,
  fields: Partial<{ name: string; color: string; icon: string; position: number }>
): Promise<void> {
  const db = await getDb();
  const parts: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (fields.name !== undefined) { parts.push(`name = $${i++}`); values.push(fields.name); }
  if (fields.color !== undefined) { parts.push(`color = $${i++}`); values.push(fields.color); }
  if (fields.icon !== undefined) { parts.push(`icon = $${i++}`); values.push(fields.icon); }
  if (fields.position !== undefined) { parts.push(`position = $${i++}`); values.push(fields.position); }
  if (parts.length === 0) return;
  parts.push(`updated_at = datetime('now')`);
  values.push(id);
  await db.execute(
    `UPDATE lists SET ${parts.join(", ")} WHERE id = $${i}`,
    values
  );
}

export async function deleteList(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM lists WHERE id = $1", [id]);
}

export async function reorderLists(
  updates: Array<{ id: string; position: number }>
): Promise<void> {
  const db = await getDb();
  for (const u of updates) {
    await db.execute(
      "UPDATE lists SET position = $1, updated_at = datetime('now') WHERE id = $2",
      [u.position, u.id]
    );
  }
}

// ─── Task helpers ─────────────────────────────────────────────────────────────

import type { Task } from "@/stores/taskStore";

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    listId: row.list_id,
    title: row.title,
    description: row.description,
    status: row.status as Task["status"],
    estimatedMinutes: row.estimated_minutes,
    actualMinutes: row.actual_minutes,
    position: row.position,
    dueDate: row.due_date,
    recurrenceRule: row.recurrence_rule,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.select<TaskRow[]>(
    "SELECT * FROM tasks WHERE status != 'done' ORDER BY position ASC"
  );
  return rows.map(rowToTask);
}

export async function getDoneTasks(limit = 50): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.select<TaskRow[]>(
    "SELECT * FROM tasks WHERE status = 'done' ORDER BY completed_at DESC LIMIT $1",
    [limit]
  );
  return rows.map(rowToTask);
}

export async function createTask(
  id: string,
  listId: string,
  title: string,
  status: string,
  position: number,
  estimatedMinutes?: number | null
): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO tasks (id, list_id, title, status, position, estimated_minutes) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, listId, title, status, position, estimatedMinutes ?? null]
  );
}

export async function updateTask(
  id: string,
  fields: Partial<{
    title: string;
    description: string | null;
    status: string;
    estimatedMinutes: number | null;
    actualMinutes: number;
    position: number;
    dueDate: string | null;
    recurrenceRule: string | null;
    listId: string;
  }>
): Promise<void> {
  const db = await getDb();
  const parts: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (fields.title !== undefined) { parts.push(`title = $${i++}`); values.push(fields.title); }
  if (fields.description !== undefined) { parts.push(`description = $${i++}`); values.push(fields.description); }
  if (fields.status !== undefined) { parts.push(`status = $${i++}`); values.push(fields.status); }
  if (fields.estimatedMinutes !== undefined) { parts.push(`estimated_minutes = $${i++}`); values.push(fields.estimatedMinutes); }
  if (fields.actualMinutes !== undefined) { parts.push(`actual_minutes = $${i++}`); values.push(fields.actualMinutes); }
  if (fields.position !== undefined) { parts.push(`position = $${i++}`); values.push(fields.position); }
  if (fields.dueDate !== undefined) { parts.push(`due_date = $${i++}`); values.push(fields.dueDate); }
  if (fields.recurrenceRule !== undefined) { parts.push(`recurrence_rule = $${i++}`); values.push(fields.recurrenceRule); }
  if (fields.listId !== undefined) { parts.push(`list_id = $${i++}`); values.push(fields.listId); }
  if (parts.length === 0) return;
  parts.push(`updated_at = datetime('now')`);
  values.push(id);
  await db.execute(
    `UPDATE tasks SET ${parts.join(", ")} WHERE id = $${i}`,
    values
  );
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function completeTask(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE tasks SET status = 'done', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = $1",
    [id]
  );
}

export async function uncompleteTask(
  id: string,
  restoreStatus: string
): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE tasks SET status = $1, completed_at = NULL, updated_at = datetime('now') WHERE id = $2",
    [restoreStatus, id]
  );
}

export async function getMaxPosition(status: string): Promise<number> {
  const db = await getDb();
  const rows = await db.select<Array<{ max_pos: number | null }>>(
    "SELECT COALESCE(MAX(position), -1) as max_pos FROM tasks WHERE status = $1",
    [status]
  );
  return rows[0]?.max_pos ?? -1;
}

export async function reorderTasks(
  updates: Array<{ id: string; position: number; status?: string }>
): Promise<void> {
  const db = await getDb();
  for (const u of updates) {
    if (u.status !== undefined) {
      await db.execute(
        "UPDATE tasks SET position = $1, status = $2, updated_at = datetime('now') WHERE id = $3",
        [u.position, u.status, u.id]
      );
    } else {
      await db.execute(
        "UPDATE tasks SET position = $1, updated_at = datetime('now') WHERE id = $2",
        [u.position, u.id]
      );
    }
  }
}
