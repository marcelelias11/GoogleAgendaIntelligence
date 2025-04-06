import { calendar_v3, google } from 'googleapis';
import { getValidAccessToken } from './auth';

// Configuração do cliente de calendário
const getCalendarClient = async (userId: number): Promise<calendar_v3.Calendar | null> => {
  const accessToken = await getValidAccessToken(userId);

  if (!accessToken) {
    return null;
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.calendar({ version: 'v3', auth });
};

/**
 * Lista os calendários disponíveis para o usuário
 */
export async function listCalendars(userId: number): Promise<any[]> {
  try {
    const calendar = await getCalendarClient(userId);

    if (!calendar) {
      throw new Error('Cliente de calendário não disponível');
    }

    const response = await calendar.calendarList.list();
    
    return (response.data.items || []).map(cal => ({
      id: cal.id,
      name: cal.summary,
      description: cal.description,
      color: cal.backgroundColor,
      primary: cal.primary || false,
      selected: cal.selected || false
    }));
  } catch (error) {
    console.error('Erro ao listar calendários:', error);
    return [];
  }
}

/**
 * Lista todos os eventos em um intervalo de datas
 */
export async function listAllEvents(
  userId: number, 
  timeMin?: string, 
  timeMax?: string
): Promise<any[]> {
  try {
    const calendar = await getCalendarClient(userId);

    if (!calendar) {
      throw new Error('Cliente de calendário não disponível');
    }

    // Padronizar datas
    const now = new Date();
    const minDate = timeMin ? new Date(timeMin) : new Date(now.getFullYear(), now.getMonth(), 1);
    const maxDate = timeMax ? new Date(timeMax) : new Date(now.getFullYear(), now.getMonth() + 2, 0);

    // Obter lista de calendários
    const calendarList = await calendar.calendarList.list();
    const calendars = calendarList.data.items || [];

    // Eventos de todos os calendários
    let allEvents: any[] = [];

    // Para cada calendário, buscar eventos
    for (const cal of calendars) {
      if (!cal.id || !cal.selected) continue;

      const response = await calendar.events.list({
        calendarId: cal.id,
        timeMin: minDate.toISOString(),
        timeMax: maxDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = (response.data.items || []).map(event => {
        const allDay = !!event.start?.date;
        
        return {
          id: event.id,
          calendarId: cal.id,
          title: event.summary,
          description: event.description,
          location: event.location,
          start: allDay ? event.start?.date : event.start?.dateTime,
          end: allDay ? event.end?.date : event.end?.dateTime,
          allDay,
          color: cal.backgroundColor,
          reminders: event.reminders?.overrides
        };
      });

      allEvents = [...allEvents, ...events];
    }

    return allEvents;
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return [];
  }
}

/**
 * Cria um novo evento no calendário
 */
export async function createEvent(
  userId: number,
  calendarId: string = 'primary',
  eventData: {
    title: string;
    description?: string;
    location?: string;
    start: any;
    end: any;
    reminders?: any;
  }
): Promise<any> {
  try {
    const calendar = await getCalendarClient(userId);

    if (!calendar) {
      throw new Error('Cliente de calendário não disponível');
    }

    const event = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: eventData.start,
      end: eventData.end,
      reminders: eventData.reminders || {
        useDefault: true
      }
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event
    });

    return {
      id: response.data.id,
      calendarId,
      title: response.data.summary,
      description: response.data.description,
      location: response.data.location,
      start: response.data.start?.date || response.data.start?.dateTime,
      end: response.data.end?.date || response.data.end?.dateTime,
      allDay: !!response.data.start?.date,
      reminders: response.data.reminders?.overrides
    };
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }
}

/**
 * Atualiza um evento existente
 */
export async function updateEvent(
  userId: number,
  calendarId: string,
  eventId: string,
  eventData: any
): Promise<any> {
  try {
    const calendar = await getCalendarClient(userId);

    if (!calendar) {
      throw new Error('Cliente de calendário não disponível');
    }

    // Primeiro obter o evento existente
    const currentEvent = await calendar.events.get({
      calendarId,
      eventId
    });

    // Mesclar dados atuais com as atualizações
    const updatedEvent = {
      ...currentEvent.data,
      summary: eventData.title || currentEvent.data.summary,
      description: eventData.description !== undefined ? eventData.description : currentEvent.data.description,
      location: eventData.location !== undefined ? eventData.location : currentEvent.data.location,
      start: eventData.start || currentEvent.data.start,
      end: eventData.end || currentEvent.data.end,
      reminders: eventData.reminders || currentEvent.data.reminders
    };

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: updatedEvent
    });

    return {
      id: response.data.id,
      calendarId,
      title: response.data.summary,
      description: response.data.description,
      location: response.data.location,
      start: response.data.start?.date || response.data.start?.dateTime,
      end: response.data.end?.date || response.data.end?.dateTime,
      allDay: !!response.data.start?.date,
      reminders: response.data.reminders?.overrides
    };
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    throw error;
  }
}

/**
 * Exclui um evento do calendário
 */
export async function deleteEvent(
  userId: number,
  calendarId: string,
  eventId: string
): Promise<void> {
  try {
    const calendar = await getCalendarClient(userId);

    if (!calendar) {
      throw new Error('Cliente de calendário não disponível');
    }

    await calendar.events.delete({
      calendarId,
      eventId
    });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    throw error;
  }
}

/**
 * Cria um lembrete (evento com notificação)
 */
export async function createReminder(
  userId: number,
  title: string,
  dateTime: string,
  reminderMinutes: number = 10
): Promise<any> {
  try {
    const reminderDate = new Date(dateTime);
    
    const eventData = {
      title,
      description: `Lembrete: ${title}`,
      start: {
        dateTime: reminderDate.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: new Date(reminderDate.getTime() + 30 * 60000).toISOString(), // 30 minutos após o início
        timeZone: 'America/Sao_Paulo'
      },
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'popup',
            minutes: reminderMinutes
          }
        ]
      }
    };

    return createEvent(userId, 'primary', eventData);
  } catch (error) {
    console.error('Erro ao criar lembrete:', error);
    throw error;
  }
}