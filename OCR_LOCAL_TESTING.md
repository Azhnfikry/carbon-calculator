# OCR Integration - Local Testing Guide

## ✅ Development Server Status
- **Status**: Running
- **URL**: http://localhost:3000
- **Port**: 3000

## 🧪 Testing the OCR Feature Locally

### 1. Access the Application
Open http://localhost:3000 in your browser

### 2. Navigate to Dashboard
- Login or sign up
- Go to Dashboard → Add Emission Entry

### 3. Test OCR Upload Feature
The new OCR feature is available in the emission form:

#### Option A: Manual Entry (Traditional)
- Select scope, activity type, quantity
- System calculates CO₂ equivalent

#### Option B: OCR Document Upload (NEW)
- Click "Extract from Document (OCR)" button
- Upload a PDF, JPG, or PNG file
- The system will:
  - Extract quantity, unit, and date
  - Display confidence score
  - Allow editing before submission
  - Auto-fill the emission form fields

### 4. Test Files to Try
You can test with:
- Utility bills (PDF)
- Receipts (JPG/PNG)
- Invoice images
- Any document with numbers

### 5. OCR Components Created
✅ `components/document-upload.tsx` - File upload interface
✅ `components/data-extraction.tsx` - Extracted data display
✅ `app/api/ocr/route.ts` - OCR API endpoint
✅ `types/emission.ts` - ExtractedData interface

### 6. API Endpoint
**POST** `/api/ocr` - Submit file for OCR processing
- Accepts: PDF, JPG, PNG
- Max size: 10MB
- Returns: { extractedData: { quantity, unit, date, confidence } }

### 7. Current Implementation
- **MVP Stage**: Simulated OCR extraction
- **Confidence Score**: 85-99% (simulated)
- **Next Step**: Integrate real OCR API (Google Vision, AWS Textract)

## 🔧 To Test Functionality

### Test Case 1: Upload Document
1. Click "Extract from Document (OCR)"
2. Upload a test file (PDF/JPG/PNG)
3. Verify extracted data appears in the form

### Test Case 2: Edit Extracted Data
1. Change quantity, unit, or date
2. Verify form updates correctly

### Test Case 3: Submit Entry
1. Select activity type to get emission factor
2. Click "Add Emission Entry"
3. Verify entry is saved to database

## 📊 Current OCR Status
- ✅ Components integrated into emission form
- ✅ API route created and tested
- ✅ TypeScript types defined
- ✅ GitHub: Committed and pushed
- ⏳ Vercel: Ready for deployment
- ⏳ Real OCR API: Can be integrated in next phase

## 🚀 Next Steps After Local Testing
1. Test all OCR features locally
2. Deploy to Vercel: `vercel deploy`
3. Test on Vercel staging environment
4. Deploy to production
5. Integrate real OCR service (optional)

---
**Local Testing Started**: January 18, 2026
**Development Server**: http://localhost:3000
