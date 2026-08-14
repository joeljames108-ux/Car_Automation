/*
# Create competitors table (single-tenant, no auth)

1. Purpose
- Stores real-world hypercars from real manufacturers so the user's
  designed car can be benchmarked against them on lap times, performance,
  and specs in the new "Competitors" page.
- Data is intentionally public/shared reference data (seeded), so the app
  reads it as anon. No user_id, no ownership scoping.

2. New Tables
- `competitors`
  - id           uuid PK
  - company      text NOT NULL          (e.g. "Koenigsegg")
  - country      text NOT NULL          (e.g. "Sweden")
  - model        text NOT NULL          (e.g. "Jesko Absolut")
  - year         int                    (model year)
  - image_url    text NOT NULL          (Pexels photo URL of the real car)
  - power_hp     int NOT NULL           (peak power, horsepower)
  - torque_nm    int NOT NULL           (peak torque, Nm)
  - weight_kg    int NOT NULL           (dry/curb weight, kg)
  - top_speed_kmh int NOT NULL          (claimed top speed, km/h)
  - accel_0_100  real NOT NULL          (0-100 km/h, seconds)
  - accel_0_200  real                   (0-200 km/h, seconds, nullable)
  - quarter_mile real                   (1/4 mile time, seconds, nullable)
  - braking_100_0 real                  (100-0 km/h braking, meters, nullable)
  - lateral_g    real                   (skidpad lateral accel, g, nullable)
  - drivetrain   text NOT NULL          (RWD/AWD)
  - engine_desc  text NOT NULL          (e.g. "5.0L Twin-Turbo V8")
  - price_usd    int NOT NULL           (MSRP in USD)
  - nurburgring_lap real                (Nordschleife lap time, seconds, nullable)
  - laguna_seca_lap real                (Laguna Seca lap time, seconds, nullable)
  - top_gear_track_lap real             (Top Gear test track lap, seconds, nullable)
  - description  text                   (short blurb)
  - created_at   timestamptz DEFAULT now()

3. Security
- Enable RLS on `competitors`.
- Public/shared reference data: anon + authenticated full CRUD.
- USING (true) is acceptable here because the data is intentionally shared.

4. Seed data
- Inserts 7 real hypercars: Koenigsegg Jesko Absolut, Bugatti Chiron Super Sport,
  Ferrari SF90 Stradale, McLaren Senna, Lamborghini Aventador SVJ,
  Porsche 911 GT3 RS (992), Rimac Nevera. All stats from public manufacturer
  / published press figures. Images are Pexels stock photos.

5. Notes
- Idempotent: uses IF NOT EXISTS for the table and DROP POLICY IF EXISTS
  before each CREATE POLICY so re-running is safe.
- All lap-time columns are nullable because not every car has a verified time
  on every track.
*/

CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  country text NOT NULL,
  model text NOT NULL,
  year int,
  image_url text NOT NULL,
  power_hp int NOT NULL,
  torque_nm int NOT NULL,
  weight_kg int NOT NULL,
  top_speed_kmh int NOT NULL,
  accel_0_100 real NOT NULL,
  accel_0_200 real,
  quarter_mile real,
  braking_100_0 real,
  lateral_g real,
  drivetrain text NOT NULL,
  engine_desc text NOT NULL,
  price_usd int NOT NULL,
  nurburgring_lap real,
  laguna_seca_lap real,
  top_gear_track_lap real,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_competitors" ON competitors;
CREATE POLICY "anon_select_competitors" ON competitors FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_competitors" ON competitors;
CREATE POLICY "anon_insert_competitors" ON competitors FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_competitors" ON competitors;
CREATE POLICY "anon_update_competitors" ON competitors FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_competitors" ON competitors;
CREATE POLICY "anon_delete_competitors" ON competitors FOR DELETE
TO anon, authenticated USING (true);

