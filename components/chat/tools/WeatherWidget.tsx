"use client";

import { Cloud, Sun, CloudRain, CloudSnow, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  location: string;
  temp: number;
  condition: string;
}

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes("sun") || lower.includes("clear")) {
    return <Sun className="h-12 w-12 text-yellow-500" />;
  }
  if (lower.includes("rain") || lower.includes("drizzle")) {
    return <CloudRain className="h-12 w-12 text-blue-500" />;
  }
  if (lower.includes("snow")) {
    return <CloudSnow className="h-12 w-12 text-blue-300" />;
  }
  if (lower.includes("wind")) {
    return <Wind className="h-12 w-12 text-gray-500" />;
  }
  return <Cloud className="h-12 w-12 text-gray-400" />;
};

export function WeatherWidget({ location, temp, condition }: WeatherWidgetProps) {
  const icon = getWeatherIcon(condition);

  return (
    <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
          <p className="text-lg font-semibold">{location}</p>
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/50 dark:bg-white/10">
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">{Math.round(temp)}°</span>
        <span className="text-lg text-muted-foreground">F</span>
      </div>
      
      <p className="text-sm text-muted-foreground mt-2 capitalize">{condition}</p>
    </div>
  );
}

