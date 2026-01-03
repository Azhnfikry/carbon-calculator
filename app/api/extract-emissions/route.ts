import { NextRequest, NextResponse } from 'next/server';

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
          console.log('Successfully extracted from CSV:', extractedData);
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

    // For Excel files, provide instruction
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return NextResponse.json({
        success: false,
        error: 'Please export your Excel file as CSV first. Upload the CSV file for best results.',
        hint: 'File → Export → CSV format'
      }, { status: 400 });
    }

    // Fallback
    return NextResponse.json({
      success: false,
      error: 'Please upload a CSV file. Convert your data to CSV format.',
      hint: 'Open in Excel, then Save As → CSV format'
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
