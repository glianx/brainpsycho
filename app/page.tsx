import AIDialogue from "@/components/AIDialogue";
import QuestionClient from "@/components/QuestionClient"; // client component
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

        <div className="sticky top-6 self-start w-[30vw] min-w-[300px] max-w-[500px] overflow-y-auto p-6">
            <div className="mb-4 p-3 bg-gray-900 text-white rounded-lg shadow-md text-center font-semibold text-lg border border-gray-700">
                Math Tutor
            </div>
            <div  className="overflow-y-auto">
                <AIDialogue questions={initial}/>
            </div>
        </div>
        </div>
    );
}
