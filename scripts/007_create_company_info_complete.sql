-- ==================================================
-- Company Info Table Setup for Carbon Calculator
-- ==================================================
-- This script creates the company_info table for storing
-- ESG reporting and descriptive company information.
-- 
-- Run this in your Supabase SQL Editor to create the table.

-- Drop existing table if needed (comment out if not wanted)
-- DROP TABLE IF EXISTS public.company_info CASCADE;

-- Create company_info table
CREATE TABLE IF NOT EXISTS public.company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  company_description TEXT DEFAULT '',
  consolidation_approach TEXT DEFAULT 'equity-share' CHECK (consolidation_approach IN ('equity-share', 'operational-control', 'financial-control')),
  business_description TEXT DEFAULT '',
  reporting_period TEXT DEFAULT '',
  scope3_activities TEXT DEFAULT '',
  excluded_activities TEXT DEFAULT '',
  base_year INTEGER DEFAULT 2024,
  base_year_rationale TEXT DEFAULT '',
  base_year_recalculation_policy TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_info_user_id ON public.company_info(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_company_info_created_at ON public.company_info(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can insert their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can update their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can delete their own company info" ON public.company_info;

-- Create RLS policies
CREATE POLICY "Users can view their own company info" ON public.company_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company info" ON public.company_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company info" ON public.company_info
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company info" ON public.company_info
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_info_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS company_info_updated_at ON public.company_info;

CREATE TRIGGER company_info_updated_at
  BEFORE UPDATE ON public.company_info
  FOR EACH ROW
  EXECUTE FUNCTION update_company_info_timestamp();

-- Verify table creation
SELECT 'Company Info table created successfully!' AS message;
