import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import DateNavigator from "@/components/Calendar/DateNavigator";
import UpcomingEvents from "@/components/Calendar/UpcomingEvents";
import { useCalendar } from "@/hooks/useCalendar";
import EventModal from "@/components/Calendar/EventModal";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const { currentView, setCurrentView } = useCalendar();

  return (
    <>
      <Sidebar />
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-100">
        <div className="py-6">
          <div className="mx-auto px-4 sm:px-6 md:px-8">
            <div className="space-y-6">
              {/* CalendarHeader */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">Agenda</h1>
                  <p className="mt-1 text-sm text-gray-500">Gerencie seus eventos e lembretes</p>
                </div>
                <div className="flex space-x-3">
                  <div className="relative inline-block text-left">
                    <Button
                      variant="outline"
                      className="inline-flex justify-center w-full"
                      onClick={() => {
                        const views = ["month", "week", "day", "agenda"];
                        const currentIndex = views.indexOf(currentView);
                        const nextIndex = (currentIndex + 1) % views.length;
                        setCurrentView(views[nextIndex] as any);
                      }}
                    >
                      <span className="material-icons mr-2 text-sm">calendar_today</span>
                      {currentView === "month" && "Mês"}
                      {currentView === "week" && "Semana"}
                      {currentView === "day" && "Dia"}
                      {currentView === "agenda" && "Agenda"}
                      <span className="material-icons ml-2 text-sm">arrow_drop_down</span>
                    </Button>
                  </div>
                  <Button onClick={() => setShowEventModal(true)}>
                    <span className="material-icons mr-1 text-sm">add</span>
                    Novo Evento
                  </Button>
                </div>
              </div>

              {/* DateNavigator with MonthCalendar */}
              <DateNavigator />

              {/* UpcomingEvents */}
              <UpcomingEvents />
            </div>
          </div>
        </div>
      </main>

      {showEventModal && <EventModal onClose={() => setShowEventModal(false)} />}
    </>
  );
};

export default Home;
