"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Question } from "@/lib/db/directory";
import { useEffect, useRef, useState } from "react";

interface QuestionCardProps {
    question: Question;
}

declare global {
    interface Window {
        MathJax?: {
            typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
            typesetClear?: (elements?: HTMLElement[]) => void;
        };
    }
}

export function QuestionCard({ question }: QuestionCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [selected, setSelected] = useState<string>("");
    const [feedback, setFeedback] = useState("");
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    // Typeset math with MathJax when content loads or flips
    useEffect(() => {
        if (window.MathJax?.typesetPromise) {
            const elements = [];
            if (frontRef.current) elements.push(frontRef.current);
            if (backRef.current) elements.push(backRef.current);
            window.MathJax.typesetPromise(elements).catch((err) =>
                console.error("MathJax typesetting error:", err)
            );
        }
    }, [question, isFlipped]);

    function handleSubmission(e: React.MouseEvent, selectedAnswer: string) {
        e.stopPropagation(); // Prevent card flip when clicking answer buttons
        setSelected(selectedAnswer);
        if (question.answer === selectedAnswer) {
            setFeedback("Correct! 🎉");
        } else {
            setFeedback("Try again.");
        }
    }

    function getVariant(l: string): "outline" | "correct" | "incorrect" {
        if (selected === l) {
            if (l === question.answer) return "correct";
            return "incorrect";
        }
        return "outline";
    }

    const handleFlip = (e?: React.MouseEvent) => {
        if (e) {
            // Check if click was on a button or interactive element
            const target = e.target as HTMLElement;
            if (
                target.tagName === "BUTTON" ||
                target.closest("button") ||
                target.closest("[role=\"button\"]")
            ) {
                return; // Don't flip if clicking on buttons
            }
        }
        setIsFlipped(!isFlipped);
    };

    return (
        <div
            className="question-card-wrapper"
            style={{
                width: "100%",
                maxWidth: "550px",
            }}
        >
            <div
                className="card-flip-container"
                style={{
                    perspective: "1000px",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        transition: "transform 0.6s",
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                >
                    {/* Front of card */}
                    <div
                        ref={frontRef}
                        style={{
                            backfaceVisibility: "hidden",
                            position: isFlipped ? "absolute" : "relative",
                            width: "100%",
                            top: 0,
                            left: 0,
                        }}
                    >
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={handleFlip}
                        >
                            <CardHeader>
                                <CardTitle>Question {question.q_num}</CardTitle>
                                <CardDescription>
                                    {question.contest} {question.grade}, {question.year}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="py-2 text-sm">{question.q_text}</div>
                                <ButtonGroup className="py-4 flex-wrap justify-center">
                                    {(["a", "b", "c", "d", "e"] as const).map((l) => (
                                        <Button
                                            key={l}
                                            variant={getVariant(l)}
                                            onClick={(e) => handleSubmission(e, l)}
                                            className="min-w-20"
                                        >
                                            {question[l]}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                                {feedback && (
                                    <p className="py-2 text-lg font-semibold text-center">
                                        {feedback}
                                    </p>
                                )}
                                <div className="mt-2 text-xs text-muted-foreground text-center">
                                    Click card to see solution
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div
                        ref={backRef}
                        style={{
                            backfaceVisibility: "hidden",
                            position: isFlipped ? "relative" : "absolute",
                            width: "100%",
                            top: 0,
                            left: 0,
                            transform: "rotateY(180deg)",
                        }}
                    >
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-shadow bg-secondary/10"
                            onClick={handleFlip}
                        >
                            <CardHeader>
                                <CardTitle>Solution - Question {question.q_num}</CardTitle>
                                <CardDescription className="text-center">
                                    Correct Answer: {question.answer.toUpperCase()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="py-2 text-sm whitespace-pre-wrap">
                                    {question.solution}
                                </div>
                                <div className="mt-4 text-xs text-muted-foreground text-center">
                                    Click card to return to question
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
