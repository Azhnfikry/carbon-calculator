// OCR API route for document-based extraction
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, JPG, or PNG' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // For MVP, simulate OCR extraction
    // TODO: Integrate with actual OCR service (Google Vision API, AWS Textract, etc.)
    const simulatedExtraction = {
      quantity: Math.floor(Math.random() * 10000) + 1000,
      unit: ['kWh', 'liters', 'km', 'gallons', 'Nm³', 'kg'][
        Math.floor(Math.random() * 6)
      ],
      date: new Date().toISOString().split('T')[0],
      confidence: 0.85 + Math.random() * 0.14, // 0.85 - 0.99
    };

    return NextResponse.json({
      success: true,
      extractedData: simulatedExtraction,
      fileName: file.name,
      fileSize: file.size,
      message: 'OCR extraction completed successfully',
    });
  } catch (error) {
    console.error('OCR extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
