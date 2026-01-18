// Document upload component with OCR extraction
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { ExtractedData } from '@/types/emission';

interface DocumentUploadProps {
  onFileUpload: (file: File, extractedData: ExtractedData) => void;
  onRemove: () => void;
  uploadedFile: File | null;
}

export default function DocumentUpload({ onFileUpload, onRemove, uploadedFile }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);

    try {
      // Call the real Gemini OCR API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract data');
      }

      const result = await response.json();
      
      if (result.success && result.extractedData) {
        const extractedData = {
          quantity: result.extractedData.quantity,
          unit: result.extractedData.unit,
          date: result.extractedData.date,
          confidence: result.extractedData.confidence,
        };
        
        onFileUpload(file, extractedData);
        console.log('✅ OCR extraction successful:', extractedData);
      } else {
        throw new Error(result.error || 'Failed to extract data from document');
      }
    } catch (error: any) {
      console.error('OCR extraction error:', error);
      alert('Failed to extract data: ' + (error.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (uploadedFile) {
    return (
      <Card className="border-2 border-emerald-200 bg-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">{uploadedFile.name}</p>
                <p className="text-sm text-emerald-700">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              onClick={onRemove}
              variant="ghost"
              size="icon"
              className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 bg-slate-50 hover:border-slate-400'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-white rounded-full">
            <Upload className="h-8 w-8 text-slate-400" />
          </div>

          <div className="space-y-2">
            <p className="text-base font-medium text-slate-700">
              Upload your utility bill, receipt, or invoice
            </p>
            <p className="text-sm text-slate-500">
              PDF, JPG, or PNG (max 10MB)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              variant="default"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Choose File'}
            </Button>
            <p className="text-sm text-slate-500 self-center">or drag and drop</p>
          </div>

          <input
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />

          <div className="pt-4 border-t border-slate-200 w-full">
            <p className="text-xs text-slate-500">
              <strong>Note:</strong> We'll extract key data from your document automatically.
              You can review and edit before submitting.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
