-- ==================================================
-- GHG Protocol Template Fields Migration
-- ==================================================
-- This script adds missing fields to the company_info table
-- to support the complete GHG Protocol Emissions Inventory template.
-- 
-- Run this in your Supabase SQL Editor to add the fields.

-- Add GHG Protocol verification fields
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS third_party_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_date DATE,
ADD COLUMN IF NOT EXISTS verifier_name TEXT,
ADD COLUMN IF NOT EXISTS verifier_email TEXT,
ADD COLUMN IF NOT EXISTS verifier_phone TEXT,
ADD COLUMN IF NOT EXISTS verifier_address TEXT;

-- Add exclusions documentation
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS has_exclusions BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS exclusions_description TEXT;

-- Add reporting period details
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS reporting_period_from DATE,
ADD COLUMN IF NOT EXISTS reporting_period_to DATE;

-- Add organizational boundaries consolidation approaches (multiple selection support)
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS consolidation_equity_share BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consolidation_financial_control BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consolidation_operational_control BOOLEAN DEFAULT FALSE;

-- Add organizational boundaries details
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS organizational_boundaries_description TEXT;

-- Add operational boundaries (Scope 3 details)
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS scope3_included BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scope3_activity_details TEXT;

-- Add base year emissions data (by gas and scope)
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS base_year_scope1_mtco2e NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope1_co2 NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope1_ch4 NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope1_n2o NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope1_hfcs NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope1_pfcs NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope1_sf6 NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope2_mtco2e NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope2_co2 NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope2_ch4 NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope2_n2o NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope2_hfcs NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope2_pfcs NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope2_sf6 NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope3_mtco2e NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope3_co2 NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope3_ch4 NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope3_n2o NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope3_hfcs NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope3_pfcs NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS base_year_scope3_sf6 NUMERIC(15,2);

-- Add biogenic CO2 reporting
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS biogenic_co2_mtco2 NUMERIC(15,2);

-- Add methodologies and emission factors documentation
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS methodologies_description TEXT,
ADD COLUMN IF NOT EXISTS emission_factors_reference TEXT,
ADD COLUMN IF NOT EXISTS calculation_tools_used TEXT;

-- Add emissions by source types documentation (Scope 1 categories)
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS scope1_stationary_combustion_description TEXT,
ADD COLUMN IF NOT EXISTS scope1_mobile_combustion_description TEXT,
ADD COLUMN IF NOT EXISTS scope1_process_sources_description TEXT,
ADD COLUMN IF NOT EXISTS scope1_fugitive_sources_description TEXT,
ADD COLUMN IF NOT EXISTS scope1_agricultural_sources_description TEXT;

-- Add emissions by source types documentation (Scope 2 categories)
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS scope2_purchased_electricity_description TEXT,
ADD COLUMN IF NOT EXISTS scope2_purchased_steam_description TEXT,
ADD COLUMN IF NOT EXISTS scope2_purchased_heating_description TEXT,
ADD COLUMN IF NOT EXISTS scope2_purchased_cooling_description TEXT;

-- Add facility-level emissions tracking
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS facilities_scope1_breakdown JSONB,
ADD COLUMN IF NOT EXISTS emissions_by_country JSONB;

-- Add emissions management and verification info
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS ghg_management_programs TEXT,
ADD COLUMN IF NOT EXISTS emissions_changes_context TEXT,
ADD COLUMN IF NOT EXISTS inventory_quality_notes TEXT,
ADD COLUMN IF NOT EXISTS performance_indicators TEXT,
ADD COLUMN IF NOT EXISTS external_assurance_outline TEXT;

-- Add offset information storage
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS offsets_purchased JSONB,
ADD COLUMN IF NOT EXISTS offsets_sold JSONB;

-- Add organizational diagram/parent company info
ALTER TABLE IF EXISTS public.company_info
ADD COLUMN IF NOT EXISTS parent_company_name TEXT,
ADD COLUMN IF NOT EXISTS parent_reports_emissions BOOLEAN,
ADD COLUMN IF NOT EXISTS organizational_diagram_url TEXT;

-- Verify migration completed
SELECT 'GHG Protocol fields migration completed successfully!' AS message;

-- Show all company_info columns for verification
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'company_info' 
ORDER BY ordinal_position;
