import QuestionClient from "@/components/QuestionClient"; // client component
import { neon } from "@neondatabase/serverless";

export default async function Home() {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`update questions set q_text = 'What percent of the entire \\(4 \\times 4\\) grid is covered by the star?' where questions.id=1`
    await sql`update questions set a = '\\(40\\)' where questions.id=1`
    const questions = await sql`select * from questions`; 

    const initial = JSON.parse(JSON.stringify(questions));

    return (
        <>
            <QuestionClient initialQuestions={initial} />
        </>
    );
}
