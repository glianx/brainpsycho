"use client";

import { MathContent } from "@/components/MathContent";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Question } from "@/lib/db/directory";
import { useState } from "react";

type AttemptHistory = {
    questionId: number;
    attempts: string[]; // ["b", "a", "e"]
    currentAnswer: string | null;
    isCorrect: boolean | null; // null = not checked yet
    timeStarted: number;
};

type CustomQuestion = Question & {
    interest?: string;
    msg?: string;
};

export default function QuestionClient({
    initialQuestions,
}: {
    initialQuestions: CustomQuestion[];
}) {
    const [qs, setQs] = useState(initialQuestions);
    const [attempts, setAttempts] = useState<Record<number, AttemptHistory>>({});
    const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

    async function askChat(i: number) {
        // same as curl -X POST http://localhost:3000/api/askChat \
        // -H "origin: http://localhost:3000" \
        // -H "x-internal-key: secret123" \
        // -d "what is 1+1?"

        const res = await fetch("/api/askChat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-internal-key": "secret123",
            },
            body: JSON.stringify({
                q_text: qs[i].q_text,
                systemPrompt:
                    "You are an encouraging, friendly math tutor. Give a pedagogical, detailed explanation of how to solve this question.",
            }),
            //body: qs[i].q_text,
        });

        const msg = await res.text();
        const newQs = [...qs];
        newQs[i] = { ...qs[i], msg };
        setQs(newQs);
    }

    function handleAnswerSelect(q: CustomQuestion, selectedAnswer: string, e: React.MouseEvent) {
        e.stopPropagation(); // Prevent card flip when clicking answer buttons
        setAttempts((prev) => {
            const existing = prev[q.id];

            return {
                ...prev,
                [q.id]: {
                    questionId: q.id,
                    attempts: existing?.attempts || [],
                    currentAnswer: selectedAnswer,
                    isCorrect: null, // Reset when selecting new answer
                    timeStarted: existing?.timeStarted || Date.now(),
                },
            };
        });
    }

    async function handleCheckAnswer(q: CustomQuestion, e: React.MouseEvent) {
        e.stopPropagation(); // Prevent card flip when clicking check button
        const attempt = attempts[q.id];
        if (!attempt?.currentAnswer) return;

        const isCorrect = q.answer === attempt.currentAnswer;
        const newAttempts = [...attempt.attempts, attempt.currentAnswer]; // TypeScript knows currentAnswer is string here
        const currentTime = Date.now();

        setAttempts((prev) => ({
            ...prev,
            [q.id]: {
                questionId: q.id,
                attempts: newAttempts,
                currentAnswer: attempt.currentAnswer,
                isCorrect,
                timeStarted: attempt.timeStarted,
            } satisfies AttemptHistory, // Ensures type safety
        }));

        const timeTaken = Math.floor((currentTime - attempt.timeStarted) / 1000);

        fetch("/api/updateAttempts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: q.id,
                userAnswer: attempt.currentAnswer,
                timeTaken,
            }),
        }).catch((err) => console.error("Failed to save response:", err));
    }

    function getButtonVariant(q: CustomQuestion, option: string) {
        const attempt = attempts[q.id];
        if (!attempt || attempt.currentAnswer !== option) return "outline";

        // User selected this option
        if (attempt.isCorrect === null) return "selected"; // Not checked yet
        return attempt.isCorrect ? "correct" : "incorrect";
    }

    function getFeedback(q: CustomQuestion) {
        const attempt = attempts[q.id];
        if (!attempt || attempt.isCorrect === null) return null;

        return attempt.isCorrect ? "Correct! 🎉" : "Try again.";
    }

    function handleFlip(qId: number, e?: React.MouseEvent) {
        if (e) {
            // Check if click was on a button or interactive element
            const target = e.target as HTMLElement;
            if (
                target.tagName === "BUTTON" ||
                target.closest("button") ||
                target.closest('[role="button"]')
            ) {
                return; // Don't flip if clicking on buttons
            }
        }
        setFlippedCards((prev) => ({ ...prev, [qId]: !prev[qId] }));
    }

    return (
        <>
            {qs
                .sort((a, b) => a.id - b.id)
                .map((q, i) => {
                    const attempt = attempts[q.id];
                    const feedback = getFeedback(q);
                    const isFlipped = flippedCards[q.id] || false;

                    return (
                        <div
                            key={q.id}
                            className="question-card-wrapper m-4"
                            style={{
                                width: "100%",
                                maxWidth: "800px",
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
                                        display: "grid",
                                        gridTemplateColumns: "1fr",
                                    }}
                                >
                                    {/* Front of card */}
                                    <div
                                        style={{
                                            backfaceVisibility: "hidden",
                                            gridColumn: 1,
                                            gridRow: 1,
                                            height: "100%",
                                        }}
                                    >
                                        <Card
                                            className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                                            onClick={(e) => handleFlip(q.id, e)}
                                        >
                                            <CardHeader>
                                                <CardTitle>Question {q.q_num}</CardTitle>
                                                <CardDescription>
                                                    {q.contest} {q.grade}, {q.year}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="py-2">
                                                    <MathContent>{q.q_text}</MathContent>
                                                </div>

                                                <ButtonGroup className="py-4 flex-wrap justify-center">
                                                    {(["a", "b", "c", "d", "e"] as const).map(
                                                        (option) => (
                                                            <Button
                                                                key={option}
                                                                variant={getButtonVariant(
                                                                    q,
                                                                    option
                                                                )}
                                                                onClick={(e) =>
                                                                    handleAnswerSelect(q, option, e)
                                                                }
                                                                disabled={
                                                                    attempt?.isCorrect === true
                                                                }
                                                                className="min-w-20"
                                                            >
                                                                <MathContent>
                                                                    {q[option]}
                                                                </MathContent>
                                                            </Button>
                                                        )
                                                    )}
                                                </ButtonGroup>

                                                {attempt?.attempts.length > 0 && (
                                                    <p className="text-sm text-muted-foreground text-center mb-2">
                                                        Attempts: {attempt.attempts.join(", ")}
                                                    </p>
                                                )}

                                                {feedback && (
                                                    <p className="py-2 text-lg font-semibold text-center">
                                                        {feedback}
                                                    </p>
                                                )}

                                                <ButtonGroup className="mt-4 justify-center">
                                                    <Button
                                                        onClick={(e) => handleCheckAnswer(q, e)}
                                                        disabled={
                                                            !attempt?.currentAnswer ||
                                                            attempt?.isCorrect === true
                                                        }
                                                    >
                                                        Check Answer
                                                    </Button>
                                                    {/* <Button
                                                        variant="secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            askChat(i);
                                                        }}
                                                    >
                                                        Explain
                                                    </Button> */}
                                                </ButtonGroup>

                                                <div className="mt-4 text-xs text-muted-foreground text-center">
                                                    Click card to see solution
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Back of card */}
                                    <div
                                        style={{
                                            backfaceVisibility: "hidden",
                                            transform: "rotateY(180deg)",
                                            gridColumn: 1,
                                            gridRow: 1,
                                            height: "100%",
                                        }}
                                    >
                                        <Card
                                            className="cursor-pointer hover:shadow-lg transition-shadow bg-secondary/10 h-full"
                                            onClick={(e) => handleFlip(q.id, e)}
                                        >
                                            <CardHeader>
                                                <CardTitle>Solution - Question {q.q_num}</CardTitle>
                                                <CardDescription className="text-center">
                                                    Correct Answer: {q.answer.toUpperCase()}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="py-2 whitespace-pre-wrap">
                                                    <MathContent>{q.solution}</MathContent>
                                                </div>

                                                {q.msg && (
                                                    <div className="mt-4 p-4 bg-muted rounded-lg">
                                                        <h4 className="font-semibold mb-2">
                                                            AI Explanation:
                                                        </h4>
                                                        <MathContent>{q.msg}</MathContent>
                                                    </div>
                                                )}

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
                })}
        </>
    );
}
