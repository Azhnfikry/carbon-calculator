"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	Legend,
	AreaChart,
	Area,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Calendar, BarChart3, PieChartIcon, LineChartIcon } from "lucide-react";
import type { EmissionEntry, EmissionSummary } from "@/types/emission";
import { formatEmissions } from "@/lib/emission-calculations";
import { useState } from "react";

interface ChartsPageProps {
	entries: EmissionEntry[];
	summary: EmissionSummary;
}

export function ChartsPage({ entries, summary }: ChartsPageProps) {
	const [timeRange, setTimeRange] = useState("12m");
	const [chartType, setChartType] = useState("area");

	// Process data by month and scope
	const monthlyData = entries.reduce(
		(acc, entry) => {
			const date = new Date(entry.date);
			const month = date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
			if (!acc[month]) {
				acc[month] = {
					total: 0,
					scope1: 0,
					scope2: 0,
					scope3: 0,
					count: 0,
				};
			}

			acc[month].total += entry.co2Equivalent;
			acc[month].count += 1;

			// Add to appropriate scope based on entry type
			if (entry.scope === 1) {
				acc[month].scope1 += entry.co2Equivalent;
			} else if (entry.scope === 2) {
				acc[month].scope2 += entry.co2Equivalent;
			} else {
				acc[month].scope3 += entry.co2Equivalent;
			}

			return acc;
		},
		{} as Record<
			string,
			{
				total: number;
				scope1: number;
				scope2: number;
				scope3: number;
				count: number;
			}
		>
	);

	const trendData = Object.entries(monthlyData)
		.map(([month, data]) => ({
			month,
			total: Number(data.total.toFixed(2)),
			scope1: Number(data.scope1.toFixed(2)),
			scope2: Number(data.scope2.toFixed(2)),
			scope3: Number(data.scope3.toFixed(2)),
			count: data.count,
			average: Number((data.total / data.count).toFixed(2)),
		}))
		.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

	const categoryData = Object.entries(summary.byCategory)
		.map(([category, value]) => ({
			name: category,
			value: Number(value.toFixed(2)),
			percentage: ((value / summary.totalEmissions) * 100).toFixed(1),
		}))
		.sort((a, b) => b.value - a.value);

	const scopeData = [
		{
			name: "Scope 1",
			value: Number(summary.scope1.toFixed(2)),
			description: "Direct emissions",
		},
		{
			name: "Scope 2",
			value: Number(summary.scope2.toFixed(2)),
			description: "Indirect energy",
		},
		{
			name: "Scope 3",
			value: Number(summary.scope3.toFixed(2)),
			description: "Other indirect",
		},
	].filter((item) => item.value > 0);

	const currentMonth = trendData[trendData.length - 1]?.total || 0;
	const previousMonth = trendData[trendData.length - 2]?.total || 0;
	const monthlyChange = currentMonth - previousMonth;
	const monthlyChangePercent = previousMonth > 0 ? ((monthlyChange / previousMonth) * 100).toFixed(1) : "0";

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h2 className="text-2xl font-semibold text-foreground">Analytics & Insights</h2>
					<p className="text-muted-foreground">Comprehensive view of your carbon footprint</p>
				</div>
				<div className="flex items-center gap-3">
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="3m">Last 3 months</SelectItem>
							<SelectItem value="6m">Last 6 months</SelectItem>
							<SelectItem value="12m">Last 12 months</SelectItem>
							<SelectItem value="all">All time</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="bg-card border-border">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Emissions</p>
								<div className="text-2xl font-bold text-foreground">{formatEmissions(summary.totalEmissions)}</div>
							</div>
							<div className="p-3 bg-primary/10 rounded-full">
								<Activity className="h-5 w-5 text-primary" />
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2">
							{monthlyChange >= 0 ? (
								<TrendingUp className="h-4 w-4 text-destructive" />
							) : (
								<TrendingDown className="h-4 w-4 text-chart-2" />
							)}
							<span className={`text-sm font-medium ${monthlyChange >= 0 ? "text-destructive" : "text-chart-2"}`}>
								{Math.abs(Number(monthlyChangePercent))}%
							</span>
							<span className="text-sm text-muted-foreground">vs last month</span>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Entries</p>
								<div className="text-2xl font-bold text-foreground">{entries.length}</div>
							</div>
							<div className="p-3 bg-chart-2/10 rounded-full">
								<BarChart3 className="h-5 w-5 text-chart-2" />
							</div>
						</div>
						<div className="mt-4">
							<Badge variant="secondary" className="text-xs">
								{Object.keys(summary.byCategory).length} categories
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Avg per Entry</p>
								<div className="text-2xl font-bold text-foreground">
									{summary.totalEmissions > 0 ? (summary.totalEmissions / entries.length).toFixed(2) : "0.00"}
									<span className="text-sm font-normal text-muted-foreground ml-1">kg CO₂e</span>
								</div>
							</div>
							<div className="p-3 bg-chart-3/10 rounded-full">
								<Calendar className="h-5 w-5 text-chart-3" />
							</div>
						</div>
						<div className="mt-4">
							<div className="text-sm text-muted-foreground">
								{trendData.length > 0 ? `${trendData.length} months tracked` : "No data"}
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-card border-border">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Highest Category</p>
								<div className="text-2xl font-bold text-foreground">{categoryData[0]?.name || "N/A"}</div>
							</div>
							<div className="p-3 bg-chart-4/10 rounded-full">
								<PieChartIcon className="h-5 w-5 text-chart-4" />
							</div>
						</div>
						<div className="mt-4">
							<div className="text-sm text-muted-foreground">{categoryData[0]?.percentage || "0"}% of total emissions</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="trend" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
					<TabsTrigger value="trend" className="flex items-center gap-2">
						<LineChartIcon className="h-4 w-4" />
						Trend Analysis
					</TabsTrigger>
					<TabsTrigger value="breakdown" className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						Category Breakdown
					</TabsTrigger>
					<TabsTrigger value="scope" className="flex items-center gap-2">
						<PieChartIcon className="h-4 w-4" />
						Scope Analysis
					</TabsTrigger>
				</TabsList>

				<TabsContent value="trend" className="space-y-6">
					<Card className="bg-card border-border">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-lg font-medium">Emissions Trend Over Time</CardTitle>
									<p className="text-sm text-muted-foreground mt-1">Monthly carbon footprint analysis by scope</p>
								</div>
								<div className="flex items-center gap-2">
									<Button variant={chartType === "area" ? "default" : "outline"} size="sm" onClick={() => setChartType("area")}>
										Area
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-96">
								{trendData.length > 0 ? (
									<ResponsiveContainer width="100%" height="100%">
										{chartType === "area" ? (
											<AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
												<defs>
													<linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
														<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
														<stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
													</linearGradient>
													<linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
														<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
														<stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
													</linearGradient>
													<linearGradient id="colorScope2" x1="0" y1="0" x2="0" y2="1">
														<stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
														<stop offset="95%" stopColor="#ffc658" stopOpacity={0.1} />
													</linearGradient>
													<linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1">
														<stop offset="5%" stopColor="#ff8042" stopOpacity={0.8} />
														<stop offset="95%" stopColor="#ff8042" stopOpacity={0.1} />
													</linearGradient>
												</defs>
												<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
												<XAxis
													dataKey="month"
													tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
													axisLine={{ stroke: "hsl(var(--border))" }}
												/>
												<YAxis
													tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
													axisLine={{ stroke: "hsl(var(--border))" }}
													label={{
														value: "kg CO₂e",
														angle: -90,
														position: "insideLeft",
														style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" },
													}}
												/>
												<Tooltip
													formatter={(value, name) => [
														`${value} kg CO₂e`,
														name === "total"
															? "Total Emissions"
															: name === "scope1"
															? "Scope 1"
															: name === "scope2"
															? "Scope 2"
															: name === "scope3"
															? "Scope 3"
															: name,
													]}
													labelStyle={{ color: "hsl(var(--foreground))" }}
													contentStyle={{
														backgroundColor: "#ffffff",
														border: "1px solid hsl(var(--border))",
														borderRadius: "8px",
														color: "#000000",
														boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
													}}
												/>
												<Legend />
												<Area
													type="monotone"
													dataKey="total"
													name="Total Emissions"
													stroke="#8884d8"
													strokeWidth={3}
													fill="url(#colorTotal)"
													stackId="1"
												/>
												<Area
													type="monotone"
													dataKey="scope1"
													name="Scope 1"
													stroke="#82ca9d"
													strokeWidth={2}
													fill="url(#colorScope1)"
													stackId="1"
												/>
												<Area
													type="monotone"
													dataKey="scope2"
													name="Scope 2"
													stroke="#ffc658"
													strokeWidth={2}
													fill="url(#colorScope2)"
													stackId="1"
												/>
												<Area
													type="monotone"
													dataKey="scope3"
													name="Scope 3"
													stroke="#ff8042"
													strokeWidth={2}
													fill="url(#colorScope3)"
													stackId="1"
												/>
											</AreaChart>
										) : (
											<LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
												<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
												<XAxis
													dataKey="month"
													tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
													axisLine={{ stroke: "hsl(var(--border))" }}
												/>
												<YAxis
													tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
													axisLine={{ stroke: "hsl(var(--border))" }}
													label={{
														value: "kg CO₂e",
														angle: -90,
														position: "insideLeft",
														style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" },
													}}
												/>
												<Tooltip
													formatter={(value, name) => [
														`${value} kg CO₂e`,
														name === "total"
															? "Total Emissions"
															: name === "scope1"
															? "Scope 1"
															: name === "scope2"
															? "Scope 2"
															: name === "scope3"
															? "Scope 3"
															: name,
													]}
													labelStyle={{ color: "hsl(var(--foreground))" }}
													contentStyle={{
														backgroundColor: "#ffffff",
														border: "1px solid hsl(var(--border))",
														borderRadius: "8px",
														color: "hsl(var(--foreground))",
														boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
													}}
												/>
												<Legend />
												<Line
													type="monotone"
													dataKey="total"
													name="Total Emissions"
													strokeWidth={3}
													dot={{ strokeWidth: 2, r: 4, fill: "#8884d8" }}
													activeDot={{ r: 6, strokeWidth: 2 }}
													stroke="#8884d8"
													connectNulls
												/>
												<Line
													type="monotone"
													dataKey="scope1"
													name="Scope 1"
													strokeWidth={2}
													dot={{ strokeWidth: 2, r: 4, fill: "#82ca9d" }}
													activeDot={{ r: 6, strokeWidth: 2 }}
													stroke="#82ca9d"
													connectNulls
												/>
												<Line
													type="monotone"
													dataKey="scope2"
													name="Scope 2"
													strokeWidth={2}
													dot={{ strokeWidth: 2, r: 4, fill: "#ffc658" }}
													activeDot={{ r: 6, strokeWidth: 2 }}
													stroke="#ffc658"
													connectNulls
												/>
												<Line
													type="monotone"
													dataKey="scope3"
													name="Scope 3"
													strokeWidth={2}
													dot={{ strokeWidth: 2, r: 4, fill: "#ff8042" }}
													activeDot={{ r: 6, strokeWidth: 2 }}
													stroke="#ff8042"
													connectNulls
												/>
											</LineChart>
										)}
									</ResponsiveContainer>
								) : (
									<div className="flex items-center justify-center h-full text-muted-foreground">
										<div className="text-center">
											<BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
											<p className="text-lg font-medium">No trend data available</p>
											<p className="text-sm">Add emission entries to see trend analysis</p>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="breakdown" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="bg-card border-border">
							<CardHeader>
								<CardTitle className="text-lg font-medium">Emissions by Category</CardTitle>
								<p className="text-sm text-muted-foreground">Distribution across activity types</p>
							</CardHeader>
							<CardContent>
								<div className="h-80">
									{categoryData.length > 0 ? (
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
												<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
												<XAxis
													dataKey="name"
													tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
													axisLine={{ stroke: "hsl(var(--border))" }}
													angle={-45}
													textAnchor="end"
													height={80}
												/>
												<YAxis
													tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
													axisLine={{ stroke: "hsl(var(--border))" }}
													label={{
														value: "kg CO₂e",
														angle: -90,
														position: "insideLeft",
														style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" },
													}}
												/>
												<Tooltip
													formatter={(value, name, props) => [`${value} kg CO₂e (${props.payload.percentage}%)`, "Emissions"]}
													labelStyle={{ color: "hsl(var(--foreground))" }}
													contentStyle={{
														backgroundColor: "hsl(var(--card))",
														border: "1px solid hsl(var(--border))",
														borderRadius: "8px",
														color: "hsl(var(--foreground))",
														boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
													}}
												/>
												<Bar dataKey="value" radius={[4, 4, 0, 0]} opacity={0.8} />
											</BarChart>
										</ResponsiveContainer>
									) : (
										<div className="flex items-center justify-center h-full text-muted-foreground">
											<div className="text-center">
												<BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
												<p className="text-lg font-medium">No category data available</p>
												<p className="text-sm">Add emission entries to see category breakdown</p>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						<Card className="bg-card border-border">
							<CardHeader>
								<CardTitle className="text-lg font-medium">Category Rankings</CardTitle>
								<p className="text-sm text-muted-foreground">Top emission sources</p>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{categoryData.slice(0, 6).map((category, index) => (
										<div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
											<div className="flex items-center gap-3">
												<div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
													{index + 1}
												</div>
												<div>
													<p className="font-medium text-foreground">{category.name}</p>
													<p className="text-sm text-muted-foreground">{category.percentage}% of total</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium text-foreground">{formatEmissions(category.value)}</p>
											</div>
										</div>
									))}
									{categoryData.length === 0 && (
										<div className="text-center py-8 text-muted-foreground">
											<p>No categories to display</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="scope" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="bg-card border-border">
							<CardHeader>
								<CardTitle className="text-lg font-medium">Scope Breakdown</CardTitle>
								<p className="text-sm text-muted-foreground">Detailed emission sources</p>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{scopeData.map((scope, index) => {
										const percentage = ((scope.value / summary.totalEmissions) * 100).toFixed(1);
										return (
											<div key={scope.name} className="p-4 rounded-lg border border-border bg-card/50">
												<div className="flex items-center justify-between mb-2">
													<div className="flex items-center gap-3">
														<div className="w-4 h-4 rounded-full bg-primary/20" />
														<div>
															<p className="font-medium text-foreground">{scope.name}</p>
															<p className="text-sm text-muted-foreground">{scope.description}</p>
														</div>
													</div>
													<div className="text-right">
														<p className="font-medium text-foreground">{formatEmissions(scope.value)}</p>
														<p className="text-sm text-muted-foreground">{percentage}%</p>
													</div>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="h-2 rounded-full transition-all duration-300 bg-primary"
														style={{
															width: `${percentage}%`,
														}}
													/>
												</div>
											</div>
										);
									})}
									{scopeData.length === 0 && (
										<div className="text-center py-8 text-muted-foreground">
											<p>No scope data to display</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
