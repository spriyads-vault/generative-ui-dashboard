import React from 'react';
import { WeatherData } from '../../types';
import { Cloud, CloudRain, Sun, Snowflake, Wind, Droplets, MapPin, ThermometerSun, SunDim } from 'lucide-react';

interface WeatherCardProps {
  data: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  const getWeatherIcon = (condition: string, size: number, className?: string) => {
    switch (condition) {
      case 'Sunny': return <Sun size={size} className={`text-yellow-400 ${className}`} />;
      case 'Rainy': return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
      case 'Snowy': return <Snowflake size={size} className={`text-cyan-200 ${className}`} />;
      default: return <Cloud size={size} className={`text-gray-300 ${className}`} />;
    }
  };

  const getGradient = () => {
    switch (data.condition) {
      case 'Sunny': return 'bg-gradient-to-br from-[#0c0a09] to-[#451a03]'; // dark orange-ish
      case 'Rainy': return 'bg-gradient-to-br from-[#020617] to-[#1e3a8a]'; // dark blue
      case 'Snowy': return 'bg-gradient-to-br from-[#0f172a] to-[#334155]'; // slate
      default: return 'bg-gradient-to-br from-[#18181b] to-[#27272a]'; // zinc
    }
  };

  return (
    <div className={`relative ${getGradient()} border border-white/10 rounded-2xl p-0 w-full max-w-[400px] overflow-hidden shadow-2xl`}>
      {/* Top Section */}
      <div className="p-6 relative">
        <div className="flex justify-between items-start">
           <div className="flex items-center text-gray-300/80 text-sm font-medium backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full">
             <MapPin size={14} className="mr-1.5" />
             {data.location}
           </div>
           <div className="text-xs font-medium text-white/50 bg-white/5 px-2 py-1 rounded-md">
             Today
           </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
            <div>
               <h2 className="text-6xl font-light text-white tracking-tighter">{data.temperature}°</h2>
               <p className="text-lg text-white/80 font-medium mt-1 pl-1">{data.condition}</p>
            </div>
            <div className="animate-pulse-slow">
               {getWeatherIcon(data.condition, 80, 'drop-shadow-2xl')}
            </div>
        </div>
        
        {/* Main Details Grid */}
        <div className="grid grid-cols-3 gap-2 mt-8">
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                <Wind size={18} className="text-white/60 mb-1" />
                <span className="text-xs text-white/40">Wind</span>
                <span className="text-sm font-bold text-white">{data.windSpeed} <span className="text-[10px] font-normal">km/h</span></span>
            </div>
             <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                <Droplets size={18} className="text-blue-400/80 mb-1" />
                <span className="text-xs text-white/40">Humidity</span>
                <span className="text-sm font-bold text-white">{data.humidity}<span className="text-[10px] font-normal">%</span></span>
            </div>
             <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                <ThermometerSun size={18} className="text-orange-400/80 mb-1" />
                <span className="text-xs text-white/40">Feels Like</span>
                <span className="text-sm font-bold text-white">{data.feelsLike}°</span>
            </div>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="bg-black/40 backdrop-blur-lg p-5 border-t border-white/5">
         <h4 className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-4">3-Day Forecast</h4>
         <div className="flex justify-between">
            {data.forecast.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 min-w-[60px]">
                    <span className="text-sm font-medium text-white/70">{day.day}</span>
                    <div className="my-1">
                        {getWeatherIcon(day.condition, 24)}
                    </div>
                    <span className="text-base font-bold text-white">{day.temp}°</span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default WeatherCard;