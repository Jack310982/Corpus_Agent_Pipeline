// components/agent/qa-input-box.tsx

"use client";

import { useState } from "react";
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface QAInputBoxProps {
  onSubmit: (question: string) => void;
  loading?: boolean;
}

export function QAInputBox({ onSubmit, loading }: QAInputBoxProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !loading) {
      onSubmit(question.trim());
      setQuestion("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about this entity... (Press Enter to send, Shift+Enter for new line)"
        className="min-h-24 resize-none pr-12"
        disabled={loading}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!question.trim() || loading}
        className="absolute bottom-3 right-3"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
