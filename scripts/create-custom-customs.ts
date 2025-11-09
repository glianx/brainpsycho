import { INTERESTS_CONFIG } from "@/lib/ai/customize";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { customizeQuestion, type Interest } from "../lib/ai/customize";
import { insertCustomQuestion } from "../lib/db/custom_questions";

dotenv.config();

// All interests to generate customizations for
const INTERESTS: Interest[] = Object.keys(INTERESTS_CONFIG) as Interest[];

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

    const QUESTIONS_PER_INTEREST = 25;
    let totalCreated = 0;
    let totalFailed = 0;

    for (const interest of INTERESTS) {
        console.log(`\n🎯 Processing interest: ${interest}`);
        console.log(`${"=".repeat(50)}`);

        // Get all questions with solutions - fresh connection
        const sql = neon(process.env.DATABASE_URL!);
        const questions = await sql`
            SELECT id, q_text, solution 
            FROM questions 
            WHERE solution IS NOT NULL
            ORDER BY id
        `;

        let created = 0;
        let failed = 0;

        for (const question of questions) {
            // Stop if we've already created enough for this interest
            if (created >= QUESTIONS_PER_INTEREST) {
                console.log(`\n✅ Reached ${QUESTIONS_PER_INTEREST} questions for ${interest}`);
                break;
            }

            try {
                const existing = await retryWithBackoff(async () => {
                    const checkSql = neon(process.env.DATABASE_URL!);
                    return await checkSql`
                        SELECT id FROM custom_questions 
                        WHERE question_id = ${question.id} AND interest = ${interest}
                    `;
                });

                if (existing.length > 0) {
                    console.log(`  ⏭️  Q${question.id}: Already exists, skipping`);
                    continue;
                }

                console.log(`  📝 Q${question.id}: ${question.q_text.substring(0, 60)}...`);
                console.log(`  🎯 Customizing for ${interest}...`);

                const customized = await customizeQuestion(
                    question.q_text,
                    question.solution,
                    interest
                );

                if (!customized) {
                    console.log("  ❌ AI failed to customize");
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

                console.log(`  ✅ Created! (${created + 1}/${QUESTIONS_PER_INTEREST})`);
                created++;
            } catch (error) {
                console.error("  ❌ Error -", error);
                failed++;
            }
        }

        console.log(`\n📊 ${interest} Summary: ${created} created, ${failed} failed`);
        totalCreated += created;
        totalFailed += failed;
    }

    console.log(
        `\n✨ Done! Total: ${totalCreated} created, ${totalFailed} failed across all interests`
    );
}

createCustomQuestions().catch(console.error);
