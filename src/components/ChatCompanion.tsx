import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatCompanion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Greetings. I'm here to support your studies. What can I help you with today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-companion", {
        body: { message: userMessage }
      });

      if (error) {
        console.error("Function invocation error:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Connection issue",
        description: "I'm having trouble responding. Please try again.",
        variant: "destructive",
      });
      
      // Remove the user message if we failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-[#6B1010] text-[#F5E6D3] shadow-2xl hover:bg-[#6B1010]/90 hover:scale-110 transition-all duration-300 z-50"
        size="icon"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#EDE4D4] border-8 border-[#8B6F47] rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-[#6B1010] text-[#F5E6D3] p-4 rounded-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F5E6D3] animate-pulse" />
          <h3 className="font-bold font-playfair italic">Study Companion</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-[#F5E6D3] hover:bg-[#8B1010] h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-[#6B1010] text-[#F5E6D3]"
                    : "bg-[#F5E6D3] text-[#5C4A3A] border-2 border-[#8B6F47]"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#F5E6D3] text-[#5C4A3A] border-2 border-[#8B6F47] rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm italic">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 bg-gradient-to-t from-[#8B6F47]/20 to-transparent">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for study advice..."
            disabled={isLoading}
            className="bg-[#F5E6D3] border-2 border-[#8B6F47] text-[#5C4A3A] placeholder:text-[#8B6F47]/50 focus-visible:ring-[#6B1010]"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-[#6B1010] text-[#F5E6D3] hover:bg-[#6B1010]/90 shadow-md"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
