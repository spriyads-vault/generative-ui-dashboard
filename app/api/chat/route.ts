import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

// Zod schemas matching component props
const stockCardSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA)"),
  price: z.number().describe("Current stock price in USD"),
  delta: z.number().describe("Percentage change (positive or negative)"),
});

const weatherWidgetSchema = z.object({
  location: z.string().describe("Location name (e.g., 'San Francisco, CA')"),
  temp: z.number().describe("Temperature in Fahrenheit"),
  condition: z.string().describe("Weather condition (e.g., 'Sunny', 'Rainy', 'Cloudy')"),
});

const kanbanBoardSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })
  ).describe("Array of tasks to display on the board"),
});

// Mock data generators
const getMockStockData = async (symbol: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const basePrices: Record<string, number> = {
    AAPL: 175.50,
    TSLA: 245.30,
    GOOGL: 142.80,
    MSFT: 378.90,
    AMZN: 152.40,
  };
  
  const basePrice = basePrices[symbol.toUpperCase()] || 100 + Math.random() * 200;
  const delta = (Math.random() - 0.5) * 10; // -5% to +5%
  const price = basePrice * (1 + delta / 100);
  
  return {
    symbol: symbol.toUpperCase(),
    price: Number(price.toFixed(2)),
    delta: Number(delta.toFixed(2)),
  };
};

const getMockWeatherData = async (location: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Clear"];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = 60 + Math.random() * 40; // 60-100°F
  
  return {
    location,
    temp: Math.round(temp),
    condition,
  };
};

const getMockKanbanData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  
  const tasks = [
    { id: "1", title: "Design new dashboard", description: "Create wireframes and mockups" },
    { id: "2", title: "Implement API endpoints", description: "Set up RESTful routes" },
    { id: "3", title: "Write unit tests", description: "Coverage for core functions" },
    { id: "4", title: "Update documentation", description: "API and component docs" },
    { id: "5", title: "Code review", description: "Review PR #123" },
    { id: "6", title: "Deploy to staging", description: "Run CI/CD pipeline" },
  ];
  
  return { tasks };
};

// Tool definitions
const tools = {
  stockCard: tool({
    description: "Display a stock price card with symbol, current price, percentage change, and a mini chart",
    parameters: stockCardSchema,
    execute: async ({ symbol }) => {
      return await getMockStockData(symbol);
    },
  }),
  
  weatherWidget: tool({
    description: "Display a weather widget showing location, temperature, and current conditions",
    parameters: weatherWidgetSchema,
    execute: async ({ location }) => {
      return await getMockWeatherData(location);
    },
  }),
  
  kanbanBoard: tool({
    description: "Display a kanban board with tasks organized in columns (To Do, In Progress, Done)",
    parameters: kanbanBoardSchema,
    execute: async () => {
      return await getMockKanbanData();
    },
  }),
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages,
    tools,
    system: "You are a helpful assistant that can display interactive UI components. When users ask about stocks, weather, or tasks, use the appropriate tool to show them visual widgets. Be conversational and helpful.",
  });

  return result.toDataStreamResponse();
}

