import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

    // Calculate emissions by scope (1, 2, and 3)
    const scope1Emissions = processedEmissions
      .filter((e: any) => e.scope === 1)
      .reduce((sum: number, e: any) => sum + (e.total_emissions || 0), 0);

    const scope2Emissions = processedEmissions
      .filter((e: any) => e.scope === 2)
      .reduce((sum: number, e: any) => sum + (e.total_emissions || 0), 0);

    const scope3Emissions = processedEmissions
      .filter((e: any) => e.scope === 3)
      .reduce((sum: number, e: any) => sum + (e.total_emissions || 0), 0);

    const totalEmissions = scope1Emissions + scope2Emissions + scope3Emissions;

    // Generate report data
    const reportData = {
      generated_at: new Date().toLocaleString(),
      company_info: {
        name: companyInfo?.company_name || 'N/A',
        description: companyInfo?.company_description || '',
        consolidation_approach: companyInfo?.consolidation_approach || '',
        business_description: companyInfo?.business_description || '',
        reporting_period: companyInfo?.reporting_period || '',
        base_year: companyInfo?.base_year || new Date().getFullYear(),
        base_year_rationale: companyInfo?.base_year_rationale || '',
      },
      user_name: profile?.full_name || 'User',
      user_email: profile?.email || user.email,
      scope_1_total: parseFloat(scope1Emissions.toFixed(2)),
      scope_2_total: parseFloat(scope2Emissions.toFixed(2)),
      scope_3_total: parseFloat(scope3Emissions.toFixed(2)),
      total_emissions: parseFloat(totalEmissions.toFixed(2)),
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
