import QuestionClient from "@/components/QuestionClient"; // client component
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const questions = await sql`select * from questions`;

export default async function Home() {
    const initial = JSON.parse(JSON.stringify(questions));

    return (
        <>
            <QuestionClient initialQuestions={initial} />
        </>
    );
}
