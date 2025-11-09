"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuestionsByCategory } from "@/lib/db/directory";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { QuestionCard } from "./QuestionCard";

interface CategoryDeckProps {
    categoryData: QuestionsByCategory;
}

const categoryColors: Record<string, string> = {
    Algebra: "bg-blue-500",
    Geometry: "bg-green-500",
    "Number Theory": "bg-purple-500",
    Combinatorics: "bg-orange-500",
    Probability: "bg-pink-500",
    Other: "bg-gray-500",
};

const categoryEmojis: Record<string, string> = {
    Algebra: "🔢",
    Geometry: "📐",
    "Number Theory": "🔢",
    Combinatorics: "🎲",
    Probability: "📊",
    Other: "📚",
};

export function CategoryDeck({ categoryData }: CategoryDeckProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="category-deck-container mb-8">
            {/* Deck Header/Trigger */}
            <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                    isExpanded ? "mb-6" : ""
                }`}
                onClick={handleToggle}
            >
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-lg ${categoryColors[categoryData.category]} flex items-center justify-center text-2xl`}
                            >
                                {categoryEmojis[categoryData.category]}
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{categoryData.category}</CardTitle>
                                <Badge variant="secondary" className="mt-1">
                                    {categoryData.count} question
                                    {categoryData.count !== 1 ? "s" : ""}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            {isExpanded ? (
                                <ChevronUp className="h-6 w-6" />
                            ) : (
                                <ChevronDown className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Expanded Cards */}
            {isExpanded && (
                <div
                    style={{
                        position: "relative",
                        transition: "opacity 0.5s ease",
                    }}
                >
                    {categoryData.count > 0 ? (
                        <div
                            className="cards-container"
                            style={{
                                position: "relative",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "2rem",
                                justifyContent: "flex-start",
                            }}
                        >
                            {categoryData.questions.map((question) => (
                                <QuestionCard key={question.id} question={question} />
                            ))}
                        </div>
                    ) : (
                        <Card className="mt-4">
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No questions in this category yet.
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
