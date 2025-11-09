// TEMPORARILY DISABLED - Waiting for Stack Auth keys
// This middleware currently allows all requests through without authentication
// When you have Stack Auth keys, uncomment the code below and remove the temporary middleware

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
    // Temporarily allow all requests through without authentication
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

/* ORIGINAL AUTH MIDDLEWARE - Uncomment when Stack Auth is ready

import { stackServerApp } from "@/stack/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow Stack auth handler routes
    if (pathname.startsWith("/handler")) {
        return NextResponse.next();
    }

    // Allow API routes (they handle their own auth)
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // Allow static files
    if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.includes(".")) {
        return NextResponse.next();
    }

    // Check authentication
    const user = await stackServerApp.getUser();

    // If not authenticated, redirect to sign-in
    if (!user) {
        const signInUrl = new URL("/handler/sign-in", request.url);
        signInUrl.searchParams.set("after_auth_return_to", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // User is authenticated - allow access to interests page and all other protected routes
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};

*/
