
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, CornerDownLeft, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { ChatMessage, Message } from '@/components/chat-message';
import { askQuestion } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { sampleNotes } from '@/lib/sample-curriculum';

const getInitialMessages = (): Message[] => {
    try {
        const item = window.sessionStorage.getItem('chatMessages');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Could not read messages from session storage", error);
        return [];
    }
}

type SamplePrompt = {
    title: string;
    prompt: string;
};

export default function LearnPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [samplePrompts, setSamplePrompts] = useState<SamplePrompt[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Generate sample prompts on the client side to avoid hydration mismatch
    const shuffledNotes = [...sampleNotes].sort(() => 0.5 - Math.random());
    const prompts = shuffledNotes.slice(0, 2).map(note => {
      const concept = note.concepts[0] || note.chapter;
      return {
        title: concept.charAt(0).toUpperCase() + concept.slice(1),
        prompt: `What is ${concept.toLowerCase()}?`,
      };
    });
    setSamplePrompts(prompts);
    
    // Load messages from session storage only on the client side after mount
    setMessages(getInitialMessages());
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            window.sessionStorage.setItem('chatMessages', JSON.stringify(messages));
        } catch (error) {
            console.error("Could not save messages to session storage", error);
        }
    }
  }, [messages]);

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
    handleSubmit(undefined, prompt);
  };

  const handleResetChat = () => {
    setMessages([]);
    try {
      window.sessionStorage.removeItem('chatMessages');
    } catch (error) {
      console.error("Could not remove chat messages from session storage", error);
    }
    toast({
      title: "Chat Cleared",
      description: "The conversation has been reset.",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">Ask me anything</h1>
            <p className="text-muted-foreground">Ask anything about your studies</p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleResetChat} aria-label="Reset chat">
                <Trash2 className="mr-2 h-4 w-4" />
                Reset Chat
              </Button>
            )}
          </div>
        </div>

      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardContent className="flex-grow p-4">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="space-y-6 pr-4">
                {messages.length === 0 && !isLoading && (
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
        </CardContent>
          
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
      </Card>
    </div>
  );
}
