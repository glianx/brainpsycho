import OpenAI from "openai";
const client = new OpenAI();

export async function POST(req: Request) {
    const origin = req.headers.get("origin") ?? "";
    console.log("ORIGIN:::", origin);
    if (!["https://brainpsycho.com", "http://localhost:3000"].includes(origin))
        return new Response("Forbidden", { status: 403 });

    const key = req.headers.get("x-internal-key");
    if (key !== process.env.INTERNAL_KEY) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { q_text, systemPrompt } = body;

    console.log("🧩 systemPrompt:", systemPrompt?.slice(0, 500)); // log first 500 chars
    console.log("🧩 q_text:", q_text);

    const res = await client.responses.create({
        model: "gpt-5-nano",
        input: [
            {
                role: "system",
                content:
                    systemPrompt ??
                    "Give a pedagogical, detailed explanation of how to solve this question. Do not ask for more information about the problem or ask for images. Tell the user to use the chatbox if they have more questions.",
            },
            { role: "user", content: q_text },
        ],
    });

    return new Response(res.output_text);
}
