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

      console.log('Fetching report data...');
      const response = await fetch('/api/generate-report', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      console.log('Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        // Check if error message is in the response
        const errorMsg = data.error || `Failed to fetch report data: ${response.statusText}`;
        console.error('API error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Data received, normalizing...');
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
      const errorMessage = err instanceof Error ? err.message : 'Error loading report';
      console.error('Setting error message:', errorMessage);
      setError(errorMessage);
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
      <div className="space-y-4">
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-gray-600 dark:text-gray-400">
          <p className="font-semibold mb-2">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure you are logged in</li>
            <li>Have you added any emissions entries?</li>
            <li>Check browser console for more details (F12 → Console tab)</li>
            <li>Try refreshing the page (F5)</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No report data available. Please add company info and emission entries first, then refresh this page.
        </AlertDescription>
      </Alert>
    );
  }

  // Helper function to format numbers
  const formatNumber = (value: number | undefined, decimals: number = 2): string => {
    if (!value && value !== 0) return 'N/A';
    return parseFloat(String(value)).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GHG Emissions Inventory Report</h2>
          <p className="text-muted-foreground text-sm">Scope 1, 2 & 3 Professional Report</p>
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
      <div ref={reportRef} className="bg-white dark:bg-slate-950 p-8 rounded-lg border border-gray-200 dark:border-slate-800 space-y-8">
        {/* Header */}
        <div className="border-b-4 border-green-600 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">GHG EMISSIONS INVENTORY REPORT</h1>
          <div className="grid grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400 mt-4">
            <div>
              <p className="text-xs uppercase font-semibold">Generated</p>
              <p>{new Date(reportData.generated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold">Inventory Year</p>
              <p>{reportData.inventory_year}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs uppercase font-semibold">Prepared By</p>
              <p>{reportData.user_name}</p>
              <p className="text-xs">{reportData.user_email}</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Company Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-3 border-green-600 pb-3 mb-6">
            1. COMPANY INFORMATION
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Company Name</p>
              <p className="text-lg text-gray-900 dark:text-white">{reportData.company_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Contact</p>
              <p className="text-lg text-gray-900 dark:text-white">{reportData.user_email}</p>
            </div>
          </div>

          {reportData.company_description && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Company Description</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">{reportData.company_description}</p>
            </div>
          )}

          {reportData.business_description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Business Activities</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">{reportData.business_description}</p>
            </div>
          )}
        </div>

        {/* SECTION 2: Emissions Summary - Main */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-3 border-green-600 pb-3 mb-6">
            2. GHG EMISSIONS SUMMARY
          </h2>

          {/* Total Emissions Headline */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-600 rounded-lg p-6 mb-6">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase">Total GHG Emissions (All Scopes)</p>
            <p className="text-5xl font-bold text-green-700 dark:text-green-400 mt-2">{formatNumber(reportData.total_emissions)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">metric tons CO₂e</p>
          </div>

          {/* Three Scopes Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Scope 1 */}
            <div className="border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 rounded-lg p-5">
              <p className="text-sm font-bold text-red-700 dark:text-red-400 uppercase mb-3">Scope 1</p>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4 font-semibold">Direct Emissions</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatNumber(reportData.scope_1_total)}</p>
                </div>
                {reportData.emissions?.scope1?.co2_mt > 0 && (
                  <div className="pt-2 border-t border-red-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400">CO₂</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{formatNumber(reportData.emissions.scope1.co2_mt)} MT</p>
                  </div>
                )}
              </div>
            </div>

            {/* Scope 2 */}
            <div className="border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-5">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase mb-3">Scope 2</p>
              <p className="text-sm text-amber-600 dark:text-amber-300 mb-4 font-semibold">Indirect Energy</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatNumber(reportData.scope_2_total)}</p>
                </div>
                {reportData.emissions?.scope2?.co2_mt > 0 && (
                  <div className="pt-2 border-t border-amber-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400">CO₂</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">{formatNumber(reportData.emissions.scope2.co2_mt)} MT</p>
                  </div>
                )}
              </div>
            </div>

            {/* Scope 3 */}
            <div className="border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-5">
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase mb-3">Scope 3</p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-4 font-semibold">Other Indirect</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(reportData.scope_3_total)}</p>
                </div>
                {reportData.emissions?.scope3?.co2_mt > 0 && (
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs text-gray-500 dark:text-gray-400">CO₂</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{formatNumber(reportData.emissions.scope3.co2_mt)} MT</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scope Definitions */}
          <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p><strong>Scope 1 - Direct Emissions:</strong> GHG emissions from sources owned or controlled by the company (e.g., fuel combustion, process emissions).</p>
            <p><strong>Scope 2 - Indirect Energy Emissions:</strong> GHG emissions from the generation of purchased electricity, steam, heating, and cooling.</p>
            <p><strong>Scope 3 - Other Indirect Emissions:</strong> All other indirect emissions from company's value chain not covered in Scopes 1 or 2.</p>
          </div>
        </div>

        {/* SECTION 3: Gas Breakdown */}
        {reportData.emissions && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-3 border-green-600 pb-3 mb-6">
              3. GHG EMISSIONS BY GAS TYPE
            </h2>

            <div className="space-y-4">
              {/* Scope 1 Gases */}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-3">Scope 1 - Direct Emissions</p>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">CO₂</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope1?.co2_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">CH₄</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope1?.ch4_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">N₂O</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope1?.n2o_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total CO₂e</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope1?.mtco2e || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Scope 2 Gases */}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-3">Scope 2 - Indirect Energy</p>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">CO₂</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope2?.co2_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">CH₄</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope2?.ch4_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">N₂O</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope2?.n2o_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total CO₂e</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope2?.mtco2e || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Scope 3 Gases */}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-3">Scope 3 - Other Indirect</p>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">CO₂</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope3?.co2_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">CH₄</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope3?.ch4_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">N₂O</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope3?.n2o_mt || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total CO₂e</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatNumber(reportData.emissions.scope3?.mtco2e || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Calculation Methodology */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-3 border-green-600 pb-3 mb-6">
            4. METHODOLOGY & STANDARDS
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Standards Applied</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">GHG Protocol Corporate Accounting and Reporting Standard</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Emission Factors</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">IPCC AR6, EPA Guidelines, DEFRA/BEIS Data</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Calculation Approach</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Emissions = Activity Data × Emission Factor × Global Warming Potential (GWP)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 text-center text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <p><strong>Report Prepared:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>© {new Date().getFullYear()} Carbon Calculator - GHG Emissions Inventory Report</p>
          <p className="italic">This report is based on data provided by the user and calculated using industry-standard emission factors.</p>
        </div>
      </div>
    </div>
  );
}
