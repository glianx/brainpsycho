import AIDialogue from "@/components/AIDialogue";
import { FilterBar } from "@/components/FilterBar";
import QuestionClient from "@/components/QuestionClient"; // client component
// TEMPORARILY DISABLED - Waiting for Stack Auth keys
// import { stackServerApp } from "@/stack/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";

export default async function Home() {
    // TEMPORARILY DISABLED - Waiting for Stack Auth keys
    // Using real user from database for testing purposes
    const user = { id: "43ded5e3-7c58-4219-b4cb-380f5adab974" }; // phillip

    /* Original auth code - uncomment when Stack Auth is ready
    // Check if user is authenticated
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect("/handler/sign-in");
    }
    */

    // Check if user has selected interests
    const sql = neon(process.env.DATABASE_URL!);
    const userResult = await sql`
        SELECT interests 
        FROM neon_auth.users_sync 
        WHERE id = ${user.id}
    `;

    let interests = userResult[0]?.interests || [];

    // Parse PostgreSQL array format if needed
    if (typeof interests === "string") {
        interests = interests
            .replace(/^\{/, "")
            .replace(/\}$/, "")
            .split(",")
            .filter((i) => i.trim() !== "");
    }

    // If no interests selected, redirect to interests page
    if (interests.length === 0) {
        redirect("/interests");
    }

    // Fetch custom questions that match ANY of the user's interests
    // Schema: custom_questions has (id, question_id, interest, custom_question_text, custom_solution)
    // Schema: questions has (id, year, contest, grade, q_num, q_text, a, b, c, d, e, answer, solution, category)
    const customQuestions = await sql`
        SELECT 
            custom_questions.id,
            custom_questions.question_id,
            custom_questions.interest,
            custom_questions.custom_question_text as q_text,
            custom_questions.custom_solution as solution,
            questions.a,
            questions.b,
            questions.c,
            questions.d,
            questions.e,
            questions.answer,
            questions.category,
            questions.year,
            questions.contest,
            questions.grade,
            questions.q_num
        FROM custom_questions
        JOIN questions ON custom_questions.question_id = questions.id
        WHERE custom_questions.interest = ANY(${interests}::interest[])
    `;

    const initial = JSON.parse(JSON.stringify(customQuestions));

    return (
        <div className="flex flex-col gap-6 p-6">
            <FilterBar />
            <div className="flex gap-6">
                <div className="flex-1">
                    <QuestionClient initialQuestions={initial} />
                </div>

                <div className="sticky top-6 self-start w-[30vw] min-w-[300px] max-w-[500px] overflow-y-auto p-6">
                    <div className="mb-4 p-3 bg-gray-900 text-white rounded-lg shadow-md text-center font-semibold text-lg border border-gray-700">
                        Math Tutor
                    </div>
                    <div className="overflow-y-auto">
                        <AIDialogue questions={initial} />
                    </div>
                </div>
            </div>
        </div>
    );
}
