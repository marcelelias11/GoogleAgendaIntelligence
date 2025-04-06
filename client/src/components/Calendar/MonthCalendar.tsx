import { Week, DayCell, CalendarEvent } from "@/lib/types";

interface MonthCalendarProps {
  weeks: Week[];
}

const MonthCalendar = ({ weeks }: MonthCalendarProps) => {
  // Formatar hora do evento
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Determinar cor do evento com base no calendário
  const getEventColor = (event: CalendarEvent) => {
    // Cores padrão caso o evento não tenha cor definida
    const defaultColors = {
      "primary": {
        bg: "bg-primary/10", 
        text: "text-primary"
      },
      "secondary": {
        bg: "bg-green-500/10", 
        text: "text-green-500"
      },
      "tertiary": {
        bg: "bg-yellow-500/10", 
        text: "text-yellow-500"
      },
      "destructive": {
        bg: "bg-red-500/10", 
        text: "text-red-500"
      }
    };
    
    // Se o evento tiver uma cor definida, usar
    if (event.color) {
      const colorName = Object.keys(defaultColors).find(
        color => defaultColors[color as keyof typeof defaultColors].text.includes(event.color || "")
      );
      
      if (colorName) {
        return defaultColors[colorName as keyof typeof defaultColors];
      }
      
      // Se a cor não corresponder a nenhuma cor padrão, usar primary
      return defaultColors.primary;
    }
    
    // Fallback para primary
    return defaultColors.primary;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Cabeçalho do calendário */}
      <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200 text-center">
        <div className="py-2 text-sm font-medium text-gray-500">Dom</div>
        <div className="py-2 text-sm font-medium text-gray-500">Seg</div>
        <div className="py-2 text-sm font-medium text-gray-500">Ter</div>
        <div className="py-2 text-sm font-medium text-gray-500">Qua</div>
        <div className="py-2 text-sm font-medium text-gray-500">Qui</div>
        <div className="py-2 text-sm font-medium text-gray-500">Sex</div>
        <div className="py-2 text-sm font-medium text-gray-500">Sáb</div>
      </div>

      {/* Grade do calendário */}
      <div className="bg-white">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
            {week.days.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className={`min-h-[100px] p-2 border-r border-gray-200 last:border-r-0 ${
                  day.isToday ? "bg-blue-50" : ""
                } ${
                  !day.isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    {day.date.getDate()}
                  </span>
                  {day.isToday && (
                    <span className="text-xs bg-primary text-white px-1 rounded">
                      Hoje
                    </span>
                  )}
                </div>
                
                {/* Eventos do dia */}
                <div className="mt-1 text-xs space-y-1">
                  {day.events.slice(0, 3).map((event, eventIndex) => {
                    const { bg, text } = getEventColor(event);
                    return (
                      <div 
                        key={eventIndex}
                        className={`px-1 py-0.5 rounded-sm ${bg} ${text} overflow-hidden whitespace-nowrap overflow-ellipsis`}
                        title={event.title}
                      >
                        {!event.allDay && formatEventTime(event.start)} - {event.title}
                      </div>
                    );
                  })}
                  
                  {/* Indicador de mais eventos */}
                  {day.events.length > 3 && (
                    <div className="text-xs text-gray-500 mt-1">
                      + {day.events.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthCalendar;
