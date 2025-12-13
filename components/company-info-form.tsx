'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Scope 3 Activities Categories
const SCOPE3_CATEGORIES = {
  upstream: {
    label: 'Upstream Scope 3 Emissions',
    items: [
      { id: 'cat1', label: 'Category 1: Purchased goods and services' },
      { id: 'cat2', label: 'Category 2: Capital goods' },
      { id: 'cat3', label: 'Category 3: Fuel- and energy-related activities' },
      { id: 'cat4', label: 'Category 4: Upstream transportation and distribution' },
      { id: 'cat5', label: 'Category 5: Waste generated in operations' },
      { id: 'cat6', label: 'Category 6: Business travel' },
      { id: 'cat7', label: 'Category 7: Employee commuting' },
      { id: 'cat8', label: 'Category 8: Upstream leased assets' },
      { id: 'cat_other_up', label: 'Other upstream activities' },
    ],
  },
  downstream: {
    label: 'Downstream Scope 3 Emissions',
    items: [
      { id: 'cat9', label: 'Category 9: Downstream transportation and distribution' },
      { id: 'cat10', label: 'Category 10: Processing of sold products' },
      { id: 'cat11', label: 'Category 11: Use of sold products' },
      { id: 'cat12', label: 'Category 12: End-of-life treatment of sold products' },
      { id: 'cat13', label: 'Category 13: Downstream leased assets' },
      { id: 'cat14', label: 'Category 14: Franchises' },
      { id: 'cat15', label: 'Category 15: Investments' },
      { id: 'cat_other_down', label: 'Other downstream activities' },
    ],
  },
};

interface CompanyInfo {
  id?: string;
  user_id: string;
  company_name: string;
  company_description: string;
  consolidation_approach: string;
  business_description: string;
  reporting_period: string;
  scope3_activities: string;
  excluded_activities: string;
  base_year: string;
  base_year_rationale: string;
  base_year_recalculation_policy: string;
  created_at?: string;
  updated_at?: string;
}

interface CompanyInfoFormProps {
  user: User | null;
}

