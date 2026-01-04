-- ========================================
-- SIMPLE FIX: Remove the check constraint
-- ========================================
-- Run this in Supabase SQL Editor to fix the error

-- This directly removes the problematic constraint
-- that's preventing you from saving multiple boundaries

ALTER TABLE public.company_info 
DROP CONSTRAINT company_info_consolidation_approach_check;

-- Done! Now you can save multiple organizational boundaries
