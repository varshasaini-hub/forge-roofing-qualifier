-- Create leads table
CREATE TABLE leads (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name            TEXT,
  email                TEXT,
  phone                TEXT,
  service_type         TEXT,
  roof_size            TEXT,
  urgency              TEXT,
  roof_condition       TEXT,
  insurance_status     TEXT,
  estimated_quote_low  NUMERIC,
  estimated_quote_high NUMERIC
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (form submissions); reads are blocked by default
CREATE POLICY "Allow public inserts"
  ON leads
  FOR INSERT
  TO public
  WITH CHECK (true);
