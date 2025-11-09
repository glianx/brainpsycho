"use client";
import {
    PromptInput,
    PromptInputBody,
    PromptInputFooter,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useEffect, useRef, useState } from "react";

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";

//math rendering
import { MathContent } from "@/components/MathContent";

interface AIDialogueProps {
    questions: { id: number; q_text: string; a: string }[];
}

export default function AIDialogue({ questions }: AIDialogueProps) {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<
        { id: string; role: "user" | "assistant"; text: string }[]
    >([]);
    const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const maxHistory = 10;

    const sendMessage = async (message: { text: string }) => {
        if (!message.text) return;

        // Add user message to UI
        const userId = crypto.randomUUID();
        setMessages((prev) => [...prev, { id: userId, role: "user", text: message.text }]);
        setStatus("sending");

        try {
            const formattedQuestions = Array.isArray(questions)
                ? questions
                      .map((q, i) => `Question ${q.id}: ${q.q_text}\nAnswer: ${q.a}`)
                      .join("\n\n")
                : "No questions available.";

            const historyText = messages
                .slice(-maxHistory) // last N messages
                .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.text}`)
                .join("\n");

            const systemPrompt = `You are an encouraging, friendly math tutor. Use these math questions and answers to give a pedagogical, detailed explanation of how to solve this question to your student. 

CRITICAL: You MUST format ALL mathematical expressions using proper LaTeX delimiters:
1. For inline math (within sentences), wrap expressions in \\( and \\): Example: "The area is \\(6s^2\\)"
2. For display math (standalone equations), wrap in \\[ and \\]: Example: "\\[6s^2 = 18\\]"
3. NEVER write math without these delimiters - every formula, variable, calculation, or number that's part of a math expression MUST be wrapped.
4. Examples of what to wrap:
   - Variables: \\(s\\), \\(x\\), \\(y\\)
   - Calculations: \\(6s^2 = 18\\), \\(s^2 = 3\\), \\(s = \\sqrt{3}\\)
   - Units with math: \\(\\sqrt{3}\\) cm
   - Fractions: \\(\\frac{1}{2}\\)
   - Exponents: \\(s^3\\), \\((\\sqrt{3})^3\\)
   - Radicals: \\(\\sqrt{3}\\), \\(\\sqrt[3]{27}\\)
5. Use \\sqrt{} for square roots, not √ symbol
6. Use proper LaTeX syntax: ^ for superscripts, _ for subscripts, \\frac{}{} for fractions
7. Escape percent signs as \\%

Example response format:
"The surface area of a cube has area equal to its total surface area: \\(6s^2\\). Given \\(6s^2 = 18\\), we get \\(s^2 = 3\\) so \\(s = \\sqrt{3}\\) cm. The volume is \\(s^3 = (\\sqrt{3})^3 = 3\\sqrt{3}\\) cm³."

Here are the questions and answers: ${formattedQuestions}. Here is the conversation history so far: ${historyText}. When responding, give a detailed, step-by-step explanation suitable for a student.`;

            // Send info to backend
            const res = await fetch("/api/askChatProxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    q_text: message.text,
                    systemPrompt,
                }),
            });

            if (!res.ok) throw new Error("AI backend error");

            const aiText = await res.text();
            const assistantId = crypto.randomUUID();
            setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: aiText }]);
            setStatus("idle");
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    const handleSubmit = (message: { text: string }) => {
        sendMessage(message);
        setText("");
    };

    // Auto-scroll to bottom when messages update
    const containerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Get the last message element inside the container
        const messagesContainer = container.querySelector(".flex-col");
        if (!messagesContainer) return;

        const lastMessage = messagesContainer.lastElementChild as HTMLElement;
        if (!lastMessage) return;

        // Scroll so the top of the last message aligns with top of container
        container.scrollTo({
            top: lastMessage.offsetTop,
            behavior: "smooth",
        });
    }, [messages]);

    return (
        <div className="max-w-4xl mx-auto p-6 relative rounded-lg border h-[60vh] md:h-[40vh] lg:h-[75vh] flex flex-col">
            <div className="flex-1 overflow-y-auto overflow-hidden" ref={containerRef}>
                <Conversation role="log">
                    <ConversationContent className="flex flex-col gap-8 p-4">
                        {messages.map((message) => (
                            <Message key={message.id} from={message.role}>
                                <MessageContent>
                                    <MathContent>{message.text}</MathContent>
                                </MessageContent>
                            </Message>
                        ))}

                        {status === "sending" && (
                            <div className="flex justify-center mt-6 mb-4">
                                <Loader className="w-12 h-12" />
                            </div>
                        )}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
            </div>

            <PromptInput onSubmit={handleSubmit} className="mt-4 w-full" globalDrop>
                <PromptInputBody>
                    <PromptInputTextarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.currentTarget.value)}
                        placeholder="Type your question..."
                    />
                </PromptInputBody>

                <PromptInputFooter>
                    <PromptInputTools></PromptInputTools>
                    <PromptInputSubmit disabled={!text || status === "sending"} status={status} />
                </PromptInputFooter>
            </PromptInput>
        </div>
    );
}
