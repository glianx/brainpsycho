'use client';
import { useState, useRef } from 'react';
import {
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
    PromptInputFooter,
    PromptInputBody,
    PromptInputTools,
    PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Loader } from '@/components/ai-elements/loader';

//math rendering
import { MathJax, MathJaxContext } from "better-react-mathjax";

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

      const systemPrompt = `You are an encouraging, friendly math tutor. Use these math questions and answers to give a pedagogical, detailed explanation of how to solve this question to your student. When providing solutions, write normal text as usual, but format all mathematical expressions using LaTeX:
          1. Write normal sentences in plain text.
          2. All mathematical expressions, formulas, and calculations must be written in LaTeX.
            - Use inline math: \( ... \) for expressions inside sentences.
          - Use display math: \[ ... \] for standalone equations or steps.
          3. Include all numbers, variables, and arithmetic operations inside LaTeX if they are part of a formula.
          4. Never use square brackets [ ... ] for math.
          5. Always escape percent signs as \%.
          6. Keep all formulas fully valid LaTeX, suitable for rendering with MathJax or similar tools.
          7. Avoid using plain text approximations of calculations — all formulas, fractions, multiplications, divisions, and percentages must be in LaTeX.
          Do not wrap plain text in LaTeX. Here are the questions and answers: ${formattedQuestions}. Here is the conversation history so far: ${historyText}. When responding, give a detailed, step-by-step explanation suitable for a student.`;

      // Send info to backend
      const res = await fetch('/api/askChatProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
                q_text: message.text,
                systemPrompt
            })
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

  return (
    <div className="max-w-4xl mx-auto p-6 relative rounded-lg border h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-hidden">
      <Conversation role="log">
        <ConversationContent className="flex flex-col gap-8 p-4">
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                <MathJaxContext>
                  <MathJax>{message.text}</MathJax>
                </MathJaxContext>
              </MessageContent>
          </Message>
          ))}

          {status === 'sending' && (
            <div className="flex justify-center mt-6 mb-4">
              <Loader className="w-12 h-12"/>
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
