"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";

interface ExtractedEmissionData {
  "Activity Type": string;
  Scope: string;
  Quantity: string;
  Unit: string;
}

interface FileUploadFormProps {
  onDataExtracted: (data: ExtractedEmissionData[]) => void;
}

export function FileUploadForm({ onDataExtracted }: FileUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fileName, setFileName] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedEmissionData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOCX, or Excel file");
      return;
    }

    setFileName(file.name);
    setError("");
    setSuccess("");
    setExtractedData([]);

    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-emissions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process file: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.extractedData && data.extractedData.length > 0) {
        setExtractedData(data.extractedData);
        setSuccess(`Successfully extracted ${data.extractedData.length} emission parameter(s) from the file`);
        onDataExtracted(data.extractedData);
      } else {
        setError("No carbon emission parameters found in the uploaded file");
      }
    } catch (error: any) {
      console.error("Error processing file:", error);
      setError(error.message || "Failed to process the file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      setError("");
      setSuccess("");
      setExtractedData([]);
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setFileName("");
    setError("");
    setSuccess("");
    setExtractedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document for Auto-Fill
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Upload a PDF, DOCX, or Excel file containing carbon emission data. 
          Our AI will automatically extract relevant emission parameters and pre-fill the form.
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.xlsx,.xls"
          className="hidden"
        />

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isUploading 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary hover:bg-primary/5"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Processing file...</p>
              <p className="text-xs text-muted-foreground">Extracting emission data</p>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">Click to upload a different file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drag & drop your file here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: PDF, DOCX, XLSX
              </p>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {extractedData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Extracted Emission Parameters:</h4>
            <div className="space-y-2">
              {extractedData.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/20">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Activity:</span> {item["Activity Type"]}
                    </div>
                    <div>
                      <span className="font-medium">Scope:</span> {item.Scope}
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span> {item.Quantity}
                    </div>
                    <div>
                      <span className="font-medium">Unit:</span> {item.Unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={triggerFileInput} 
            variant="outline" 
            className="flex-1"
            disabled={isUploading}
          >
            {fileName ? "Change File" : "Choose File"}
          </Button>
          {fileName && (
            <Button 
              onClick={resetForm} 
              variant="outline" 
              disabled={isUploading}
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
