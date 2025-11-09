//needed to fetch to chat from front end
export async function POST(req: Request) {
    const { q_text, systemPrompt } = await req.json();

    try {
        const res = await fetch(
            `${process.env.API_BASE_URL ?? "http://localhost:3000"}/api/askChat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-internal-key": process.env.INTERNAL_KEY!,
                    Origin: "http://localhost:3000",
                },
                body: JSON.stringify({
                    q_text,
                    systemPrompt,
                }),
            }
        );

        console.log("[chatProxy] askChat status:", res.status);

        const output = await res.text();
        console.log("[chatProxy] askChat response:", output);

        return new Response(output, { status: res.status });
    } catch (error) {
        console.error("[chatProxy] error:", error);
        return new Response("Proxy failed", { status: 500 });
    }
}
