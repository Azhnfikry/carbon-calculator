"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, LogOut, Plus, BarChart3, FileText, Leaf, Settings, Moon, Sun, LogIn, FileJson } from "lucide-react"
import { EmissionSummaryComponent } from "@/components/emission-summary"
import { EmissionChart } from "@/components/emission-chart"
import { EmissionForm } from "@/components/emission-form"
import { ChartsPage } from "@/components/charts-page"
import { EmissionTable } from "@/components/emission-table"
import { EmissionReport } from "@/components/emission-report"
import { createClient } from "@/lib/supabase/client"
import { calculateEmissionSummary } from "@/lib/emission-calculations"
import type { EmissionEntry, EmissionSummary } from "@/types/emission"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CarbonDashboardProps {
  user: User | null // Made user optional
  profile: any
}

export function CarbonDashboard({ user, profile }: CarbonDashboardProps) {
  const [entries, setEntries] = useState<EmissionEntry[]>([])
  const [summary, setSummary] = useState<EmissionSummary>({
    totalEmissions: 0,
    scope1: 0,
    scope2: 0,
    scope3: 0,
    byCategory: {},
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const loadEmissionEntries = async () => {
    try {
      if (!user) {
        // Return demo data for unauthenticated users
        const demoEntries: EmissionEntry[] = [
					{
						id: "demo-1",
						activity_type: "Electricity",
						category: "Energy",
						scope: 2,
						quantity: 1000,
						unit: "kWh",
						emissionFactor: 0.5,
						co2Equivalent: 500,
						date: "2024-01-15",
						description: "Office electricity consumption (Demo Data)",
					},
					{
						id: "demo-2",
						activity_type: "Natural Gas",
						category: "Energy",
						scope: 1,
						quantity: 500,
						unit: "m³",
						emissionFactor: 2.0,
						co2Equivalent: 1000,
						date: "2024-01-10",
						description: "Heating fuel consumption (Demo Data)",
					},
				];
        return demoEntries
      }

      const { data, error } = await supabase
        .from("emissions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error

      // Convert database format to EmissionEntry format
      const formattedEntries: EmissionEntry[] = (data || []).map((entry) => ({
				id: entry.id,
				activity_type: entry.activity_type,
				category: entry.category,
				scope: entry.scope,
				quantity: entry.quantity,
				unit: entry.unit,
				emissionFactor: entry.emission_factor,
				co2Equivalent: entry.co2_equivalent,
				date: entry.date,
				description: entry.description,
			}));

      return formattedEntries
    } catch (error) {
      console.error("Error loading emissions:", error)
      return []
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    const loadedEntries = await loadEmissionEntries()
    setEntries(loadedEntries)
    setSummary(calculateEmissionSummary(loadedEntries))
    setIsLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [user]) // Added user dependency to refresh when auth state changes

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh() // Refresh instead of redirecting to login
  }

  const handleLogin = () => {
    router.push("/auth/login")
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(entries, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "carbon-emissions-data.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Carbon Accounting</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {user ? profile?.company_name || "Personal" : "Demo Mode"}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-3 w-3 bg-primary rounded-full" />
                    {user ? profile?.full_name || user.email : "Guest User"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="flex items-center gap-2 bg-transparent"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark Mode
                      </>
                    )}
                  </DropdownMenuItem>
                  {user ? (
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleLogin}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Leaf className="h-5 w-5" />
              <div>
                <p className="font-medium">Demo Mode</p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  You're viewing demo data.{" "}
                  <button onClick={handleLogin} className="underline hover:no-underline">
                    Login
                  </button>{" "}
                  to save your own emission entries.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="add-entry" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="all-entries" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Entries
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EmissionSummaryComponent summary={summary} />
            <EmissionChart summary={summary} />
          </TabsContent>

          <TabsContent value="add-entry">
            <EmissionForm onEntryAdded={refreshData} user={user} />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsPage entries={entries} summary={summary} />
          </TabsContent>

          <TabsContent value="all-entries">
            <EmissionTable entries={entries} onDataChange={refreshData} user={user} />
          </TabsContent>

          <TabsContent value="reports">
            <EmissionReport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
