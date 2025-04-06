import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarEvent, Calendar, EventFormData } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useCalendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"month" | "week" | "day" | "agenda">("month");

  // Buscar calendários
  const { data: calendars = [], isLoading: isLoadingCalendars } = useQuery({
    queryKey: ["/api/calendars"],
    retry: false,
  });

  // Buscar eventos
  const getTimeRange = () => {
    const now = new Date(selectedDate);
    let startDate: Date, endDate: Date;

    if (currentView === "month") {
      // Primeiro dia do mês
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      // Último dia do mês
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (currentView === "week") {
      // Início da semana (domingo)
      const day = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      // Fim da semana (sábado)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      // Dia atual
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    }

    return {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
    };
  };

  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events", selectedDate.toISOString(), currentView],
    queryFn: async () => {
      const { timeMin, timeMax } = getTimeRange();
      const res = await fetch(`/api/events?timeMin=${timeMin}&timeMax=${timeMax}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao carregar eventos");
      return res.json();
    },
  });

  // Buscar próximos eventos
  const { data: upcomingEvents = [], isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["/api/events/upcoming"],
    queryFn: async () => {
      const res = await fetch("/api/events/upcoming", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao carregar próximos eventos");
      return res.json();
    },
  });

  // Criar evento
  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      const startDateTime = `${eventData.startDate}T${eventData.startTime}:00`;
      const endDateTime = `${eventData.endDate}T${eventData.endTime}:00`;

      // Verificar se data de término é menor que data de início
      if (new Date(endDateTime) < new Date(startDateTime)) {
        throw new Error("A data de término deve ser posterior à data de início");
      }

      return apiRequest("POST", "/api/events", {
        title: eventData.title,
        description: eventData.description || "",
        startDate: eventData.startDate,
        startTime: eventData.startTime,
        endDate: eventData.endDate,
        endTime: eventData.endTime,
        calendarId: eventData.calendarId,
        allDay: eventData.allDay,
        reminders: eventData.reminder && eventData.reminderMinutes
          ? [{ method: "popup", minutes: eventData.reminderMinutes }]
          : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming"] });
      
      toast({
        title: "Evento criado",
        description: "O evento foi adicionado ao seu calendário com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar evento:", error);
      toast({
        title: "Erro ao criar evento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o evento.",
        variant: "destructive",
      });
    },
  });

  // Formatar data para exibição
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obter nome do mês atual
  const getCurrentMonthName = (): string => {
    return selectedDate.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  // Navegar para hoje
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Gerar células do calendário para o mês atual
  const generateCalendarCells = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // Primeiro dia do mês
    const firstDayOfMonth = new Date(year, month, 1);
    // Último dia do mês
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia do mês (0 = domingo, 1 = segunda, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Matriz para armazenar as semanas e os dias
    const weeks = [];
    
    // Data atual para iteração
    let currentDate = new Date(firstDayOfMonth);
    currentDate.setDate(currentDate.getDate() - firstDayWeekday);
    
    // Hoje para comparação
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Iterar pelas semanas (6 semanas garantem que cobrimos todo o mês)
    for (let week = 0; week < 6; week++) {
      const days = [];
      
      // Iterar pelos dias da semana
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        
        // Verificar se é o mês atual
        const isCurrentMonth = date.getMonth() === month;
        
        // Verificar se é hoje
        const isToday = date.getTime() === today.getTime();
        
        // Filtrar eventos para este dia
        const dayEvents = events.filter((event: CalendarEvent) => {
          const eventDate = new Date(event.start);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        });
        
        days.push({
          date,
          isCurrentMonth,
          isToday,
          events: dayEvents,
        });
        
        // Avançar para o próximo dia
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push({ days });
      
      // Se já passamos do último dia do mês e completamos a semana, podemos parar
      if (currentDate > lastDayOfMonth && currentDate.getDay() === 0) {
        break;
      }
    }
    
    return weeks;
  };

  return {
    calendars,
    events,
    upcomingEvents,
    isLoadingCalendars,
    isLoadingEvents,
    isLoadingUpcoming,
    createEvent: createEventMutation.mutate,
    isPendingCreateEvent: createEventMutation.isPending,
    selectedDate,
    setSelectedDate,
    currentView,
    setCurrentView,
    formatDate,
    getCurrentMonthName,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    generateCalendarCells,
  };
}
