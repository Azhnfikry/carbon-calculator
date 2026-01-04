# GHG Protocol Implementation Guide

## Overview
Your Carbon Calculator MVP now includes comprehensive support for the **GHG Protocol Emissions Inventory Template**. This guide explains what has been implemented and what remaining steps are needed.

## ✅ Completed

### 1. Enhanced Report Generation API
**File**: `app/api/generate-report/route.ts`

The report generation endpoint now includes:

#### Utility Functions
- `asNumber()` - Safe number conversion with null handling
- `toMtCO2e()` - Converts kg CO2 to metric tons CO2e
- `round2()` - Rounds to 2 decimal places
- `normalizeScopeNumber()` - Handles "Scope 1", "1", "scope 1" formats

#### Report Sections (All GHG Protocol Compliant)
1. **Report Metadata** - Generated timestamp, report type, contact info
2. **Company Information** - Name, description, business details
3. **Verification** - Third-party verification details, verifier contact info
4. **Exclusions** - Documentation of excluded facilities/operations
5. **Reporting Period** - From/to dates
6. **Organizational Boundaries** - Consolidation approaches (equity share, financial control, operational control)
7. **Operational Boundaries** - Scope 3 activity types and inclusion flag
8. **Emissions Data** - Current year emissions by scope (1, 2, 3) with gas breakdowns:
   - mtCO2e (total)
   - CO2 (metric tons)
   - CH4 (metric tons)
   - N2O (metric tons)
   - HFCs (metric tons)
   - PFCs (metric tons)
   - SF6 (metric tons)
9. **Base Year Data** - Base year emissions with recalculation policy
10. **Methodologies** - Calculation methodologies and emission factors used
11. **Emissions by Source** - Detailed breakdown by source types
    - Scope 1: stationary combustion, mobile combustion, process, fugitive, agricultural
    - Scope 2: purchased electricity, steam, heating, cooling
12. **Facility & Geographic Breakdowns** - Optional facility-level and country-level data
13. **GHG Management** - Management programs, emissions changes context, inventory quality notes
14. **Organizational Structure** - Optional parent company info
15. **Offsets Information** - Purchased and sold offsets tracking
16. **Line Items** - Detailed emissions entries with full calculations

### 2. Database Migration Script
**File**: `scripts/008_ghg_protocol_fields.sql`

This migration adds **60+ new columns** to the `company_info` table to support all GHG Protocol template fields:

#### Verification Fields (6 columns)
- `third_party_verified` (boolean)
- `verification_date` (date)
- `verifier_name`, `verifier_email`, `verifier_phone`, `verifier_address` (text)

#### Exclusions (2 columns)
- `has_exclusions` (boolean)
- `exclusions_description` (text)

#### Reporting Period (2 columns)
- `reporting_period_from`, `reporting_period_to` (dates)

#### Organizational Boundaries (4 columns)
- `consolidation_equity_share`, `consolidation_financial_control`, `consolidation_operational_control` (booleans)
- `organizational_boundaries_description` (text)

#### Operational Boundaries (2 columns)
- `scope3_included` (boolean)
- `scope3_activity_details` (text)

#### Base Year Emissions (21 columns)
- `base_year_scope1/2/3_mtco2e`, `_co2`, `_ch4`, `_n2o`, `_hfcs`, `_pfcs`, `_sf6` (numeric)

#### Biogenic CO2 (1 column)
- `biogenic_co2_mtco2` (numeric)

#### Methodologies (3 columns)
- `methodologies_description`, `emission_factors_reference`, `calculation_tools_used` (text)

#### Emissions by Source Types (9 columns)
- Scope 1: stationary_combustion, mobile_combustion, process_sources, fugitive_sources, agricultural_sources (text)
- Scope 2: purchased_electricity, purchased_steam, purchased_heating, purchased_cooling (text)

#### Additional Fields (8 columns)
- `facilities_scope1_breakdown` (JSONB)
- `emissions_by_country` (JSONB)
- `ghg_management_programs`, `emissions_changes_context` (text)
- `inventory_quality_notes`, `performance_indicators`, `external_assurance_outline` (text)
- `offsets_purchased`, `offsets_sold` (JSONB)

#### Organizational Structure (3 columns)
- `parent_company_name` (text)
- `parent_reports_emissions` (boolean)
- `organizational_diagram_url` (text)

---

