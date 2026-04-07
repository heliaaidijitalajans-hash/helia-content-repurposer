import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    console.log("API HIT")

    const body = await req.json()
    const { userId } = body

    // 1. Job oluştur
    const { data, error } = await supabase
      .from("transcription_jobs")
      .insert([
        {
          user_id: userId || "test-user",
          status: "pending",
          progress: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("DB ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("JOB CREATED:", data.id)

    return NextResponse.json({
      success: true,
      jobId: data.id,
    })
  } catch (err: any) {
    console.error("API ERROR:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}