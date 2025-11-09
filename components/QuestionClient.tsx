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

export default function QuestionClient({ initialQuestions }: { initialQuestions: any[] }) {
    const [qs, setQs] = useState(initialQuestions);
    const [feedback, setFeedback] = useState("");
    // const [buttonvar, setButtonvar] = useState("outline")
    const [selected, setSelected] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState(-1);

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

    function handleSubmission(q: any, selectedAnswer: string) {
        setSelected(selectedAnswer);
        setSelectedQuestion(q.id);
        if (q.answer === selectedAnswer) {
            setFeedback("Correct! 🎉");
        } else setFeedback("Try again.");
    }

    function getVariant(q: any, l: string) {
        if (selected === l && selectedQuestion === q.id) {
            if (l === q.answer) return "correct";
            return "incorrect";
        }
        return "outline";
    }

    return (
        <>
            {qs
                .sort((a, b) => a.id - b.id)
                .map((q, i) => (
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
                            <p>{q.answer}</p>
                            <p>{q.solution}</p>
                            <ButtonGroup className="py-2">
                                {(["a", "b", "c", "d", "e"] as const).map((l) => (
                                    <Button
                                        key={l}
                                        variant={getVariant(q, l)}
                                        onClick={() => handleSubmission(q, l)}
                                    >
                                        {q[l]}
                                    </Button>
                                ))}
                            </ButtonGroup>
                            <ButtonGroup>
                                <ButtonGroup>
                                    <Button variant="secondary">See Hint</Button>
                                </ButtonGroup>
                                <ButtonGroup>
                                    <Button onClick={() => askChat(i)}>Check Answer</Button>
                                </ButtonGroup>
                            </ButtonGroup>
                            <p
                                id="feedback"
                                hidden={q.id !== selectedQuestion}
                                className="py-2 text-lg"
                            >
                                {feedback}
                            </p>
                        </CardContent>
                        <CardFooter>{q.msg}</CardFooter>
                    </Card>
                ))}
        </>
    );
}
