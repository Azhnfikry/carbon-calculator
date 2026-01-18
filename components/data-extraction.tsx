// Display and edit extracted data from OCR
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ExtractedData } from '@/types/emission';

interface DataExtractionProps {
  extractedData: ExtractedData;
  onDataConfirm: (quantity: number, unit: string, date: string) => void;
}

export default function DataExtraction({ extractedData, onDataConfirm }: DataExtractionProps) {
  const [quantity, setQuantity] = useState(extractedData.quantity.toString());
  const [unit, setUnit] = useState(extractedData.unit);
  const [date, setDate] = useState(extractedData.date);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    // Notify parent of any changes
    const numQuantity = parseFloat(quantity);
    if (!isNaN(numQuantity) && unit && date) {
      onDataConfirm(numQuantity, unit, date);
    }
  }, [quantity, unit, date, onDataConfirm]);

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    setIsEdited(true);
  };

  const handleUnitChange = (value: string) => {
    setUnit(value);
    setIsEdited(true);
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setIsEdited(true);
  };

  const confidencePercentage = Math.round(extractedData.confidence * 100);

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          Data Extracted from Document (Gemini OCR)
        </CardTitle>
        <CardDescription>
          Powered by Google Gemini AI. Please review and correct if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-white border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-slate-700">
            Extraction confidence: <strong>{confidencePercentage}%</strong>
            {confidencePercentage < 90 && ' - Please verify the values below'}
            {extractedData.secondaryValue !== undefined && ' - Multi-fuel document detected'}
          </AlertDescription>
        </Alert>

        {/* Show reasoning if available */}
        {extractedData.reasoning && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-slate-700">
              <strong>Extraction Details:</strong> {extractedData.reasoning}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="extracted-quantity">
              {extractedData.dataType || 'Quantity'} {isEdited && <span className="text-xs text-blue-600">(edited)</span>}
            </Label>
            <Input
              id="extracted-quantity"
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="bg-white"
              step="0.01"
            />
            <p className="text-xs text-slate-500">Primary: {extractedData.dataType}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extracted-unit">
              Unit {isEdited && <span className="text-xs text-blue-600">(edited)</span>}
            </Label>
            <Input
              id="extracted-unit"
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="bg-white"
              placeholder="e.g., kWh, liters, km"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extracted-date">
              Date {isEdited && <span className="text-xs text-blue-600">(edited)</span>}
            </Label>
            <Input
              id="extracted-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        {/* Multi-fuel display */}
        {extractedData.secondaryValue !== undefined && (
          <div className="border-t-2 border-blue-200 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Secondary Fuel Type Detected
            </p>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-slate-700">
                <strong>{extractedData.secondaryDataType}:</strong> {extractedData.secondaryValue} {unit}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                You can enter this as a separate emission entry in the form below if needed.
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-slate-600 pt-2">
          <strong>Tip:</strong> Make sure the quantity and unit match what's on your document.
        </p>
      </CardContent>
    </Card>
  );
}
