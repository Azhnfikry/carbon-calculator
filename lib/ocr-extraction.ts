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
You are an expert at extracting emissions data from utility bills, invoices, and fuel consumption documents.

ANALYZE THIS DOCUMENT AND EXTRACT THE MAIN CONSUMPTION QUANTITY:

RULES:
1. Look for these QUANTITY FIELDS (in priority order):
   - "Penggunaan" (Malaysian bills)
   - "Usage" / "Consumption" / "Total Usage"
   - "Quantity" / "KUANTITI"
   - "Volume" / "Amount"
   - "kWh" / "kWH" / "KWH" (for electricity)
   - "Liters" / "LTR" / "L" (for fuel)

2. IGNORE:
   - Previous balances
   - Payment amounts
   - Dates alone (unless explicitly labeled as usage)
   - Charges/costs/prices

3. DOCUMENT TYPE DETECTION:
   - If has "kWh", "Electricity", "Electric", "Kilowatt": Type = "Electricity"
   - If has "Fuel", "Petrol", "Diesel", "Petrol", "Liter", "LTR": Type = "Fuel (Diesel)" or "Fuel (Petrol)"
   - If has "Travel", "Transport", "km": Type = "Transport"

4. SUPPLIER DETECTION:
   - Extract company name from bill header
   - Common: TNB, Petronas, Tenaga Nasional Berhad, etc.

5. OUTPUT FORMAT - MUST BE VALID JSON:
{
  "value": <number only, no units>,
  "unit": "<kWh or liters or km>",
  "detectedDataType": "<Electricity|Fuel (Diesel)|Fuel (Petrol)|Transport>",
  "supplierName": "<company name>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<explain what you found>"
}

IMPORTANT:
- value must be a NUMBER (not string)
- confidence should be HIGH (0.8+) if clearly labeled
- If unsure, return confidence < 0.5
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
            reasoning: { type: Type.STRING }
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
