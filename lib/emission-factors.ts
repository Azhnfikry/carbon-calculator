

export const EMISSION_SCOPES: any[] = [
  {
    id: 1,
    name: "Scope 1 (Direct)",
    description: "Direct GHG emissions from sources owned or controlled by the organization",
    color: "#ef4444",
  },
  {
    id: 2,
    name: "Scope 2 (Indirect Energy)",
    description: "Indirect GHG emissions from purchased electricity, steam, heating and cooling",
    color: "#f97316",
  },
  {
    id: 3,
    name: "Scope 3 (Other Indirect)",
    description: "All other indirect GHG emissions in the value chain",
    color: "#3b82f6",
  },
]

export const EMISSION_CATEGORIES: any[] = [
  {
    id: "energy",
    name: "Energy",
    description: "Electricity, gas, and other energy consumption",
    defaultUnit: "kWh",
    defaultEmissionFactor: 0.5, // kg CO2e per kWh
  },
  {
    id: "transportation",
    name: "Transportation",
    description: "Vehicle fuel consumption and travel",
    defaultUnit: "km",
    defaultEmissionFactor: 0.2, // kg CO2e per km
  },
  {
    id: "waste",
    name: "Waste",
    description: "Waste generation and disposal",
    defaultUnit: "kg",
    defaultEmissionFactor: 0.5, // kg CO2e per kg
  },
  {
    id: "water",
    name: "Water",
    description: "Water consumption and treatment",
    defaultUnit: "L",
    defaultEmissionFactor: 0.001, // kg CO2e per L
  },
  {
    id: "materials",
    name: "Materials",
    description: "Raw materials and supplies",
    defaultUnit: "kg",
    defaultEmissionFactor: 1.5, // kg CO2e per kg
  },
]