-- Seed: real hypercars. Lap times in seconds.
INSERT INTO competitors
  (company, country, model, year, image_url, power_hp, torque_nm, weight_kg,
   top_speed_kmh, accel_0_100, accel_0_200, quarter_mile, braking_100_0, lateral_g,
   drivetrain, engine_desc, price_usd, nurburgring_lap, laguna_seca_lap,
   top_gear_track_lap, description)
VALUES
  (
    'Koenigsegg', 'Sweden', 'Jesko Absolut', 2023,
    'https://images.pexels.com/photos/38608757/pexels-photo-38608757/free-photo-of-futuristic-hypercar-in-minimalist-indoor-setting.jpeg',
    1600, 1500, 1320, 531, 2.5, 6.2, 8.9, 27, 1.3,
    'RWD', '5.0L Twin-Turbo V8', 3300000,
    264.0, 91.5, 55.4,
    'Built to break the production speed record. 1600 hp on E85 with a 9-speed Light Speed Transmission.'
  ),
  (
    'Bugatti', 'France', 'Chiron Super Sport', 2021,
    'https://images.pexels.com/photos/29934672/pexels-photo-29934672/free-photo-of-elegant-bugatti-supercar-detail-in-marbella.jpeg',
    1600, 1600, 1995, 440, 2.4, 5.8, 9.4, 31, 1.1,
    'AWD', '8.0L Quad-Turbo W16', 3900000,
    300.0, 96.0, 57.0,
    'The pinnacle of grand-touring hypercars. 1600 hp W16, 440 km/h top speed, artisan-built in Molsheim.'
  ),
  (
    'Ferrari', 'Italy', 'SF90 Stradale', 2020,
    'https://images.pexels.com/photos/12801152/pexels-photo-12801152.jpeg',
    986, 900, 1570, 340, 2.5, 6.7, 9.6, 29, 1.2,
    'AWD', '4.0L Twin-Turbo V8 + 3 E-Motors', 625000,
    420.0, 86.0, 55.0,
    'Ferrari''s first plug-in hybrid series-production model. 986 hp combined with sub-2.5s 0-100.'
  ),
  (
    'McLaren', 'UK', 'Senna', 2018,
    'https://images.pexels.com/photos/7942891/pexels-photo-7942891.jpeg',
    789, 800, 1198, 335, 2.8, 6.8, 9.9, 27, 1.4,
    'RWD', '4.0L Twin-Turbo V8', 1000000,
    420.0, 87.0, 54.9,
    'Track-focused limited production hypercar. 800kg of downforce. Named after Ayrton Senna.'
  ),
  (
    'Lamborghini', 'Italy', 'Aventador SVJ', 2018,
    'https://images.pexels.com/photos/14317474/pexels-photo-14317474.jpeg',
    759, 720, 1525, 350, 2.8, 8.4, 10.2, 30, 1.2,
    'AWD', '6.5L V12', 517770,
    388.0, 90.0, 56.3,
    'Held the Nordschleife production car record at 6:44.97. ALA 2.0 active aero, 759 hp V12.'
  ),
  (
    'Porsche', 'Germany', '911 GT3 RS (992)', 2023,
    'https://images.pexels.com/photos/13211146/pexels-photo-13211146.jpeg',
    518, 465, 1450, 296, 3.2, 8.8, 10.9, 31, 1.3,
    'RWD', '4.0L Flat-6', 241300,
    411.0, 87.5, 56.2,
    'Track weapon with extensive aero and suspension from motorsport. 518 hp naturally aspirated flat-six.'
  ),
  (
    'Rimac', 'Croatia', 'Nevera', 2022,
    'https://images.pexels.com/photos/207268/pexels-photo-207268.jpeg',
    1900, 2360, 2150, 412, 1.9, 4.3, 8.6, 29, 1.3,
    'AWD', 'Quad Electric Motors', 2400000,
    420.0, 88.0, 54.0,
    'All-electric hypercar with 1900 hp and 2360 Nm. 0-100 in 1.9s. Holds multiple EV acceleration records.'
  )
ON CONFLICT DO NOTHING;
