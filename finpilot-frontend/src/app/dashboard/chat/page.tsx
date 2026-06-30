"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Zap, Plus, Trash2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
const SUGGESTED_PROMPTS = [
  "Where did I spend the most money last month?",
  "Can I afford an iPhone right now?",
  "What subscriptions should I cancel?",
  "Predict my next month's expenses",
  "Create a budget for me",
  "Explain my financial health score",
  "Which category wastes the most money?",
  "How much should I save monthly?",
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm your **FinPilot AI** financial copilot 🚀\n\nI have access to all your transaction data, analytics, and financial insights. Ask me anything about your finances!",
    timestamp: new Date().toISOString(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    try {
  const { data } = await api.chat.sendMessage(null, content);

  const response = data.response;

  setMessages((prev) =>
    prev.map((m) =>
      m.id === assistantMessage.id
        ? {
            ...m,
            content: response,
            isStreaming: false,
          }
        : m
    )
  );
} catch (err) {
  setMessages((prev) =>
    prev.map((m) =>
      m.id === assistantMessage.id
        ? {
            ...m,
            content: "❌ Failed to get AI response.",
            isStreaming: false,
          }
        : m
    )
  );
  console.error(err);
} finally {
  setIsLoading(false);
}

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Streaming simulation — replace with real SSE from backend
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Simulate streaming response
    const { data } = await api.chat.sendMessage(null, content);

const response = data.response;

setMessages((prev) =>
  prev.map((m) =>
    m.id === assistantMessage.id
      ? {
          ...m,
          content: response,
          isStreaming: false,
        }
      : m
  )
);

setIsLoading(false);
};

const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">FinPilot AI Chat</h1>
            <p className="text-xs text-muted-foreground">Powered by GPT-4o + your financial data</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-success-500/10 px-2.5 py-0.5 text-xs font-medium text-success-600">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
            Online
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Suggested prompts (shown when only 1 message) */}
        {messages.length === 1 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-xl border border-border bg-card p-3 text-left text-xs text-muted-foreground hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-foreground transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                message.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-muted text-muted-foreground"
              )}>
                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                message.role === "user"
                  ? "bg-brand-600 text-white rounded-tr-sm"
                  : "bg-card border border-border rounded-tl-sm"
              )}>
                {message.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block h-4 w-0.5 bg-brand-500 animate-pulse ml-0.5" />
                    )}
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-card px-4 py-3">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-3 rounded-2xl border border-border bg-card p-3 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your finances..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white disabled:opacity-50 hover:bg-brand-700 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          FinPilot AI uses your financial data to provide personalized insights.
        </p>
      </div>
    </div>
  );
}


