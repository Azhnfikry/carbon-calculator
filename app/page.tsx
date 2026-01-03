import { createClient } from "@/lib/supabase/server"
import { CarbonDashboard } from "@/components/carbon-dashboard"

export default async function HomePage() {
  let user = null
  let profile = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    user = data?.user || null

    // Get user profile only if user is authenticated
    if (user) {
      try {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        profile = profileData
      } catch (profileError) {
        console.warn('Profile fetch error:', profileError)
      }
    }
  } catch (error) {
    console.warn('Auth or Supabase connection error - continuing in offline mode:', error)
    // App will work without auth/profile in offline mode
  }

  return <CarbonDashboard user={user} profile={profile} />
}
