-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emissions table for tracking carbon emissions
CREATE TABLE IF NOT EXISTS emissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  category TEXT NOT NULL,
  scope INTEGER NOT NULL CHECK (scope IN (1, 2, 3)),
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  emission_factor DECIMAL(10,6) NOT NULL,
  co2_equivalent DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_factors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for emissions
CREATE POLICY "Users can view own emissions" ON emissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emissions" ON emissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emissions" ON emissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emissions" ON emissions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for emission_factors (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view emission factors" ON emission_factors
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emissions_user_id ON emissions(user_id);
CREATE INDEX IF NOT EXISTS idx_emissions_date ON emissions(date);
CREATE INDEX IF NOT EXISTS idx_emissions_scope ON emissions(scope);
CREATE INDEX IF NOT EXISTS idx_emission_factors_activity ON emission_factors(activity_type, category);
