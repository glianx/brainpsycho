import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { customizeQuestion, type Interest } from "../lib/ai/customize";
import { insertCustomQuestion } from "../lib/db/custom_questions";

dotenv.config();

// All interests to generate customizations for
const INTERESTS: Interest[] = ["Sports", "Music", "Art"];

// Retry helper function
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const waitTime = delay * Math.pow(2, i);
            console.log(`  ⏳ Retry ${i + 1}/${maxRetries} in ${waitTime}ms...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    }
    throw new Error("Max retries exceeded");
}

async function createCustomQuestions() {
    console.log("🎨 Starting to create custom questions...\n");

    // Get all questions with solutions - fresh connection
    const sql = neon(process.env.DATABASE_URL!);
    const questions = await sql`
        SELECT id, q_text, solution 
        FROM questions 
        WHERE solution IS NOT NULL
    `;
    console.log(`Found ${questions.length} questions with solutions\n`);

    let created = 0;
    let failed = 0;

    for (const question of questions) {
        console.log(`\n📝 Q${question.id}: ${question.q_text.substring(0, 60)}...`);

        for (const interest of INTERESTS) {
            try {
                const existing = await retryWithBackoff(async () => {
                    const checkSql = neon(process.env.DATABASE_URL!);
                    return await checkSql`
                        SELECT id FROM custom_questions 
                        WHERE question_id = ${question.id} AND interest = ${interest}
                    `;
                });

                if (existing.length > 0) {
                    console.log(`  ⏭️  ${interest}: Already exists, skipping`);
                    continue;
                }

                console.log(`  🎯 Customizing for ${interest}...`);
                const customized = await customizeQuestion(
                    question.q_text,
                    question.solution,
                    interest
                );

                if (!customized) {
                    console.log(`  ❌ ${interest}: AI failed to customize`);
                    failed++;
                    continue;
                }

                await retryWithBackoff(async () => {
                    await insertCustomQuestion({
                        question_id: question.id,
                        interest: interest,
                        custom_question_text: customized.questionText,
                        custom_solution: customized.solutionText,
                    });
                });

                console.log(`  ✅ ${interest}: Created!`);
                created++;
            } catch (error) {
                console.error(`  ❌ ${interest}: Error -`, error);
                failed++;
            }
        }
    }

    console.log(`\n✨ Done! Created ${created} custom questions, failed ${failed}`);
}

createCustomQuestions().catch(console.error);
