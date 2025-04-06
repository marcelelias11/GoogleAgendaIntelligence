import { useCalendar } from "@/hooks/useCalendar";

const UpcomingEvents = () => {
  const { upcomingEvents, isLoadingUpcoming } = useCalendar();

  // Formatar data relativa (hoje, amanhã, etc.)
  const getRelativeDate = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) {
      return "Hoje";
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return "Amanhã";
    } else {
      return eventDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Formatar hora do evento
  const formatEventTime = (startTime: string, endTime: string, allDay: boolean = false) => {
    if (allDay) {
      return "Dia inteiro";
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startStr = start.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    const endStr = end.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    return `${startStr} - ${endStr}`;
  };

  if (isLoadingUpcoming) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Próximos eventos</h3>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 p-3 rounded-md">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Próximos eventos</h3>
      {upcomingEvents.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-icons text-4xl text-gray-400">event_busy</span>
          <p className="mt-2 text-gray-500">Nenhum evento próximo encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="border border-gray-200 p-3 rounded-md hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <span className="material-icons text-primary">event</span>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-800">{event.title}</h4>
                    <span className="text-xs text-gray-500">{getRelativeDate(event.startTime)}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatEventTime(event.startTime, event.endTime, event.allDay)}
                  </div>
                  {event.description && (
                    <div className="mt-2 text-sm text-gray-500">{event.description}</div>
                  )}
                  {event.location && (
                    <div className="mt-1 text-xs text-gray-500">{event.location}</div>
                  )}
                  <div className="mt-2 flex">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      <span className="w-2 h-2 bg-primary rounded-full mr-1"></span>
                      {event.calendarId === "primary" ? "Principal" : event.calendarId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
