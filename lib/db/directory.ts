import type { QuestionCategory } from "@/lib/ai/categorize";
import { neon } from "@neondatabase/serverless";

export interface Question {
    id: number;
    q_num: number;
    q_text: string;
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    answer: string;
    solution: string;
    contest: string;
    grade: string;
    year: number;
    category: QuestionCategory;
}

export interface QuestionsByCategory {
    category: QuestionCategory;
    questions: Question[];
    count: number;
}

/**
 * Fetch all questions grouped by category
 */
export async function getQuestionsByCategory(): Promise<QuestionsByCategory[]> {
    const sql = neon(process.env.DATABASE_URL!);

    const questions = (await sql`
        SELECT 
            id, q_num, q_text, a, b, c, d, e, answer, solution, 
            contest, grade, year, category
        FROM questions
        WHERE category IS NOT NULL
        ORDER BY category, q_num
    `) as Question[];

    // Group by category
    const categories: QuestionCategory[] = [
        "Algebra",
        "Geometry",
        "Number Theory",
        "Combinatorics",
        "Probability",
        "Other",
    ];

    return categories.map((category) => {
        const categoryQuestions = questions.filter((q) => q.category === category);
        return {
            category,
            questions: categoryQuestions,
            count: categoryQuestions.length,
        };
    });
}

/**
 * Fetch questions for a specific category
 */
export async function getQuestionsBySpecificCategory(
    category: QuestionCategory
): Promise<Question[]> {
    const sql = neon(process.env.DATABASE_URL!);

    const questions = (await sql`
        SELECT 
            id, q_num, q_text, a, b, c, d, e, answer, solution, 
            contest, grade, year, category
        FROM questions
        WHERE category = ${category}
        ORDER BY q_num
    `) as Question[];

    return questions;
}
