"use client";

import dynamic from "next/dynamic";

// Dynamically import MathJax with SSR disabled
const MathJax = dynamic(() => import("better-react-mathjax").then((mod) => mod.MathJax), {
    ssr: false,
    loading: () => <span>...</span>,
});

/**
 * Client-side only MathJax wrapper to prevent hydration mismatches.
 * Uses dynamic import with ssr: false to ensure MathJax only renders on client.
 * The `dynamic` prop tells MathJax to re-process content when it changes.
 */
export function MathContent({ children }: { children: string }) {
    return (
        <MathJax dynamic hideUntilTypeset="first">
            {children}
        </MathJax>
    );
}
