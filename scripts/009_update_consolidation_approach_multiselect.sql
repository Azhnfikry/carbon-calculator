-- ==================================================
-- Update consolidation_approach to support multiple selections
-- ==================================================
-- This script updates the company_info table to allow multiple
-- organizational boundary selections via JSON array instead of
-- a single value with check constraint.

-- IMPORTANT: Run these commands in your Supabase SQL Editor

-- Step 1: Drop the old restrictive check constraint
ALTER TABLE IF EXISTS public.company_info
DROP CONSTRAINT IF EXISTS company_info_consolidation_approach_check;

-- Step 2: Recreate the table WITHOUT the restrictive check constraint
-- This is the safest way to remove it completely

-- First, backup data if needed:
-- SELECT * INTO company_info_backup FROM public.company_info;

-- Create new table structure
CREATE TABLE IF NOT EXISTS public.company_info_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  company_description TEXT DEFAULT '',
  consolidation_approach TEXT DEFAULT '[]',
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

-- Copy data from old table to new table
INSERT INTO public.company_info_new 
SELECT 
  id,
  user_id,
  company_name,
  company_description,
  CASE 
    WHEN consolidation_approach = 'equity-share' THEN '["equity"]'
    WHEN consolidation_approach = 'operational-control' THEN '["operational"]'
    WHEN consolidation_approach = 'financial-control' THEN '["financial"]'
    ELSE '[]'
  END as consolidation_approach,
  business_description,
  reporting_period,
  scope3_activities,
  excluded_activities,
  base_year,
  base_year_rationale,
  base_year_recalculation_policy,
  created_at,
  updated_at
FROM public.company_info ON CONFLICT DO NOTHING;

-- Drop old table
DROP TABLE IF EXISTS public.company_info CASCADE;

-- Rename new table to original name
ALTER TABLE public.company_info_new RENAME TO company_info;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_company_info_user_id ON public.company_info(user_id);
CREATE INDEX IF NOT EXISTS idx_company_info_created_at ON public.company_info(created_at DESC);

-- Enable RLS
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view their own company info" ON public.company_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company info" ON public.company_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company info" ON public.company_info
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company info" ON public.company_info
  FOR DELETE USING (auth.uid() = user_id);

-- Recreate trigger
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

-- Add comment
COMMENT ON COLUMN public.company_info.consolidation_approach IS 
'JSON array of selected boundary approaches. Example: ["equity", "financial", "operational"]';
