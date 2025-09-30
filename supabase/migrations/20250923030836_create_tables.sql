-- Create speakers table
CREATE TABLE speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    display_name TEXT NOT NULL,
    locale_hint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(device_id, display_name)
);

-- Create utterances table
CREATE TABLE utterances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    speaker_id UUID NOT NULL REFERENCES speakers(id),
    idx INTEGER NOT NULL,
    text TEXT NOT NULL,
    source_batch_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on utterances for performance
CREATE INDEX idx_utterances_speaker_idx ON utterances(speaker_id, idx);

-- Create recordings table
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    speaker_id UUID NOT NULL REFERENCES speakers(id),
    utterance_id UUID NOT NULL REFERENCES utterances(id),
    duration_sec REAL NOT NULL CHECK (duration_sec >= 0),
    status TEXT NOT NULL CHECK (status IN ('recorded', 'validated')),
    storage_key TEXT NOT NULL,
    ext TEXT NOT NULL DEFAULT 'm4a',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(speaker_id, utterance_id, status) -- Ensures only one validated per speaker-utterance
);

-- Create index on recordings for performance
CREATE INDEX idx_recordings_utterance_id ON recordings(utterance_id);

-- Enable RLS
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE utterances ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on speakers" ON speakers FOR ALL USING (true);
CREATE POLICY "Allow all operations on utterances" ON utterances FOR ALL USING (true);
CREATE POLICY "Allow all operations on recordings" ON recordings FOR ALL USING (true);