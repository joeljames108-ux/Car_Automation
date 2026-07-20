/*
# Create rd_state table for R&D Center persistence

1. New Tables
- `rd_state` — stores the player's R&D division state (single row, single-tenant)
- `id` (int, primary key, always 1) — singleton row
- `state` (jsonb, not null) — full RDState object: cash, EK, innovation score,
  buildings (10 labs with levels 1-10), technologies (70+ tech tree nodes),
  research projects, skunkworks projects, patents, engineers, budget allocation,
  monthly revenue, and an event log.
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

2. Security
- Enable RLS on `rd_state`.
- Single-tenant app (no sign-in) — allow anon + authenticated full CRUD because
  the R&D state is intentionally shared/public, matching the existing `designs` table.
- 4 separate policies for SELECT, INSERT, UPDATE, DELETE using `USING (true)` / `WITH CHECK (true)`.

3. Notes
- Only one row is ever needed (the player's R&D division). The RDContext loads
  the singleton row with id=1 and upserts on every save.
- The jsonb column holds the entire RDState so the schema never needs to change
  when new R&D features are added — the TypeScript types are the source of truth.
*/

CREATE TABLE IF NOT EXISTS rd_state (
  id int PRIMARY KEY DEFAULT 1,
  state jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

ALTER TABLE rd_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_rd_state" ON rd_state;
CREATE POLICY "anon_select_rd_state" ON rd_state FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rd_state" ON rd_state;
CREATE POLICY "anon_insert_rd_state" ON rd_state FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rd_state" ON rd_state;
CREATE POLICY "anon_update_rd_state" ON rd_state FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_rd_state" ON rd_state;
CREATE POLICY "anon_delete_rd_state" ON rd_state FOR DELETE
  TO anon, authenticated USING (true);
