/*
# Make image_url nullable on competitors
# We are adding 1000+ cars; only the original 7 have verified Pexels photos.
# Generated cars get NULL image_url and the UI renders a brand-colored placeholder.
*/
ALTER TABLE competitors ALTER COLUMN image_url DROP NOT NULL;
