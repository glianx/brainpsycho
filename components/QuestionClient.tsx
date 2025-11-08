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

    async function askChat(i: number) {
        // same as curl -X POST http://localhost:3000/api/askChat \
        // -H "origin: http://localhost:3000" \
        // -H "x-internal-key: secret123" \
        // -d "what is 1+1?"
        const res = await fetch("/api/askChat", {
            method: "POST",
            headers: { "x-internal-key": "secret123" },
            body: qs[i].q_text,
        });
        const msg = await res.text();
        const newQs = [...qs];
        newQs[i] = { ...qs[i], msg };
        setQs(newQs);
    }

    return (
        <>
            {qs.map((q, i) => (
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
                        <ButtonGroup>
                            {(["a", "b", "c", "d", "e"] as const).map((l) => (
                                <Button key={l} variant="outline">
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
                    </CardContent>
                    <CardFooter>{q.msg}</CardFooter>
                </Card>
            ))}
        </>
    );
}
