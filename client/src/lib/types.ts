// Tipos para o calendário
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  description?: string;
  location?: string;
  calendarId: string;
  color?: string;
  allDay?: boolean;
  reminders?: Reminder[];
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  selected?: boolean;
}

export interface Reminder {
  method: string;
  minutes: number;
}

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface Week {
  days: DayCell[];
}

export interface Month {
  weeks: Week[];
  name: string;
  year: number;
}

// Tipos para o assistente
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  messages: Message[];
  title?: string;
  createdAt: Date;
}

// Tipos para autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Tipos para o evento no modal
export interface EventFormData {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  calendarId: string;
  reminder: boolean;
  reminderMinutes?: number;
  allDay: boolean;
}
