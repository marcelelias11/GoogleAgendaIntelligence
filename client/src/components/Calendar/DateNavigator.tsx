import { useCalendar } from "@/hooks/useCalendar";
import MonthCalendar from "./MonthCalendar";
import { Button } from "@/components/ui/button";

const DateNavigator = () => {
  const { 
    currentView,
    setCurrentView,
    getCurrentMonthName,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    generateCalendarCells,
  } = useCalendar();

  const calendarWeeks = generateCalendarCells();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
          >
            <span className="material-icons">chevron_left</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
          >
            <span className="material-icons">chevron_right</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
          >
            Hoje
          </Button>
        </div>
        <h2 className="text-xl font-medium text-gray-800">{getCurrentMonthName()}</h2>
        <div className="hidden sm:block">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setCurrentView("month")}
          >
            <span className="material-icons text-sm mr-1">calendar_today</span>
            Mês
          </Button>
        </div>
      </div>

      <MonthCalendar weeks={calendarWeeks} />
    </div>
  );
};

export default DateNavigator;
