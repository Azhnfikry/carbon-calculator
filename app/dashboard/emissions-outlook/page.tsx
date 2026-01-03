"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EmissionsOutlook } from "@/components/emissions-outlook";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function EmissionsOutlookPage() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const supabase = createClient();

	useEffect(() => {
		const getUser = async () => {
			try {
				const {
					data: { user: authUser },
				} = await supabase.auth.getUser();

				if (!authUser) {
					router.push("/auth/login");
					return;
				}

				setUser(authUser);
			} catch (error) {
				console.error("Auth error:", error);
				router.push("/auth/login");
			} finally {
				setIsLoading(false);
			}
		};

		getUser();
	}, [supabase, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-gray-600">Loading...</p>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto py-8 px-4">
				{/* Header */}
				<div className="mb-8">
					<Button
						onClick={() => router.push("/")}
						variant="ghost"
						size="sm"
						className="mb-4"
					>
						<ChevronLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Button>
					<h1 className="text-4xl font-bold mb-2">Emissions Outlook & Reduction Insights</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Analyze your emissions trends, identify reduction opportunities, and track progress toward your sustainability goals.
					</p>
				</div>

				{/* Content */}
				<div className="max-w-7xl mx-auto">
					<EmissionsOutlook user={user} />
				</div>
			</div>
		</div>
	);
}
