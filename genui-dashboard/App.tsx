import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage } from "@google/genai";
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import StockCard from './components/widgets/StockCard';
import WeatherCard from './components/widgets/WeatherCard';
import KanbanBoard from './components/widgets/KanbanBoard';
import { geminiService, float32ArrayToBase64, base64ToFloat32Array } from './services/geminiService';
import { Message, LiveStatus, WidgetContent } from './types';
import { Bot, User, Sparkles, Hexagon } from 'lucide-react';

// --- Widget Renderer ---
const WidgetRenderer: React.FC<{ widget: WidgetContent }> = ({ widget }) => {
  switch (widget.type) {
    case 'stock': return <StockCard data={widget.data as any} />;
    case 'weather': return <WeatherCard data={widget.data as any} />;
    case 'kanban': return <KanbanBoard data={widget.data as any} />;
    default: return null;
  }
};

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', timestamp: Date.now(), text: 'Welcome to Generative UI Dashboard. Ask me to show stocks, weather, or tasks.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Live API State
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(LiveStatus.DISCONNECTED);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- Text Chat Handler ---
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const history = messages
      .filter(m => m.role !== 'system' && m.text)
      .map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));

    const response = await geminiService.sendMessage(text, history);

    setIsTyping(false);
    
    if (response.widget) {
        const modelMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: response.text, 
            widget: response.widget, 
            timestamp: Date.now() 
        };
        setMessages(prev => [...prev, modelMsg]);
    } else if (response.text) {
        const modelMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: response.text, 
            timestamp: Date.now() 
        };
        setMessages(prev => [...prev, modelMsg]);
    }
  };

  // --- Live API Handlers ---
  const connectLive = async () => {
    setLiveStatus(LiveStatus.CONNECTING);
    try {
      const client = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const config = geminiService.getLiveConfig();
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 16000
      } });
      
      inputSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      inputSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      const sessionPromise = client.live.connect({
        model: config.model,
        config: config.config,
        callbacks: {
          onopen: () => {
            setLiveStatus(LiveStatus.CONNECTED);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: "Live session started. I'm listening...", timestamp: Date.now() }]);
            
             processorRef.current!.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const base64Data = float32ArrayToBase64(inputData);
              sessionPromise.then(session => {
                  session.sendRealtimeInput({
                      media: { mimeType: "audio/pcm;rate=16000", data: base64Data }
                  });
              });
            };
          },
          onmessage: async (msg: LiveServerMessage) => {
             if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                const audioData = msg.serverContent.modelTurn.parts[0].inlineData.data;
                playAudioChunk(audioData);
             }

             if (msg.toolCall) {
                for (const fc of msg.toolCall.functionCalls) {
                   const { name, args } = fc;
                   // @ts-ignore
                   const argsObj = args; 
                   
                   let widget: WidgetContent | undefined;
                   // Simplified Mock for Live Demo
                    if (name === 'showStockPrice') {
                       // @ts-ignore
                      widget = { type: 'stock', data: { symbol: argsObj.symbol, price: 152.4, change: 1.5, history: [], low: 148, high: 155, open: 150, volume: '45M' } }; 
                    } else if (name === 'showWeather') {
                       // @ts-ignore
                      widget = { type: 'weather', data: { location: argsObj.location, temperature: 22, condition: 'Sunny', humidity: 45, windSpeed: 12, feelsLike: 24, forecast: [] } };
                    } else if (name === 'createKanbanBoard') {
                      widget = { type: 'kanban', data: { title: 'Project X', columns: [] } };
                    }

                   if (widget) {
                     setMessages(prev => [...prev, { 
                         id: Date.now().toString(), 
                         role: 'model', 
                         text: `Showing ${name}...`, 
                         widget, 
                         timestamp: Date.now() 
                     }]);
                   }
                   
                   sessionPromise.then(session => {
                       session.sendToolResponse({
                           functionResponses: {
                               name: fc.name,
                               id: fc.id,
                               response: { result: "Widget displayed" }
                           }
                       })
                   })
                }
             }
          },
          onclose: () => {
            setLiveStatus(LiveStatus.DISCONNECTED);
          },
          onerror: (err) => {
            setLiveStatus(LiveStatus.ERROR);
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setLiveStatus(LiveStatus.ERROR);
    }
  };

  const disconnectLive = async () => {
    if (sessionRef.current) {
        const session = await sessionRef.current;
        session.close();
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    setLiveStatus(LiveStatus.DISCONNECTED);
  };

  const toggleLive = () => {
    if (liveStatus === LiveStatus.CONNECTED || liveStatus === LiveStatus.CONNECTING) {
        disconnectLive();
    } else {
        connectLive();
    }
  };

  const nextStartTime = useRef(0);
  const playAudioChunk = async (base64Audio: string) => {
     if (!audioContextRef.current) return;
     const ctx = audioContextRef.current;
     const float32 = base64ToFloat32Array(base64Audio);
     const buffer = ctx.createBuffer(1, float32.length, 24000);
     buffer.getChannelData(0).set(float32);
     
     const source = ctx.createBufferSource();
     source.buffer = buffer;
     source.connect(ctx.destination);
     
     const now = ctx.currentTime;
     const start = Math.max(now, nextStartTime.current);
     source.start(start);
     nextStartTime.current = start + buffer.duration;
  };

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-[#e4e4e7] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header - Minimalist */}
        <div className="absolute top-0 left-0 right-0 p-4 pl-6 flex items-center justify-between z-10 bg-gradient-to-b from-[#09090b] to-transparent h-24 pointer-events-none">
           <div className="pointer-events-auto opacity-0 md:opacity-100 transition-opacity">
           </div>
        </div>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto pt-20 pb-36 px-4 md:px-0">
          <div className="max-w-3xl mx-auto w-full space-y-8">
            {messages.length === 1 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                        <div className="relative bg-[#18181b] p-6 rounded-3xl border border-white/5 shadow-2xl">
                            <Hexagon size={40} className="text-blue-500 fill-blue-500/20" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-4 tracking-tight">
                            How can I help you?
                        </h1>
                        <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                            I can visualize data for you. Try asking about financial markets, local weather, or project management.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-sm">
                        {[
                          "Show me Apple's stock price",
                          "Weather in Tokyo",
                          "Create a Kanban for Q4 Goals",
                          "Compare TSLA and F"
                        ].map((prompt, i) => (
                           <button 
                             key={i} 
                             onClick={() => handleSendMessage(prompt)} 
                             className="bg-[#18181b] hover:bg-[#27272a] hover:text-white text-gray-400 p-4 rounded-xl border border-[#27272a] transition-all text-left shadow-sm hover:shadow-md hover:-translate-y-0.5"
                           >
                              {prompt}
                           </button>
                        ))}
                    </div>
                </div>
            )}

            {messages.slice(1).map((msg) => (
                <div key={msg.id} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Avatar for Bot */}
                    {msg.role === 'model' && (
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center mr-4 mt-1 border border-indigo-500/30">
                             <Sparkles size={16} className="text-indigo-400" />
                        </div>
                    )}

                    <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Text Bubble */}
                        {msg.text && (
                            <div className={`py-3 px-5 text-[15px] leading-relaxed shadow-sm backdrop-blur-sm ${
                                msg.role === 'user' 
                                ? 'bg-[#27272a] text-white rounded-2xl rounded-tr-sm border border-white/5' 
                                : 'bg-transparent text-gray-300 pl-0 pt-0'
                            }`}>
                                {msg.text}
                            </div>
                        )}
                        
                        {/* Widget Container */}
                        {msg.widget && (
                            <div className="mt-3 w-full">
                                <WidgetRenderer widget={msg.widget} />
                            </div>
                        )}
                    </div>

                    {/* Avatar for User */}
                    {msg.role === 'user' && (
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center ml-3 mt-1 border border-white/5">
                            <User size={16} className="text-gray-400" />
                        </div>
                    )}
                </div>
            ))}

            {isTyping && (
                <div className="flex w-full justify-start animate-in fade-in duration-300">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center mr-4 border border-indigo-500/30">
                        <Sparkles size={16} className="text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1.5 h-10">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area - Floating */}
        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-20">
             <ChatInput 
               onSendMessage={handleSendMessage} 
               liveStatus={liveStatus}
               onToggleLive={toggleLive}
               disabled={isTyping}
             />
        </div>
      </div>
    </div>
  );
};

export default App;