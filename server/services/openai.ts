import OpenAI from 'openai';
import { createEvent } from './googleCalendar';

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tipos para as ações identificadas
type Action = 
  | { type: 'CREATE_EVENT', data: EventActionData }
  | { type: 'CREATE_REMINDER', data: ReminderActionData }
  | { type: 'SEARCH_INFO', data: SearchActionData }
  | { type: 'NO_ACTION', data: null };

interface EventActionData {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay?: boolean;
}

interface ReminderActionData {
  title: string;
  dateTime: string;
  minutes: number;
}

interface SearchActionData {
  query: string;
}

interface AIResponse {
  message: string;
  action: Action['type'];
  actionData: Action['data'];
}

// Prompt base para processamento de mensagens
const BASE_PROMPT = `
Você é um assistente de calendário inteligente que ajuda a gerenciar eventos e lembretes.
Você pode criar eventos, definir lembretes e buscar informações na internet.

Ao processar a mensagem do usuário, identifique se ele deseja:
1. Criar um evento no calendário
2. Criar um lembrete
3. Buscar uma informação na internet
4. Outra ação (conversa geral)

Responda em português brasileiro.

Se a ação for criar um evento:
- Extraia o título, data, hora de início e término, descrição e local (se fornecidos)
- Formate a data como YYYY-MM-DD
- Formate a hora como HH:MM (24h)

Se a ação for criar um lembrete:
- Extraia o título e o momento do lembrete
- Defina quantos minutos antes o usuário deve ser lembrado

Se a ação for buscar informação:
- Identifique claramente a consulta a ser feita

Responda em formato JSON com a seguinte estrutura:
{
  "message": "Sua resposta em texto natural para o usuário",
  "action": "CREATE_EVENT, CREATE_REMINDER, SEARCH_INFO ou NO_ACTION",
  "actionData": {
    // Dados específicos da ação, conforme o tipo
  }
}
`;

/**
 * Processa a mensagem do usuário e identifica ações
 */
export async function processUserMessage(userId: number, message: string): Promise<AIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: BASE_PROMPT },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    // Extrair conteúdo da resposta
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Resposta vazia da OpenAI');
    }

    try {
      // Tentar analisar a resposta como JSON
      const parsedResponse = JSON.parse(content) as AIResponse;
      
      return {
        message: parsedResponse.message || "Não entendi sua solicitação. Poderia reformular?",
        action: parsedResponse.action || "NO_ACTION",
        actionData: parsedResponse.actionData || null
      };
    } catch (error) {
      console.error('Erro ao analisar resposta JSON da OpenAI:', error);
      
      // Retornar resposta de fallback se o parsing falhar
      return {
        message: content || "Não entendi sua solicitação. Poderia reformular?",
        action: "NO_ACTION",
        actionData: null
      };
    }
  } catch (error) {
    console.error('Erro ao processar mensagem com OpenAI:', error);
    
    return {
      message: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
      action: "NO_ACTION",
      actionData: null
    };
  }
}

/**
 * Executa a ação identificada pelo assistente
 */
export async function processAction(
  userId: number, 
  aiResponse: AIResponse
): Promise<{ 
  success: boolean; 
  message?: string;
  data?: any;
}> {
  try {
    switch (aiResponse.action) {
      case 'CREATE_EVENT':
        if (!aiResponse.actionData) {
          return { success: false, message: "Dados do evento não fornecidos" };
        }
        
        const eventData = aiResponse.actionData as EventActionData;
        
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
        
        const event = await createEvent(userId, 'primary', {
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          start: startObj,
          end: endObj
        });
        
        return { 
          success: true, 
          message: `Evento "${eventData.title}" criado com sucesso para ${eventData.startDate} às ${eventData.startTime}.`,
          data: event
        };
        
      case 'CREATE_REMINDER':
        if (!aiResponse.actionData) {
          return { success: false, message: "Dados do lembrete não fornecidos" };
        }
        
        const reminderData = aiResponse.actionData as ReminderActionData;
        
        // Criar lembrete como um evento com notificação
        const reminder = await createEvent(userId, 'primary', {
          title: reminderData.title,
          description: `Lembrete: ${reminderData.title}`,
          start: {
            dateTime: new Date(reminderData.dateTime).toISOString(),
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: new Date(new Date(reminderData.dateTime).getTime() + 30 * 60000).toISOString(),
            timeZone: 'America/Sao_Paulo'
          },
          reminders: {
            useDefault: false,
            overrides: [
              {
                method: 'popup',
                minutes: reminderData.minutes || 10
              }
            ]
          }
        });
        
        return { 
          success: true, 
          message: `Lembrete "${reminderData.title}" criado com sucesso para ${new Date(reminderData.dateTime).toLocaleString('pt-BR')}.`,
          data: reminder
        };
        
      case 'SEARCH_INFO':
        if (!aiResponse.actionData) {
          return { success: false, message: "Consulta de pesquisa não fornecida" };
        }
        
        const searchData = aiResponse.actionData as SearchActionData;
        
        // Aqui você poderia integrar com uma API de busca como Google, Bing, etc.
        // Por enquanto, apenas retornaremos a mensagem original do assistente
        return { 
          success: true,
          message: aiResponse.message
        };
        
      case 'NO_ACTION':
      default:
        return { 
          success: true,
          message: aiResponse.message
        };
    }
  } catch (error) {
    console.error('Erro ao processar ação:', error);
    
    return {
      success: false,
      message: "Ocorreu um erro ao executar a ação solicitada. Por favor, tente novamente."
    };
  }
}