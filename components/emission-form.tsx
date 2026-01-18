"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Calculator, LogIn, Upload, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateCO2Equivalent } from "@/lib/emission-calculations";
import DocumentUpload from "@/components/document-upload";
import DataExtraction from "@/components/data-extraction";
import type { EmissionFactor, ExtractedData } from "@/types/emission";
import type { User } from "@supabase/supabase-js";

interface EmissionFormProps {
	onEntryAdded: () => void;
	user: User | null; // Made user optional
	onBulkUploadClick?: () => void;
}

interface ExtractedEmissionData {
  "Activity Type": string;
  Scope: string;
  Quantity: string;
  Unit: string;
}

export function EmissionForm({ onEntryAdded, user, onBulkUploadClick }: EmissionFormProps) {
	const [activityType, setActivityType] = useState("");
	const [category, setCategory] = useState("");
	const [scope, setScope] = useState<1 | 2 | 3 | "">("");
	const [quantity, setQuantity] = useState("");
	const [unit, setUnit] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [description, setDescription] = useState("");
	const [emissionFactor, setEmissionFactor] = useState("");
	const [co2Equivalent, setCo2Equivalent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
	
	// OCR states
	const [useOCR, setUseOCR] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

	const supabase = createClient();

	useEffect(() => {
		loadEmissionFactors();
	}, []);

	const loadEmissionFactors = async () => {
		try {
      const { data, error } = await supabase.from("emission_factors").select("*").order("activity_type");
      
      console.log(data);
      

			if (error) throw error;
			setEmissionFactors(data || []);
		} catch (error) {
			console.error("Error loading emission factors:", error);
		}
	};

	const handleActivityTypeChange = (value: string) => {
		setActivityType(value);
		const factor = emissionFactors.find((f) => f.activity_type === value);
		if (factor) {
			setCategory(factor.category);
			setUnit(factor.unit);
			setEmissionFactor(factor.factor.toString());
		}
	};

	const handleFileUpload = (file: File, data: ExtractedData) => {
		setUploadedFile(file);
		setExtractedData(data);
	};

	const handleRemoveFile = () => {
		setUploadedFile(null);
		setExtractedData(null);
	};

	const handleDataConfirm = (qty: number, unit: string, date: string) => {
		setQuantity(qty.toString());
		setUnit(unit);
		setDate(date);
	};

	const handleScopeChange = (value: string) => {
		const newScope = Number(value) as 1 | 2 | 3;
		setScope(newScope);
		// Reset activity type when scope changes
		setActivityType("");
		setCategory("");
		setUnit("");
		setEmissionFactor("");
	};

	const calculateEmissions = () => {
		const qty = Number.parseFloat(quantity);
		const factor = Number.parseFloat(emissionFactor);
		if (!isNaN(qty) && !isNaN(factor)) {
			const result = calculateCO2Equivalent(qty, factor);
			setCo2Equivalent(result.toFixed(2));
		}
	};

	useEffect(() => {
		if (quantity && emissionFactor) {
			calculateEmissions();
		}
	}, [quantity, emissionFactor]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			setError("Please login to save emission entries. You can still use the calculator below.");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const { error } = await supabase.from("emissions").insert({
				user_id: user.id,
				activity_type: activityType,
				category,
				scope: Number(scope),
				quantity: Number.parseFloat(quantity),
				unit,
				emission_factor: Number.parseFloat(emissionFactor),
				co2_equivalent: Number.parseFloat(co2Equivalent),
				date,
				description: description || null,
			});

			if (error) throw error;

			// Reset form
			setActivityType("");
			setCategory("");
			setScope("");
			setQuantity("");
			setUnit("");
			setEmissionFactor("");
			setCo2Equivalent("");
			setDescription("");
			setDate(new Date().toISOString().split("T")[0]);

			onEntryAdded();
		} catch (error: any) {
			setError(error.message || "An error occurred while saving the entry");
		} finally {
			setIsLoading(false);
		}
	};

	// Filter activity types based on selected scope
	const filteredActivityTypes = scope 
		? [...new Set(emissionFactors.filter(f => f.scope === scope).map(f => f.activity_type))]
		: [];

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Plus className="h-5 w-5" />
						Add New Emission Entry
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 space-y-2">
						<Button 
							type="button" 
							variant="outline" 
							className="flex items-center gap-2 w-full"
							onClick={onBulkUploadClick}
						>
							<Upload className="h-4 w-4" />
							Bulk Upload Multiple Entries
						</Button>
						<Button 
							type="button" 
							variant="outline" 
							className={`flex items-center gap-2 w-full ${useOCR ? 'bg-blue-50 border-blue-500' : ''}`}
							onClick={() => setUseOCR(!useOCR)}
						>
							<FileText className="h-4 w-4" />
							{useOCR ? 'Hide OCR Document Upload' : 'Extract from Document (OCR)'}
						</Button>
					</div>

					{useOCR && (
						<div className="mb-6 space-y-4">
							<DocumentUpload 
								onFileUpload={handleFileUpload}
								onRemove={handleRemoveFile}
								uploadedFile={uploadedFile}
							/>
							{extractedData && (
								<DataExtraction 
									extractedData={extractedData}
									onDataConfirm={handleDataConfirm}
								/>
							)}
						</div>
					)}

					{!user && (
						<Alert className="mb-4">
							<LogIn className="h-4 w-4" />
							<AlertDescription>
								You can use this calculator to estimate emissions, but you'll need to login to save entries to your dashboard.
							</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<Alert variant={!user ? "default" : "destructive"}>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
						</div>

						<div className="space-y-2">
							<Label htmlFor="scope">Scope</Label>
							<select 
								id="scope"
								value={scope.toString()} 
								onChange={(e) => handleScopeChange(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">Select scope</option>
								<option value="1">Scope 1 (Direct)</option>
								<option value="2">Scope 2 (Indirect Energy)</option>
								<option value="3">Scope 3 (Other Indirect)</option>
							</select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="activityType">Activity Type</Label>
							<select 
								id="activityType"
								value={activityType} 
								onChange={(e) => handleActivityTypeChange(e.target.value)}
								required 
								disabled={!scope}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							>
								<option value="">{scope ? "Select activity type" : "Select scope first"}</option>
								{filteredActivityTypes.map((type) => {
									const unit = emissionFactors.find(f => f.activity_type === type)?.unit || '';
									return (
										<option key={type} value={type}>
											{type} {unit ? `(${unit})` : ''}
										</option>
									);
								})}
							</select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="quantity">Quantity</Label>
							<Input
								id="quantity"
								type="number"
								step="0.01"
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2 col-span-2">
							<Label htmlFor="co2Equivalent">CO₂ Equivalent (kg)</Label>
							<div className="flex gap-2">
								<Input id="co2Equivalent" type="number" step="0.01" value={co2Equivalent} readOnly />
								<Button type="button" variant="outline" size="sm" onClick={calculateEmissions}>
									<Calculator className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description (Optional)</Label>
						<Textarea
							id="description"
							placeholder="Additional details about this emission entry..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<Button type="submit" disabled={isLoading} className="w-full">
						{!user ? "Login Required to Save Entry" : isLoading ? "Adding Entry..." : "Add Emission Entry"}
					</Button>
				</form>
			</CardContent>
		</Card>
		</div>
	);
}
