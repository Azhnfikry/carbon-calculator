// OCR Document Extraction using Google Gemini
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, DataType } from "./ocr-types";

export const extractDataFromDocument = async (
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractionResult> => {
  // Clean base64 string
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  // Initializing with the system provided API key
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert at extracting emissions data from utility bills, fuel receipts, and invoices.

CRITICAL: For multi-page documents, analyze ALL pages. The CORRECT values are typically:
- On the LAST page in summary/totals sections
- Labeled "TOTAL", "JUMLAH", "TOTAL CONSUMPTION", "SUMMARY"
- The LARGEST values for each fuel type (not individual transactions)
- Representing the PERIOD total (monthly or annual consumption)

ANALYZE THIS DOCUMENT AND EXTRACT THE CORRECT CONSUMPTION QUANTITIES:

SPECIAL INSTRUCTION FOR MULTI-FUEL DOCUMENTS (Petronas SmartPay):
MANDATORY: Extract BOTH fuel types with their TOTAL period consumption:
- Find "TOTAL CONSUMPTION", "TOTAL PETROL", "TOTAL DIESEL" or similar
- Look for the LARGEST/HIGHEST values, not individual transaction amounts
- Petronas documents: The total consumption is usually shown on a summary/totals page
- Example: If you see "24.39" and "1873.433" for Petrol, extract 1873.433 (the larger total)
- For Diesel: Extract the total consumption value
- ALWAYS return: Petrol total and Diesel total separately

RULES:
1. For PDF documents with multiple pages:
   - Scan EVERY page systematically
   - PRIORITIZE last 2-3 pages for totals/summary sections
   - Look for "Total:", "Jumlah:", "Summary:", "Period Total:"
   - When multiple values exist for same fuel type, pick the LARGEST (that's the total)
   - IGNORE individual transaction amounts or daily values

2. Petronas SmartPay specific:
   - Look for consumption breakdown/summary tables
   - Find rows labeled: "PETROL TOTAL", "DIESEL TOTAL", "TOTAL CONSUMPTION"
   - Extract the numeric value from the total row
   - Ignore unit prices and individual transaction prices
   - The TOTAL row is usually at the bottom of transaction lists

3. General quantity fields (look in this order):
   - "TOTAL CONSUMPTION", "TOTAL JUMLAH", "TOTAL PENGGUNAAN"
   - "Total Period Consumption", "Consumption Total"
   - Summary tables with "Total" row
   - "TOTAL PETROL LITERS", "TOTAL DIESEL LITERS"
   - "Petrol Total:", "Diesel Total:"
   - If multiple similar values found, SELECT THE LARGEST one

4. FUEL TYPE DETECTION:
   - Find BOTH: "PETROL", "DIESEL" clearly labeled with THEIR totals
   - MUST extract TOTAL for each fuel type
   - If "PETROL TOTAL: 1873.433 LITERS" and "DIESEL TOTAL: 12.602 LITERS" → extract exactly these
   - Return larger total as "value", smaller as "secondaryValue"

5. IGNORE:
   - Individual transaction amounts (e.g., single fill-ups)
   - Previous month's balance
   - Payment amounts or invoiced amounts
   - Unit prices ($/liter)
   - Dates alone
   - Non-consumption figures

6. DOCUMENT TYPE DETECTION:
   - If "PETROL TOTAL" and "DIESEL TOTAL" found: Type = "Fuel (Petrol)" if petrol > diesel, else "Fuel (Diesel)"
   - If only "DIESEL TOTAL": Type = "Fuel (Diesel)"
   - If only "PETROL TOTAL": Type = "Fuel (Petrol)"

7. OUTPUT FORMAT - MUST BE VALID JSON:
{
  "value": <TOTAL consumption for primary fuel - LARGEST value>,
  "unit": "liters",
  "detectedDataType": "<Fuel (Diesel)|Fuel (Petrol)>",
  "supplierName": "PETRONAS",
  "confidence": <0.85 if found clear "TOTAL" label, 0.95 if summary page>,
  "reasoning": "<Page reference and source. Format: 'TOTAL CONSUMPTION - Petrol: X liters (Summary Page), Diesel: Y liters (Summary Page)'>",
  "secondaryValue": <TOTAL consumption for secondary fuel>,
  "secondaryDataType": "<Fuel (Diesel)|Fuel (Petrol)>"
}

CRITICAL RULES:
- value MUST be the TOTAL CONSUMPTION for primary fuel (1873.433 for Petrol if that's the total)
- secondaryValue MUST be the TOTAL CONSUMPTION for secondary fuel (12.602 for Diesel if that's the total)
- Both must be NUMBERS only, no strings
- confidence: HIGH (0.95) if clearly on summary page with "TOTAL" label
- reasoning MUST show source: e.g., "Found on Summary Page: Petrol Total 1873.433L, Diesel Total 12.602L"
- Return ONLY valid JSON, no explanations
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            detectedDataType: { 
              type: Type.STRING, 
              enum: ["Electricity", "Fuel (Diesel)", "Fuel (Petrol)", "Transport"]
            },
            supplierName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            secondaryValue: { type: Type.NUMBER },
            secondaryDataType: { 
              type: Type.STRING, 
              enum: ["Electricity", "Fuel (Diesel)", "Fuel (Petrol)", "Transport"]
            }
          },
          required: ["value", "unit", "detectedDataType", "confidence"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No text returned from Gemini.");
    }

    console.log('Raw Gemini response:', resultText);
    
    let extractedResult;
    try {
      extractedResult = JSON.parse(resultText) as ExtractionResult;
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response was:', resultText);
      throw new Error(`Invalid JSON response from Gemini: ${resultText.substring(0, 200)}`);
    }
    
    // Validate the response
    if (!extractedResult.value || !extractedResult.unit || !extractedResult.detectedDataType) {
      console.error('Invalid extraction result - missing required fields:', extractedResult);
      throw new Error('Gemini returned incomplete data. Please try another document.');
    }

    console.log('✅ OCR Extraction successful:', {
      value: extractedResult.value,
      unit: extractedResult.unit,
      type: extractedResult.detectedDataType,
      supplier: extractedResult.supplierName,
      confidence: extractedResult.confidence
    });

    return extractedResult;
  } catch (e: any) {
    console.error("❌ Gemini Extraction Error:", e);
    
    if (e.message?.includes("400") || e.message?.includes("INVALID_ARGUMENT")) {
      throw new Error("The AI was unable to process this file format or the file is too large. Please try a standard JPEG/PNG or a smaller PDF.");
    }
    
    throw new Error(e.message || "Failed to extract data from document.");
  }
};
