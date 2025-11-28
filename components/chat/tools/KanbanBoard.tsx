"use client";

import { CheckCircle2, Circle, Clock, MoreHorizontal, Tag } from "lucide-react";

interface KanbanTask {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
  tag: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

interface KanbanData {
  title: string;
  columns: KanbanColumn[];
}

interface KanbanBoardProps {
  data: KanbanData;
}

type ColumnType = "todo" | "inprogress" | "done";

const columnConfig: Record<ColumnType, { title: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  todo: {
    title: "To Do",
    icon: <Circle className="h-4 w-4" />,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10 border-gray-500/20"
  },
  inprogress: {
    title: "In Progress",
    icon: <Clock className="h-4 w-4" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20"
  },
  done: {
    title: "Done",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20"
  },
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-red-500/20 text-red-400 border-red-500/20';
    case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
    case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/20';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
  }
};

export function KanbanBoard({ data }: KanbanBoardProps) {
  return (
    <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 w-full max-w-[800px] shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Project Management</h3>
          <h2 className="text-xl font-bold text-white tracking-tight">{data.title || 'Task Board'}</h2>
        </div>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-3 gap-4">
        {(data.columns || []).map((column, index) => {
          const config = columnConfig[column.id as ColumnType] || columnConfig.todo;
          
          return (
            <div key={column.id || index} className="flex flex-col">
              {/* Column Header */}
              <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${config.bgColor} border`}>
                {config.icon}
                <h4 className={`font-medium text-sm ${config.color}`}>{column.title || 'Tasks'}</h4>
                <span className="ml-auto text-xs text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full">
                  {(column.tasks || []).length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-2 min-h-[300px]">
                {(column.tasks || []).map((task) => (
                  <div
                    key={task.id}
                    className="group rounded-lg border border-[#27272a] bg-[#18181b] p-3 hover:border-[#3f3f46] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-200 leading-tight">
                        {task.content || 'Untitled Task'}
                      </p>
                      <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                    
                    {/* Task Meta */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority || 'Medium')}`}>
                        {task.priority || 'Medium'}
                      </span>
                      {task.tag && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Tag size={12} />
                          <span className="truncate max-w-[100px]">{task.tag}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(column.tasks || []).length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-12 border-2 border-dashed border-[#27272a] rounded-lg">
                    No tasks yet
                  </div>
                )}
              </div>

              {/* Add Task Button */}
              <button className="mt-3 w-full p-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-dashed border-[#27272a] transition-colors">
                + Add task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

