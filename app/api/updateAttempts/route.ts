import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user from Stack Auth
        const user = await stackServerApp.getUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { questionId, userAnswer, timeTaken } = body;

        // Insert a new attempt record (no update - each attempt is a new row)
        await sql`
            INSERT INTO fluency (
                user_id, 
                question_id, 
                user_answer, 
                time_taken,
                attempts_taken
            )
            VALUES (
                ${user.id},
                ${questionId}, 
                ${userAnswer}, 
                ${timeTaken},
                1
            )
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
            { error: "Failed to save response" },
            { status: 500 }
        );
    }
}