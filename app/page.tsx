import { createClient } from "@/lib/supabase/server"
import { CarbonDashboard } from "@/components/carbon-dashboard"

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  const user = data?.user || null

  // Get user profile only if user is authenticated
  let profile = null
  if (user) {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = profileData
  }

  return <CarbonDashboard user={user} profile={profile} />
}
