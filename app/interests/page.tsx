"use client";

import { InterestBubble } from "@/components/interests/InterestBubble";
import { Button } from "@/components/ui/button";
import { Interest, INTERESTS_CONFIG } from "@/lib/ai/customize";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Generate circular random positions for bubbles
function generateCircularPositions(count: number) {
    const positions: Array<{ x: number; y: number; duration: number }> = [];
    const centerX = 50;
    const centerY = 50;
    const radiusX = 35; // Horizontal radius (percentage)
    const radiusY = 30; // Vertical radius (percentage)

    for (let i = 0; i < count; i++) {
        // Calculate angle with slight randomization
        const baseAngle = (i / count) * 2 * Math.PI;
        const angleOffset = (Math.random() - 0.5) * 0.5; // Random offset
        const angle = baseAngle + angleOffset;

        // Calculate position with some radius variation
        const radiusVariation = 0.8 + Math.random() * 0.4; // 80-120% of base radius
        const x = centerX + Math.cos(angle) * radiusX * radiusVariation;
        const y = centerY + Math.sin(angle) * radiusY * radiusVariation;

        // Random animation duration between 2-4 seconds
        const duration = 2 + Math.random() * 2;

        positions.push({ x, y, duration });
    }

    return positions;
}

export default function InterestsPage() {
    const router = useRouter();
    const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const allInterests = Object.keys(INTERESTS_CONFIG) as Interest[];

    // Generate positions only once on mount
    const bubblePositions = useMemo(
        () => generateCircularPositions(allInterests.length),
        [allInterests.length]
    );

    // Fetch existing interests on mount
    useEffect(() => {
        async function fetchInterests() {
            try {
                const response = await fetch("/api/user/interests");
                if (response.ok) {
                    const data = await response.json();
                    setSelectedInterests(data.interests || []);
                }
            } catch (err) {
                console.error("Failed to fetch interests:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchInterests();
    }, []);

    const toggleInterest = (interest: Interest) => {
        setSelectedInterests((prev) => {
            if (prev.includes(interest)) {
                return prev.filter((i) => i !== interest);
            } else {
                // Max 5 interests
                if (prev.length >= 5) {
                    setError("You can select up to 5 interests");
                    setTimeout(() => setError(null), 3000);
                    return prev;
                }
                return [...prev, interest];
            }
        });
        setError(null);
    };

    const handleSave = async () => {
        if (selectedInterests.length === 0) {
            setError("Please select at least 1 interest");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch("/api/user/interests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ interests: selectedInterests }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save interests");
            }

            // Redirect to home page after successful save
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save interests");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = async () => {
        // Save empty array (allowing user to skip for now)
        setIsSaving(true);
        try {
            await fetch("/api/user/interests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ interests: ["Art"] }), // Default to at least one
            });
            router.push("/");
        } catch (err) {
            console.error("Skip failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading your interests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
            {/* Header */}
            <div className="container mx-auto px-4 pt-8 pb-4 text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
                    What are you interested in? ✨
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                    Select 1-5 interests to personalize your math adventure!
                </p>
                <p className="text-sm text-gray-500">Drag them around for fun! Click to select.</p>
                <div className="mt-4">
                    <span className="text-2xl font-bold text-blue-600">
                        {selectedInterests.length} / 5
                    </span>
                    <span className="text-gray-600 ml-2">selected</span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-md mx-auto mb-4 px-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                </div>
            )}

            {/* Floating Bubbles Container */}
            <div className="relative w-full h-[500px] sm:h-[600px]">
                {allInterests.map((interest, index) => (
                    <InterestBubble
                        key={interest}
                        interest={interest}
                        isSelected={selectedInterests.includes(interest)}
                        onToggle={() => toggleInterest(interest)}
                        initialX={bubblePositions[index].x}
                        initialY={bubblePositions[index].y}
                        animationDuration={bubblePositions[index].duration}
                    />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="container mx-auto px-4 pb-8">
                <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={handleSave}
                        disabled={selectedInterests.length === 0 || isSaving}
                        className="flex-1 h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                        {isSaving ? "Saving..." : "Save & Continue"}
                    </Button>
                    <Button
                        onClick={handleSkip}
                        variant="outline"
                        disabled={isSaving}
                        className="sm:w-32 h-12"
                    >
                        Skip for now
                    </Button>
                </div>
            </div>
        </div>
    );
}
