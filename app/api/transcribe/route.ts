import { createClient } from '@supabase/supabase-js'

export async function POST() {
  console.log("API CALISTI")

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from("transcriptions")
      .insert([{ status: "pending" }])
      .select()

    console.log("DATA:", data)
    console.log("ERROR:", error)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, data })

  } catch (err) {
    console.error("CRASH:", err)
    return Response.json({ error: "server error" }, { status: 500 })
  }
}