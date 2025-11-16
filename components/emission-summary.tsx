"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Leaf, Trash2, Zap, TrendingUp } from "lucide-react"
import type { EmissionSummary } from "@/types/emission"
import { formatEmissions, calculatePercentage } from "@/lib/emission-calculations"

interface EmissionSummaryProps {
  summary: EmissionSummary
}

export function EmissionSummaryComponent({ summary }: EmissionSummaryProps) {
  const scopes = [
    {
      id: 1,
      name: "Scope 1",
      fullName: "Direct Emissions",
      description: "Direct GHG emissions from owned or controlled sources",
      value: summary.scope1,
      icon: Zap,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      borderColor: "border-chart-1/20",
    },
    {
      id: 2,
      name: "Scope 2",
      fullName: "Indirect Energy",
      description: "Indirect GHG emissions from purchased energy",
      value: summary.scope2,
      icon: Leaf,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      borderColor: "border-chart-2/20",
    },
    {
      id: 3,
      name: "Scope 3",
      fullName: "Other Indirect",
      description: "All other indirect GHG emissions in value chain",
      value: summary.scope3,
      icon: Trash2,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      borderColor: "border-chart-3/20",
    },
  ]

  const activeScopes = scopes.filter((scope) => scope.value > 0)
  const totalCategories = Object.keys(summary.byCategory).length

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">Total GHG Emissions</CardTitle>
                <p className="text-sm text-muted-foreground">Carbon dioxide equivalent</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-background/50">
                {activeScopes.length} scope{activeScopes.length !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="secondary" className="bg-background/50">
                {totalCategories} categories
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold text-primary">{formatEmissions(summary.totalEmissions)}</div>
            {/* <div className="text-lg text-muted-foreground">kg CO₂e</div> */}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-1" />
              <span>Direct: {formatEmissions(summary.scope1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-2" />
              <span>Energy: {formatEmissions(summary.scope2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-3" />
              <span>Indirect: {formatEmissions(summary.scope3)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scopes.map((scope) => {
          const Icon = scope.icon
          const percentage = calculatePercentage(scope.value, summary.totalEmissions)
          const percentageValue = summary.totalEmissions > 0 ? (scope.value / summary.totalEmissions) * 100 : 0

          return (
            <Card
              key={scope.id}
              className={`${scope.bgColor} ${scope.borderColor} border-2 relative overflow-hidden group hover:shadow-lg transition-all duration-200`}
            >
              <div className="absolute inset-0 bg-linear-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <CardHeader className="pb-4 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">{scope.name}</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground">{scope.fullName}</p>
                  </div>
                  <div
                    className={`p-3 rounded-xl bg-background/80 ${scope.color} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-foreground">{formatEmissions(scope.value)}</div>
                    <p className="text-sm text-muted-foreground mt-1">{scope.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Percentage of total</span>
                      <span className="font-medium text-foreground">{percentage}</span>
                    </div>
                    <Progress
                      value={percentageValue}
                      className="h-2"
                      style={
                        {
                          "--progress-background": scope.color.replace("text-", "hsl(var(--") + "))",
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  {scope.value > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <div className={`p-1 rounded ${scope.bgColor}`}>
                        <TrendingUp className={`h-3 w-3 ${scope.color}`} />
                      </div>
                      <span className="text-xs text-muted-foreground">Active emissions source</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalCategories > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Category Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Top emission categories</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(summary.byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([category, value], index) => {
                  const categoryPercentage = ((value / summary.totalEmissions) * 100).toFixed(1)
                  return (
                    <div key={category} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground truncate">{category}</span>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="text-lg font-semibold text-foreground">{formatEmissions(value)}</div>
                      <div className="text-xs text-muted-foreground">{categoryPercentage}% of total</div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
