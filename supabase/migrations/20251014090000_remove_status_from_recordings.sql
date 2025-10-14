-- Remove the status column from recordings and keep uniqueness per speaker/utterance
ALTER TABLE recordings DROP CONSTRAINT IF EXISTS recordings_speaker_id_utterance_id_status_key;

ALTER TABLE recordings DROP COLUMN IF EXISTS status;

ALTER TABLE recordings ADD CONSTRAINT recordings_speaker_id_utterance_id_key UNIQUE (speaker_id, utterance_id);
