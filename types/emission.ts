export interface EmissionEntry {
  id: string
  activity_type: string
  category: string
  scope: 1 | 2 | 3
  quantity: number
  unit: string
  emissionFactor: number
  co2Equivalent: number
  date: string
  description?: string
}

export interface EmissionSummary {
  totalEmissions: number
  scope1: number
  scope2: number
  scope3: number
  byCategory: Record<string, number>
}

export interface EmissionFactor {
	id: string;
	activity_type: string;
	category: string;
	scope: 1 | 2 | 3;
	unit: string;
	factor: number;
	source?: string;
	region?: string;
	year?: number;
}

export interface ExtractedData {
  quantity: number;
  unit: string;
  date: string;
  confidence: number; // 0-1 for OCR confidence
  dataType?: string; // e.g., "Fuel (Petrol)", "Fuel (Diesel)", "Electricity"
  supplier?: string; // e.g., "PETRONAS", "TNB"
  reasoning?: string; // Explanation from OCR
  secondaryValue?: number; // For multi-fuel documents
  secondaryDataType?: string; // For multi-fuel documents
}

export interface Profile {
  id: string
  full_name?: string
  company_name?: string
  industry?: string
  created_at: string
  updated_at: string
}
