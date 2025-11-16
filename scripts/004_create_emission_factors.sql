-- Create emission_factors table for standardized emission factors
CREATE TABLE IF NOT EXISTS emission_factors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL,
  category TEXT NOT NULL,
  scope INTEGER NOT NULL CHECK (scope IN (1, 2, 3)),
  unit TEXT NOT NULL,
  factor DECIMAL(10,6) NOT NULL,
  source TEXT,
  region TEXT DEFAULT 'Global',
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE emission_factors ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for emission_factors (readable by everyone since auth is optional)
CREATE POLICY "Anyone can view emission factors" ON emission_factors
  FOR SELECT USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_emission_factors_activity ON emission_factors(activity_type, category);
