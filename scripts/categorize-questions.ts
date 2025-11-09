import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { categorizeQuestion } from "../lib/ai/categorize";
import { updateQuestion } from "../lib/db/questions";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function categorizeAllQuestions() {
    console.log("🏷️  Starting to categorize all questions...\n");

    // Get all questions
    const questions = await sql`SELECT id, q_text, category FROM questions`;
    console.log(`Found ${questions.length} questions to categorize\n`);

    let categorized = 0;
    let skipped = 0;

    for (const question of questions) {
        // Skip if already categorized (not 'Other')
        if (question.category && question.category !== "Other") {
            console.log(
                `⏭️  Skipping Q${question.id} - already categorized as ${question.category}`
            );
            skipped++;
            continue;
        }

        try {
            console.log(`\n📝 Q${question.id}: ${question.q_text.substring(0, 80)}...`);

            // Categorize using AI
            const category = await categorizeQuestion(question.q_text);
            console.log(`✅ Category: ${category}`);

            // Update in database
            await updateQuestion(question.id, { category });

            categorized++;
        } catch (error) {
            console.error(`❌ Error categorizing Q${question.id}:`, error);
        }
    }

    console.log(`\n✨ Done! Categorized ${categorized} questions, skipped ${skipped}`);
}

categorizeAllQuestions().catch(console.error);
