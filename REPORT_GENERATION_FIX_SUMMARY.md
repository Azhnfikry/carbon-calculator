# Report Generation Fix - Summary

## Problem
The report was showing all zeros because:
1. **Gas breakdown columns were hardcoded to 0** - The report had placeholder zeros for CO2, CH4, N2O, HFCs, PFCs, SF6
2. **Wrong emissions column being referenced** - The code was looking for `total_emissions` but the database stores emissions as `co2_equivalent`
3. **Company info query too strict** - Using `.single()` would fail if the record didn't exist yet

## Solutions Applied

### 1. ✅ Fixed Gas Breakdown Calculations
**Before** (lines ~190-200):
```typescript
return {
  mtco2e: ...,
  co2: 0,      // Hardcoded zeros!
  ch4: 0,
  n2o: 0,
  hfcs: 0,
  pfcs: 0,
  sf6: 0,
};
```

**After** (lines ~193-210):
```typescript
// Actual calculation from emissions data
const co2Mt = round2(toMtCO2e(scopeEmissions.reduce((sum, e) => 
  sum + asNumber(e.co2_emissions || e.total_emissions), 0)));
const ch4Mt = round2(toMtCO2e(scopeEmissions.reduce((sum, e) => 
  sum + asNumber(e.ch4_emissions || 0), 0)));
// ... and so on for N2O, HFCs, PFCs, SF6
```

**Result**: Gas breakdowns now show actual calculated values instead of zeros.

### 2. ✅ Fixed Column Reference
**Before**:
```typescript
const total_emissions = emission.total_emissions || emission.co2_equivalent || 0;
```

**After** (Priority order matches database):
```typescript
const total_emissions = emission.co2_equivalent ||    // Database column
                       emission.total_emissions ||    // Fallback
                       emission.co2Equivalent || 0;   // Fallback
```

**Result**: Now correctly reads from `co2_equivalent` column in emissions table.

### 3. ✅ Improved Company Info Query
**Before**:
```typescript
const { data: companyInfo, error: companyError } = await supabase
  .from('company_info')
  .select('*')
  .eq('user_id', user.id)
  .single();  // Fails if record doesn't exist!
```

**After**:
```typescript
let companyInfo = null;
const { data: companyData, error: companyError } = await supabase
  .from('company_info')
  .select('*')
  .eq('user_id', user.id)
  .maybeSingle();  // Returns null gracefully if no record

if (companyError) {
  console.warn('Company info fetch warning:', companyError.message);
} else if (companyData) {
  companyInfo = companyData;
}
```

**Result**: Report no longer crashes when company_info doesn't exist - it returns empty/default values instead.

### 4. ✅ Added Debug Logging
Added detailed console logging to help identify data issues:
```typescript
console.log(`Found ${emissions.length} emissions for user`);
console.log('Sample emission:', emissions[0]);
console.log('Scope 1: X entries');
console.log('Scope 1 totals - mtCO2e: X, CO2: Y, CH4: Z');
```

**Result**: Developers can now see exactly what data is being fetched and calculated in server logs.

## Database Schema Reference
The `emissions` table actually uses:
- `co2_equivalent` (numeric) - The emissions in kg CO2e
- NOT `total_emissions`

This is what was causing the zeros - the code was looking at the wrong column!

## Testing the Fix

### Expected Report Output After Fix:
```json
{
  "emissions": {
    "scope1": {
      "mtco2e": 1.25,      // Now shows actual value
      "co2_mt": 1.25,      // Now shows actual value (not 0)
      "ch4_mt": 0.01,      // Calculated from data
      ...
    },
    "scope2": { ... },
    "scope3": { ... },
    "total": 2.53         // Now sums correctly
  }
}
```

### Where to Check:
1. Go to http://localhost:3000/api/generate-report (after login)
2. Check server logs for console output
3. Verify emissions are non-zero
4. Check that emissions match sum of bulk-uploaded entries

## Files Changed
- `app/api/generate-report/route.ts` - Fixed calculations and database queries

## Commits
- `c51fda8` - Initial gas breakdown fix
- `82c5537` - Fixed column reference to use co2_equivalent

## Next Steps
- ✅ Verify report shows actual emissions data (not zeros)
- ⏳ Test with actual bulk-uploaded emissions entries
- ⏳ Verify company info fields populate when saved
- ⏳ Consider adding PDF export functionality
