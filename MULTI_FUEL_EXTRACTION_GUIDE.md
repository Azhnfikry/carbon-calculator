# Multi-Fuel Extraction Enhancement

## Overview
The OCR extraction system now supports documents with **multiple fuel types** (petrol AND diesel) from a single document. This is particularly useful for Petronas SmartPay fuel receipts that contain both petrol and diesel consumption data.

## What's New

### Enhanced Extraction Logic
When a document contains both Petrol AND Diesel data:
- **Primary Quantity**: The larger fuel quantity is extracted as the main value
- **Secondary Quantity**: The smaller fuel quantity is returned separately
- **Reasoning**: Both fuel types and quantities are listed (e.g., "Petrol: 1886.035 liters, Diesel: 245.50 liters")

### Data Structure

The extraction now returns both primary and secondary values:

```typescript
{
  value: 1886.035,                           // Primary fuel quantity (larger)
  unit: "liters",
  detectedDataType: "Fuel (Petrol)",        // Primary fuel type
  supplierName: "PETRONAS",
  confidence: 0.90,
  reasoning: "Petrol: 1886.035 liters, Diesel: 245.50 liters",
  
  // NEW: Secondary fuel data
  secondaryValue: 245.50,                    // Secondary fuel quantity
  secondaryDataType: "Fuel (Diesel)"         // Secondary fuel type
}
```

### UI Changes

The **Data Extraction** component now displays:
1. **Extraction Details**: Shows the reasoning from Gemini with all detected fuels
2. **Primary Fuel**: Main extracted quantity and type
3. **Secondary Fuel Display** (if detected):
   - Shows secondary fuel type and quantity
   - Provides note: "You can enter this as a separate emission entry in the form below if needed"

## How It Works

### 1. Gemini Prompt Enhancement
The OCR extraction prompt includes specific instructions for multi-fuel documents:

```
SPECIAL INSTRUCTION FOR MULTI-FUEL DOCUMENTS:
If the document contains BOTH Petrol AND Diesel data (like Petronas SmartPay):
- Extract BOTH fuel types
- Return the PRIMARY/LARGEST quantity
- Include BOTH values in the reasoning with format: "Petrol: X liters, Diesel: Y liters"

FUEL TYPE DETECTION (Petronas SmartPay & fuel receipts):
- Look for BOTH: "Diesel", "Premium Diesel", "DIESEL"
- Look for BOTH: "Petrol", "RON95", "RON97", "PETROL", "PRIMAX", "V-POWER"
- If BOTH found: Extract both quantities
```

### 2. API Response Mapping
Files involved:
- **lib/ocr-extraction.ts**: Enhanced Gemini extraction with multi-fuel support
- **app/api/ocr/route.ts**: API endpoint returning all extracted fields
- **components/document-upload.tsx**: Maps response to ExtractedData interface

### 3. UI Display
Files involved:
- **components/data-extraction.tsx**: Displays both primary and secondary fuel data
- **types/emission.ts**: ExtractedData interface with secondaryValue and secondaryDataType fields

## Workflow Example: Petronas SmartPay Document

### Input Document
A Petronas fuel receipt containing:
- Petrol (PRIMAX 95): 1886.035 liters
- Diesel (Premium Diesel): 245.50 liters

### Processing Steps
1. User uploads the document via OCR upload
2. File is sent to `/api/ocr` endpoint
3. Gemini extracts BOTH fuel quantities
4. Response includes both values:
   - Primary: 1886.035 liters (Petrol)
   - Secondary: 245.50 liters (Diesel)
5. UI displays both values for user confirmation

### User Options
After extraction, user can:
1. **Use Primary Fuel**: Submit the petrol quantity as-is
2. **Create Two Entries**: 
   - Submit petrol (1886.035 liters)
   - Submit diesel (245.50 liters) as a separate emission entry
3. **Edit Values**: Modify any quantity before confirming

## Technical Details

### Response Schema
The Gemini response schema now includes optional secondary fields:

