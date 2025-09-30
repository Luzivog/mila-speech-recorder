-- Backfill existing rows with a placeholder to satisfy NOT NULL constraint
UPDATE utterances SET language = 'unknown' WHERE language IS NULL;

-- Add NOT NULL constraint on language
ALTER TABLE utterances
ALTER COLUMN language SET NOT NULL;
