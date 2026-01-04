import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Utility functions for GHG Protocol report formatting
const asNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const toMtCO2e = (value: any): number => {
  // Convert kg to mtCO2e (divide by 1000)
  return asNumber(value) / 1000;
};

const round2 = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const normalizeScopeNumber = (scope: any): number => {
  if (!scope) return 0;
  const str = String(scope).toLowerCase();
  if (str.includes('1')) return 1;
  if (str.includes('2')) return 2;
  if (str.includes('3')) return 3;
  return asNumber(scope);
};

// Emission factors for different activities
const EMISSION_FACTORS: Record<string, number> = {
  'Electricity': 0.5, // kg CO2 per kWh
  'Natural Gas': 2.0, // kg CO2 per m³
  'Diesel': 2.68, // kg CO2 per liter
  'Gasoline': 2.31, // kg CO2 per liter
  'Business Travel - Air': 0.255, // kg CO2 per km
  'Business Travel - Car': 0.21, // kg CO2 per km
  'Business Travel - Rail': 0.041, // kg CO2 per km
  'Paper': 1.5, // kg CO2 per kg
  'Water Supply': 0.5, // kg CO2 per m³
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              console.warn('Cookie setting error:', error);
            }
          },
        },
      }
    );

    // Get current user with detailed error handling
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        code: authError.code,
      });
      return NextResponse.json(
        { error: `Authentication failed: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found in session');
      return NextResponse.json(
        { error: 'User session not found. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user.id);

    // Get user's emissions
    const { data: emissions, error } = await supabase
      .from('emissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Emissions fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch emissions: ' + error.message }, { status: 500 });
    }

    if (!emissions) {
      console.warn('No emissions found for user:', user.id);
      // Return empty report with no emissions
      const emptyReport = {
        generated_at: new Date().toLocaleString(),
        company_info: {
          name: 'N/A',
          description: '',
          consolidation_approach: '',
          business_description: '',
          reporting_period: '',
          base_year: new Date().getFullYear(),
          base_year_rationale: '',
        },
        user_name: 'User',
        user_email: user.email || 'N/A',
        scope_1_total: 0,
        scope_2_total: 0,
        scope_3_total: 0,
        total_emissions: 0,
      };
      return NextResponse.json(emptyReport);
    }

    // Get user profile for report header
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn('Profile fetch warning:', profileError.message);
    }

    // Calculate emissions for each entry if not already calculated
    const processedEmissions = emissions.map((emission: any) => {
      // Try to get total_emissions from different possible field names
      let total_emissions = emission.total_emissions || 
                           emission.co2_equivalent || 
                           emission.co2Equivalent || 0;
      
      // If total_emissions is 0 or not set, try to calculate it
      if (!total_emissions && emission.quantity && emission.activity_type) {
        const factor = EMISSION_FACTORS[emission.activity_type] || 
                      EMISSION_FACTORS[emission.category] || 
                      emission.emission_factor ||
                      1;
        total_emissions = parseFloat(emission.quantity) * parseFloat(String(factor));
      }

      return {
        ...emission,
        total_emissions: isNaN(total_emissions) ? 0 : parseFloat(String(total_emissions)),
        activity_description: emission.description || emission.activity_type || '-',
      };
    });

    // Get company info
    const { data: companyInfo, error: companyError } = await supabase
      .from('company_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (companyError) {
      console.warn('Company info fetch warning:', companyError.message);
    }

    // Calculate emissions by scope with gas breakdowns
    const calculateScopeEmissions = (scopeNum: number) => {
      return {
        mtco2e: round2(toMtCO2e(processedEmissions
          .filter((e: any) => normalizeScopeNumber(e.scope) === scopeNum)
          .reduce((sum, e) => sum + asNumber(e.total_emissions), 0))),
        co2: 0,
        ch4: 0,
        n2o: 0,
        hfcs: 0,
        pfcs: 0,
        sf6: 0,
      };
    };

    const scope1 = calculateScopeEmissions(1);
    const scope2 = calculateScopeEmissions(2);
    const scope3 = calculateScopeEmissions(3);
    const totalEmissions = scope1.mtco2e + scope2.mtco2e + scope3.mtco2e;

    // Format reporting period
    const reportingPeriodFrom = companyInfo?.reporting_period_from || new Date().toISOString().split('T')[0];
    const reportingPeriodTo = companyInfo?.reporting_period_to || new Date().toISOString().split('T')[0];

    // Generate comprehensive GHG Protocol-aligned report
    const reportData = {
      // Report metadata
      report_type: 'GHG Emissions Inventory',
      generated_at: new Date().toISOString(),
      generated_by: profile?.full_name || 'User',
      report_contact_email: profile?.email || user.email,

      // Company information
      company_name: companyInfo?.company_name || '[COMPANY NAME]',
      inventory_year: companyInfo?.base_year || new Date().getFullYear(),
      company_description: companyInfo?.company_description || '',
      business_description: companyInfo?.business_description || '',

      // VERIFICATION SECTION
      verification: {
        third_party_verified: companyInfo?.third_party_verified || false,
        verification_date: companyInfo?.verification_date || null,
        verifier_name: companyInfo?.verifier_name || '',
        verifier_email: companyInfo?.verifier_email || '',
        verifier_phone: companyInfo?.verifier_phone || '',
        verifier_address: companyInfo?.verifier_address || '',
      },

      // EXCLUSIONS SECTION
      exclusions: {
        has_exclusions: companyInfo?.has_exclusions || false,
        description: companyInfo?.exclusions_description || '',
      },

      // REPORTING PERIOD SECTION
      reporting_period: {
        from: reportingPeriodFrom,
        to: reportingPeriodTo,
      },

      // ORGANIZATIONAL BOUNDARIES SECTION
      organizational_boundaries: {
        consolidation_approaches: {
          equity_share: companyInfo?.consolidation_equity_share || false,
          financial_control: companyInfo?.consolidation_financial_control || false,
          operational_control: companyInfo?.consolidation_operational_control || false,
        },
        description: companyInfo?.organizational_boundaries_description || '',
      },

      // OPERATIONAL BOUNDARIES SECTION
      operational_boundaries: {
        scope3_included: companyInfo?.scope3_included || false,
        scope3_activity_types: companyInfo?.scope3_activity_details || '',
      },

      // EMISSIONS DATA - Current Year
      emissions: {
        scope1: {
          mtco2e: scope1.mtco2e,
          co2_mt: scope1.co2,
          ch4_mt: scope1.ch4,
          n2o_mt: scope1.n2o,
          hfcs_mt: scope1.hfcs,
          pfcs_mt: scope1.pfcs,
          sf6_mt: scope1.sf6,
        },
        scope2: {
          mtco2e: scope2.mtco2e,
          co2_mt: scope2.co2,
          ch4_mt: scope2.ch4,
          n2o_mt: scope2.n2o,
          hfcs_mt: scope2.hfcs,
          pfcs_mt: scope2.pfcs,
          sf6_mt: scope2.sf6,
        },
        scope3: {
          mtco2e: scope3.mtco2e,
          co2_mt: scope3.co2,
          ch4_mt: scope3.ch4,
          n2o_mt: scope3.n2o,
          hfcs_mt: scope3.hfcs,
          pfcs_mt: scope3.pfcs,
          sf6_mt: scope3.sf6,
        },
        total: totalEmissions,
        biogenic_co2_mtco2: companyInfo?.biogenic_co2_mtco2 || 0,
      },

      // BASE YEAR EMISSIONS DATA
      base_year: {
        year: companyInfo?.base_year || new Date().getFullYear(),
        recalculation_policy: companyInfo?.base_year_recalculation_policy || '',
        emissions: {
          scope1: {
            mtco2e: companyInfo?.base_year_scope1_mtco2e || 0,
            co2_mt: companyInfo?.base_year_scope1_co2 || 0,
            ch4_mt: companyInfo?.base_year_scope1_ch4 || 0,
            n2o_mt: companyInfo?.base_year_scope1_n2o || 0,
            hfcs_mt: companyInfo?.base_year_scope1_hfcs || 0,
            pfcs_mt: companyInfo?.base_year_scope1_pfcs || 0,
            sf6_mt: companyInfo?.base_year_scope1_sf6 || 0,
          },
          scope2: {
            mtco2e: companyInfo?.base_year_scope2_mtco2e || 0,
            co2_mt: companyInfo?.base_year_scope2_co2 || 0,
            ch4_mt: companyInfo?.base_year_scope2_ch4 || 0,
            n2o_mt: companyInfo?.base_year_scope2_n2o || 0,
            hfcs_mt: companyInfo?.base_year_scope2_hfcs || 0,
            pfcs_mt: companyInfo?.base_year_scope2_pfcs || 0,
            sf6_mt: companyInfo?.base_year_scope2_sf6 || 0,
          },
          scope3: {
            mtco2e: companyInfo?.base_year_scope3_mtco2e || 0,
            co2_mt: companyInfo?.base_year_scope3_co2 || 0,
            ch4_mt: companyInfo?.base_year_scope3_ch4 || 0,
            n2o_mt: companyInfo?.base_year_scope3_n2o || 0,
            hfcs_mt: companyInfo?.base_year_scope3_hfcs || 0,
            pfcs_mt: companyInfo?.base_year_scope3_pfcs || 0,
            sf6_mt: companyInfo?.base_year_scope3_sf6 || 0,
          },
        },
      },

      // METHODOLOGIES AND EMISSION FACTORS
      methodologies: {
        calculation_methodologies: companyInfo?.methodologies_description || '',
        emission_factors_reference: companyInfo?.emission_factors_reference || 'GHG Protocol',
        calculation_tools_used: companyInfo?.calculation_tools_used || '',
      },

      // EMISSIONS BY SOURCE TYPES
      emissions_by_source: {
        scope1: {
          stationary_combustion: companyInfo?.scope1_stationary_combustion_description || '',
          mobile_combustion: companyInfo?.scope1_mobile_combustion_description || '',
          process_sources: companyInfo?.scope1_process_sources_description || '',
          fugitive_sources: companyInfo?.scope1_fugitive_sources_description || '',
          agricultural_sources: companyInfo?.scope1_agricultural_sources_description || '',
        },
        scope2: {
          purchased_electricity: companyInfo?.scope2_purchased_electricity_description || '',
          purchased_steam: companyInfo?.scope2_purchased_steam_description || '',
          purchased_heating: companyInfo?.scope2_purchased_heating_description || '',
          purchased_cooling: companyInfo?.scope2_purchased_cooling_description || '',
        },
      },

      // FACILITY AND GEOGRAPHIC BREAKDOWNS
      facilities_scope1_breakdown: companyInfo?.facilities_scope1_breakdown || {},
      emissions_by_country: companyInfo?.emissions_by_country || {},

      // EMISSIONS MANAGEMENT AND ADDITIONAL INFORMATION
      ghg_management: {
        programs_and_strategies: companyInfo?.ghg_management_programs || '',
        emissions_changes_context: companyInfo?.emissions_changes_context || '',
        inventory_quality_notes: companyInfo?.inventory_quality_notes || '',
        performance_indicators: companyInfo?.performance_indicators || '',
        external_assurance: companyInfo?.external_assurance_outline || '',
      },

      // ORGANIZATIONAL STRUCTURE (optional)
      organizational_structure: {
        parent_company_name: companyInfo?.parent_company_name || '',
        parent_reports_emissions: companyInfo?.parent_reports_emissions || false,
        organizational_diagram_url: companyInfo?.organizational_diagram_url || '',
      },

      // OFFSETS INFORMATION (optional)
      offsets: {
        purchased: companyInfo?.offsets_purchased || [],
        sold: companyInfo?.offsets_sold || [],
      },

      // LINE ITEMS (detailed emissions entries)
      line_items: processedEmissions.map((e: any) => ({
        date: e.created_at,
        activity_type: e.activity_type,
        description: e.description,
        quantity: asNumber(e.quantity),
        unit: e.unit,
        emission_factor: asNumber(e.emission_factor),
        scope: normalizeScopeNumber(e.scope),
        total_emissions_kg_co2e: asNumber(e.total_emissions),
        total_emissions_mt_co2e: toMtCO2e(e.total_emissions),
      })),
    };

    return NextResponse.json(reportData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Report generation error:', errorMessage, error);
    return NextResponse.json(
      { error: 'Failed to generate report: ' + errorMessage },
      { status: 500 }
    );
  }
}
