"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockCardProps {
  symbol: string;
  price: number;
  delta: number; // percentage change
}

// Generate dummy chart data
const generateChartData = (basePrice: number, delta: number) => {
  const data = [];
  const trend = delta > 0 ? 1 : -1;
  const volatility = Math.abs(delta) * 0.1;
  
  for (let i = 0; i < 20; i++) {
    const variation = (Math.random() - 0.5) * volatility * basePrice;
    const trendValue = (i / 20) * trend * Math.abs(delta) * 0.01 * basePrice;
    data.push({
      value: basePrice + variation + trendValue,
    });
  }
  return data;
};

export function StockCard({ symbol, price, delta }: StockCardProps) {
  const isPositive = delta >= 0;
  const chartData = generateChartData(price, delta);
  const deltaColor = isPositive ? "text-green-600" : "text-red-600";
  const bgColor = isPositive ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20";

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{symbol}</h3>
          <p className="text-2xl font-bold mt-1">${price.toFixed(2)}</p>
        </div>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded", bgColor)}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={cn("text-sm font-medium", deltaColor)}>
            {isPositive ? "+" : ""}
            {delta.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="h-[80px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "#16a34a" : "#dc2626"}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

