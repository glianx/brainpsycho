//needed to fetch to chat from front end
export async function POST(req: Request) {
  const text = await req.text();
  console.log("[chatProxy] received text:", text);

  try {
    const res = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:3000"}/api/askChat`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "x-internal-key": process.env.INTERNAL_KEY!,
        "Origin": "http://localhost:3000",
      },
      body: text,
    });

    console.log("[chatProxy] askChat status:", res.status);

    const output = await res.text();
    console.log("[chatProxy] askChat response:", output);

    return new Response(output, { status: res.status });
  } catch (error) {
    console.error("[chatProxy] error:", error);
    return new Response("Proxy failed", { status: 500 });
  }
}

