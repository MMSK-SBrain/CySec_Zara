"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
}

export function ZaraChat({ employee }: { employee: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Zara, your AI HR assistant. I can help with leave balances, applying leave, comp-offs, encashment, and policy questions. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/zara/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .filter((m) => m.role !== "tool")
            .concat(userMsg)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Zara failed to respond");
        setLoading(false);
        return;
      }

      const assistantMsg: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.toolCalled) {
        const toolMsg: Message = {
          role: "tool",
          content: data.toolResult,
          toolName: data.toolCalled,
        };
        setMessages((prev) => [...prev, toolMsg]);
      }
    } catch (err) {
      toast.error("Failed to reach Zara");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="w-5 h-5 text-primary" />
          Zara AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role !== "user" && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {msg.role === "tool" ? "T" : "Z"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : msg.role === "tool"
                    ? "bg-muted border border-border font-mono text-xs"
                    : "bg-muted"
                }`}
              >
                {msg.role === "tool" && (
                  <div className="flex items-center gap-1 text-destructive mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-semibold">Tool: {msg.toolName}</span>
                  </div>
                )}
                {msg.content}
              </div>
              {msg.role === "user" && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-secondary text-xs">
                    {employee.firstName[0]}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  Z
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-2 text-sm">Zara is thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zara anything..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
