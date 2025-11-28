import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StockData } from '../../types';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface StockCardProps {
  data: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ data }) => {
  const isPositive = data.change >= 0;
  const color = isPositive ? '#10b981' : '#ef4444'; // emerald-500 : red-500
  
  return (
    <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 w-full max-w-[400px] shadow-2xl overflow-hidden relative group">
      {/* Background glow effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${isPositive ? 'emerald' : 'red'}-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none transition-colors duration-500`} />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#18181b] flex items-center justify-center border border-[#27272a]">
             <Activity size={20} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400">Stock Market</h3>
            <h2 className="text-xl font-bold text-white tracking-tight">{data.symbol}</h2>
          </div>
        </div>
        <div className={`flex flex-col items-end`}>
           <span className="text-2xl font-bold text-white">${data.price.toFixed(2)}</span>
           <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight size={16} className="mr-0.5"/> : <ArrowDownRight size={16} className="mr-0.5"/>}
              {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
           </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 w-full mb-6 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.history}>
            <defs>
              <linearGradient id={`colorPrice-${data.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} horizontal={true} stroke="#27272a" strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                borderColor: '#27272a', 
                borderRadius: '8px', 
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#52525b', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#colorPrice-${data.symbol})`} 
              strokeWidth={2}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-[#27272a] pt-4 relative z-10">
        <div className="flex flex-col">
           <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Open</span>
           <span className="text-sm font-medium text-gray-200">${data.open.toFixed(2)}</span>
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Volume</span>
           <span className="text-sm font-medium text-gray-200">{data.volume}</span>
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">High</span>
           <span className="text-sm font-medium text-gray-200">${data.high.toFixed(2)}</span>
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Low</span>
           <span className="text-sm font-medium text-gray-200">${data.low.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;