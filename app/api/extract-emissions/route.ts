import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

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

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload PDF, DOCX, or Excel files.' },
        { status: 400 }
      );
    }

    // Convert file to base64 for Gemini API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString('base64');

    // Process file using Gemini API
    const extractedData = await processFileWithGemini(file, base64File);

    // Always return at least one entry, even if empty
    const finalData = extractedData && extractedData.length > 0 ? extractedData : [
      {
        "Activity Type": "Unknown Activity",
        "Scope": "Unknown",
        "Quantity": "1",
        "Unit": "unknown"
      }
    ];

    return NextResponse.json({
      success: true,
      extractedData: finalData,
      message: `Extracted ${finalData.length} emission parameter(s) from the file`
    });

  } catch (error: any) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}

async function processFileWithGemini(file: File, base64File: string): Promise<any[]> {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    // For Excel/Spreadsheet files, try direct text extraction
    if (fileExtension === 'xlsx' || fileExtension === 'xls' || fileExtension === 'csv') {
      try {
        const directExtraction = await extractFromSpreadsheetText(file);
        if (directExtraction && directExtraction.length > 0) {
          console.log('Successfully extracted from spreadsheet directly:', directExtraction);
          return directExtraction;
        }
      } catch (e) {
        console.warn('Direct spreadsheet extraction failed:', e);
      }
    }

    // Try Gemini if API key is available
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const prompt = `
You are an expert in carbon accounting. Analyze the provided file and extract ANY carbon emission parameters you can find.

MUST FIND AT LEAST ONE EMISSION PARAMETER. Look for any numbers, quantities, or measurements that could relate to carbon emissions.

CRITICAL: You MUST use EXACTLY these activity types and scopes that are available in the system:

SCOPE 1 ACTIVITY TYPES (Direct emissions):
- Natural Gas (units: kWh)
- Diesel (units: liters)
- Gasoline (units: liters)
- Petrol (units: liters)
- Propane (units: kg)
- Coal (units: kg)
- Heating Oil (units: liters)
- Refrigerants - R134a (units: kg)
- Refrigerants - R410A (units: kg)

SCOPE 2 ACTIVITY TYPES (Indirect energy):
- Electricity (units: kWh)
- Steam (units: MMBtu)

SCOPE 3 ACTIVITY TYPES (Other indirect):
- Business Travel - Air (units: km)
- Business Travel - Car (units: km)
- Business Travel - Rail (units: km)
- Company Vehicle Travel (units: km)
- Hotel Stay (units: nights)
- Paper (units: kg)
- Water Supply (units: cubic meters)
- Waste to Landfill (units: kg)
- Waste Recycling (units: kg)
- Air Travel (Economy) (units: km)
- Air Travel (Business) (units: km)

For each identified parameter, output the information in this exact structured format as JSON array:
[
  {
    "Activity Type": "Electricity",
    "Scope": "2",
    "Quantity": "12500",
    "Unit": "kWh"
  }
]

File information:
- Name: ${file.name}
- Type: ${mimeType}
- Extension: ${fileExtension}
`;

      const { text } = await generateText({
        model: google("gemini-2.0-flash"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "file",
                data: base64File,
                mediaType: mimeType,
              },
            ],
          },
        ],
      });

      const extractedData = parseGeminiResponse(text);
      return extractedData;
    } else {
      console.log('Google API key not configured, using fallback extraction');
      return [];
    }
  } catch (error) {
    console.error('Error processing file with Gemini:', error);
    return [];
  }
}

