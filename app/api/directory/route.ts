import { getQuestionsByCategory } from "@/lib/db/directory";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const categorizedQuestions = await getQuestionsByCategory();
        return NextResponse.json(categorizedQuestions);
    } catch (error) {
        console.error("Error fetching questions by category:", error);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}
