export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    console.log("FILE:", file.name);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("FORMDATA ERROR:", err);
    return new Response(JSON.stringify({ error: "FormData okunamadı" }), {
      status: 500,
    });
  }
}
