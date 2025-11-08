'use client';
import { neon } from "@neondatabase/serverless";
import { useState, useRef } from 'react';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  PromptInputBody,
  PromptInputTools,
  PromptInputButton,
} from '@/components/ai-elements/prompt-input';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Loader } from '@/components/ai-elements/loader';

interface AIDialogueProps {
  questions: { id: number; q_text: string; a: string }[];
}

export default function AIDialogue({ questions }: AIDialogueProps) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; text: string }[]
  >([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async (message: { text: string }) => {
    if (!message.text) return;

    // Add user message to UI
    const userId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: userId, role: 'user', text: message.text }]);
    setStatus('sending');

    try {
      // const promptQuestions = questions
      //   .map(q => `Q: ${q.q_text}\nA: ${q.a}`)
      //   .join("\n\n");

      const formattedQuestions = Array.isArray(questions)
        ? questions
          .map((q, i) => `Question ${q.id}: ${q.q_text}\nAnswer: ${q.a}`)
          .join("\n\n")
        : "No questions available.";

      const systemPrompt = `You are an encouraging, friendly math tutor. Use these math questions and answers to give a pedagogical, detailed explanation of how to solve this question to your student. Here are the questions and answers: ${formattedQuestions}`;

      // Send message to backend
      const res = await fetch('/api/askChatProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
                q_text: message.text,
                systemPrompt: systemPrompt
            })
        //body: message.text,
    });


      if (!res.ok) throw new Error('AI backend error');

      const aiText = await res.text();
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', text: aiText }]);
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleSubmit = (message: { text: string }) => {
    sendMessage(message);
    setText('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative rounded-lg border h-[600px] flex flex-col">
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                <pre className="whitespace-pre-wrap">{message.text}</pre>
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

      <PromptInput
        onSubmit={handleSubmit}
        className="mt-4 w-full"
        globalDrop
      >
        <PromptInputBody>
          <PromptInputTextarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            placeholder="Type your question..."
          />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
          </PromptInputTools>
          <PromptInputSubmit disabled={!text || status === 'sending'} status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}