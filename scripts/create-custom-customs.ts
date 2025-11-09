import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { customizeQuestion, type Interest } from "../lib/ai/customize";
import { insertCustomQuestion } from "../lib/db/custom_questions";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

// All interests to generate customizations for
const INTERESTS: Interest[] = ["Sports", "Music", "Art"];

async function createCustomQuestions() {
    console.log("🎨 Starting to create custom questions...\n");

    // Get all questions with solutions
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
                // Check if customization already exists
                const existing = await sql`
                    SELECT id FROM custom_questions 
                    WHERE question_id = ${question.id} AND interest = ${interest}
                `;

                if (existing.length > 0) {
                    console.log(`  ⏭️  ${interest}: Already exists, skipping`);
                    continue;
                }

                // Generate customization using AI
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

                // Insert into database
                await insertCustomQuestion({
                    question_id: question.id,
                    interest: interest,
                    custom_question_text: customized.questionText,
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
