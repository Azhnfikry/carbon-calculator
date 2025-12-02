'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Emission = {
  created_at: string;
  activity_description: string;
  category: string;
  total_emissions: number | string | null;
};

type ReportData = {
  generated_at: string;
  user_name: string;
  user_email: string;
  total_entries: number;
  total_emissions: number;
  average_emissions: number;
  emissions: Emission[];
};

declare global {
  interface Window {
    html2canvas: any;
    jsPDF: any;
  }
}

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

      const response = await fetch('/api/generate-report');
      if (!response.ok) {
        throw new Error(`Failed to fetch report data: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate and normalize the data
      const normalizedData: ReportData = {
        generated_at: data.generated_at || new Date().toISOString(),
        user_name: data.user_name || 'Unknown User',
        user_email: data.user_email || 'N/A',
        total_entries: Number(data.total_entries) || 0,
        total_emissions: Number(data.total_emissions) || 0,
        average_emissions: Number(data.average_emissions) || 0,
        emissions: Array.isArray(data.emissions) ? data.emissions : [],
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

      // Simple approach: use print/browser print-to-PDF
      const printContent = reportRef.current.innerHTML;
      const printWindow = window.open('', '', 'width=900,height=700');
      
      if (!printWindow) {
        throw new Error('Could not open print window. Check your browser settings.');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Carbon Emissions Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .gradient { background: linear-gradient(to right, #f0f9ff, #e0e7ff); padding: 20px; margin: 20px 0; border-radius: 8px; }
            h2 { color: #333; }
            .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 15px; }
            .stat-box { background: white; padding: 15px; border-radius: 5px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
            .stat-label { font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.print();
            window.close();
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Print error:', err);
      setError(err instanceof Error ? err.message : 'Failed to open print dialog');
    } finally {
      setDownloading(false);
    }
  };

  const formatEmissionValue = (value: number | string | null): string => {
    if (value === null || value === undefined) return '0.00';
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchReportData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No data available</p>
        <Button onClick={fetchReportData} variant="outline">
          Load Report
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-4 justify-between items-center flex-wrap">
        <h1 className="text-3xl font-bold">Carbon Emissions Report</h1>
        <div className="flex gap-2">
          <Button onClick={fetchReportData} variant="outline" disabled={loading || downloading}>
            Refresh
          </Button>
          <Button
            onClick={downloadPDF}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            disabled={loading || downloading}
            aria-label="Download report as PDF"
          >
            {downloading ? '⏳ Generating PDF...' : '📥 Download PDF'}
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        {/* Header */}
        <div className="border-b pb-6">
          <h2 className="text-2xl font-bold mb-2">Carbon Emissions Report</h2>
          <p className="text-gray-600">
            Generated on {new Date(reportData.generated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">User Name</p>
            <p className="font-semibold">{reportData.user_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold">{reportData.user_email}</p>
          </div>
        </div>

        {/* Summary Statistics */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.total_entries.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Emissions</p>
              <p className="text-2xl font-bold text-orange-600">
                {reportData.total_emissions.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} kg CO₂
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average per Entry</p>
              <p className="text-2xl font-bold text-green-600">
                {reportData.average_emissions.toFixed(2)} kg CO₂
              </p>
            </div>
          </div>
        </Card>

        {/* Emissions Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Emissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border-b">Date</th>
                  <th className="px-4 py-2 text-left border-b">Activity</th>
                  <th className="px-4 py-2 text-left border-b">Category</th>
                  <th className="px-4 py-2 text-right border-b">Emissions (kg CO₂)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.emissions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>
                      No emissions data found. Start tracking your carbon footprint!
                    </td>
                  </tr>
                ) : (
                  reportData.emissions.map((emission: Emission, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">
                        {emission.created_at
                          ? new Date(emission.created_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {emission.activity_description || '-'}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {emission.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {formatEmissionValue(emission.total_emissions)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-xs text-gray-500">
          <p>This is an automated report generated by Carbon Calculator</p>
          <p className="mt-1">
            For more information, visit:{' '}
            <a
              href="https://carbon-calculator-khaki-eta.vercel.app"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              carbon-calculator-khaki-eta.vercel.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}