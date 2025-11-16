"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { EmissionSummary } from "@/types/emission";

interface EmissionChartProps {
	summary: EmissionSummary;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export function EmissionChart({ summary }: EmissionChartProps) {
	const categoryData = Object.entries(summary.byCategory).map(([category, value]) => ({
		name: category,
		value: Number(value.toFixed(2)),
	}));

	const scopeData = [
		{ name: "Scope 1", value: Number(summary.scope1.toFixed(2)) },
		{ name: "Scope 2", value: Number(summary.scope2.toFixed(2)) },
		{ name: "Scope 3", value: Number(summary.scope3.toFixed(2)) },
	].filter((item) => item.value > 0);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-medium">Emissions by Category</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
								<XAxis
									dataKey="name"
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
									formatter={(value) => [`${value} kg CO₂e`, "Emissions"]}
									labelStyle={{ color: "hsl(var(--foreground))" }}
									contentStyle={{
										backgroundColor: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "8px",
										color: "hsl(var(--foreground))",
									}}
								/>
								<Bar dataKey="value" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-medium">Emissions by Scope</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						{scopeData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={scopeData}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
										outerRadius={80}
										dataKey="value">
										{scopeData.map((_entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
									<Tooltip
										formatter={(value) => [`${value} kg CO₂e`, "Emissions"]}
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
											color: "hsl(var(--foreground))",
										}}
									/>
									<Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="flex items-center justify-center h-full text-muted-foreground">
								<p>No emission data available</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