```typescript
responseSchema: {
  type: Type.OBJECT,
  properties: {
    value: { type: Type.NUMBER },
    unit: { type: Type.STRING },
    detectedDataType: { type: Type.STRING, enum: [...] },
    supplierName: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    reasoning: { type: Type.STRING },
    secondaryValue: { type: Type.NUMBER },        // NEW
    secondaryDataType: { type: Type.STRING, enum: [...] }  // NEW
  },
  required: ["value", "unit", "detectedDataType", "confidence"],
}
```

### Type Definitions (types/emission.ts)
```typescript
export interface ExtractedData {
  quantity: number;
  unit: string;
  date: string;
  confidence: number;
  dataType?: string;
  supplier?: string;
  reasoning?: string;
  secondaryValue?: number;           // NEW
  secondaryDataType?: string;        // NEW
}
```

## Supported Document Types

### Electricity Bills (Single Value)
- **Example**: TNB electricity bill
- **Response**: 
  - value: 69 kWh
  - detectedDataType: "Electricity"

### Single Fuel Receipts (Single Value)
- **Example**: Shell petrol-only receipt
- **Response**:
  - value: 1500 liters
  - detectedDataType: "Fuel (Petrol)"

### Multi-Fuel Receipts (Dual Values) ✨ NEW
- **Example**: Petronas SmartPay with both petrol and diesel
- **Response**:
  - value: 1886.035 (primary)
  - secondaryValue: 245.50 (secondary)
  - detectedDataType: "Fuel (Petrol)"
  - secondaryDataType: "Fuel (Diesel)"
  - reasoning: "Petrol: 1886.035 liters, Diesel: 245.50 liters"

## Testing the Feature

### Using OCR Debug Page
1. Go to `http://localhost:3000/ocr-debug`
2. Upload a Petronas fuel receipt with both petrol and diesel data
3. View the full JSON response including secondaryValue and secondaryDataType

### Expected Output (Petronas Example)
```json
{
  "extractedData": {
    "value": 1886.035,
    "unit": "liters",
    "detectedDataType": "Fuel (Petrol)",
    "supplierName": "PETRONAS",
    "confidence": 0.90,
    "reasoning": "Petrol: 1886.035 liters, Diesel: 245.50 liters",
    "secondaryValue": 245.50,
    "secondaryDataType": "Fuel (Diesel)"
  }
}
```

## Future Enhancements

Potential improvements:
- Auto-create two emission entries for multi-fuel documents
- Support for 3+ fuel types (e.g., petrol, diesel, LPG)
- Confidence scoring per fuel type
- Historical tracking of multi-fuel documents

## Files Modified

1. **lib/ocr-extraction.ts**
   - Enhanced Gemini prompt with multi-fuel instructions
   - Updated response schema to include secondaryValue and secondaryDataType

2. **lib/ocr-types.ts**
   - Added secondaryValue? and secondaryDataType? to ExtractionResult interface

3. **types/emission.ts**
   - Extended ExtractedData interface with multi-fuel fields
   - Added dataType, supplier, reasoning, secondaryValue, secondaryDataType

4. **components/document-upload.tsx**
   - Updated response mapping to include all new fields
   - Maps Gemini response to ExtractedData correctly

5. **components/data-extraction.tsx**
   - Enhanced UI to display reasoning from Gemini
   - Added secondary fuel display section when detected
   - Shows primary fuel type label
   - Includes note about creating separate emission entries

6. **app/api/ocr/route.ts**
   - Updated response to include all fields from Gemini extraction
   - Returns both value and quantity for compatibility
   - Includes secondaryValue and secondaryDataType in response

## Deployment Status

✅ **GitHub**: Pushed to main branch (commit a4572b1)
✅ **Build**: Successful compilation with no errors
⏳ **Vercel**: Ready to deploy
⏳ **Testing**: Ready for Petronas document testing

## Git Commit

```
Commit: a4572b1
Message: "enhance: Support multi-fuel extraction (petrol + diesel from single document)"
Changed Files: 6 files changed, 80 insertions(+), 14 deletions(-)
```

---

**Status**: ✅ Implementation Complete - Ready for Testing
