import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
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
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Thank you for signing up!</CardTitle>
              <CardDescription>Check your email to confirm your account</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                You&apos;ve successfully signed up for Carbon Accounting Dashboard. Please check your email to confirm
                your account before signing in.
              </p>
              <Link
                href="/auth/login"
                className="text-sm text-green-600 hover:text-green-700 underline underline-offset-4"
              >
                Return to login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
