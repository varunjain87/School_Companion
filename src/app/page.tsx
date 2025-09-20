"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, CornerDownLeft, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage, Message } from '@/components/chat-message';
import { askQuestion } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const samplePrompts = [
  {
    title: "Hydroelectric dam",
    prompt: "How does a hydroelectric dam generate electricity?",
  },
  {
    title: "Latest K-pop song",
    prompt: "What is the latest K-pop song?",
  },
];

export default function LearnPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pedagogyMode, setPedagogyMode] = useState('direct'); // Mocking remote config
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, prompt?: string) => {
    if (e) e.preventDefault();
    const userMessageContent = prompt || input;
    if (!userMessageContent.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const result = await askQuestion(userMessageContent);
    
    if (result.success && result.data) {
        const assistantMessage: Message = { 
            role: 'assistant', 
            content: result.data.answer,
            citations: result.data.citations,
        };
        setMessages(prev => [...prev, assistantMessage]);
    } else {
        const errorMessage: Message = {
            role: 'assistant',
            content: result.error || 'Sorry, something went wrong.',
        };
        setMessages(prev => [...prev, errorMessage]);
        toast({
          title: "Error",
          description: result.error || 'Sorry, something went wrong.',
          variant: "destructive",
        })
    }

    setIsLoading(false);
  };
  
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const togglePedagogy = () => {
    setPedagogyMode(prev => prev === 'direct' ? 'socratic' : 'direct');
    toast({
      title: "Pedagogy Mode Changed",
      description: `Switched to ${pedagogyMode === 'direct' ? 'Socratic' : 'Direct'} style.`,
    })
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">Learn</h1>
            <p className="text-muted-foreground">Ask anything about your CBSE subjects.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={togglePedagogy} aria-label="Flip pedagogy mode">
              Flip Pedagogy
            </Button>
            <Badge variant="outline">Pedagogy: <span className="capitalize font-semibold ml-1">{pedagogyMode}</span></Badge>
          </div>
        </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <Sparkles className="h-12 w-12 mb-4 text-primary" />
                  <h2 className="text-lg font-semibold">Start your learning journey</h2>
                  <p className="max-w-sm">Ask a question or try one of the examples below.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoading && (
                 <ChatMessage message={{role: 'assistant', content: 'Thinking...'}} />
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4 bg-background/50">
            <div className="mb-2 flex flex-wrap gap-2">
              {samplePrompts.map(p => (
                <Button key={p.title} variant="outline" size="sm" onClick={() => handlePromptClick(p.prompt)} disabled={isLoading}>
                  Try: "{p.title}"
                </Button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about math, science, social studies..."
                className="pr-12"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                Press Enter to send.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
