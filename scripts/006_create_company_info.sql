-- Create company_info table
CREATE TABLE IF NOT EXISTS public.company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  consolidation_approach TEXT DEFAULT 'equity-share',
  business_description TEXT,
  reporting_period TEXT,
  scope3_activities TEXT,
  excluded_activities TEXT,
  base_year INTEGER,
  base_year_rationale TEXT,
  base_year_recalculation_policy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_info_user_id ON public.company_info(user_id);

-- Enable RLS
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own company info" ON public.company_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company info" ON public.company_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company info" ON public.company_info
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company info" ON public.company_info
  FOR DELETE USING (auth.uid() = user_id);
