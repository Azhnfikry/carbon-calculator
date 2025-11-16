import type { EmissionEntry, EmissionSummary } from "@/types/emission"

export function calculateCO2Equivalent(activityData: number, emissionFactor: number): number {
  return activityData * emissionFactor
}

export function calculateEmissionSummary(entries: EmissionEntry[]): EmissionSummary {
  const summary: EmissionSummary = {
    totalEmissions: 0,
    scope1: 0,
    scope2: 0,
    scope3: 0,
    byCategory: {},
  }

  entries.forEach((entry) => {
    summary.totalEmissions += entry.co2Equivalent

    // Sum by scope (scope is now a simple number)
    if (entry.scope === 1) summary.scope1 += entry.co2Equivalent
    if (entry.scope === 2) summary.scope2 += entry.co2Equivalent
    if (entry.scope === 3) summary.scope3 += entry.co2Equivalent

    // Sum by category (category is now a simple string)
    if (!summary.byCategory[entry.category]) {
      summary.byCategory[entry.category] = 0
    }
    summary.byCategory[entry.category] += entry.co2Equivalent
  })

  return summary
}

export function formatEmissions(value: number): string {
  // Convert to tons if value is 1000 kg or more (1 ton = 1000 kg)
  if (value >= 1000) {
    const tons = value / 1000;
    return `${tons.toFixed(2)} t CO₂e`;
  }
  return `${value.toFixed(2)} kg CO₂e`;
}

export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return "0.0%"
  return `${((value / total) * 100).toFixed(1)}%`
}
