'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const WELCOME: Message = {
  role: 'assistant',
  content: 'Hi! I\'m Awa, your Awahouse AI assistant. I can help with property searches, escrow questions, and platform guidance. What would you like to know?',
};

export default function AskAwaPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Stub AI response — replace with Claude API call in production
    setTimeout(() => {
      const response: Message = {
        role: 'assistant',
        content: 'This is a placeholder response. The Ask Awa AI feature will be powered by Claude API in a future release. For now, please explore the property listings or contact support.',
      };
      setMessages((prev) => [...prev, response]);
      setLoading(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-6">
      <div className="mb-4">
        <h1 className="font-display text-3xl italic font-black text-charcoal">Ask Awa</h1>
        <p className="font-body text-charcoal/60">Your AI property assistant</p>
      </div>

      <Card className="mb-4 flex-1">
        <CardContent className="pt-4 pb-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-surface-warm text-charcoal'
              }`}>
                <p className="font-body text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-surface-warm px-4 py-2">
                <p className="font-body text-sm text-charcoal/60 animate-pulse">Awa is thinking...</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Awa anything about Awahouse..."
            disabled={loading}
          />
        </div>
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
