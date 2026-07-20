/*
# Correct competitor lap times to verified figures only

1. Context
- The initial seed inserted placeholder lap times for several cars that do not
  have official/verified times on those circuits. This corrects them so the
  Competitors page only shows real, published lap times.

2. Changes
- Nürburgring Nordschleife (nurburgring_lap), in seconds:
  - Lamborghini Aventador SVJ: 6:44.97 = 404.97s (official, 2018)
  - Porsche 911 GT3 RS (992): 6:49.328 = 409.328s (official, 2023)
  - Koenigsegg Jesko Absolut: NULL (no official Nordschleife time)
  - Bugatti Chiron Super Sport: NULL (no official Nordschleife time)
  - Ferrari SF90 Stradale: NULL (no official Nordschleife time)
  - McLaren Senna: NULL (no official Nordschleife time)
  - Rimac Nevera: NULL (no official Nordschleife time)
- Laguna Seca (laguna_seca_lap): set to NULL for all (no reliably verified
  matching times for this exact set of cars).
- Top Gear track (top_gear_track_lap): set to NULL for all (unverified).

3. Notes
- Idempotent: UPDATE statements match by company+model, safe to re-run.
- No schema changes.
*/

UPDATE competitors SET nurburgring_lap = 404.97
  WHERE company = 'Lamborghini' AND model = 'Aventador SVJ';
UPDATE competitors SET nurburgring_lap = 409.328
  WHERE company = 'Porsche' AND model = '911 GT3 RS (992)';
UPDATE competitors SET nurburgring_lap = NULL
  WHERE company IN ('Koenigsegg','Bugatti','Ferrari','McLaren','Rimac');
UPDATE competitors SET laguna_seca_lap = NULL;
UPDATE competitors SET top_gear_track_lap = NULL;
