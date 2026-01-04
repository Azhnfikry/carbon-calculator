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
      console.log('Company info from API:', data.company_info);
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
        
        // Keep new GHG Protocol data and company_info
        company_info: data.company_info,
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

      const printContent = reportRef.current.innerHTML;
      const printWindow = window.open('', '', 'width=1000,height=1400');
      
      if (!printWindow) {
        throw new Error('Could not open print window. Check your browser settings.');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>GHG Emissions Inventory Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              padding: 40px; 
              background: white; 
              color: #1f2937;
              line-height: 1.6;
            }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .space-y-8 > * + * { margin-top: 2rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            
            h1 { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
            h2 { font-size: 24px; font-weight: bold; border-bottom: 4px solid #16a34a; padding-bottom: 12px; margin-bottom: 24px; }
            h3 { font-size: 16px; font-weight: 600; }
            
            p { font-size: 14px; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 13px; }
            .text-lg { font-size: 16px; }
            .text-2xl { font-size: 20px; }
            .text-5xl { font-size: 48px; }
            
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .uppercase { text-transform: uppercase; }
            
            .text-gray-600 { color: #4b5563; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-900 { color: #1f2937; }
            .text-green-700 { color: #15803d; }
            .text-green-400 { color: #4ade80; }
            
            .border-b-4 { border-bottom: 4px solid #16a34a; }
            .border-b-3 { border-bottom: 3px solid #16a34a; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-t-2 { border-top: 2px solid #d1d5db; }
            .border-r { border-right: 1px solid #e5e7eb; }
            .border-2 { border: 2px solid #e5e7eb; }
            .border-red-3 { border: 2px solid #fca5a5; }
            .border-amber-3 { border: 2px solid #fcd34d; }
            .border-blue-3 { border: 2px solid #93c5fd; }
            
            .pb-3 { padding-bottom: 12px; }
            .pb-6 { padding-bottom: 24px; }
            .pt-2 { padding-top: 8px; }
            .pt-4 { padding-top: 16px; }
            .pt-6 { padding-top: 24px; }
            .p-3 { padding: 12px; }
            .p-4 { padding: 16px; }
            .p-5 { padding: 20px; }
            .p-6 { padding: 24px; }
            .p-8 { padding: 32px; }
            
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            
            .bg-red-50 { background: #fef2f2; }
            .bg-amber-50 { background: #fffbeb; }
            .bg-blue-50 { background: #eff6ff; }
            .bg-green-50 { background: #f0fdf4; }
            .bg-gray-50 { background: #f9fafb; }
            
            .rounded { border-radius: 4px; }
            .rounded-lg { border-radius: 8px; }
            
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; gap: 24px; }
            .grid-cols-3 { grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
            .grid-cols-4 { grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
            .gap-3 { gap: 12px; }
            .gap-4 { gap: 16px; }
            .gap-6 { gap: 24px; }
            
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-start { align-items: flex-start; }
            
            .text-center { text-align: center; }
            
            .bg-gradient-to-r { background: linear-gradient(to right, #f0fdf4, #dbeafe); }
            
            @media print {
              body { padding: 20px; }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            setTimeout(() => {
              window.print();
            }, 100);
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
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
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase">Business Activities</p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">{reportData.business_description}</p>
            </div>
          )}

          {/* ORGANIZATIONAL BOUNDARY SUB-SECTION */}
          <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700 mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-4 border-b border-gray-300 pb-2">Organizational Boundary Approach</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Equity Share</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {(() => {
                    try {
                      const boundaries = JSON.parse(reportData.company_info?.consolidation_approach || '[]');
                      return Array.isArray(boundaries) && boundaries.includes('equity') ? '✓' : '—';
                    } catch {
                      return '—';
                    }
                  })()}
                </p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Financial Control</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {(() => {
                    try {
                      const boundaries = JSON.parse(reportData.company_info?.consolidation_approach || '[]');
                      return Array.isArray(boundaries) && boundaries.includes('financial') ? '✓' : '—';
                    } catch {
                      return '—';
                    }
                  })()}
                </p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Operational Control</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {(() => {
                    try {
                      const boundaries = JSON.parse(reportData.company_info?.consolidation_approach || '[]');
                      return Array.isArray(boundaries) && boundaries.includes('operational') ? '✓' : '—';
                    } catch {
                      return '—';
                    }
                  })()}
                </p>
              </div>
            </div>

            {reportData.company_info?.consolidation_approach && (
              <div className="p-3 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">Applied Boundary Approaches</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {(() => {
                    try {
                      const boundaries = JSON.parse(reportData.company_info.consolidation_approach || '[]');
                      if (!Array.isArray(boundaries) || boundaries.length === 0) return 'Not specified';
                      const labels: Record<string, string> = {
                        equity: 'Equity Share',
                        financial: 'Financial Control',
                        operational: 'Operational Control'
                      };
                      return boundaries.map(b => labels[b] || b).join(', ');
                    } catch {
                      return reportData.company_info.consolidation_approach;
                    }
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* OPERATIONAL BOUNDARIES SUB-SECTION */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mb-6">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase mb-4 border-b border-blue-300 pb-2">Scope & Emission Coverage</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Scope 3 Included</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                  {reportData.company_info?.consolidation_approach?.includes('scope3') || 
                   (reportData.scope_3_total && reportData.scope_3_total > 0) ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Reporting Period</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2">
                  {reportData.company_info?.reporting_period || `Year ${reportData.inventory_year}`}
                </p>
              </div>
            </div>

            {reportData.company_info?.business_description && (
              <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">Scope Coverage</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Includes all applicable Scopes 1, 2, and 3 emissions as defined by GHG Protocol standards.</p>
              </div>
            )}
          </div>
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
                {reportData.emissions?.scope1 && reportData.emissions.scope1.co2_mt > 0 && (
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
                {reportData.emissions?.scope2 && reportData.emissions.scope2.co2_mt > 0 && (
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
                {reportData.emissions?.scope3 && reportData.emissions.scope3.co2_mt > 0 && (
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
