"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface KanbanBoardProps {
  tasks: Task[];
}

type ColumnType = "todo" | "inProgress" | "done";

const columnConfig: Record<ColumnType, { title: string; icon: React.ReactNode; color: string }> = {
  todo: {
    title: "To Do",
    icon: <Circle className="h-4 w-4" />,
    color: "text-gray-600",
  },
  inProgress: {
    title: "In Progress",
    icon: <Clock className="h-4 w-4" />,
    color: "text-blue-600",
  },
  done: {
    title: "Done",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-green-600",
  },
};

// Simple distribution: split tasks into 3 columns
const distributeTasks = (tasks: Task[]): Record<ColumnType, Task[]> => {
  const total = tasks.length;
  const perColumn = Math.ceil(total / 3);
  
  return {
    todo: tasks.slice(0, perColumn),
    inProgress: tasks.slice(perColumn, perColumn * 2),
    done: tasks.slice(perColumn * 2),
  };
};

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const distributed = distributeTasks(tasks);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Task Board</h3>
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(columnConfig) as ColumnType[]).map((columnType) => {
          const config = columnConfig[columnType];
          const columnTasks = distributed[columnType];

          return (
            <div key={columnType} className="flex flex-col">
              <div className={cn("flex items-center gap-2 mb-3", config.color)}>
                {config.icon}
                <h4 className="font-medium text-sm">{config.title}</h4>
                <span className="ml-auto text-xs text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-md border bg-background p-3 text-sm hover:shadow-sm transition-shadow"
                  >
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-8">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

