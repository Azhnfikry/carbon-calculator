'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function EmissionReport() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/generate-report');
      if (!response.ok) throw new Error('Failed to fetch report data');
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      // Dynamically import libraries only when needed
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`carbon-emissions-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF');
    }
  };

  if (loading) return <div className="text-center py-8">Loading report...</div>;
  if (error) return <div className="text-red-600 py-8">{error}</div>;
  if (!reportData) return <div className="text-center py-8">No data available</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold">Carbon Emissions Report</h1>
        <div className="flex gap-2">
          <Button onClick={fetchReportData} variant="outline">
            Refresh
          </Button>
          <Button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700">
            📥 Download PDF
          </Button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="bg-white p-8 rounded-lg shadow-lg space-y-6"
      >
        {/* Header */}
        <div className="border-b pb-6">
          <h2 className="text-2xl font-bold mb-2">Carbon Emissions Report</h2>
          <p className="text-gray-600">Generated on {reportData.generated_at}</p>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.total_entries}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Emissions</p>
              <p className="text-2xl font-bold text-orange-600">
                {reportData.total_emissions} kg CO₂
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average per Entry</p>
              <p className="text-2xl font-bold text-green-600">
                {reportData.average_emissions} kg CO₂
              </p>
            </div>
          </div>
        </Card>

        {/* Emissions Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Emissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Activity</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Emissions (kg CO₂)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.emissions.map((emission: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(emission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{emission.activity_description}</td>
                    <td className="px-4 py-2">{emission.category}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {emission.total_emissions.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-xs text-gray-500">
          <p>This is an automated report generated by Carbon Calculator</p>
          <p>For more information, visit: https://carbon-calculator-khaki-eta.vercel.app</p>
        </div>
      </div>
    </div>
  );
}