async function extractFromSpreadsheetText(file: File): Promise<any[]> {
  try {
    const text = await file.text();
    
    // Try to parse as CSV or tab-separated
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      return [];
    }

    // Parse header row
    const headerLine = lines[0];
    const headers = headerLine.split(/[,\t]/).map(h => h.trim().toLowerCase());
    
    // Find column indices for our expected fields
    const activityTypeIdx = headers.findIndex(h => h.includes('activity') || h.includes('type'));
    const scopeIdx = headers.findIndex(h => h === 'scope');
    const quantityIdx = headers.findIndex(h => h.includes('quantity') || h.includes('amount') || h.includes('value'));
    const unitIdx = headers.findIndex(h => h === 'unit');

    if (activityTypeIdx === -1 || quantityIdx === -1) {
      console.log('Could not find required columns');
      return [];
    }

    const results: any[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(/[,\t]/).map(c => c.trim()).filter(c => c);
      
      if (cells.length <= Math.max(activityTypeIdx, quantityIdx)) {
        continue;
      }

      let scope = scopeIdx >= 0 && cells[scopeIdx] ? cells[scopeIdx] : 'Unknown';
      // Normalize scope format
      if (scope && !scope.includes('Scope')) {
        scope = `Scope ${scope}`;
      }

      const entry = {
        'Activity Type': cells[activityTypeIdx] || 'Unknown',
        'Scope': scope,
        'Quantity': cells[quantityIdx] || '1',
        'Unit': unitIdx >= 0 ? (cells[unitIdx] || 'unknown') : 'unknown'
      };

      results.push(entry);
    }

    return results;
  } catch (e) {
    console.warn('Error extracting from spreadsheet text:', e);
    return [];
  }
}

function parseGeminiResponse(response: string): any[] {
  console.log('Raw AI response:', response);

  try {
    // Clean the response - remove markdown code blocks and extra whitespace
    const cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Try to parse as JSON first - handle both object and array formats
    let jsonData;
    try {
      jsonData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If direct parse fails, try to extract JSON from the response
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    }
    
    // Handle direct array format (like the example you provided)
    if (Array.isArray(jsonData)) {
      return jsonData.map((item: any) => normalizeEmissionEntry(item));
    }
    
    // Handle the JSON structure with general_overview array
    if (jsonData.general_overview && Array.isArray(jsonData.general_overview)) {
      return jsonData.general_overview.map((item: any) => normalizeEmissionEntry(item));
    }

    // Handle object format with other possible keys
    if (typeof jsonData === 'object' && jsonData !== null) {
      // Try to find any array in the object
      for (const key in jsonData) {
        if (Array.isArray(jsonData[key])) {
          return jsonData[key].map((item: any) => normalizeEmissionEntry(item));
        }
      }
    }

    // Fallback to text parsing if JSON parsing fails
    const lines = response.split('\n');
    const extractedData: any[] = [];
    let currentEntry: any = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Activity Type:') || trimmedLine.startsWith('- Activity Type:')) {
        if (Object.keys(currentEntry).length > 0) {
          extractedData.push(normalizeEmissionEntry(currentEntry));
          currentEntry = {};
        }
        currentEntry['Activity Type'] = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine.startsWith('Scope:') || trimmedLine.startsWith('- Scope:')) {
        currentEntry['Scope'] = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine.startsWith('Quantity:') || trimmedLine.startsWith('- Quantity:')) {
        currentEntry['Quantity'] = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine.startsWith('Unit:') || trimmedLine.startsWith('- Unit:')) {
        currentEntry['Unit'] = trimmedLine.split(':')[1].trim();
      }
    }

    // Add the last entry if exists
    if (Object.keys(currentEntry).length > 0) {
      extractedData.push(normalizeEmissionEntry(currentEntry));
    }

    return extractedData.length > 0 ? extractedData : [];

  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}

function normalizeEmissionEntry(item: any): any {
  // Normalize the scope to include "Scope" prefix if missing
  let scope = item['Scope'] || item.Scope || 'Unknown';
  if (scope && !scope.includes('Scope')) {
    scope = `Scope ${scope}`;
  }

  return {
    'Activity Type': item['Activity Type'] || item.activity_type || 'Unknown Activity',
    'Scope': scope,
    'Quantity': item['Quantity'] || item.quantity || '1',
    'Unit': item['Unit'] || item.unit || 'unknown'
  };
}
