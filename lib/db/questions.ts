import type { QuestionCategory } from "@/lib/ai/categorize";
import { neon } from "@neondatabase/serverless";

export interface UpdateQuestionInput {
    q_text?: string;
    solution?: string;
    category?: QuestionCategory;
}

export async function updateQuestion(id: number, data: UpdateQuestionInput) {
    const sql = neon(process.env.DATABASE_URL!);

    if (data.q_text !== undefined) {
        await sql`UPDATE questions SET q_text = ${data.q_text} WHERE id = ${id}`;
    }
    if (data.solution !== undefined) {
        await sql`UPDATE questions SET solution = ${data.solution} WHERE id = ${id}`;
    }
    if (data.category !== undefined) {
        await sql`UPDATE questions SET category = ${data.category} WHERE id = ${id}`;
    }
}
