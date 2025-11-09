// stack.ts (in your root directory or lib folder)
import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
});