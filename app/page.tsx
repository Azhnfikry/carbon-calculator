import { createClient } from "@/lib/supabase/server"
import { CarbonDashboard } from "@/components/carbon-dashboard"

export default async function HomePage() {
  let user = null
  let profile = null

  try {
    const supabase = await createClient()
    try {
      const { data, error } = await supabase.auth.getUser()
      user = data?.user || null

      // Get user profile only if user is authenticated
      if (user) {
        try {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
          profile = profileData
        } catch (profileError) {
          // Silently ignore profile fetch errors
        }
      }
    } catch (authError) {
      // Silently handle auth errors - app works in offline mode
    }
  } catch (error) {
    // Silently handle Supabase connection errors
  }

  return <CarbonDashboard user={user} profile={profile} />
}
