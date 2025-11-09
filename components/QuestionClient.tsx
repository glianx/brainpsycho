"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

type AttemptHistory = {
    questionId: number;
    attempts: string[]; // ["b", "a", "e"]
    currentAnswer: string | null;
    isCorrect: boolean | null; // null = not checked yet
    timeStarted: number;
};

export default function QuestionClient({ initialQuestions }: { initialQuestions: any[] }) {
    const [qs, setQs] = useState(initialQuestions);
    
    const [attempts, setAttempts] = useState<Record<number, AttemptHistory>>({});

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

    function handleAnswerSelect(q: any, selectedAnswer: string) {
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

    function handleCheckAnswer(q: any) {
        const attempt = attempts[q.id];
        if (!attempt?.currentAnswer) return;
    
        const isCorrect = q.answer === attempt.currentAnswer;
        const newAttempts = [...attempt.attempts, attempt.currentAnswer]; // TypeScript knows currentAnswer is string here
        
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

        // TODO: Save to database here
        // saveAttempt({
        //     questionId: q.id,
        //     userAnswer: attempt.currentAnswer,
        //     timeSpentSeconds: Math.floor((Date.now() - attempt.timeStarted) / 1000),
        //     isCorrect,
        //     attemptHistory: [...attempt.attempts, attempt.currentAnswer],
        // });
    }

    function getButtonVariant(q: any, option: string) {
        const attempt = attempts[q.id];
        if (!attempt || attempt.currentAnswer !== option) return "outline";
        
        // User selected this option
        if (attempt.isCorrect === null) return "selected"; // Not checked yet
        return attempt.isCorrect ? "correct" : "incorrect";
    }

    function getFeedback(q: any) {
        const attempt = attempts[q.id];
        if (!attempt || attempt.isCorrect === null) return null;
        
        return attempt.isCorrect ? "Correct! 🎉" : "Try again.";
    }


    return (
        <>
            {qs
                .sort((a, b) => a.id - b.id)
                .map((q, i) => {
                    const attempt = attempts[q.id];
                    const feedback = getFeedback(q)
                
                    return (
                        <Card key={q.id} className="m-4">
                            <CardHeader>
                                <CardTitle>Question {q.q_num}</CardTitle>
                                <CardDescription>Easy</CardDescription>
                                <CardAction>
                                    <Button variant="link">
                                        {q.contest} {q.grade}, {q.year}
                                    </Button>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="py-2">{q.q_text}</div>

                                {attempt?.attempts.length > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Attempts: {attempt.attempts.join(", ")}
                                    </p>
                                )}

                                <p>{q.answer}</p>
                                <p>{q.solution}</p>
                                <ButtonGroup className="py-2">
                                    {(["a", "b", "c", "d", "e"] as const).map((option) => (
                                        <Button
                                            key={option}
                                            variant={getButtonVariant(q, option)}
                                            onClick={() => handleAnswerSelect(q, option)}
                                            disabled={attempt?.isCorrect === true}
                                        >
                                            {q[option]}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                                <ButtonGroup>
                                    <ButtonGroup>
                                        <Button variant="secondary">See Hint</Button>
                                    </ButtonGroup>
                                    <Button 
                                        onClick={() => handleCheckAnswer(q)}
                                        disabled={!attempt?.currentAnswer || attempt?.isCorrect === true}
                                    >
                                        Check Answer
                                    </Button>
                                    <ButtonGroup>
                                        <Button onClick={() => askChat(i)}>Explain</Button>
                                    </ButtonGroup>
                                </ButtonGroup>
                                {feedback && (
                                    <p className="py-2 text-lg font-medium">
                                        {feedback}
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter>{q.msg}</CardFooter>
                        </Card>
                    );
            })}
        </>
    );
}
