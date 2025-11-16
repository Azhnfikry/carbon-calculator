"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Edit, Trash2, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatEmissions } from "@/lib/emission-calculations"
import type { EmissionEntry } from "@/types/emission"
import type { User } from "@supabase/supabase-js"

interface EmissionTableProps {
  entries: EmissionEntry[]
  onDataChange: () => void
  user: User | null // Made user optional
}

export function EmissionTable({ entries, onDataChange, user }: EmissionTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const filteredEntries = entries.filter(
    (entry) =>
      entry.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.scope.toString().includes(searchTerm.toLowerCase()) ||
      entry.quantity.toString().includes(searchTerm.toLowerCase()) ||
      entry.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.co2Equivalent.toString().includes(searchTerm.toLowerCase()) ||
      new Date(entry.date).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    if (!user) {
      alert("Please login to delete entries.")
      return
    }

    if (!confirm("Are you sure you want to delete this entry?")) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("emissions").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error
      onDataChange()
    } catch (error) {
      console.error("Error deleting entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScopeBadgeColor = (scope: number) => {
    switch (scope) {
      case 1:
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case 2:
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case 3:
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Emission Entries
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Activity Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>CO₂ Equivalent</TableHead>
                <TableHead>Description</TableHead>
                {user && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user ? 9 : 8} className="text-center py-8 text-muted-foreground">
                    {searchTerm
                      ? "No entries match your search."
                      : !user
                        ? "Demo data shown. Login to see your own entries."
                        : "No emission entries found. Add your first entry!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.activity_type}</TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getScopeBadgeColor(entry.scope)}>
                        Scope {entry.scope}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.quantity.toFixed(2)}</TableCell>
                    <TableCell>{entry.unit}</TableCell>
                    <TableCell className="font-medium">{formatEmissions(entry.co2Equivalent)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.description || "-"}</TableCell>
                    {user && (
                      <TableCell>
                        {!entry.id.startsWith("demo-") ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={isLoading}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(entry.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">Demo</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
