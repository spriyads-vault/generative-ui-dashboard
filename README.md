# Generative UI Dashboard

Next.js app where an LLM dynamically renders interactive React components based on user requests.

## The "Why": Client-Side Tool Mapping

Uses **Client-Side Tool Mapping** instead of experimental `ai/rsc`/`streamUI` for stability and control. Server returns tool invocations as JSON; client maps them to React components.

## Architecture

```mermaid
flowchart TD
    A[User Input] --> B[Chat Interface]
    B --> C[API Route /api/chat]
    C --> D[LLM Processing]
    D --> E{Tool Invocation?}
    E -->|Yes| F[Execute Tool Handler]
    E -->|No| G[Return Text Response]
    F --> H[Return Tool Result as JSON]
    H --> I[Client: useChat Hook]
    I --> J[Parse toolInvocations]
    J --> K[Map toolName to Component]
    K --> L[Render Component with Props]
    L --> M[Interactive UI Component]
    G --> I
    M --> N[User Interaction]
    N --> A
```

<img width="1795" height="934" alt="image" src="https://github.com/user-attachments/assets/1a13237f-9e90-4c2c-a7b9-322a20483916" />

<img width="1758" height="840" alt="image" src="https://github.com/user-attachments/assets/909e5a86-4b35-4095-97d5-e36364e7d3d0" />



## Features

- **StockCard**: Stock info with mini-chart (symbol, price, delta)
- **WeatherWidget**: Weather display (location, temp, condition)
- **KanbanBoard**: 3-column task board

## Tech Stack

Next.js 14+ (App Router), Vercel AI SDK (`ai/react`), Tailwind + Shadcn/UI, Zod, Recharts, Lucide React

## Getting Started

```bash
npm install
npm run dev
```

## Development Phases

1. ✅ Phase 1: Project Setup & README
2. Phase 2: Component Library (The Tools)
3. Phase 3: Server-Side Logic (API)
4. Phase 4: Client-Side Integration
5. Phase 5: Polish & UI Wrapper