export function CompanyInfoForm({ user }: CompanyInfoFormProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedScope3, setSelectedScope3] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<CompanyInfo>({
    user_id: user?.id || '',
    company_name: '',
    company_description: '',
    consolidation_approach: 'equity-share',
    business_description: '',
    reporting_period: '',
    scope3_activities: '',
    excluded_activities: '',
    base_year: new Date().getFullYear().toString(),
    base_year_rationale: '',
    base_year_recalculation_policy: '',
  });

  // Helper function to parse scope3_activities string to Set
  const parseScope3Activities = (activitiesStr: string): Set<string> => {
    if (!activitiesStr) return new Set();
    try {
      const parsed = JSON.parse(activitiesStr);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      // Fallback for old comma-separated format
      return new Set(activitiesStr.split(',').map((s) => s.trim()).filter(Boolean));
    }
  };

  // Helper function to convert Set to JSON string
  const serializeScope3Activities = (selectedSet: Set<string>): string => {
    return JSON.stringify(Array.from(selectedSet));
  };

  // Handle Scope 3 checkbox changes
  const handleScope3Change = (categoryId: string, checked: boolean) => {
    const newSelected = new Set(selectedScope3);
    if (checked) {
      newSelected.add(categoryId);
    } else {
      newSelected.delete(categoryId);
    }
    setSelectedScope3(newSelected);
    setFormData((prev) => ({
      ...prev,
      scope3_activities: serializeScope3Activities(newSelected),
    }));
  };

  // Load existing company info
  useEffect(() => {
    const loadCompanyInfo = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('company_info')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // PGRST116 = no rows returned (this is expected for new users)
        if (error && error.code !== 'PGRST116') {
          console.warn('Warning loading company info:', error);
          // Don't throw - just continue with empty form
        }

        if (data) {
          setFormData({
            ...data,
            base_year: data.base_year?.toString() || new Date().getFullYear().toString(),
          });
          setSelectedScope3(parseScope3Activities(data.scope3_activities));
        }
      } catch (error) {
        console.error('Error loading company info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyInfo();
  }, [user, supabase]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof CompanyInfo
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSelectChange = (field: keyof CompanyInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to save company information' });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        company_name: formData.company_name,
        company_description: formData.company_description,
        consolidation_approach: formData.consolidation_approach,
        business_description: formData.business_description,
        reporting_period: formData.reporting_period,
        scope3_activities: formData.scope3_activities,
        excluded_activities: formData.excluded_activities,
        base_year: parseInt(formData.base_year) || new Date().getFullYear(),
        base_year_rationale: formData.base_year_rationale,
        base_year_recalculation_policy: formData.base_year_recalculation_policy,
        user_id: user.id,
      };

      if (formData.id) {
        // Update existing
        const { error } = await supabase
          .from('company_info')
          .update(dataToSave)
          .eq('id', formData.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        setMessage({ type: 'success', text: 'Company information updated successfully!' });
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('company_info')
          .insert([dataToSave])
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        if (data) {
          setFormData({ ...formData, id: data.id });
        }
        setMessage({ type: 'success', text: 'Company information saved successfully!' });
      }

      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Error saving company info:', error);
      const errorMessage = error?.message || 'Failed to save company information. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Please log in to view and edit company information.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Information</h2>
        <p className="text-muted-foreground mt-2">
          Provide descriptive information about your company for ESG reporting compliance
        </p>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Part 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Company name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="Enter your company name"
                value={formData.company_name}
                onChange={(e) => handleInputChange(e, 'company_name')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_description">Description of the Company *</Label>
              <Textarea
                id="company_description"
                placeholder="Provide a detailed description of your company"
                value={formData.company_description}
                onChange={(e) => handleInputChange(e, 'company_description')}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Part 2: Consolidation & Scope */}
        <Card>
          <CardHeader>
            <CardTitle>Consolidation & Organizational Boundary</CardTitle>
            <CardDescription>Define your reporting approach and scope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consolidation_approach">Chosen Consolidation Approach *</Label>
              <Select value={formData.consolidation_approach} onValueChange={(value) => handleSelectChange('consolidation_approach', value)}>
                <SelectTrigger id="consolidation_approach">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equity-share">Equity Share</SelectItem>
                  <SelectItem value="operational-control">Operational Control</SelectItem>
                  <SelectItem value="financial-control">Financial Control</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_description">Description of Businesses & Operations in Organizational Boundary *</Label>
              <Textarea
                id="business_description"
                placeholder="Describe the businesses and operations included in your organizational boundary"
                value={formData.business_description}
                onChange={(e) => handleInputChange(e, 'business_description')}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Part 3: Reporting Period & Base Year */}
        <Card>
          <CardHeader>
            <CardTitle>Reporting Period & Base Year</CardTitle>
            <CardDescription>Define your reporting timeframe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reporting_period">Reporting Period *</Label>
              <Input
                id="reporting_period"
                placeholder="e.g., January 1, 2024 - December 31, 2024"
                value={formData.reporting_period}
                onChange={(e) => handleInputChange(e, 'reporting_period')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_year">Base Year *</Label>
              <Input
                id="base_year"
                type="number"
                placeholder="e.g., 2020"
                value={formData.base_year}
                onChange={(e) => handleInputChange(e, 'base_year')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_year_rationale">Base Year Rationale *</Label>
              <Textarea
                id="base_year_rationale"
                placeholder="Explain why this year was chosen as the base year"
                value={formData.base_year_rationale}
                onChange={(e) => handleInputChange(e, 'base_year_rationale')}
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Part 4: Scope 3 Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Scope 3 Activities</CardTitle>
            <CardDescription>Select the scope 3 activities included in your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(SCOPE3_CATEGORIES).map(([key, section]) => (
              <div key={key} className="space-y-3">
                <h3 className="font-semibold text-base text-foreground bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded">
                  {section.label}
                </h3>
                <div className="grid grid-cols-1 gap-3 pl-2">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={selectedScope3.has(item.id)}
                        onChange={(e) => handleScope3Change(item.id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 cursor-pointer"
                      />
                      <label htmlFor={item.id} className="text-sm text-foreground cursor-pointer">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-4">
              Select all scope 3 emission categories that are relevant to your organization
            </p>
          </CardContent>
        </Card>

        {/* Part 5: Excluded Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Excluded Activities</CardTitle>
            <CardDescription>Activities excluded from the report with justification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excluded_activities">Excluded Activities with Justification *</Label>
              <Textarea
                id="excluded_activities"
                placeholder="List scope 1, 2, and 3 activities excluded with justification (one per line)"
                value={formData.excluded_activities}
                onChange={(e) => handleInputChange(e, 'excluded_activities')}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">Format: Activity name - Justification for exclusion</p>
            </div>
          </CardContent>
        </Card>

        {/* Part 6: Base Year Recalculation Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Base Year Recalculation Policy</CardTitle>
            <CardDescription>Define your policy for recalculating base year emissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="base_year_recalculation_policy">Base Year Emissions Recalculation Policy *</Label>
              <Textarea
                id="base_year_recalculation_policy"
                placeholder="Describe your policy for recalculating base year emissions if significant changes occur..."
                value={formData.base_year_recalculation_policy}
                onChange={(e) => handleInputChange(e, 'base_year_recalculation_policy')}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            {isSaving ? 'Saving...' : 'Save Company Information'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">* Required fields</p>
      </form>
    </div>
  );
}
