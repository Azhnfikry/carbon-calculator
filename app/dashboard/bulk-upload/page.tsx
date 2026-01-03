"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BulkUpload } from "@/components/bulk-upload";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function BulkUploadPage() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);
			setIsLoading(false);

			if (!user) {
				router.push("/auth/login");
			}
		};

		getUser();
	}, [router, supabase]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="mb-6 flex items-center gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>

				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Bulk Upload Emissions</h1>
					<p className="text-gray-600 mt-2">
						Upload documents to automatically extract and add multiple emission entries at once
					</p>
				</div>

				{/* Bulk Upload Component */}
				<BulkUpload
					user={user}
					onUploadSuccess={() => {
						// Optionally redirect back to dashboard
						setTimeout(() => router.push("/dashboard"), 2000);
					}}
				/>
			</div>
		</div>
	);
}
