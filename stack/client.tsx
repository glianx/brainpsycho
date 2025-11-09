import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/handler/sign-in",
        afterSignIn: "/interests",
        afterSignOut: "/handler/sign-in",
    },
});
