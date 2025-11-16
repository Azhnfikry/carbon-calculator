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

    const prompt = `
You are an expert in carbon accounting. Analyze the provided file and extract ANY carbon emission parameters you can find.

MUST FIND AT LEAST ONE EMISSION PARAMETER. Look for any numbers, quantities, or measurements that could relate to carbon emissions.

CRITICAL: You MUST use EXACTLY these activity types and scopes that are available in the system:

SCOPE 1 ACTIVITY TYPES (Direct emissions):
- Natural Gas (units: kWh)
- Diesel (units: liters)
- Gasoline (units: liters)
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
- Hotel Stay (units: nights)
- Paper (units: kg)
- Water Supply (units: cubic meters)
- Waste to Landfill (units: kg)
- Waste Recycling (units: kg)

For each identified parameter, output the information in this exact structured format:
- Activity Type: [MUST BE ONE OF THE EXACT ACTIVITY TYPES LISTED ABOVE]
- Scope: [MUST BE 'Scope 1', 'Scope 2', or 'Scope 3' based on the activity type above]
- Quantity: [The numerical value you found, e.g., 342.00, 1500.5]
- Unit: [The unit of measurement, MUST MATCH the unit listed for that activity type above]

If you find multiple numbers, extract as many as possible. If you're unsure, make your best educated guess but ALWAYS use the exact activity types and scopes listed above.
ALWAYS output at least one parameter. Never say "No carbon emission parameters found. If there are multiple entries calculate the total emissions. In the description say that the user has to always cross check the information given."

ALWAYS REPLY IN JSON FORMAT with an array of objects.

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

    // Parse the response to extract structured data
    const extractedData = parseGeminiResponse(text);
    return extractedData;

  } catch (error) {
    console.error('Error processing file with Gemini:', error);
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
      const jsonMatch = cleanedResponse.match(/[\{\[][\s\S]*[\}\]]/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    }
    
    // Handle the JSON structure with general_overview array
    if (jsonData.general_overview && Array.isArray(jsonData.general_overview)) {
      return jsonData.general_overview.map((item: any) => ({
        'Activity Type': item['Activity Type'] || 'Unknown Activity',
        'Scope': item['Scope'] || 'Unknown',
        'Quantity': item['Quantity']?.toString() || '1',
        'Unit': item['Unit'] || 'unknown'
      }));
    }
    
    // Handle direct array format (like the example you provided)
    if (Array.isArray(jsonData)) {
      return jsonData.map((item: any) => ({
        'Activity Type': item['Activity Type'] || 'Unknown Activity',
        'Scope': item['Scope'] || 'Unknown',
        'Quantity': item['Quantity']?.toString() || '1',
        'Unit': item['Unit'] || 'unknown'
      }));
    }

    // Handle object format with other possible keys
    if (typeof jsonData === 'object' && jsonData !== null) {
      // Try to find any array in the object
      for (const key in jsonData) {
        if (Array.isArray(jsonData[key])) {
          return jsonData[key].map((item: any) => ({
            'Activity Type': item['Activity Type'] || 'Unknown Activity',
            'Scope': item['Scope'] || 'Unknown',
            'Quantity': item['Quantity']?.toString() || '1',
            'Unit': item['Unit'] || 'unknown'
          }));
        }
      }
    }

    // Fallback to text parsing if JSON parsing fails
    const lines = response.split('\n');
    const extractedData: any[] = [];
    let currentEntry: any = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Activity Type:')) {
        if (Object.keys(currentEntry).length > 0) {
          extractedData.push(currentEntry);
          currentEntry = {};
        }
        currentEntry['Activity Type'] = trimmedLine.split('Activity Type:')[1].trim();
      } else if (trimmedLine.startsWith('Scope:')) {
        currentEntry['Scope'] = trimmedLine.split('Scope:')[1].trim();
      } else if (trimmedLine.startsWith('Quantity:')) {
        currentEntry['Quantity'] = trimmedLine.split('Quantity:')[1].trim();
      } else if (trimmedLine.startsWith('Unit:')) {
        currentEntry['Unit'] = trimmedLine.split('Unit:')[1].trim();
      }
    }

    // Add the last entry if exists
    if (Object.keys(currentEntry).length > 0) {
      extractedData.push(currentEntry);
    }

    return extractedData.length > 0 ? extractedData : [];

  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}
