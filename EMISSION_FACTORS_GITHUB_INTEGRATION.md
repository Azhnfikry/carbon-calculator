# Emission Factors GitHub Integration

## Overview
The Carbon Calculator has been updated to directly fetch emission factors from the centralized Aethera Emission Factors GitHub repository instead of relying solely on the local database.

**Repository:** https://github.com/Azhnfikry/aethera-emission-factors

## Changes Made

### 1. New Module: `lib/emission-factors-github.ts`
Created a new module that handles fetching and parsing emission factors directly from the GitHub repository.

**Key Features:**
- Fetches emission factors from GitHub raw content URLs
- Implements intelligent CSV parsing
- Client-side caching (1-hour duration) to reduce API calls
- Fallback mechanisms for error handling
- TypeScript interfaces for type safety

**Exported Functions:**
- `fetchEmissionFactorsFromGithub()` - Fetch all emission factors
- `fetchScopesFromGithub()` - Fetch scope definitions
- `getEmissionFactor(activityType, region)` - Get a specific factor
- `getEmissionFactorsByScope(scopeId)` - Get factors by scope
- `getEmissionFactorsByCategory(category)` - Get factors by category
- `clearEmissionFactorsCache()` - Force refresh cache

### 2. Updated Component: `components/emission-form.tsx`
Modified the emission form to use GitHub emission factors.

**Changes:**
- Imports `fetchEmissionFactorsFromGithub` from the new module
- Updated `loadEmissionFactors()` to fetch from GitHub
- Fallback to Supabase database if GitHub fetch fails
- Updated filter logic to use `scope_id` (GitHub field naming)
- Maintains all existing form functionality

### 3. Updated API Route: `app/api/generate-report/route.ts`
Modified the report generation endpoint to use GitHub emission factors.

**Changes:**
- Removed hardcoded `EMISSION_FACTORS` object
- Added import and call to `fetchEmissionFactorsFromGithub()`
- Implements fallback to hardcoded factors if GitHub is unavailable
- Creates a dynamic lookup map from GitHub factors
- Used in report generation calculations

## Data Flow

```
GitHub Repository (aethera-emission-factors)
          ↓
CSV Files in /data directory
          ↓
emission-factors-github.ts (fetch & parse)
          ↓
          ├─→ emission-form.tsx (user input)
          └─→ generate-report/route.ts (report generation)
          ↓
Fallback to Supabase if fetch fails
```

## Benefits

✅ **Centralized Data Source** - Single source of truth for emission factors  
✅ **Easy Updates** - Update factors in one place, automatically used everywhere  
✅ **Version Control** - Track changes to emission factors in Git  
✅ **Collaboration** - Team can contribute factor updates via GitHub  
✅ **Caching** - Reduces unnecessary network calls with intelligent caching  
✅ **Graceful Fallback** - Works with Supabase if GitHub is unavailable  

## GitHub Repository Structure

The emission factors repository contains:

```
aethera-emission-factors/
├── data/
│   ├── scopes.csv
│   ├── emission_factors.csv
│   └── scope_categories.csv
├── supabase/
│   └── schema.sql
├── DATA_DICTIONARY.md
└── README.md
```

### CSV File Formats

**emission_factors.csv:**
```
scope_id, scope_name, category, activity_type, unit, factor, source, region
1, Scope 1 (Direct), Stationary Combustion, Natural Gas, kWh, 0.18385, EPA, US
2, Scope 2 (Indirect Energy), Purchased Electricity, Electricity, kWh, 0.4, EPA, US
3, Scope 3 (Other Indirect), Business Travel, Business Travel - Air, km, 0.255, DEFRA, UK
```

**scopes.csv:**
```
id, name, description, color
1, Scope 1 (Direct), Direct GHG emissions, #ef4444
2, Scope 2 (Indirect Energy), Indirect energy emissions, #f97316
3, Scope 3 (Other Indirect), Other indirect emissions, #3b82f6
```

## Configuration

No additional configuration needed! The module automatically:
- Connects to GitHub using the repository URL
- Caches data for 1 hour
- Falls back gracefully if GitHub is unavailable

## Error Handling

The application implements multiple layers of error handling:

1. **Primary:** Fetch from GitHub with caching
2. **Fallback 1:** Load from Supabase database if GitHub fails
3. **Fallback 2:** Use hardcoded emission factors (API routes only)
4. **Logging:** All errors are logged to console for debugging

## Testing

To test the GitHub integration:

```typescript
import { fetchEmissionFactorsFromGithub, getEmissionFactor } from '@/lib/emission-factors-github'

// Test fetching all factors
const allFactors = await fetchEmissionFactorsFromGithub()
console.log('Total factors:', allFactors.length)

// Test fetching specific factor
const electricityFactor = await getEmissionFactor('Electricity', 'US')
console.log('Electricity factor:', electricityFactor)

// Clear cache for testing
import { clearEmissionFactorsCache } from '@/lib/emission-factors-github'
clearEmissionFactorsCache()
```

## Performance

- **Cache Duration:** 1 hour (configurable in `CACHE_DURATION`)
- **Network Calls:** Only 1 per user session (or per hour, whichever comes first)
- **Parsing:** Client-side CSV parsing (lightweight)
- **File Size:** ~10-50 KB per CSV file

## Future Enhancements

- Real-time updates via GitHub webhooks
- Support for multiple regions/countries
- Factor version management
- User-custom factors overlay on top of GitHub factors
- Analytics on factor usage

## Troubleshooting

### Emission factors not loading
1. Check browser console for errors
2. Verify GitHub repository is accessible
3. Check network tab in DevTools
4. System will automatically fallback to Supabase

### Outdated factors
1. Clear the cache: `clearEmissionFactorsCache()`
2. Refresh the page
3. Check that GitHub repository has latest data

### Performance issues
- Increase `CACHE_DURATION` to reduce API calls
- Implement server-side caching layer
- Use CDN to serve GitHub content

## References

- [Aethera Emission Factors Repository](https://github.com/Azhnfikry/aethera-emission-factors)
- [Emission Factors GitHub Module](./lib/emission-factors-github.ts)
- [Updated Emission Form](./components/emission-form.tsx)
- [Updated Report API](./app/api/generate-report/route.ts)
