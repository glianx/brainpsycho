import OpenAI from "openai";

// Match database enum - all 10 interests
export type Interest =
    | "Sports"
    | "Art"
    | "Music"
    | "Science"
    | "Cooking"
    | "Gaming"
    | "Nature"
    | "Animals"
    | "Space"
    | "Technology";

// Interest metadata for UI display
export const INTERESTS_CONFIG: Record<
    Interest,
    {
        label: string;
        color: string;
        emoji: string;
    }
> = {
    Sports: { label: "Sports", color: "#FF6B35", emoji: "⚽" },
    Art: { label: "Art", color: "#E63946", emoji: "🎨" },
    Music: { label: "Music", color: "#A855F7", emoji: "🎵" },
    Science: { label: "Science", color: "#3B82F6", emoji: "🔬" },
    Cooking: { label: "Cooking", color: "#F59E0B", emoji: "🍳" },
    Gaming: { label: "Gaming", color: "#10B981", emoji: "🎮" },
    Nature: { label: "Nature", color: "#22C55E", emoji: "🌿" },
    Animals: { label: "Animals", color: "#D97706", emoji: "🐾" },
    Space: { label: "Space", color: "#6366F1", emoji: "🚀" },
    Technology: { label: "Technology", color: "#06B6D4", emoji: "💻" },
};

export interface CustomizedQuestion {
    questionText: string;
    solutionText: string;
}

/**
 * @param questionText - The original question text
 * @param solutionText - The explanatory solution text
 * @param interest - The student's interest to customize around
 * @returns The customized question and answer texts
 */
export async function customizeQuestion(
    questionText: string,
    solutionText: string,
    interest: Interest
): Promise<CustomizedQuestion | null> {
    const client = new OpenAI();

    const res = await client.responses.create({
        model: "gpt-5-nano",
        input: `You are a creative educator who personalizes math problems based on student interests.

SUPER MOST IMPORTANT: USe the MathJax delimiters exactly the same that is \\( \\) for inline and \\[ \\] for display math. just copy those. All math in MathJax syntax.

Original Question: ${questionText}
Original Answer: ${solutionText}
Student Interest: ${interest}

Rewrite this math problem to incorporate the student's interest in ${interest}, while keeping the exact same mathematical structure, difficulty, and solution approach. The numbers and relationships have to remain identical.

Return your response in the following JSON format:
{
    "questionText": "the customized question here",
    "solutionText": "the customized solution here"
}

Make it engaging and relevant to ${interest} enthusiasts!`,
    });

    try {
        const parsed = JSON.parse(res.output_text.trim());
        return {
            questionText: parsed.questionText,
            solutionText: parsed.solutionText,
        };
    } catch (error) {
        console.error("AI couldnt customize properly:", error);
        return null;
    }
}
