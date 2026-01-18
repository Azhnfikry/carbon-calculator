// OCR API route for document-based extraction using Google Gemini
import { NextRequest, NextResponse } from 'next/server';
import { extractDataFromDocument } from '@/lib/ocr-extraction';

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

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');

    // Call Google Gemini for OCR extraction
    const extractedData = await extractDataFromDocument(base64String, file.type);

    return NextResponse.json({
      success: true,
      extractedData: {
        quantity: extractedData.value,
        unit: extractedData.unit,
        date: new Date().toISOString().split('T')[0], // Use today's date
        confidence: extractedData.confidence,
        dataType: extractedData.detectedDataType,
        supplier: extractedData.supplierName,
        reasoning: extractedData.reasoning,
      },
      fileName: file.name,
      fileSize: file.size,
      message: 'OCR extraction completed successfully',
    });
  } catch (error: any) {
    console.error('OCR extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process document' },
      { status: 500 }
    );
  }
}
