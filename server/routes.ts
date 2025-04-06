import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import { getAuthUrl, processAuthCode } from "./services/auth";
import { 
  listCalendars, 
  listAllEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  createReminder 
} from "./services/googleCalendar";
import { processUserMessage, processAction } from "./services/openai";
import { createInsertSchema } from "drizzle-zod";

// Middleware para verificar autenticação
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Não autenticado" });
};

// Validação do corpo da requisição
const messageSchema = z.object({
  content: z.string().min(1),
  conversationId: z.number().optional()
});

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
  calendarId: z.string().default("primary"),
  allDay: z.boolean().default(false),
  reminders: z.array(z.object({
    method: z.string(),
    minutes: z.number()
  })).optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar sessão
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "assistente-calendario-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 dias
    })
  );

  // Rotas de autenticação
  app.get("/api/auth/url", (req, res) => {
    try {
      const url = getAuthUrl();
      res.json({ url });
    } catch (error) {
      console.error("Erro ao gerar URL de autenticação:", error);
      res.status(500).json({ message: "Erro ao gerar URL de autenticação" });
    }
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Código de autorização ausente" });
      }
      
      const user = await processAuthCode(code);
      
      if (user) {
        req.session.userId = user.id;
        
        // Redirecionar para a página inicial
        res.redirect("/");
      } else {
        res.status(401).json({ message: "Falha na autenticação" });
      }
    } catch (error) {
      console.error("Erro no callback de autenticação:", error);
      res.status(500).json({ message: "Erro no processo de autenticação" });
    }
  });

  app.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.userId) {
      res.json({ authenticated: true, userId: req.session.userId });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.get("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao encerrar sessão" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Não enviar informações sensíveis para o cliente
      const { password, googleRefreshToken, googleAccessToken, ...safeUser } = user;
      
      res.json(safeUser);
    } catch (error) {
      console.error("Erro ao obter informações do usuário:", error);
      res.status(500).json({ message: "Erro ao obter informações do usuário" });
    }
  });

  // Rotas do calendário
  app.get("/api/calendars", isAuthenticated, async (req, res) => {
    try {
      const calendars = await listCalendars(req.session.userId);
      res.json(calendars);
    } catch (error) {
      console.error("Erro ao listar calendários:", error);
      res.status(500).json({ message: "Erro ao listar calendários" });
    }
  });

  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const { timeMin, timeMax } = req.query;
      
      const events = await listAllEvents(
        req.session.userId,
        typeof timeMin === "string" ? timeMin : undefined,
        typeof timeMax === "string" ? timeMax : undefined
      );
      
      res.json(events);
    } catch (error) {
      console.error("Erro ao listar eventos:", error);
      res.status(500).json({ message: "Erro ao listar eventos" });
    }
  });

  app.get("/api/events/upcoming", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getUpcomingEventsByUserId(req.session.userId, 10);
      res.json(events);
    } catch (error) {
      console.error("Erro ao listar próximos eventos:", error);
      res.status(500).json({ message: "Erro ao listar próximos eventos" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const validation = eventSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validation.error.errors 
        });
      }
      
      const eventData = validation.data;
      
      // Converter datas e horas para objetos start/end do Google Calendar
      let startObj, endObj;
      
      if (eventData.allDay) {
        startObj = { date: eventData.startDate };
        endObj = { date: eventData.endDate };
      } else {
        const startDateTime = `${eventData.startDate}T${eventData.startTime}:00`;
        const endDateTime = `${eventData.endDate}T${eventData.endTime}:00`;
        
        startObj = {
          dateTime: new Date(startDateTime).toISOString(),
          timeZone: 'America/Sao_Paulo'
        };
        
        endObj = {
          dateTime: new Date(endDateTime).toISOString(),
          timeZone: 'America/Sao_Paulo'
        };
      }
      
      const event = await createEvent(req.session.userId, eventData.calendarId, {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start: startObj,
        end: endObj,
        reminders: eventData.reminders ? {
          useDefault: false,
          overrides: eventData.reminders
        } : undefined
      });
      
      res.json(event);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      res.status(500).json({ message: "Erro ao criar evento" });
    }
  });

  app.put("/api/events/:calendarId/:eventId", isAuthenticated, async (req, res) => {
    try {
      const { calendarId, eventId } = req.params;
      const eventData = req.body;
      
      const event = await updateEvent(req.session.userId, calendarId, eventId, eventData);
      res.json(event);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      res.status(500).json({ message: "Erro ao atualizar evento" });
    }
  });

  app.delete("/api/events/:calendarId/:eventId", isAuthenticated, async (req, res) => {
    try {
      const { calendarId, eventId } = req.params;
      
      await deleteEvent(req.session.userId, calendarId, eventId);
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      res.status(500).json({ message: "Erro ao excluir evento" });
    }
  });

  // Rotas do assistente
  app.post("/api/assistant/message", isAuthenticated, async (req, res) => {
    try {
      const validation = messageSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Mensagem inválida", 
          errors: validation.error.errors 
        });
      }
      
      const { content, conversationId } = validation.data;
      
      // Obter ou criar conversa
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.userId !== req.session.userId) {
          return res.status(404).json({ message: "Conversa não encontrada" });
        }
      } else {
        conversation = await storage.createConversation({
          userId: req.session.userId,
          title: content.slice(0, 50) + (content.length > 50 ? "..." : "")
        });
      }
      
      // Salvar mensagem do usuário
      await storage.createMessage({
        conversationId: conversation.id,
        content,
        role: "user"
      });
      
      // Processar mensagem com OpenAI
      const aiResponse = await processUserMessage(req.session.userId, content);
      
      // Executar ação identificada pelo assistente
      const actionResult = await processAction(req.session.userId, aiResponse);
      
      // Salvar resposta do assistente
      const assistantMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: actionResult.message || aiResponse.message,
        role: "assistant"
      });
      
      res.json({
        message: assistantMessage,
        action: aiResponse.action,
        actionResult,
        conversationId: conversation.id
      });
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      res.status(500).json({ message: "Erro ao processar mensagem" });
    }
  });

  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getConversationsByUserId(req.session.userId);
      res.json(conversations);
    } catch (error) {
      console.error("Erro ao listar conversas:", error);
      res.status(500).json({ message: "Erro ao listar conversas" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      // Verificar se a conversa pertence ao usuário
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation || conversation.userId !== req.session.userId) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Erro ao listar mensagens:", error);
      res.status(500).json({ message: "Erro ao listar mensagens" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
