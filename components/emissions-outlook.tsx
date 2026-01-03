"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
	TrendingUp,
	TrendingDown,
	Target,
	Zap,
	AlertCircle,
	CheckCircle2,
	ChevronRight,
	BarChart3,
	Lightbulb,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface EmissionRecord {
	id: string;
	activity_type: string;
	category: string;
	scope: number;
	co2_equivalent: number;
	date: string;
	created_at: string;
}

interface MetricsData {
	totalEmissions: number;
	lastMonthEmissions: number;
	reductionPercent: number;
	scope1: number;
	scope2: number;
	scope3: number;
	topSources: Array<{ activity: string; emissions: number; percent: number }>;
	monthlyTrend: Array<{ month: string; emissions: number }>;
	yearOverYearGrowth: number;
}

export function EmissionsOutlook({ user }: { user: User | null }) {
	const [metrics, setMetrics] = useState<MetricsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const supabase = createClient();

	useEffect(() => {
		if (user) {
			fetchEmissionsData();
		}
	}, [user]);

	const fetchEmissionsData = async () => {
		try {
			const { data, error: fetchError } = await supabase
				.from("emissions")
				.select("*")
				.eq("user_id", user?.id)
				.order("date", { ascending: false });

			if (fetchError) throw fetchError;

			const emissions = (data as EmissionRecord[]) || [];

			// Calculate metrics
			const now = new Date();
			const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

			const currentMonthEmissions = emissions
				.filter((e) => {
					const date = new Date(e.date);
					return date >= thisMonth;
				})
				.reduce((sum, e) => sum + (e.co2_equivalent || 0), 0);

			const lastMonthEmissions = emissions
				.filter((e) => {
					const date = new Date(e.date);
					return date >= lastMonth && date < thisMonth;
				})
				.reduce((sum, e) => sum + (e.co2_equivalent || 0), 0);

			const totalEmissions = emissions.reduce((sum, e) => sum + (e.co2_equivalent || 0), 0);

			const reductionPercent =
				lastMonthEmissions > 0
					? ((lastMonthEmissions - currentMonthEmissions) / lastMonthEmissions) * 100
					: 0;

			const scope1 = emissions
				.filter((e) => e.scope === 1)
				.reduce((sum, e) => sum + (e.co2_equivalent || 0), 0);
			const scope2 = emissions
				.filter((e) => e.scope === 2)
				.reduce((sum, e) => sum + (e.co2_equivalent || 0), 0);
			const scope3 = emissions
				.filter((e) => e.scope === 3)
				.reduce((sum, e) => sum + (e.co2_equivalent || 0), 0);

			// Top emission sources
			const activityMap = new Map<string, number>();
			emissions.forEach((e) => {
				activityMap.set(
					e.activity_type,
					(activityMap.get(e.activity_type) || 0) + (e.co2_equivalent || 0)
				);
			});

			const topSources = Array.from(activityMap.entries())
				.map(([activity, emissions]) => ({
					activity,
					emissions,
					percent: totalEmissions > 0 ? (emissions / totalEmissions) * 100 : 0,
				}))
				.sort((a, b) => b.emissions - a.emissions)
				.slice(0, 5);

			// Monthly trend
			const monthlyMap = new Map<string, number>();
			emissions.forEach((e) => {
				const date = new Date(e.date);
				const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
				monthlyMap.set(
					monthKey,
					(monthlyMap.get(monthKey) || 0) + (e.co2_equivalent || 0)
				);
			});

			const monthlyTrend = Array.from(monthlyMap.entries())
				.sort()
				.slice(-6)
				.map(([month, emissions]) => ({
					month: new Date(`${month}-01`).toLocaleDateString("en-US", {
						month: "short",
						year: "2-digit",
					}),
					emissions,
				}));

			// Year over year
			const currentYearStart = new Date(now.getFullYear(), 0, 1);
			const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
			const lastYearEnd = new Date(now.getFullYear(), 0, 1);

			const currentYearEmissions = emissions
				.filter((e) => {
					const date = new Date(e.date);
					return date >= currentYearStart;
				})
				.reduce((sum, e) => sum + (e.co2_equivalent || 0), 0);

			const lastYearEmissions = emissions
				.filter((e) => {
					const date = new Date(e.date);
					return date >= lastYearStart && date < lastYearEnd;
				})
				.reduce((sum, e) => sum + (e.co2_equivalent || 0), 0);

			const yearOverYearGrowth =
				lastYearEmissions > 0
					? ((currentYearEmissions - lastYearEmissions) / lastYearEmissions) * 100
					: 0;

			setMetrics({
				totalEmissions,
				lastMonthEmissions,
				reductionPercent,
				scope1,
				scope2,
				scope3,
				topSources,
				monthlyTrend,
				yearOverYearGrowth,
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch emissions data");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<p className="text-gray-600">Loading emissions data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (!metrics || metrics.totalEmissions === 0) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					No emissions data available. Start by adding emission entries to see insights.
				</AlertDescription>
			</Alert>
		);
	}

	const recommendations = [
		{
			title: "Switch to Renewable Energy",
			savings: (metrics.scope2 * 0.8).toFixed(0),
			impact: "80% reduction in Scope 2",
			priority: "high",
		},
		{
			title: "Reduce Business Travel",
			savings: (metrics.scope3 * 0.5).toFixed(0),
			impact: "50% reduction in travel emissions",
			priority: "medium",
		},
		{
			title: "Optimize Fleet Efficiency",
			savings: (metrics.scope1 * 0.4).toFixed(0),
			impact: "40% reduction in fuel consumption",
			priority: "medium",
		},
		{
			title: "Partner with Green Suppliers",
			savings: (metrics.scope3 * 0.3).toFixed(0),
			impact: "30% reduction in supply chain",
			priority: "low",
		},
	];

	return (
		<div className="space-y-6">
			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-sm text-gray-600 mb-2">Total Emissions</p>
							<p className="text-3xl font-bold">{metrics.totalEmissions.toFixed(0)}</p>
							<p className="text-xs text-gray-500 mt-1">kg CO₂e</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-sm text-gray-600 mb-2">This Month vs Last</p>
							<div className="flex items-center justify-center gap-2">
								{metrics.reductionPercent >= 0 ? (
									<TrendingDown className="h-5 w-5 text-green-600" />
								) : (
									<TrendingUp className="h-5 w-5 text-red-600" />
								)}
								<p className="text-3xl font-bold">{Math.abs(metrics.reductionPercent).toFixed(1)}%</p>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								{metrics.reductionPercent >= 0 ? "Reduction" : "Increase"}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-sm text-gray-600 mb-2">Year-over-Year</p>
							<div className="flex items-center justify-center gap-2">
								{metrics.yearOverYearGrowth <= 0 ? (
									<TrendingDown className="h-5 w-5 text-green-600" />
								) : (
									<TrendingUp className="h-5 w-5 text-red-600" />
								)}
								<p className="text-3xl font-bold">{Math.abs(metrics.yearOverYearGrowth).toFixed(1)}%</p>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								{metrics.yearOverYearGrowth <= 0 ? "Improvement" : "Growth"}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-sm text-gray-600 mb-2">Reduction Target</p>
							<p className="text-3xl font-bold">45%</p>
							<p className="text-xs text-gray-500 mt-1">By 2030</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Scope Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Scope Breakdown
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[
							{ scope: 1, name: "Scope 1 (Direct)", value: metrics.scope1, color: "bg-red-500" },
							{ scope: 2, name: "Scope 2 (Indirect Energy)", value: metrics.scope2, color: "bg-orange-500" },
							{ scope: 3, name: "Scope 3 (Other Indirect)", value: metrics.scope3, color: "bg-blue-500" },
						].map((item) => {
							const percent =
								metrics.totalEmissions > 0
									? (item.value / metrics.totalEmissions) * 100
									: 0;
							return (
								<div key={item.scope}>
									<div className="flex justify-between mb-2">
										<span className="text-sm font-medium">{item.name}</span>
										<span className="text-sm text-gray-600">
											{item.value.toFixed(0)} kg CO₂e ({percent.toFixed(1)}%)
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className={`${item.color} h-2 rounded-full`}
											style={{ width: `${percent}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Top Emission Sources */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-red-600" />
						Top Emission Sources
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{metrics.topSources.map((source, idx) => (
							<div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
								<div>
									<p className="font-medium text-sm">{source.activity}</p>
									<p className="text-xs text-gray-600">{source.emissions.toFixed(0)} kg CO₂e</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-semibold text-red-600">{source.percent.toFixed(1)}%</p>
									<p className="text-xs text-gray-600">of total</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Reduction Recommendations */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Lightbulb className="h-5 w-5 text-yellow-600" />
						Reduction Recommendations
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{recommendations.map((rec, idx) => (
							<div
								key={idx}
								className={`p-4 rounded-lg border-l-4 ${
									rec.priority === "high"
										? "border-red-600 bg-red-50"
										: rec.priority === "medium"
											? "border-yellow-600 bg-yellow-50"
											: "border-blue-600 bg-blue-50"
								}`}
							>
								<div className="flex justify-between items-start mb-2">
									<div>
										<p className="font-semibold text-sm">{rec.title}</p>
										<p className="text-xs text-gray-700 mt-1">{rec.impact}</p>
									</div>
									<span
										className={`text-xs font-bold px-2 py-1 rounded ${
											rec.priority === "high"
												? "bg-red-200 text-red-800"
												: rec.priority === "medium"
													? "bg-yellow-200 text-yellow-800"
													: "bg-blue-200 text-blue-800"
										}`}
									>
										{rec.priority.toUpperCase()}
									</span>
								</div>
								<div className="flex items-center gap-2 text-green-700">
									<CheckCircle2 className="h-4 w-4" />
									<span className="text-sm font-medium">
										Potential savings: {rec.savings} kg CO₂e
									</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Action Items */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Next Steps
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
							<CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
							<div>
								<p className="font-medium text-sm">Set Reduction Target</p>
								<p className="text-xs text-gray-600">Define your company's 2030 emission reduction goal</p>
							</div>
						</div>
						<div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
							<Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
							<div>
								<p className="font-medium text-sm">Implement Quick Wins</p>
								<p className="text-xs text-gray-600">Start with high-priority recommendations this quarter</p>
							</div>
						</div>
						<div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
							<TrendingDown className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
							<div>
								<p className="font-medium text-sm">Monitor Progress</p>
								<p className="text-xs text-gray-600">Track emissions monthly and adjust strategies accordingly</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
