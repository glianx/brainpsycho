"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// TEMPORARILY DISABLED - Waiting for Stack Auth keys
// import { useUser } from "@stackframe/stack";
import { Heart, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
    // TEMPORARILY DISABLED - Using mock user for testing
    const user = {
        displayName: "phillip",
        primaryEmail: "phillip.sievers@gmx.de",
    };

    /* Original auth code - uncomment when Stack Auth is ready
    const user = useUser();
    */
    const router = useRouter();

    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.displayName || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.primaryEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/interests")}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>My Interests</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        // TEMPORARILY DISABLED - Mock sign out
                        router.push("/");
                    }}
                    className="text-red-600 focus:text-red-600"
                >
                    {/* Original: onClick={() => user.signOut()} */}
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
