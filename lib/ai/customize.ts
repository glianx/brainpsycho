import OpenAI from "openai";

// match to dc with drizzle
export type Interest = "Sports" | "Music" | "Art";

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
