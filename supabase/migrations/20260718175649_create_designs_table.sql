/*
# Create designs table (single-tenant, no auth)

1. Purpose
   Stores saved vehicle designs for the Engine & Vehicle Design Simulator.
   Each row holds the full editable VehicleDesign configuration (engine + vehicle)
   plus a snapshot of the computed SimResult at save time, so the load list can
   show headline stats without re-simulating.

2. New Tables
   - `designs`
     - `id` (uuid, primary key, auto-generated)
     - `name` (text, not null) — user-given design name
     - `description` (text, nullable) — optional notes
     - `config` (jsonb, not null) — full VehicleDesign config (engine + vehicle)
     - `snapshot` (jsonb, not null) — computed SimResult at save time
     - `created_at` (timestamptz, default now())
     - `updated_at` (timestamptz, default now())

3. Security
   - Enable RLS on `designs`.
   - This is a single-tenant app with NO sign-in screen, so the anon-key frontend
     must be able to read and write its own data. All four CRUD policies are
     scoped TO anon, authenticated with USING (true) / WITH CHECK (true) because
     the data is intentionally public/shared (no per-user isolation).
   - NEVER copy this pattern for a multi-user app — write real ownership checks.

4. Notes
   - `updated_at` is set by the application on every update; no trigger is added
     to keep the migration simple and idempotent.
   - The table is safe to re-run: CREATE TABLE IF NOT EXISTS and DROP POLICY IF
     EXISTS guard every statement.
*/

CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  config jsonb NOT NULL,
  snapshot jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_designs" ON designs;
CREATE POLICY "anon_select_designs" ON designs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_designs" ON designs;
CREATE POLICY "anon_insert_designs" ON designs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_designs" ON designs;
CREATE POLICY "anon_update_designs" ON designs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_designs" ON designs;
CREATE POLICY "anon_delete_designs" ON designs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS designs_updated_at_idx ON designs (updated_at DESC);
