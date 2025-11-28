"use client";

import { useChat } from "ai/react";
import { Send, Loader2 } from "lucide-react";
import { StockCard } from "@/components/chat/tools/StockCard";
import { WeatherWidget } from "@/components/chat/tools/WeatherWidget";
import { KanbanBoard } from "@/components/chat/tools/KanbanBoard";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  const renderToolInvocation = (toolInvocation: any) => {
    const { toolName, state, result } = toolInvocation;

    // Loading state - tool is being called
    if (state === "call" || state === "partial-call") {
      return (
        <div className="rounded-lg border bg-muted/50 p-4 animate-pulse">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading {toolName}...</span>
          </div>
        </div>
      );
    }

    // Error state
    if (state === "result" && !result) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load {toolName}
          </p>
        </div>
      );
    }

    // Render component based on tool name when result is available
    if (state === "result" && result) {
      try {
        switch (toolName) {
          case "stockCard":
            return (
              <StockCard
                symbol={result.symbol}
                price={result.price}
                delta={result.delta}
              />
            );
          case "weatherWidget":
            return (
              <WeatherWidget
                location={result.location}
                temp={result.temp}
                condition={result.condition}
              />
            );
          case "kanbanBoard":
            return <KanbanBoard tasks={result.tasks} />;
          default:
            return (
              <div className="rounded-lg border bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Unknown tool: {toolName}
                </p>
              </div>
            );
        }
      } catch (error) {
        return (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error rendering {toolName}
            </p>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-4 py-8">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h1 className="text-3xl font-semibold mb-2">Generative UI Dashboard</h1>
                  <p className="text-muted-foreground mb-8">
                    Ask me to show stocks, weather, or tasks and I'll render interactive components.
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Try: "Show me the stock price for AAPL"</p>
                    <p>Or: "What's the weather in San Francisco?"</p>
                    <p>Or: "Display a task board"</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-3",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                {message.role === "user" && (
                  <div className="rounded-lg bg-primary text-primary-foreground px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}

                {message.role === "assistant" && (
                  <div className="flex flex-col gap-3 w-full max-w-[80%]">
                    {message.content && (
                      <div className="rounded-lg border bg-card px-4 py-2">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    )}

                    {message.toolInvocations?.map((toolInvocation, idx) => (
                      <div key={idx} className="w-full">
                        {renderToolInvocation(toolInvocation)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border bg-card px-4 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t bg-background">
            <div className="mx-auto max-w-4xl px-4 py-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me to show stocks, weather, or tasks..."
                  className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "rounded-lg bg-primary text-primary-foreground px-4 py-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "hover:bg-primary/90 transition-colors"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
