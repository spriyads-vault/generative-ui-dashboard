"use client";

import { BarChart3, Cloud, CheckSquare, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { name: "Stock Card", icon: BarChart3, description: "Display stock prices" },
  { name: "Weather Widget", icon: Cloud, description: "Show weather info" },
  { name: "Kanban Board", icon: CheckSquare, description: "Task management" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
      <div className="p-4">
        <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
          Available Tools
        </h2>
        <div className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className="flex items-start gap-3 rounded-lg p-3 text-sm hover:bg-muted/60 transition-colors"
              >
                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span>Ask me to use any tool</span>
        </div>
      </div>
    </aside>
  );
}

