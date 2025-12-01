import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

    // Calculate totals
    const totalEmissions = emissions.reduce((sum, e) => sum + (e.total_emissions || 0), 0);
    const avgEmissions = emissions.length > 0 ? totalEmissions / emissions.length : 0;

    // Generate report data
    const reportData = {
      generated_at: new Date().toLocaleString(),
      user_name: profile?.full_name || 'User',
      user_email: profile?.email || user.email,
      total_entries: emissions.length,
      total_emissions: totalEmissions.toFixed(2),
      average_emissions: avgEmissions.toFixed(2),
      emissions: emissions.slice(0, 50), // Last 50 entries
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
