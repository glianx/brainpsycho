import QuestionClient from "@/components/QuestionClient"; // client component
import AIDialogue from "@/components/AIDialogue";
import { neon } from "@neondatabase/serverless";

export default async function Home() {
    const sql = neon(process.env.DATABASE_URL!);
    const questions = await sql`select * from questions`; 

    const initial = JSON.parse(JSON.stringify(questions));

    return (
        <div className="flex gap-6 p-6">
            <div className="flex-1">
                <QuestionClient initialQuestions={initial} />
            </div>

        <div className="w-[400px]">
            <AIDialogue />
        </div>
        </div>
    );
}
