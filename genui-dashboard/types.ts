export interface StockData {
  symbol: string;
  price: number;
  change: number;
  history: { time: string; value: number }[];
  // New fields for enhanced UI
  low: number;
  high: number;
  open: number;
  volume: string;
  marketCap: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy';
  humidity: number;
  windSpeed: number;
  // New fields
  feelsLike: number;
  uvIndex: number;
  forecast: { day: string; temp: number; condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' }[];
}

export interface KanbanTask {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
  tag: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

export interface KanbanData {
  title: string;
  columns: KanbanColumn[];
}

export type WidgetType = 'stock' | 'weather' | 'kanban';

export interface WidgetContent {
  type: WidgetType;
  data: StockData | WeatherData | KanbanData;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text?: string;
  widget?: WidgetContent;
  timestamp: number;
}

export enum LiveStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}