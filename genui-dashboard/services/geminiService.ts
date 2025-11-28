import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { WidgetContent, StockData, WeatherData, KanbanData } from "../types";

// --- Mock Data Generators for Tools ---

const generateStockData = (symbol: string): StockData => {
  const basePrice = Math.random() * 1000 + 50;
  const history = Array.from({ length: 20 }, (_, i) => ({
    time: `${9 + Math.floor(i/2)}:${i%2 === 0 ? '00' : '30'}`,
    value: basePrice + (Math.random() - 0.5) * 20
  }));
  
  const currentPrice = history[history.length - 1].value;
  
  return {
    symbol: symbol.toUpperCase(),
    price: currentPrice,
    change: (Math.random() - 0.5) * 5,
    history,
    low: basePrice - Math.random() * 10,
    high: basePrice + Math.random() * 10,
    open: basePrice,
    volume: `${(Math.random() * 10 + 1).toFixed(1)}M`,
    marketCap: `${(Math.random() * 2 + 0.5).toFixed(1)}T`
  };
};

const generateWeatherData = (location: string): WeatherData => {
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'] as const;
  const currentTemp = Math.floor(Math.random() * 30) + 5;
  
  return {
    location,
    temperature: currentTemp,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    humidity: Math.floor(Math.random() * 60) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    feelsLike: currentTemp + Math.floor(Math.random() * 4) - 2,
    uvIndex: Math.floor(Math.random() * 10),
    forecast: [
      { day: 'Tue', temp: currentTemp + 1, condition: conditions[Math.floor(Math.random() * conditions.length)] },
      { day: 'Wed', temp: currentTemp - 2, condition: conditions[Math.floor(Math.random() * conditions.length)] },
      { day: 'Thu', temp: currentTemp + 3, condition: conditions[Math.floor(Math.random() * conditions.length)] },
    ]
  };
};

const generateKanbanData = (title: string): KanbanData => {
  return {
    title,
    columns: [
      { 
        id: 'todo', 
        title: 'To Do', 
        tasks: [
          { id: '1', content: 'Analyze requirements', priority: 'High', tag: 'Product' }, 
          { id: '2', content: 'Draft design', priority: 'Medium', tag: 'Design' }
        ] 
      },
      { 
        id: 'in-progress', 
        title: 'In Progress', 
        tasks: [
          { id: '3', content: 'Develop prototype', priority: 'High', tag: 'Dev' }
        ] 
      },
      { 
        id: 'done', 
        title: 'Done', 
        tasks: [
          { id: '4', content: 'Initial meeting', priority: 'Low', tag: 'General' }
        ] 
      }
    ]
  };
};

// --- Tool Definitions ---

const tools = [
  {
    functionDeclarations: [
      {
        name: 'showStockPrice',
        description: 'Displays a stock price card with a chart for a given symbol.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING, description: 'The stock symbol (e.g., AAPL, GOOGL)' }
          },
          required: ['symbol']
        }
      },
      {
        name: 'showWeather',
        description: 'Displays a weather widget for a specific location.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING, description: 'The city or location name' }
          },
          required: ['location']
        }
      },
      {
        name: 'createKanbanBoard',
        description: 'Creates a Kanban board for task management.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'The title of the project or board' }
          },
          required: ['title']
        }
      }
    ]
  }
];

// --- Service Class ---

class GeminiService {
  private client: GoogleGenAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.API_KEY || '';
    if (!this.apiKey) {
      console.error("API_KEY is missing from environment variables.");
    }
    this.client = new GoogleGenAI({ apiKey: this.apiKey });
  }

  // --- Text Chat Method ---
  async sendMessage(
    message: string, 
    history: { role: 'user' | 'model'; parts: { text?: string }[] }[]
  ): Promise<{ text?: string; widget?: WidgetContent }> {
    try {
      const chat = this.client.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are a helpful AI assistant for a dashboard. You can display UI widgets using tools. If the user asks for stock, weather, or tasks, call the appropriate function. Be concise in text responses. Do not output markdown, just plain text.",
            tools: tools
        },
        history: history
      });

      const response = await chat.sendMessage({ message });
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        const { name, args } = call;

        // In a real app, we would send the function response back to the model.
        // For this Generative UI demo, we intercept the call and return the Widget data directly to the frontend.
        
        let widget: WidgetContent | undefined;

        if (name === 'showStockPrice') {
          widget = { type: 'stock', data: generateStockData(args.symbol as string) };
        } else if (name === 'showWeather') {
          widget = { type: 'weather', data: generateWeatherData(args.location as string) };
        } else if (name === 'createKanbanBoard') {
          widget = { type: 'kanban', data: generateKanbanData(args.title as string) };
        }

        return { text: "I've generated that widget for you.", widget };
      }

      return { text: response.text };

    } catch (error) {
      console.error("Error in sendMessage:", error);
      return { text: "Sorry, I encountered an error processing your request." };
    }
  }

  // --- Live API Helpers (Audio handling) ---

  getLiveConfig() {
    return {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO], 
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: "You are a dashboard AI. When asked, you can call tools to show stocks, weather, or kanban boards. Keep audio responses brief and professional.",
        tools: tools,
      },
    };
  }
}

export const geminiService = new GeminiService();

// Audio Helpers
export function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for(let i=0; i<int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

export function float32ArrayToBase64(data: Float32Array): string {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
        let s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for(let i=0; i<bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}