import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv'
import OpenAI from "openai";

dotenv.config({ path: '../.env'})

const sql = neon(process.env.DATABASE_URL)
const client = new OpenAI();

const qs = await sql`select * from questions`
console.log(qs)

for (const q of qs) {
    console.log(q[q.answer])
}

await Promise.all(
    qs.filter(q => q.id >= 1).map(async q => {
        console.log(q.id)
        const res = await client.responses.create({
            model: "gpt-5",
            input: 
                `how to solve this question: 
                <<< input >>> 
                ${q.q_text}. 
                <<< /input >>>
                the correct answer is ${q[q.answer]}.
                output with \\( and \\) delimiters for LaTeX and box the answer.

                below are sample input/output format and style.
                
                <<< input >>>
                Annika and \\(3\\) of her friends play Buffalo Shuffle-o with \\(15\\) cards each. Suppose \\(2\\) more friends join. How many cards will each player get?
                <<< /input >>>

                <<< output >>>
                The total number of cards is \\(4\\times 15=60\\). With \\(2\\) more friends, there are \\(4+2=6\\) players in total. 
                
                Thus, each player receives \\(60\\div 6=\\boxed{10}\\) cards.
                <<< /output >>>

                <<< input >>>
                Lucius is counting backward by 7s. His first three numbers are 100,93,86. What is his 10th number?
                <<< /input >>>

                <<< output >>>
                This is an arithmetic sequence with difference \\(-7\\), so the \\(n^{th}\\) term is \\(a_n=100-7(n-1)\\). 
                
                For \\(n=10\\), \\(a_10=100-7\\cdot9=100-63=\\boxed{37}\\).
                <<< /output >>>
                 `,
        });
        const msg = res.output_text
        console.log(msg)
    
        await sql`update questions set solution = ${msg} where id = ${q.id}`
    })
)