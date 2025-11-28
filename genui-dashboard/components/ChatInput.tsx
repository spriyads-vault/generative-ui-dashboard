import React, { useState } from 'react';
import { Send, Mic, MicOff, AudioWaveform, Paperclip } from 'lucide-react';
import { LiveStatus } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  liveStatus: LiveStatus;
  onToggleLive: () => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, liveStatus, onToggleLive, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const isLive = liveStatus === LiveStatus.CONNECTED || liveStatus === LiveStatus.CONNECTING;

  return (
    <div className="w-full max-w-3xl relative">
      {/* Live Status Indicator - Floating above input */}
      {isLive && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            {liveStatus === LiveStatus.CONNECTING ? 'Connecting to Gemini...' : 'Listening...'}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`relative flex items-center gap-2 bg-[#18181b]/80 backdrop-blur-xl border border-[#27272a] p-2 rounded-2xl shadow-2xl transition-all duration-300 ${isLive ? 'ring-2 ring-red-500/20 border-red-500/20' : 'focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40'}`}>
        
        {/* Attachment Mock Button */}
        <button type="button" className="p-3 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-colors" disabled={isLive}>
            <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLive ? "Voice mode active..." : "Ask anything..."}
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-[15px] py-2"
          disabled={disabled || isLive}
        />

        {/* Live Button */}
        <button
          type="button"
          onClick={onToggleLive}
          disabled={liveStatus === LiveStatus.CONNECTING}
          className={`
            p-3 rounded-xl transition-all duration-300 flex items-center justify-center
            ${isLive 
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }
          `}
          title={isLive ? "Stop Live Session" : "Start Voice Chat"}
        >
          {isLive ? <AudioWaveform size={20} className="animate-pulse" /> : <Mic size={20} />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || disabled || isLive}
          className={`
             p-3 rounded-xl transition-all duration-300 flex items-center justify-center
             ${input.trim() && !isLive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500'
                : 'bg-[#27272a] text-gray-600 cursor-not-allowed'
             }
          `}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;