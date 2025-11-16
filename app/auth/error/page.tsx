import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-linear-to-br from-red-50 to-rose-50">
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
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Sorry, something went wrong.</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error ? (
                <p className="text-sm text-muted-foreground mb-4">Error: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  An unspecified error occurred during authentication.
                </p>
              )}
              <Link
                href="/auth/login"
                className="text-sm text-green-600 hover:text-green-700 underline underline-offset-4"
              >
                Try logging in again
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
