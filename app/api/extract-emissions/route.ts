import { NextRequest, NextResponse } from 'next/server';

// Only import Gemini if API key is available
let generateText: any = null;
let google: any = null;

if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  try {
    const aiModule = require('ai');
    const googleModule = require('@ai-sdk/google');
    generateText = aiModule.generateText;
    google = googleModule.google;
    console.log('✅ Gemini API modules loaded successfully');
  } catch (e) {
    console.warn('⚠️ AI modules not available:', e);
  }
} else {
  console.log('⚠️ GOOGLE_GENERATIVE_AI_API_KEY not set - Gemini disabled');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // For CSV files, try direct text extraction
    if (fileExtension === 'csv' || file.type === 'text/csv') {
      try {
        const textContent = await file.text();
        const extractedData = parseCSVContent(textContent);
        if (extractedData && extractedData.length > 0) {
          console.log('✅ Successfully extracted from CSV:', extractedData);
          return NextResponse.json({
            success: true,
            emissions: extractedData,
            message: `Extracted ${extractedData.length} emission entries from CSV`
          });
        }
      } catch (e) {
        console.error('CSV parsing error:', e);
      }
    }

    // For other file types (PDF, DOCX), try Gemini if API key is available
    // Note: Excel/XLSX not supported by Gemini, skip to fallback
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY && generateText && google && 
        (fileExtension === 'pdf' || fileExtension === 'docx')) {
      console.log('🤖 Using Gemini API for', fileExtension, 'extraction...');
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64File = buffer.toString('base64');
        const extractedData = await processFileWithGemini(file, base64File);
        
        if (extractedData && extractedData.length > 0) {
          console.log('✅ Successfully extracted with Gemini:', extractedData);
          return NextResponse.json({
            success: true,
            emissions: extractedData,
            message: `Extracted ${extractedData.length} emission entries using Gemini`
          });
        }
      } catch (e) {
        console.error('Gemini extraction error:', e);
      }
    }

    // Fallback message
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return NextResponse.json({
        success: false,
        error: 'Excel extraction requires Google API key. Convert to CSV or configure GOOGLE_GENERATIVE_AI_API_KEY.',
        hint: 'File → Export → CSV format'
      }, { status: 400 });
    }

    if (fileExtension === 'pdf' || fileExtension === 'docx') {
      return NextResponse.json({
        success: false,
        error: 'PDF/DOCX extraction requires Google Gemini API. Configure GOOGLE_GENERATIVE_AI_API_KEY environment variable.',
        hint: 'Or convert your file to CSV for immediate support'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Unsupported file format. Supported: CSV, PDF, DOCX, Excel',
      hint: 'CSV files work immediately. Other formats require Google API key.'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}

function parseCSVContent(csvText: string): any[] {
  try {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      console.log('CSV has insufficient lines:', lines.length);
      return [];
    }

    // Parse header row - handle both comma and tab separated
    const headerLine = lines[0];
    let headers: string[];
    
    if (headerLine.includes('\t')) {
      headers = headerLine.split('\t').map(h => h.trim().toLowerCase());
    } else {
      headers = headerLine.split(',').map(h => h.trim().toLowerCase());
    }
    
    console.log('CSV Headers detected:', headers);
    
    // Find column indices
    const activityTypeIdx = headers.findIndex(h => 
      h.includes('activity') || h.includes('type')
    );
    const scopeIdx = headers.findIndex(h => 
      h === 'scope'
    );
    const quantityIdx = headers.findIndex(h => 
      h.includes('quantity') || h.includes('amount')
    );
    const unitIdx = headers.findIndex(h => 
      h === 'unit'
    );

    console.log('Column indices:', { activityTypeIdx, scopeIdx, quantityIdx, unitIdx });

    if (activityTypeIdx === -1 || quantityIdx === -1) {
      console.log('Could not find required columns');
      return [];
    }

    const results: any[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      let cells: string[];
      if (line.includes('\t')) {
        cells = line.split('\t').map(c => c.trim());
      } else {
        cells = line.split(',').map(c => c.trim());
      }

      if (cells.filter(c => c).length === 0) continue;
      if (activityTypeIdx >= cells.length || quantityIdx >= cells.length) continue;

      const activityType = cells[activityTypeIdx]?.trim();
      const quantity = cells[quantityIdx]?.trim();
      
      if (!activityType || !quantity) continue;

      let scope = scopeIdx >= 0 && cells[scopeIdx] ? cells[scopeIdx].trim() : 'Unknown';
      if (scope && scope.match(/^\d$/)) {
        scope = `Scope ${scope}`;
      }

      const unit = unitIdx >= 0 && cells[unitIdx] ? cells[unitIdx].trim() : 'unknown';

      results.push({
        'Activity Type': activityType,
        'Scope': scope,
        'Quantity': quantity,
        'Unit': unit
      });
    }

    console.log(`Parsed ${results.length} rows from CSV`);
    return results;
  } catch (e) {
    console.error('Error parsing CSV:', e);
    return [];
  }
}

async function processFileWithGemini(file: File, base64File: string): Promise<any[]> {
  if (!generateText || !google) {
    console.error('Gemini not available');
    return [];
  }

  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const prompt = `You are a carbon accounting expert. Extract carbon emission data from this document.

REQUIRED FIELDS for each emission entry:
- Activity Type: The type of activity (e.g., Electricity, Diesel, Business Travel - Air)
- Scope: The GHG Protocol scope (1, 2, or 3)
- Quantity: The numerical value
- Unit: The measurement unit (kWh, liters, km, etc.)

VALID ACTIVITY TYPES:
Scope 1: Natural Gas, Diesel, Gasoline, Petrol, Propane, Coal, Heating Oil, Refrigerants - R134a, Refrigerants - R410A
Scope 2: Electricity, Steam
Scope 3: Business Travel - Air, Business Travel - Car, Business Travel - Rail, Company Vehicle Travel, Hotel Stay, Paper, Water Supply, Waste to Landfill, Waste Recycling, Air Travel (Economy), Air Travel (Business)

Extract ALL emissions found and return as JSON array:
[
  {
    "Activity Type": "Electricity",
    "Scope": "2",
    "Quantity": "12500",
    "Unit": "kWh"
  }
]

File: ${file.name}`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "file", data: base64File, mediaType: mimeType }
          ]
        }
      ]
    });

    return parseGeminiResponse(text);
  } catch (error) {
    console.error('Gemini API error:', error);
    return [];
  }
}

function parseGeminiResponse(response: string): any[] {
  try {
    // Remove markdown code blocks
    const cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Try to extract JSON array
    const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('No JSON array found in response');
      return [];
    }

    const jsonData = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(jsonData)) {
      console.warn('Parsed data is not an array');
      return [];
    }

    return jsonData.map((item: any) => ({
      'Activity Type': item['Activity Type'] || item.activity_type || 'Unknown',
      'Scope': normalizeScope(item['Scope'] || item.scope),
      'Quantity': String(item['Quantity'] || item.quantity || '1'),
      'Unit': item['Unit'] || item.unit || 'unknown'
    }));
  } catch (e) {
    console.error('Error parsing Gemini response:', e);
    return [];
  }
}

function normalizeScope(scope: any): string {
  if (!scope) return 'Unknown';
  const scopeStr = String(scope).trim();
  if (scopeStr.match(/^\d$/)) {
    return `Scope ${scopeStr}`;
  }
  return scopeStr;
}
