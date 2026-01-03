/**
 * Fetch emission factors directly from Aethera emission factors GitHub repository
 * Repository: https://github.com/Azhnfikry/aethera-emission-factors
 */

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/Azhnfikry/aethera-emission-factors/main"

export interface EmissionFactor {
  id?: string
  scope_id: number
  scope_name: string
  category: string
  activity_type: string
  unit: string
  factor: number
  source: string
  region: string
}

export interface Scope {
  id: number
  name: string
  description: string
  color: string
}

interface RawEmissionFactorCSV {
  scope_id: string
  scope_name: string
  category: string
  activity_type: string
  unit: string
  factor: string
  source: string
  region: string
}

// Cache for emission factors to reduce API calls
let emissionFactorsCache: EmissionFactor[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

/**
 * Fetch emission factors from GitHub repository
 */
export async function fetchEmissionFactorsFromGithub(): Promise<EmissionFactor[]> {
  // Return cached data if still valid
  if (emissionFactorsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log("Using cached emission factors")
    return emissionFactorsCache
  }

  try {
    console.log("Fetching emission factors from GitHub...")
    const response = await fetch(`${GITHUB_RAW_URL}/data/emission_factors.csv`)
    
    console.log("GitHub response status:", response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch emission factors: ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("CSV text length:", csvText.length)
    console.log("First 200 chars:", csvText.substring(0, 200))
    
    const factors = parseEmissionFactorsCSV(csvText)
    console.log("Parsed factors count:", factors.length)
    
    // Cache the results
    emissionFactorsCache = factors
    cacheTimestamp = Date.now()
    
    return factors
  } catch (error) {
    console.error("Error fetching emission factors from GitHub:", error)
    throw error
  }
}

/**
 * Fetch scopes from GitHub repository
 */
export async function fetchScopesFromGithub(): Promise<Scope[]> {
  try {
    const response = await fetch(`${GITHUB_RAW_URL}/data/scopes.csv`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch scopes: ${response.statusText}`)
    }

    const csvText = await response.text()
    const scopes = parseScopesCSV(csvText)
    
    return scopes
  } catch (error) {
    console.error("Error fetching scopes from GitHub:", error)
    throw error
  }
}

/**
 * Parse emission factors CSV data
 */
function parseEmissionFactorsCSV(csvText: string): EmissionFactor[] {
  const lines = csvText.trim().split("\n")
  console.log("CSV lines count:", lines.length)
  
  if (lines.length < 2) {
    console.warn("CSV has no data rows")
    return []
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  console.log("CSV headers:", headers)
  
  const factors: EmissionFactor[] = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    
    if (values.length < headers.length) {
      console.warn(`Row ${i} has insufficient columns`)
      continue
    }

    const row = Object.fromEntries(
      headers.map((header, idx) => [header, values[idx]])
    ) as unknown as RawEmissionFactorCSV

    try {
      factors.push({
        scope_id: parseInt(row.scope_id, 10),
        scope_name: row.scope_name,
        category: row.category,
        activity_type: row.activity_type,
        unit: row.unit,
        factor: parseFloat(row.factor),
        source: row.source,
        region: row.region,
      })
    } catch (e) {
      console.error(`Error parsing row ${i}:`, e, row)
    }
  }

  console.log("Successfully parsed factors:", factors.length)
  return factors
}

/**
 * Parse scopes CSV data
 */
function parseScopesCSV(csvText: string): Scope[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return []

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const scopes: Scope[] = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    
    if (values.length < headers.length) continue

    const idIdx = headers.indexOf("id")
    const nameIdx = headers.indexOf("name")
    const descIdx = headers.indexOf("description")
    const colorIdx = headers.indexOf("color")

    if (idIdx !== -1 && nameIdx !== -1) {
      scopes.push({
        id: parseInt(values[idIdx], 10),
        name: values[nameIdx],
        description: descIdx !== -1 ? values[descIdx] : "",
        color: colorIdx !== -1 ? values[colorIdx] : "#000000",
      })
    }
  }

  return scopes
}

/**
 * Get emission factor for a specific activity
 */
export async function getEmissionFactor(
  activityType: string,
  region: string = "US"
): Promise<EmissionFactor | null> {
  const factors = await fetchEmissionFactorsFromGithub()
  return (
    factors.find(
      (f) => f.activity_type.toLowerCase() === activityType.toLowerCase() && f.region === region
    ) || null
  )
}

/**
 * Get all emission factors by scope
 */
export async function getEmissionFactorsByScope(scopeId: number): Promise<EmissionFactor[]> {
  const factors = await fetchEmissionFactorsFromGithub()
  return factors.filter((f) => f.scope_id === scopeId)
}

/**
 * Get all emission factors by category
 */
export async function getEmissionFactorsByCategory(category: string): Promise<EmissionFactor[]> {
  const factors = await fetchEmissionFactorsFromGithub()
  return factors.filter((f) => f.category.toLowerCase() === category.toLowerCase())
}

/**
 * Clear the cache (useful for testing or force refresh)
 */
export function clearEmissionFactorsCache(): void {
  emissionFactorsCache = null
  cacheTimestamp = 0
}
