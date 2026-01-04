"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Loader2, CheckCircle, XCircle, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateCO2Equivalent } from "@/lib/emission-calculations";
import type { User } from "@supabase/supabase-js";

interface ExtractedEmissionData {
	"Activity Type": string;
	Scope: string;
	Quantity: string;
	Unit: string;
}

interface BulkUploadProps {
	user: User | null;
	onUploadSuccess?: () => void;
}

export function BulkUpload({ user, onUploadSuccess }: BulkUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [fileName, setFileName] = useState("");
	const [extractedData, setExtractedData] = useState<ExtractedEmissionData[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingStatus, setProcessingStatus] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const supabase = createClient();

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = [
			"text/csv",
			"application/csv",
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/vnd.ms-excel",
		];

		if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv")) {
			setError("Please upload a CSV, PDF, DOCX, or Excel file");
			return;
		}

		setFileName(file.name);
		setError("");
		setSuccess("");
		setExtractedData([]);

		await extractDataFromFile(file);
	};

	const extractDataFromFile = async (file: File) => {
		setIsUploading(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/extract-emissions", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				const errorMsg = data.error || "Failed to extract emissions from file";
				const hint = data.hint ? ` ${data.hint}` : "";
				throw new Error(errorMsg + hint);
			}

			const extracted: ExtractedEmissionData[] = data.emissions || [];

			if (extracted.length === 0) {
				setError("No emission data found in the file");
				return;
			}

			setExtractedData(extracted);
			setSuccess(`Successfully extracted ${extracted.length} emission entries`);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Failed to process file");
		} finally {
			setIsUploading(false);
		}
	};

	const handleBulkInsert = async () => {
		if (!user) {
			setError("Please login to save entries");
			return;
		}

		if (extractedData.length === 0) {
			setError("No data to insert");
			return;
		}

		setIsProcessing(true);
		setProcessingStatus("Processing entries...");

		try {
			// Get emission factors from database
			const { data: factors, error: factorError } = await supabase
				.from("emission_factors")
				.select("*");

			if (factorError) throw factorError;

			const factorMap = new Map();
			factors?.forEach((f: any) => {
				factorMap.set(f.activity_type.toLowerCase(), f);
			});

			// Prepare entries for insertion
			const entriesToInsert = extractedData.map((item, index) => {
				setProcessingStatus(`Processing entry ${index + 1} of ${extractedData.length}...`);

				// Find matching factor
				const matchedFactor = Array.from(factorMap.values()).find(
					(f: any) =>
						f.activity_type.toLowerCase() === item["Activity Type"].toLowerCase()
				);

				const quantity = parseFloat(item.Quantity);
				const factor = matchedFactor?.factor || 1;
				const co2_equivalent = quantity * factor;

				// Parse scope: handles both "2" and "Scope 2" formats
				let scopeNumber = 2; // default
				const scopeStr = item.Scope?.toString().toLowerCase().trim() || "";
				if (scopeStr.includes("scope")) {
					const match = scopeStr.match(/\d+/);
					if (match) scopeNumber = parseInt(match[0]);
				} else {
					scopeNumber = parseInt(item.Scope) || 2;
				}

				return {
					user_id: user.id,
					activity_type: item["Activity Type"],
					category: matchedFactor?.category || "Unknown",
					scope: scopeNumber,
					quantity,
					unit: matchedFactor?.unit || item.Unit,
					emission_factor: factor,
					co2_equivalent,
					date: new Date().toISOString().split("T")[0],
					description: `Bulk uploaded from ${fileName}`,
				};
			});

			// Insert in batches of 100
			const batchSize = 100;
			let successCount = 0;

			for (let i = 0; i < entriesToInsert.length; i += batchSize) {
				const batch = entriesToInsert.slice(i, i + batchSize);
				const { error: insertError } = await supabase
					.from("emissions")
					.insert(batch);

				if (insertError) throw insertError;
				successCount += batch.length;
				setProcessingStatus(
					`Inserted ${successCount} of ${entriesToInsert.length} entries...`
				);
			}

			setSuccess(`✅ Successfully inserted ${successCount} emission entries!`);
			setExtractedData([]);
			setFileName("");
			if (fileInputRef.current) fileInputRef.current.value = "";
			onUploadSuccess?.();
		} catch (error) {
			console.error("Database insertion error:", error);
			setError(error instanceof Error ? error.message : "Failed to insert entries");
		} finally {
			setIsProcessing(false);
			setProcessingStatus("");
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Bulk Upload Emissions
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* File Upload Section */}
					<div className="space-y-2">
						<label className="block text-sm font-medium">Upload Document</label>
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
							<input
								ref={fileInputRef}
								type="file"
								accept=".csv,.pdf,.docx,.xlsx,.xls"
								onChange={handleFileChange}
								disabled={isUploading}
								className="hidden"
								id="file-upload"
							/>
							<label
								htmlFor="file-upload"
								className="cursor-pointer flex flex-col items-center gap-2"
							>
								<FileText className="h-8 w-8 text-gray-400" />
								<span className="text-sm font-medium">
									Click to upload or drag and drop
								</span>
								<span className="text-xs text-gray-500">
									CSV (recommended), PDF, DOCX, or Excel supported
								</span>
							</label>
						</div>

						{fileName && (
							<div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
								<FileText className="h-4 w-4 text-blue-600" />
								<span className="text-sm text-blue-900">{fileName}</span>
							</div>
						)}
					</div>

					{/* Error Alert */}
					{error && (
						<Alert variant="destructive">
							<XCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Success Alert */}
					{success && (
						<Alert className="border-green-200 bg-green-50">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<AlertDescription className="text-green-800">{success}</AlertDescription>
						</Alert>
					)}

					{/* Processing Status */}
					{isProcessing && (
						<Alert className="border-blue-200 bg-blue-50">
							<Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
							<AlertDescription className="text-blue-800">
								{processingStatus}
							</AlertDescription>
						</Alert>
					)}

					{/* Extracted Data Preview */}
					{extractedData.length > 0 && (
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<h3 className="font-semibold">
									Preview ({extractedData.length} entries)
								</h3>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										setExtractedData([]);
										setFileName("");
										if (fileInputRef.current) fileInputRef.current.value = "";
									}}
								>
									Clear
								</Button>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full text-sm border-collapse">
									<thead>
										<tr className="border-b bg-gray-50">
											<th className="text-left p-2">Activity Type</th>
											<th className="text-left p-2">Scope</th>
											<th className="text-left p-2">Quantity</th>
											<th className="text-left p-2">Unit</th>
										</tr>
									</thead>
									<tbody>
										{extractedData.slice(0, 5).map((item, idx) => (
											<tr key={idx} className="border-b hover:bg-gray-50">
												<td className="p-2">{item["Activity Type"]}</td>
												<td className="p-2">{item.Scope}</td>
												<td className="p-2">{item.Quantity}</td>
												<td className="p-2">{item.Unit}</td>
											</tr>
										))}
									</tbody>
								</table>
								{extractedData.length > 5 && (
									<div className="p-2 text-sm text-gray-600 text-center">
										... and {extractedData.length - 5} more entries
									</div>
								)}
							</div>

							{/* Insert Button */}
							<Button
								onClick={handleBulkInsert}
								disabled={!user || isProcessing}
								className="w-full bg-green-600 hover:bg-green-700"
							>
								{!user ? (
									"Login Required"
								) : isProcessing ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Processing...
									</>
								) : (
									<>
										<CheckCircle className="h-4 w-4 mr-2" />
										Insert {extractedData.length} Entries
									</>
								)}
							</Button>
						</div>
					)}

					{/* Upload Button */}
					<Button
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
						className="w-full"
					>
						{isUploading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Extracting Data...
							</>
						) : (
							<>
								<Upload className="h-4 w-4 mr-2" />
								{fileName ? "Choose Different File" : "Select File"}
							</>
						)}
					</Button>
				</CardContent>
			</Card>

			{/* Instructions Card */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">How to Use Bulk Upload</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<p>
						<strong>1. Prepare Document:</strong> Create a CSV file (recommended), PDF, or Word document 
						with emission data in the following format:
					</p>
					<ul className="list-disc list-inside ml-2 space-y-1">
						<li>Column 1: Activity Type (e.g., Electricity, Diesel)</li>
						<li>Column 2: Scope (1, 2, or 3)</li>
						<li>Column 3: Quantity (number)</li>
						<li>Column 4: Unit (kWh, liters, km, etc.)</li>
					</ul>
					<p className="mt-3 text-xs text-gray-600">
						💡 <strong>Tip:</strong> CSV files work instantly. PDF/Word files require Gemini API key. 
						Excel files must be converted to CSV.
					</p>
					<p className="mt-3">
						<strong>2. Upload File:</strong> Click "Select File" and choose your prepared document (CSV, PDF, or DOCX)
					</p>
					<p>
						<strong>3. Review Data:</strong> Check the preview table to ensure all entries
						are correctly extracted
					</p>
					<p>
						<strong>4. Insert Entries:</strong> Click "Insert Entries" to add all records to
						your dashboard
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
