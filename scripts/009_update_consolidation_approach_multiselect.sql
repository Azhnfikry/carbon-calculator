-- ==================================================
-- Update consolidation_approach to support multiple selections
-- ==================================================
-- This script updates the company_info table to allow multiple
-- organizational boundary selections via JSON array instead of
-- a single value with check constraint.

-- Drop the old check constraint
ALTER TABLE IF EXISTS public.company_info
DROP CONSTRAINT IF EXISTS company_info_consolidation_approach_check;

-- Update the column type to TEXT to store JSON array
-- (Supabase treats it as text but we'll store valid JSON)
-- The column already exists and is TEXT, so no ALTER needed

-- Add a comment explaining the new format
COMMENT ON COLUMN public.company_info.consolidation_approach IS 
'JSON array of selected boundary approaches. Example: ["equity", "financial", "operational"]';

-- Create a check constraint that allows any non-empty text (for JSON validation at app level)
ALTER TABLE public.company_info
ADD CONSTRAINT company_info_consolidation_approach_valid 
CHECK (consolidation_approach IS NULL OR consolidation_approach != '');
