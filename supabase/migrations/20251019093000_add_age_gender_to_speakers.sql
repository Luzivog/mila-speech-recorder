-- Add age and gender columns to speakers
ALTER TABLE public.speakers
  ADD COLUMN age SMALLINT,
  ADD COLUMN gender TEXT;

-- Populate existing rows with defaults
UPDATE public.speakers
SET age = 20
WHERE age IS NULL;

UPDATE public.speakers
SET gender = 'Male'
WHERE gender IS NULL;

-- Enforce constraints on new columns
ALTER TABLE public.speakers
  ALTER COLUMN age SET NOT NULL,
  ALTER COLUMN gender SET NOT NULL,
  ADD CONSTRAINT speakers_age_range CHECK (age BETWEEN 1 AND 120);
