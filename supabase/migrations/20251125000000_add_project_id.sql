-- Create projects table to store valid project IDs
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial project 'mila'
INSERT INTO projects (id) VALUES ('mila');

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow read access to projects for validation
CREATE POLICY "Allow read access on projects" ON projects FOR SELECT USING (true);

-- Add project_id column to speakers (nullable first for migration)
ALTER TABLE speakers ADD COLUMN project_id TEXT;

-- Update all existing speakers to have project_id 'mila'
UPDATE speakers SET project_id = 'mila' WHERE project_id IS NULL;

-- Now enforce NOT NULL constraint
ALTER TABLE speakers ALTER COLUMN project_id SET NOT NULL;

-- Add foreign key constraint to ensure project_id is valid
ALTER TABLE speakers ADD CONSTRAINT speakers_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id);

