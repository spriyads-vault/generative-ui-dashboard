// Direct OpenAI API implementation bypassing AI SDK schema issues
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Define tools with proper JSON Schema
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "stockCard",
          description: "Display a stock price card with symbol, current price, percentage change, and a mini chart",
          parameters: {
            type: "object" as const,
            properties: {
              symbol: {
                type: "string" as const,
                description: "Stock symbol (e.g., AAPL, TSLA, GOOGL)"
              }
            },
            required: ["symbol"] as const
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "weatherWidget",
          description: "Display a weather widget showing location, temperature, and current conditions",
          parameters: {
            type: "object" as const,
            properties: {
              location: {
                type: "string" as const,
                description: "Location for weather (e.g., San Francisco, New York)"
              }
            },
            required: ["location"] as const
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "kanbanBoard",
          description: "Display a kanban board with tasks organized in columns (To Do, In Progress, Done)",
          parameters: {
            type: "object" as const,
            properties: {},
            required: [] as const
          }
        }
      }
    ];

    // Call OpenAI API directly
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `You represent a futuristic dashboard OS that brings data to life through interactive visualizations. 
You have access to powerful tools that can render dynamic UI components in real-time.

When users request information about:
- Stocks: Use the stockCard tool to display price data with beautiful charts
- Weather: Use the weatherWidget tool to show current conditions
- Tasks: Use the kanbanBoard tool to organize and visualize work

Be proactive and intelligent - if a user asks about a stock, weather, or tasks, automatically use the appropriate tool to create a visual representation. 
Your responses should be concise, modern, and focused on delivering value through interactive components. 
Think of yourself as a next-generation interface that makes data beautiful and actionable.`
          },
          ...messages
        ],
        tools: tools,
        tool_choice: "auto",
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      return new Response(JSON.stringify({ error: "OpenAI API error", details: data }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle tool calls and execute them
    const message = data.choices[0]?.message;
    if (message?.tool_calls) {
      const toolResults: Array<{
        tool_call_id: string;
        role: string;
        name: string;
        content: string;
      }> = [];
      
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments || '{}');
        
        let result: any;
        switch (functionName) {
          case "stockCard":
            result = await getMockStockData(functionArgs.symbol);
            break;
          case "weatherWidget":
            result = await getMockWeatherData(functionArgs.location);
            break;
          case "kanbanBoard":
            result = await getMockKanbanData();
            break;
          default:
            result = { error: "Unknown tool" };
        }
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(result)
        });
      }
      
      // Second call to get final response with tool results
      const finalResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You represent a futuristic dashboard OS that brings data to life through interactive visualizations."
            },
            ...messages,
            message,
            ...toolResults
          ],
          temperature: 0.7
        })
      });
      
      const finalData = await finalResponse.json();
      
      if (!finalResponse.ok) {
        console.error("OpenAI API Error (final):", finalData);
        return new Response(JSON.stringify({ error: "OpenAI API error", details: finalData }), {
          status: finalResponse.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Format response to match expected UI structure
      const formattedResponse = {
        ...finalData,
        choices: finalData.choices.map((choice: any) => ({
          ...choice,
          message: {
            ...choice.message,
            toolInvocations: message.tool_calls.map((call: any, index: number) => ({
              toolCallId: call.id,
              toolName: call.function.name,
              args: JSON.parse(call.function.arguments || '{}'),
              result: JSON.parse(toolResults[index].content)
            }))
          }
        }))
      };
      
      return new Response(JSON.stringify(formattedResponse), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

