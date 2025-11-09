import type { Interest } from "@/lib/ai/customize";
import { neon } from "@neondatabase/serverless";

export interface CreateCustomQuestionInput {
    question_id: number;
    interest: Interest;
    custom_question_text: string;
}

export interface UpdateCustomQuestionInput {
    custom_question_text: string;
    interest: Interest;
}

export async function insertCustomQuestion(data: CreateCustomQuestionInput) {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
        INSERT INTO custom_questions (question_id, interest, custom_question_text)
        VALUES (${data.question_id}, ${data.interest}, ${data.custom_question_text})
    `;
}

export async function updateCustomQuestion(id: number, data: UpdateCustomQuestionInput) {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
        UPDATE custom_questions 
        SET custom_question_text = ${data.custom_question_text}, interest = ${data.interest} 
        WHERE id = ${id}
    `;
}
