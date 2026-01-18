// Test file to verify OCR components work
// This is a simple test component to check if OCR is integrated

'use client';

import { useState } from 'react';
import DocumentUpload from '@/components/document-upload';
import DataExtraction from '@/components/data-extraction';
import type { ExtractedData } from '@/types/emission';

export default function OCRTest() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleFileUpload = (file: File, data: ExtractedData) => {
    console.log('File uploaded:', file.name);
    console.log('Extracted data:', data);
    setUploadedFile(file);
    setExtractedData(data);
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setExtractedData(null);
  };

  const handleDataConfirm = (quantity: number, unit: string, date: string) => {
    console.log('Data confirmed:', { quantity, unit, date });
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">OCR Feature Test</h1>
      <p className="text-gray-600">This page tests the OCR integration</p>
      
      <div className="border-2 border-blue-200 p-4 rounded-lg bg-blue-50">
        <h2 className="text-lg font-semibold mb-4">Document Upload Test</h2>
        <DocumentUpload 
          onFileUpload={handleFileUpload}
          onRemove={handleRemove}
          uploadedFile={uploadedFile}
        />
      </div>

      {extractedData && (
        <div className="border-2 border-green-200 p-4 rounded-lg bg-green-50">
          <h2 className="text-lg font-semibold mb-4">Data Extraction Test</h2>
          <DataExtraction 
            extractedData={extractedData}
            onDataConfirm={handleDataConfirm}
          />
        </div>
      )}
    </div>
  );
}
