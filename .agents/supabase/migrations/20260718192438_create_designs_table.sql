/*
# Create designs table for Apex Engineer

1. New Tables
- `designs` — stores vehicle designs created in the Apex Engineer simulator
- `id` (uuid, primary key)
- `name` (text, not null) — user-given design name
- `description` (text) — optional description
- `design` (jsonb, not null) — full VehicleDesign config including engine, vehicle, aero, interior
- `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `designs`.
- Single-tenant app (no sign-in) — allow anon + authenticated full CRUD because designs are intentionally shared/public.
- 4 separate policies for SELECT, INSERT, UPDATE, DELETE using `USING (true)` / `WITH CHECK (true)`.
*/

CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  design jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
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
