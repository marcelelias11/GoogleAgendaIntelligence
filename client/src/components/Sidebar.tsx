import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import EventModal from "@/components/Calendar/EventModal";
import { useCalendar } from "@/hooks/useCalendar";

const Sidebar = () => {
  const [showEventModal, setShowEventModal] = useState(false);
  const { calendars, isLoadingCalendars } = useCalendar();

  return (
    <>
      <aside className="hidden lg:block w-64 bg-white shadow-sm overflow-y-auto border-r border-gray-200">
        <div className="px-4 py-6">
          <Button 
            className="w-full mt-1 flex items-center justify-center"
            onClick={() => setShowEventModal(true)}
          >
            <span className="material-icons mr-1 text-sm">add</span>
            Novo Evento
          </Button>
          
          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Meus Calendários
            </h3>
            <div className="mt-2 space-y-1">
              {isLoadingCalendars ? (
                <div className="flex justify-center py-2">
                  <div className="animate-spin h-5 w-5 border-t-2 border-primary rounded-full"></div>
                </div>
              ) : (
                calendars.map((calendar: any) => (
                  <a 
                    key={calendar.id}
                    href="#" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-gray-100"
                  >
                    <span 
                      className="w-3 h-3 mr-3 rounded-full" 
                      style={{ backgroundColor: calendar.color }}
                    ></span>
                    <span>{calendar.name}</span>
                  </a>
                ))
              )}
              {!isLoadingCalendars && calendars.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Nenhum calendário encontrado
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Assistente IA
            </h3>
            <div className="mt-2 space-y-1">
              <Link 
                href="/assistant"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-gray-100"
              >
                <span className="material-icons mr-3 text-sm text-green-500">smart_toy</span>
                Assistente
              </Link>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-gray-100">
                <span className="material-icons mr-3 text-sm text-green-500">history</span>
                Consultas recentes
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-gray-100">
                <span className="material-icons mr-3 text-sm text-green-500">bookmark</span>
                Consultas salvas
              </a>
              <Link
                href="/settings"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-gray-100"
              >
                <span className="material-icons mr-3 text-sm text-green-500">settings</span>
                Configurar assistente
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {showEventModal && (
        <EventModal onClose={() => setShowEventModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
