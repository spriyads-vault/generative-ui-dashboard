import React from 'react';
import { KanbanData } from '../../types';
import { MoreHorizontal, Plus, Flag, CircleDashed } from 'lucide-react';

interface KanbanBoardProps {
  data: KanbanData;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ data }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 w-full max-w-4xl shadow-xl overflow-x-auto">
      <div className="flex justify-between items-center mb-6 min-w-[600px]">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <CircleDashed className="text-indigo-400" size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white leading-tight">{data.title}</h3>
                <p className="text-xs text-gray-500">Project Board</p>
            </div>
        </div>
        
        <div className="flex -space-x-2 mr-4">
             {[1,2,3].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-[#121214] bg-zinc-800 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                     U{i}
                 </div>
             ))}
             <button className="w-8 h-8 rounded-full border-2 border-[#121214] bg-zinc-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors">
                <Plus size={14} />
             </button>
        </div>
      </div>
      
      <div className="flex gap-4 min-w-[700px]">
        {data.columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[220px] bg-[#18181b] rounded-xl p-3 border border-[#27272a]">
             <div className="flex justify-between items-center mb-3 px-1">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                   <span className={`w-1.5 h-1.5 rounded-full ${
                       column.id === 'todo' ? 'bg-gray-500' : 
                       column.id === 'in-progress' ? 'bg-indigo-500' : 'bg-emerald-500'
                   }`} />
                   {column.title}
               </h4>
               <span className="text-[10px] text-gray-500 font-mono bg-[#27272a] px-1.5 py-0.5 rounded">{column.tasks.length}</span>
             </div>
             
             <div className="space-y-2.5">
               {column.tasks.map((task) => (
                 <div key={task.id} className="bg-[#27272a]/50 hover:bg-[#27272a] transition-all p-3.5 rounded-lg border border-[#3f3f46]/30 group cursor-pointer shadow-sm hover:shadow-md hover:border-[#3f3f46]">
                   <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                        <button className="text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={14} />
                        </button>
                   </div>
                   <p className="text-sm text-gray-200 font-medium leading-snug mb-3">{task.content}</p>
                   
                   <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{task.tag}</span>
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[9px] text-indigo-300 border border-indigo-500/30">
                            JD
                        </div>
                   </div>
                 </div>
               ))}
               <button className="w-full py-2 border border-dashed border-[#3f3f46] rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:border-gray-500 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 group">
                 <Plus size={14} className="group-hover:scale-110 transition-transform" /> Add Task
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;