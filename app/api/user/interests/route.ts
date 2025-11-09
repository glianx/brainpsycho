// TEMPORARILY DISABLED - Waiting for Stack Auth keys
// import { stackServerApp } from "@/stack/server";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

// GET: Fetch user's interests
export async function GET() {
    try {
        // TEMPORARILY DISABLED - Using mock user for testing
        const user = { id: "43ded5e3-7c58-4219-b4cb-380f5adab974" }; // phillip

        /* Original auth code - uncomment when Stack Auth is ready
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        */

        // Fetch interests from neon_auth.users_sync
        const result = await sql`
            SELECT interests 
            FROM neon_auth.users_sync 
            WHERE id = ${user.id}
        `;

        // PostgreSQL returns array as string like "{Art,Music}" - parse it properly
        let interests = result[0]?.interests || [];

        // If interests is a string (PostgreSQL array format), parse it
        if (typeof interests === "string") {
            // Remove curly braces and split by comma
            interests = interests
                .replace(/^\{/, "")
                .replace(/\}$/, "")
                .split(",")
                .filter((i) => i.trim() !== "");
        }

        return NextResponse.json({ interests });
    } catch (error) {
        console.error("Error fetching interests:", error);
        return NextResponse.json({ error: "Failed to fetch interests" }, { status: 500 });
    }
}

// POST: Save user's interests
export async function POST(req: NextRequest) {
    try {
        // TEMPORARILY DISABLED - Using mock user for testing
        const user = { id: "43ded5e3-7c58-4219-b4cb-380f5adab974" }; // phillip

        /* Original auth code - uncomment when Stack Auth is ready
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        */

        const body = await req.json();
        const { interests } = body;

        // Validate interests array
        if (!Array.isArray(interests)) {
            return NextResponse.json({ error: "Interests must be an array" }, { status: 400 });
        }

        if (interests.length > 5) {
            return NextResponse.json({ error: "Maximum 5 interests allowed" }, { status: 400 });
        }

        // Valid interest types matching the enum
        const validInterests = [
            "Sports",
            "Art",
            "Music",
            "Science",
            "Cooking",
            "Gaming",
            "Nature",
            "Animals",
            "Space",
            "Technology",
        ];

        const invalidInterests = interests.filter((interest) => !validInterests.includes(interest));

        if (invalidInterests.length > 0) {
            return NextResponse.json(
                { error: `Invalid interests: ${invalidInterests.join(", ")}` },
                { status: 400 }
            );
        }

        // Update interests in neon_auth.users_sync
        await sql`
            UPDATE neon_auth.users_sync 
            SET interests = ${interests}::interest[]
            WHERE id = ${user.id}
        `;

        return NextResponse.json({
            success: true,
            interests,
        });
    } catch (error) {
        console.error("Error saving interests:", error);
        return NextResponse.json({ error: "Failed to save interests" }, { status: 500 });
    }
}
