"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User, Hexagon } from "lucide-react";
import { StockCard } from "@/components/chat/tools/StockCard";
import { WeatherWidget } from "@/components/chat/tools/WeatherWidget";
import { KanbanBoard } from "@/components/chat/tools/KanbanBoard";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  widget?: {
    type: "stock" | "weather" | "kanban";
    data: any;
  };
  timestamp: number;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'system', 
      content: 'Welcome to Generative UI Dashboard. Ask me to show stocks, weather, or tasks.',
      timestamp: Date.now() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput("");
    setError(null);
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: userInput }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const toolInvocations = data.choices[0]?.message?.toolInvocations || [];
      
      // Convert tool invocations to widget format
      let widget: Message['widget'] | undefined;
      if (toolInvocations.length > 0) {
        const tool = toolInvocations[0];
        switch (tool.toolName) {
          case "stockCard":
            widget = {
              type: "stock",
              data: {
                ...tool.result,
                change: tool.result.delta, // Map delta to change for the component
                history: [],
                low: tool.result.price - 5,
                high: tool.result.price + 5,
                open: tool.result.price - tool.result.delta,
                volume: "45M",
                marketCap: "2.8T"
              }
            };
            break;
          case "weatherWidget":
            widget = {
              type: "weather",
              data: {
                ...tool.result,
                humidity: 45,
                windSpeed: 12,
                feelsLike: tool.result.temp + 2,
                uvIndex: 6,
                forecast: []
              }
            };
            break;
          case "kanbanBoard":
            widget = {
              type: "kanban",
              data: {
                title: "Project Tasks",
                columns: [
                  {
                    id: "todo",
                    title: "To Do",
                    tasks: tool.result.tasks.slice(0, 2).map((task: any) => ({
                      id: task.id,
                      content: task.title,
                      priority: "High" as const,
                      tag: task.description
                    }))
                  },
                  {
                    id: "inprogress",
                    title: "In Progress", 
                    tasks: tool.result.tasks.slice(2, 4).map((task: any) => ({
                      id: task.id,
                      content: task.title,
                      priority: "Medium" as const,
                      tag: task.description
                    }))
                  },
                  {
                    id: "done",
                    title: "Done",
                    tasks: tool.result.tasks.slice(4, 6).map((task: any) => ({
                      id: task.id,
                      content: task.title,
                      priority: "Low" as const,
                      tag: task.description
                    }))
                  }
                ]
              }
            };
            break;
        }
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.choices[0]?.message?.content || "",
        widget,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const renderToolInvocation = (widget: Message['widget']) => {
    if (!widget) return null;

    try {
      switch (widget.type) {
        case "stock":
          return <StockCard data={widget.data} />;
        case "weather":
          return <WeatherWidget data={widget.data} />;
        case "kanban":
          return <KanbanBoard data={widget.data} />;
        default:
          return (
            <div className="rounded-lg border bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Unknown widget: {widget.type}
              </p>
            </div>
          );
      }
    } catch (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error rendering widget
          </p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-[#e4e4e7] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header - Minimalist */}
        <div className="absolute top-0 left-0 right-0 p-4 pl-6 flex items-center justify-between z-10 bg-gradient-to-b from-[#09090b] to-transparent h-24 pointer-events-none">
           <div className="pointer-events-auto opacity-0 md:opacity-100 transition-opacity">
           </div>
        </div>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto pt-20 pb-36 px-4 md:px-0">
          <div className="max-w-3xl mx-auto w-full space-y-8">
            {messages.length === 1 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                        <div className="relative bg-[#18181b] p-6 rounded-3xl border border-white/5 shadow-2xl">
                            <Hexagon size={40} className="text-blue-500 fill-blue-500/20" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-4 tracking-tight">
                            How can I help you?
                        </h1>
                        <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                            I can visualize data for you. Try asking about financial markets, local weather, or project management.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-sm">
                        {[
                          "Show me Apple's stock price",
                          "Weather in Tokyo",
                          "Create a Kanban for Q4 Goals",
                          "Compare TSLA and F"
                        ].map((prompt, i) => (
                           <button 
                             key={i} 
                             onClick={() => {
                               setInput(prompt);
                               const formEvent = new Event('submit', { cancelable: true }) as any;
                               formEvent.preventDefault = () => {};
                               handleSubmit(formEvent);
                             }} 
                             className="bg-[#18181b] hover:bg-[#27272a] hover:text-white text-gray-400 p-4 rounded-xl border border-[#27272a] transition-all text-left shadow-sm hover:shadow-md hover:-translate-y-0.5"
                           >
                              {prompt}
                           </button>
                        ))}
                    </div>
                </div>
            )}

            {messages.slice(1).map((msg) => (
                <div key={msg.id} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Avatar for Bot */}
                    {msg.role === 'assistant' && (
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center mr-4 mt-1 border border-indigo-500/30">
                             <Sparkles size={16} className="text-indigo-400" />
                        </div>
                    )}

                    <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Text Bubble */}
                        {msg.content && (
                            <div className={`py-3 px-5 text-[15px] leading-relaxed shadow-sm backdrop-blur-sm ${
                                msg.role === 'user' 
                                ? 'bg-[#27272a] text-white rounded-2xl rounded-tr-sm border border-white/5' 
                                : 'bg-transparent text-gray-300 pl-0 pt-0'
                            }`}>
                                {msg.content}
                            </div>
                        )}
                        
                        {/* Widget Container */}
                        {msg.widget && (
                            <div className="mt-3 w-full">
                                {renderToolInvocation(msg.widget)}
                            </div>
                        )}
                    </div>

                    {/* Avatar for User */}
                    {msg.role === 'user' && (
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center ml-3 mt-1 border border-white/5">
                            <User size={16} className="text-gray-400" />
                        </div>
                    )}
                </div>
            ))}

            {isLoading && (
                <div className="flex w-full justify-start animate-in fade-in duration-300">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center mr-4 border border-indigo-500/30">
                        <Sparkles size={16} className="text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1.5 h-10">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area - Floating */}
        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-20">
          <form onSubmit={handleSubmit} className="w-full max-w-3xl relative">
            <div className="relative flex items-center gap-2 bg-[#18181b]/80 backdrop-blur-xl border border-[#27272a] p-2 rounded-2xl shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40">
              
              {/* Attachment Mock Button */}
              <button type="button" className="p-3 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
              </button>

              <input
                type="text"
                value={input}
                onChange={handleChange}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-[15px] py-2"
                disabled={isLoading}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`
                   p-3 rounded-xl transition-all duration-300 flex items-center justify-center
                   ${input.trim() && !isLoading
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500'
                      : 'bg-[#27272a] text-gray-600 cursor-not-allowed'
                   }
                `}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
