import type { EmissionEntry } from "@/types/emission"

const STORAGE_KEY = "carbon-accounting-data"

export function saveEmissionEntries(entries: EmissionEntry[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }
}

export function loadEmissionEntries(): EmissionEntry[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }
  return []
}

export function addEmissionEntry(entry: EmissionEntry): void {
  const entries = loadEmissionEntries()
  entries.push(entry)
  saveEmissionEntries(entries)
}

export function deleteEmissionEntry(id: string): void {
  const entries = loadEmissionEntries()
  const filtered = entries.filter((entry) => entry.id !== id)
  saveEmissionEntries(filtered)
}
