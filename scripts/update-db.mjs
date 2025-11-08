import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv'
import OpenAI from "openai";

dotenv.config({ path: '../.env'})

const sql = neon(process.env.DATABASE_URL)
const client = new OpenAI();

const qs = await sql`select * from questions`
console.log(qs)

for (const q of qs) {
    if (q.solution == null) {
        console.log(q.id)
        const res = await client.responses.create({
            model: "gpt-5-nano",
            input: 
                `how to solve this question: ${q.q_text}. 
                 output with \\( and \\) delimiters for LaTeX. 
                 an example for correct format is: Place \\(ABCD\\) with \\(AB=5,AD=3\\). Rotate \\(90^{\\circ}\\) about the midpoint of \\(DC\\); the overlap area is a right triangle pair totaling \\(6.25\\,\\text{in}^2\\). Union area \\(=2\\cdot(5\\cdot3)-6.25=30-6.25=23.75\\,\\text{in}^2\\).
                 `,
        });
        const msg = res.output_text
        console.log(msg)
    
        await sql`update questions set solution = ${msg} where id = ${q.id}`
    }
}