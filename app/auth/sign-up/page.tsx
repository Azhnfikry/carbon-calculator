"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Leaf } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-linear-to-br from-green-50 to-emerald-50">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<div className="flex items-center justify-center gap-2 mb-6">
						<div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
							<Leaf className="w-6 h-6 text-white" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900">Carbon Accounting</h1>
					</div>
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">Sign up</CardTitle>
							<CardDescription>Create a new account to start tracking emissions</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSignUp}>
								<div className="flex flex-col gap-6">
									<div className="grid gap-2">
										<Label htmlFor="fullName">Full Name</Label>
										<Input
											id="fullName"
											type="text"
											placeholder="John Doe"
											required
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="companyName">Company Name (Optional)</Label>
										<Input
											id="companyName"
											type="text"
											placeholder="Acme Corp"
											required
											value={companyName}
											onChange={(e) => setCompanyName(e.target.value)}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="m@example.com"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											type="password"
											required
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="repeat-password">Repeat Password</Label>
										<Input
											id="repeat-password"
											type="password"
											required
											value={repeatPassword}
											onChange={(e) => setRepeatPassword(e.target.value)}
										/>
									</div>
									{error && <p className="text-sm text-red-500">{error}</p>}
									<Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
										{isLoading ? "Creating account..." : "Sign up"}
									</Button>
								</div>
								<div className="mt-4 text-center text-sm">
									Already have an account?{" "}
									<Link href="/auth/login" className="underline underline-offset-4 text-green-600 hover:text-green-700">
										Login
									</Link>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