## 🔄 Next Steps Required

### Step 1: Apply Database Migration
1. Go to your **Supabase Dashboard** → SQL Editor
2. Copy and paste the entire contents of `scripts/008_ghg_protocol_fields.sql`
3. Click **Run** to execute the migration
4. Verify all columns were added successfully

**Status**: ⏳ Awaiting execution

### Step 2: Update Company Info Form Component
**Files to create/update**:
- `components/company-info-form.tsx` or create a new component

Add UI fields for:
- ✅ Basic info (company name, description, business description)
- ⏳ Verification details (checkbox for third-party verified, date picker, verifier contact fields)
- ⏳ Exclusions checkbox and text area
- ⏳ Reporting period date selectors
- ⏳ Consolidation approach checkboxes (multi-select)
- ⏳ Scope 3 inclusion checkbox with activity types field
- ⏳ Base year and recalculation policy fields
- ⏳ Methodologies and emission factors documentation

**Complexity**: Medium - Significant form expansion needed

### Step 3: Create Base Year Data Entry Form
Add a separate form to allow users to enter:
- Base year (dropdown or year input)
- Base year emissions for each scope and gas type
- Recalculation policy (text field)

**Optional**: Could be a separate page or modal in the dashboard

### Step 4: Test Report Generation
1. Start dev server: `npm run dev`
2. Log in to dashboard
3. Navigate to reports section
4. Generate report and verify JSON structure matches template
5. Check that all fields populate correctly (non-null values when data exists)

### Step 5: Create Report Download/Export Feature
Add functionality to:
- Download report as JSON
- Export as PDF (recommended)
- Export as formatted HTML matching the GHG Protocol template

**Suggestion**: Use a library like `jsPDF` or `html2pdf` for PDF export

---

## 📋 Report Generation Test Case

### Sample API Response Structure
```json
{
  "report_type": "GHG Emissions Inventory",
  "generated_at": "2026-01-04T10:30:00Z",
  "company_name": "Example Corp",
  "inventory_year": 2025,
  "verification": {
    "third_party_verified": true,
    "verification_date": "2026-01-01",
    "verifier_name": "Carbon Verifiers Inc",
    "verifier_email": "verify@example.com"
  },
  "emissions": {
    "scope1": {
      "mtco2e": 1250.50,
      "co2_mt": 1200.00,
      "ch4_mt": 10.50,
      "n2o_mt": 0.00,
      "hfcs_mt": 0.00,
      "pfcs_mt": 0.00,
      "sf6_mt": 0.00
    },
    "scope2": { "mtco2e": 850.25, ... },
    "scope3": { "mtco2e": 425.00, ... },
    "total": 2525.75
  },
  "base_year": {
    "year": 2023,
    "recalculation_policy": "Annual recalculation with 5% restatement threshold",
    "emissions": { ... }
  },
  "methodologies": { ... },
  "line_items": [ ... ]
}
```

---

## 🔗 Integration Checklist

- [ ] **Database**: Run migration in Supabase SQL Editor
- [ ] **UI Forms**: Create/update company info form with new fields
- [ ] **Testing**: Verify report JSON matches template structure
- [ ] **Export**: Add PDF/JSON download functionality
- [ ] **Documentation**: Create user guide for GHG Protocol template
- [ ] **Deployment**: Test on Vercel with real data
- [ ] **Validation**: Cross-check report with official GHG Protocol guidance

---

## 📚 Resources

- **GHG Protocol Template**: Your provided template with 20+ sections
- **Emission Factors**: Currently using basic factors; consider updating to sector-specific rates
- **Verification**: Integration with third-party verifiers (future enhancement)

---

## ⚠️ Important Notes

1. **Null Values**: If a field doesn't exist in company_info, the report will return empty strings or zeros
2. **Gas Breakdowns**: Currently not calculated from individual emissions - you may need to add gas type tracking to the emissions table
3. **Scope 3**: Requires additional company_info data to populate; can be marked as "not included" for now
4. **Base Year Tracking**: Requires manual data entry initially; could automate with historical data capture

---

## Current Deployed Version
- **GitHub**: https://github.com/Azhnfikry/carbon-calculator
- **Latest Commit**: GHG Protocol implementation
- **Vercel Live**: https://carbon-calculator-khaki-eta.vercel.app

Report API Endpoint: `GET /api/generate-report`
