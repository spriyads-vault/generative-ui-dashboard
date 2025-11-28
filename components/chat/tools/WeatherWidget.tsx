"use client";

import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Thermometer } from "lucide-react";

interface WeatherWidgetProps {
  data: {
    location: string;
    temperature: number;
    condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy';
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    uvIndex?: number;
    forecast?: { day: string; temp: number; condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' }[];
  };
}

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes("sun") || lower.includes("clear")) {
    return <Sun className="h-16 w-16 text-yellow-400" />;
  }
  if (lower.includes("rain") || lower.includes("drizzle")) {
    return <CloudRain className="h-16 w-16 text-blue-400" />;
  }
  if (lower.includes("snow")) {
    return <CloudSnow className="h-16 w-16 text-blue-300" />;
  }
  if (lower.includes("wind")) {
    return <Wind className="h-16 w-16 text-gray-400" />;
  }
  return <Cloud className="h-16 w-16 text-gray-400" />;
};

const getWeatherGradient = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes("sun") || lower.includes("clear")) {
    return 'from-yellow-500/20 to-orange-500/20';
  }
  if (lower.includes("rain") || lower.includes("drizzle")) {
    return 'from-blue-500/20 to-cyan-500/20';
  }
  if (lower.includes("snow")) {
    return 'from-blue-300/20 to-gray-300/20';
  }
  return 'from-gray-500/20 to-gray-400/20';
};

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const icon = getWeatherIcon(data.condition || 'Cloudy');
  const gradient = getWeatherGradient(data.condition || 'Cloudy');
  
  return (
    <div className={`bg-[#121214] border border-[#27272a] rounded-2xl p-6 w-full max-w-[400px] shadow-2xl overflow-hidden relative group bg-gradient-to-br ${gradient}`}>
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Weather</h3>
          <h2 className="text-xl font-bold text-white tracking-tight">{data.location || 'Unknown Location'}</h2>
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          {icon}
        </div>
      </div>

      {/* Temperature Display */}
      <div className="flex items-baseline gap-2 mb-6 relative z-10">
        <span className="text-5xl font-bold text-white">{Math.round(data.temperature || 0)}</span>
        <span className="text-2xl text-gray-300">°F</span>
        <span className="text-lg text-gray-400 ml-2">Feels like {Math.round(data.feelsLike || data.temperature || 0)}°</span>
      </div>
      
      {/* Condition */}
      <p className="text-lg text-gray-200 mb-6 capitalize relative z-10">{data.condition || 'Unknown'}</p>

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-3 gap-4 border-t border-[#27272a] pt-4 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-blue-400 mb-1">
            <Droplets size={16} />
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Humidity</span>
          <span className="text-sm font-medium text-gray-200">{data.humidity || 0}%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Wind size={16} />
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Wind</span>
          <span className="text-sm font-medium text-gray-200">{data.windSpeed || 0} mph</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-orange-400 mb-1">
            <Thermometer size={16} />
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">UV Index</span>
          <span className="text-sm font-medium text-gray-200">{data.uvIndex || 6}</span>
        </div>
      </div>
    </div>
  );
}

