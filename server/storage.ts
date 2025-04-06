import { 
  users, 
  conversations, 
  messages, 
  events, 
  calendars, 
  type User, 
  type InsertUser, 
  type Conversation, 
  type InsertConversation, 
  type Message, 
  type InsertMessage, 
  type Event, 
  type InsertEvent, 
  type Calendar, 
  type InsertCalendar 
} from "@shared/schema";

// Interface para operações de armazenamento
export interface IStorage {
  // Métodos de usuário
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokens(userId: number, accessToken: string, refreshToken: string | null, expiryDate: Date | null): Promise<User>;
  
  // Métodos de conversa
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: Omit<InsertConversation, "id">): Promise<Conversation>;
  
  // Métodos de mensagem
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: Omit<InsertMessage, "id">): Promise<Message>;
  
  // Métodos de evento
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByUserId(userId: number): Promise<Event[]>;
  getUpcomingEventsByUserId(userId: number, limit?: number): Promise<Event[]>;
  createEvent(event: Omit<InsertEvent, "id">): Promise<Event>;
  updateEvent(id: number, event: Partial<Omit<InsertEvent, "id">>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  
  // Métodos de calendário
  getCalendarsByUserId(userId: number): Promise<Calendar[]>;
  createCalendar(calendar: Omit<InsertCalendar, "id">): Promise<Calendar>;
  updateCalendar(id: number, updates: Partial<Omit<InsertCalendar, "id">>): Promise<Calendar>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private events: Map<number, Event>;
  private calendars: Map<number, Calendar>;
  
  private userIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private eventIdCounter: number;
  private calendarIdCounter: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.events = new Map();
    this.calendars = new Map();
    
    this.userIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.eventIdCounter = 1;
    this.calendarIdCounter = 1;
  }

  // Métodos de usuário
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date().toISOString();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserTokens(
    userId: number, 
    accessToken: string, 
    refreshToken: string | null, 
    expiryDate: Date | null
  ): Promise<User> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado`);
    }
    
    const updatedUser: User = {
      ...user,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken || user.googleRefreshToken,
      googleTokenExpiry: expiryDate ? expiryDate.toISOString() : user.googleTokenExpiry
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Métodos de conversa
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conversation => conversation.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createConversation(conversation: Omit<InsertConversation, "id">): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const createdAt = new Date().toISOString();
    const newConversation: Conversation = { ...conversation, id, createdAt };
    this.conversations.set(id, newConversation);
    return newConversation;
  }
  
  // Métodos de mensagem
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  async createMessage(message: Omit<InsertMessage, "id">): Promise<Message> {
    const id = this.messageIdCounter++;
    const timestamp = new Date().toISOString();
    const newMessage: Message = { ...message, id, timestamp };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  // Métodos de evento
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventsByUserId(userId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.userId === userId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }
  
  async getUpcomingEventsByUserId(userId: number, limit: number = 10): Promise<Event[]> {
    const now = new Date();
    
    return Array.from(this.events.values())
      .filter(event => {
        return event.userId === userId && new Date(event.startTime) >= now;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit);
  }
  
  async createEvent(event: Omit<InsertEvent, "id">): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date().toISOString();
    const newEvent: Event = { ...event, id, createdAt };
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async updateEvent(id: number, updates: Partial<Omit<InsertEvent, "id">>): Promise<Event> {
    const event = await this.getEvent(id);
    
    if (!event) {
      throw new Error(`Evento com ID ${id} não encontrado`);
    }
    
    const updatedEvent: Event = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<void> {
    this.events.delete(id);
  }
  
  // Métodos de calendário
  async getCalendarsByUserId(userId: number): Promise<Calendar[]> {
    return Array.from(this.calendars.values())
      .filter(calendar => calendar.userId === userId);
  }
  
  async createCalendar(calendar: Omit<InsertCalendar, "id">): Promise<Calendar> {
    const id = this.calendarIdCounter++;
    const newCalendar: Calendar = { ...calendar, id };
    this.calendars.set(id, newCalendar);
    return newCalendar;
  }
  
  async updateCalendar(id: number, updates: Partial<Omit<InsertCalendar, "id">>): Promise<Calendar> {
    const calendar = this.calendars.get(id);
    
    if (!calendar) {
      throw new Error(`Calendário com ID ${id} não encontrado`);
    }
    
    const updatedCalendar: Calendar = { ...calendar, ...updates };
    this.calendars.set(id, updatedCalendar);
    return updatedCalendar;
  }
}

export const storage = new MemStorage();
