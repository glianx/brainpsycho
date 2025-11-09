"use client";

import { Button } from "@/components/ui/button";
import { FolderTree, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function FilterBar() {
    const router = useRouter();

    return (
        <div className="w-full mb-6">
            <div className="flex gap-3 items-center justify-center">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/interests")}
                    className="flex items-center gap-2 px-6"
                >
                    <Sparkles className="h-5 w-5" />
                    <span>Set Interests</span>
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/directory")}
                    className="flex items-center gap-2 px-6"
                >
                    <FolderTree className="h-5 w-5" />
                    <span>Browse Categories</span>
                </Button>
            </div>
        </div>
    );
}
