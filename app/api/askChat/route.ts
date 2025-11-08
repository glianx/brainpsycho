import OpenAI from "openai";
const client = new OpenAI();

export async function POST(req: Request) {
    const origin = req.headers.get("origin") ?? "";
    console.log("ORIGIN:::", origin);
    if (!["https://brainpsycho.com", "http://localhost:3000"].includes(origin))
        return new Response("Forbidden", { status: 403 });

    const key = req.headers.get("x-internal-key");
    if (key !== process.env.INTERNAL_KEY) return new Response("Unauthorized", { status: 401 });

    const q_text = await req.text();
    const res = await client.responses.create({
        model: "gpt-5-nano",
        input: `give a pedagogical, detailed explanation of how to solve this question: ${q_text}`,
    });

    return new Response(res.output_text);
}
