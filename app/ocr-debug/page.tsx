// Test OCR extraction with the actual test file
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OCRDebugTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const testFiles = [
    {
      name: 'Electricity Bill',
      path: 'C:\\Users\\N O\\Desktop\\Aethera\\Carbon C MVP\\MVP Docs\\OCR Test Docs\\Data Utiliti Elektrik dan Air - Sheet1.pdf'
    },
    {
      name: 'Non-Domestic Invoice',
      path: 'C:\\Users\\N O\\Desktop\\Aethera\\Carbon C MVP\\MVP Docs\\OCR Test Docs\\Sample_Bill_NonDom_e-Invoicing.pdf'
    },
    {
      name: 'Fuel Consumption',
      path: 'C:\\Users\\N O\\Desktop\\Aethera\\Carbon C MVP\\MVP Docs\\OCR Test Docs\\STM-20250331_50853902Fuel Consumption.pdf'
    }
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await testExtraction(file);
    }
  };

  const testExtraction = async (file: File) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Extraction failed');
        return;
      }

      setResult(data.extractedData);
      console.log('✅ Extraction successful:', data.extractedData);
    } catch (err: any) {
      setError(err.message || 'Failed to extract');
      console.error('Extraction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">🧪 OCR Extraction Debug Test</h1>
        <p className="text-gray-600">Test the improved Gemini OCR extraction with your actual documents</p>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload a Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              {selectedFile && <span className="text-sm text-gray-600">{selectedFile.name}</span>}
            </div>
            {loading && <p className="text-blue-600">🔄 Extracting with Gemini...</p>}
          </CardContent>
        </Card>

        {/* Test Files Info */}
        <Card>
          <CardHeader>
            <CardTitle>Available Test Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {testFiles.map((file) => (
                <div key={file.path} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-gray-600 break-all">{file.path}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              ❌ Error: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">✅ Extraction Successful</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="font-semibold text-lg">{result.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-600">Unit</p>
                  <p className="font-semibold text-lg">{result.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-semibold">{result.dataType || result.detectedDataType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Confidence</p>
                  <p className="font-semibold">{Math.round((result.confidence || 0) * 100)}%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Supplier</p>
                  <p className="font-semibold">{result.supplier || result.supplierName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">{result.date}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Reasoning</p>
                  <p className="text-sm">{result.reasoning}</p>
                </div>
              </div>

              {/* JSON Display */}
              <details className="bg-white p-3 rounded border border-gray-200">
                <summary className="cursor-pointer font-semibold text-gray-700">Raw JSON Response</summary>
                <pre className="mt-2 text-xs overflow-auto bg-gray-100 p-2 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            💡 <strong>How it works:</strong> Upload a document and the improved Gemini OCR will extract the consumption quantity, 
            detect the type (Electricity, Fuel, etc.), identify the supplier, and provide a confidence score.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
