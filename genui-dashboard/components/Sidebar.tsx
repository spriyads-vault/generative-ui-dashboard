import React from 'react';
import { BarChart3, CloudSun, Kanban, Settings, LayoutDashboard, ChevronLeft, Hexagon } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const menuItems = [
    { icon: BarChart3, label: 'Stock Card', desc: 'Display stock prices' },
    { icon: CloudSun, label: 'Weather Widget', desc: 'Show weather info' },
    { icon: Kanban, label: 'Kanban Board', desc: 'Task management' },
  ];

  return (
    <div className={`h-full border-r border-border bg-black/50 backdrop-blur-xl transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between border-b border-border/50 h-16">
        {!collapsed && (
          <div className="flex items-center gap-2 text-white font-bold tracking-tight">
            <Hexagon className="text-primary fill-primary/20" size={20} />
            <span>GenUI</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg hover:bg-surfaceHighlight text-gray-400 transition-transform ${collapsed ? 'mx-auto rotate-180' : ''}`}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="p-3">
        {!collapsed && <p className="text-xs font-semibold text-gray-500 mb-3 px-2">AVAILABLE TOOLS</p>}
        <div className="space-y-1">
          {menuItems.map((item, idx) => (
            <button key={idx} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surfaceHighlight text-gray-400 hover:text-white transition-all group text-left">
              <item.icon size={20} className="shrink-0 group-hover:text-primary transition-colors" />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-[10px] text-gray-500 leading-tight">{item.desc}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-3 border-t border-border/50">
        <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surfaceHighlight text-gray-400 hover:text-white transition-all">
          <Settings size={20} />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;