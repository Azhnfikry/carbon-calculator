'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download } from 'lucide-react';

type CompanyInfo = {
  name?: string;
  description?: string;
  consolidation_approach?: string;
  business_description?: string;
  reporting_period?: string;
  base_year?: number;
  base_year_rationale?: string;
};

type EmissionByGas = {
  mtco2e: number;
  co2_mt: number;
  ch4_mt: number;
  n2o_mt: number;
  hfcs_mt: number;
  pfcs_mt: number;
  sf6_mt: number;
};

type ReportData = {
  generated_at: string;
  company_name?: string;
  inventory_year?: number;
  company_description?: string;
  business_description?: string;
  user_name?: string;
  user_email?: string;
  
  // Simplified totals (for backward compatibility)
  scope_1_total?: number;
  scope_2_total?: number;
  scope_3_total?: number;
  total_emissions?: number;
  
  // New GHG Protocol fields
  company_info?: CompanyInfo;
  emissions?: {
    scope1?: EmissionByGas;
    scope2?: EmissionByGas;
    scope3?: EmissionByGas;
    total?: number;
  };
};

export function EmissionReport() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch('/api/generate-report', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if error message is in the response
        const errorMsg = data.error || `Failed to fetch report data: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Validate and normalize the data to handle both old and new formats
      const normalizedData: ReportData = {
        generated_at: data.generated_at || new Date().toISOString(),
        company_name: data.company_name || data.company_info?.name || 'Not Provided',
        inventory_year: data.inventory_year || data.company_info?.base_year || new Date().getFullYear(),
        company_description: data.company_description || data.company_info?.description || '',
        business_description: data.business_description || data.company_info?.business_description || '',
        user_name: data.generated_by || data.user_name || 'Unknown User',
        user_email: data.report_contact_email || data.user_email || 'N/A',
        
        // Support both old and new formats
        scope_1_total: data.emissions?.scope1?.mtco2e || Number(data.scope_1_total) || 0,
        scope_2_total: data.emissions?.scope2?.mtco2e || Number(data.scope_2_total) || 0,
        scope_3_total: data.emissions?.scope3?.mtco2e || Number(data.scope_3_total) || 0,
        total_emissions: data.emissions?.total || Number(data.total_emissions) || 0,
        
        // Keep new GHG Protocol data
        emissions: data.emissions || {
          scope1: {
            mtco2e: data.scope_1_total || 0,
            co2_mt: data.scope_1_total || 0,
            ch4_mt: 0,
            n2o_mt: 0,
            hfcs_mt: 0,
            pfcs_mt: 0,
            sf6_mt: 0,
          },
          scope2: {
            mtco2e: data.scope_2_total || 0,
            co2_mt: data.scope_2_total || 0,
            ch4_mt: 0,
            n2o_mt: 0,
            hfcs_mt: 0,
            pfcs_mt: 0,
            sf6_mt: 0,
          },
          scope3: {
            mtco2e: data.scope_3_total || 0,
            co2_mt: data.scope_3_total || 0,
            ch4_mt: 0,
            n2o_mt: 0,
            hfcs_mt: 0,
            pfcs_mt: 0,
            sf6_mt: 0,
          },
          total: data.total_emissions || 0,
        },
      };

      setReportData(normalizedData);
    } catch (err) {
      console.error('Report fetch error:', err);
      setError(err instanceof Error ? err.message : 'Error loading report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) {
      setError('Report not ready');
      return;
    }

    try {
      setDownloading(true);
      setError(null);

      // Use browser print-to-PDF
      const printContent = reportRef.current.innerHTML;
      const printWindow = window.open('', '', 'width=900,height=1200');
      
      if (!printWindow) {
        throw new Error('Could not open print window. Check your browser settings.');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Carbon Emissions Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: white; }
            .report-container { max-width: 900px; margin: 0 auto; }
            .header { border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
            .subtitle { color: #6b7280; font-size: 14px; }
            .company-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .company-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #16a34a; padding-bottom: 10px; }
            .info-row { display: grid; grid-template-columns: 200px 1fr; gap: 20px; margin-bottom: 12px; }
            .info-label { font-weight: 600; color: #374151; }
            .info-value { color: #6b7280; }
            .emissions-section { margin-bottom: 30px; }
            .emissions-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 20px; border-bottom: 2px solid #16a34a; padding-bottom: 10px; }
            .emissions-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
            .emission-card { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; }
            .emission-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
            .emission-value { font-size: 28px; font-weight: bold; color: #16a34a; }
            .emission-unit { color: #9ca3af; font-size: 12px; margin-top: 4px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      // Trigger print dialog after content is loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setDownloading(false);
      }, 250);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error downloading PDF');
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!reportData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No report data available. Please add company info and emission entries first.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GHG Emissions Inventory Report</h2>
          <p className="text-muted-foreground text-sm">Scope 1, 2 & 3 Cumulative Summary</p>
        </div>
        <Button
          onClick={downloadPDF}
          disabled={downloading}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>

      {/* Printable Report */}
      <div ref={reportRef} className="bg-white dark:bg-slate-950 p-8 rounded-lg border border-gray-200 dark:border-slate-800 space-y-6">
        {/* Header */}
        <div className="border-b-4 border-green-600 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Carbon Emissions Report</h1>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Generated: {reportData.generated_at}</span>
            <span>Prepared for: {reportData.user_name}</span>
          </div>
        </div>

        {/* Company Information Section */}
        <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-green-600 pb-3">
            Part 1: Company Information
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Company Name</p>
              <p className="text-lg text-gray-900 dark:text-white">{reportData.company_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Inventory Year</p>
              <p className="text-lg text-gray-900 dark:text-white">{reportData.inventory_year || new Date().getFullYear()}</p>
            </div>
          </div>

          {reportData.company_description && (
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Description</p>
              <p className="text-gray-700 dark:text-gray-300">{reportData.company_description}</p>
            </div>
          )}

          {reportData.business_description && (
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Business Description</p>
              <p className="text-gray-700 dark:text-gray-300">{reportData.business_description}</p>
            </div>
          )}
        </div>

        {/* Emissions Summary Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-green-600 pb-3">
            Part 2: GHG Emissions Summary
          </h2>

          {/* Emissions Cards - All Three Scopes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Scope 1 Card */}
            <div className="border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-lg p-6">
              <p className="text-sm font-bold text-red-700 dark:text-red-400 uppercase mb-2">Scope 1</p>
              <p className="text-sm text-red-600 dark:text-red-300 mb-3">Direct Emissions</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{reportData.scope_1_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-2">kg CO₂e</p>
            </div>

            {/* Scope 2 Card */}
            <div className="border-2 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-6">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase mb-2">Scope 2</p>
              <p className="text-sm text-amber-600 dark:text-amber-300 mb-3">Indirect Energy</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{reportData.scope_2_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">kg CO₂e</p>
            </div>

            {/* Scope 3 Card */}
            <div className="border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6">
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase mb-2">Scope 3</p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">Other Indirect</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reportData.scope_3_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">kg CO₂e</p>
            </div>

            {/* Total Emissions Card */}
            <div className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20 rounded-lg p-6">
              <p className="text-sm font-bold text-purple-700 dark:text-purple-400 uppercase mb-2">Total</p>
              <p className="text-sm text-purple-600 dark:text-purple-300 mb-3">All Scopes</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{reportData.total_emissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-purple-600 dark:text-purple-500 mt-2">kg CO₂e</p>
            </div>
          </div>

          {/* Summary Note */}
          <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg mt-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Scope 1:</strong> Direct emissions from owned or controlled sources. <strong>Scope 2:</strong> Indirect emissions from purchased electricity, steam, or heating. <strong>Scope 3:</strong> Other indirect emissions from the value chain.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center text-xs text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Carbon Calculator Report</p>
        </div>
      </div>
    </div>
  );
}
