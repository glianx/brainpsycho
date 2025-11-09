import OpenAI from "openai";

// match db enum, maybe drizzle for ease
export type QuestionCategory =
    | "Algebra"
    | "Geometry"
    | "Number Theory"
    | "Combinatorics"
    | "Probability"
    | "Other";

/**
 * @param questionText - The question text to categorize
 * @returns QuestionCategory
 */
export async function categorizeQuestion(questionText: string): Promise<QuestionCategory> {
    const client = new OpenAI();

    const res = await client.responses.create({
        model: "gpt-5-nano",
        input: `Categorize this math question into ONE of these categories: Algebra, Geometry, Number Theory, Combinatorics, Probability, Other.

Question: ${questionText}

Return ONLY the category name, nothing else.
Return a single word from the list above that fits best to the Question.
It is of highest importance that it is only this single word and match Character by character, nothing else.`,
    });

    const category = res.output_text.trim() as QuestionCategory;

    const validCategories: QuestionCategory[] = [
        "Algebra",
        "Geometry",
        "Number Theory",
        "Combinatorics",
        "Probability",
        "Other",
    ];

    if (validCategories.includes(category)) {
        return category;
    }

    console.warn("Ai fked up lol, fallback, got:", category);
    return "Other" as QuestionCategory;
}
