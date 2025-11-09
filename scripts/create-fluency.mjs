import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const sql = neon(process.env.DATABASE_URL);

console.log(await sql`select * from neon_auth.users_sync`);

await sql`create table fluency (
    id serial primary key,
    user_id text not null references neon_auth.users_sync(id) on delete cascade,
    question_id integer not null references questions(id) on delete cascade,
    user_answer text not null,
    time_taken integer not null,
    attempts_taken integer not null,
    attempted_at timestamptz default current_timestamp
)`;
