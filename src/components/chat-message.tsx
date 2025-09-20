"use client";

import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
};

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "")}>
      {!isUser && (
        <Avatar className="h-9 w-9 border">
          <AvatarFallback className="bg-primary/20 text-primary">
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "max-w-2xl rounded-lg px-4 py-3 shadow-sm", 
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-card"
      )}>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 border-t pt-2">
            <h4 className="text-xs font-semibold mb-1">Sources:</h4>
            <div className="flex flex-wrap gap-2">
            {message.citations.map((citation, i) => (
              <Badge key={i} variant="secondary">{citation}</Badge>
            ))}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-9 w-9 border">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
