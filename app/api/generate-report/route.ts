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
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's emissions
    const { data: emissions, error } = await supabase
      .from('emissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user profile for report header
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

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
    const { data: companyInfo } = await supabase
      .from('company_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Calculate emissions by scope (2 and 3 only)
    const scope2Emissions = processedEmissions
      .filter((e: any) => e.scope === 2)
      .reduce((sum: number, e: any) => sum + (e.total_emissions || 0), 0);

    const scope3Emissions = processedEmissions
      .filter((e: any) => e.scope === 3)
      .reduce((sum: number, e: any) => sum + (e.total_emissions || 0), 0);

    const combinedTotal = scope2Emissions + scope3Emissions;

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
      scope_2_total: parseFloat(scope2Emissions.toFixed(2)),
      scope_3_total: parseFloat(scope3Emissions.toFixed(2)),
      combined_total: parseFloat(combinedTotal.toFixed(2)),
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
