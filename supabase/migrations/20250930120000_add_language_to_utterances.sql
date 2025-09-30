-- Add language column to utterances
ALTER TABLE utterances
ADD COLUMN IF NOT EXISTS language TEXT;

-- Optional: index if querying by language becomes common
-- CREATE INDEX IF NOT EXISTS idx_utterances_language ON utterances(language);
