// Types for OCR extraction from Gemini
export type DataType = 'Electricity' | 'Fuel (Diesel)' | 'Fuel (Petrol)' | 'Transport';

export interface ExtractionResult {
  value: number;
  unit: string;
  detectedDataType: DataType;
  supplierName: string;
  confidence: number;
  reasoning?: string;
}
