import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import EventModal from "@/components/Calendar/EventModal";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const [showEventModal, setShowEventModal] = useState(false);

  if (!isOpen) return null;

  const handleEventButtonClick = () => {
    setShowEventModal(true);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 flex z-40 lg:hidden">
        <div className="fixed inset-0 bg-gray-800/75 transition-opacity" onClick={onClose}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none"
              onClick={onClose}
            >
              <span className="material-icons text-white">close</span>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="material-icons text-primary mr-2">event</span>
              <span className="text-xl font-medium text-primary">AssistenteCalendário</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              <Link
                href="/"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-primary"
                onClick={onClose}
              >
                <span className="material-icons mr-3 text-sm">event</span>
                Agenda
              </Link>
              <Link
                href="/assistant"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-gray-100"
                onClick={onClose}
              >
                <span className="material-icons mr-3 text-sm">smart_toy</span>
                Assistente
              </Link>
              <Link
                href="/settings"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-800 hover:bg-gray-100"
                onClick={onClose}
              >
                <span className="material-icons mr-3 text-sm">settings</span>
                Configurações
              </Link>
              <div className="mt-4">
                <Button 
                  className="w-full flex items-center justify-center"
                  onClick={handleEventButtonClick}
                >
                  <span className="material-icons mr-1 text-sm">add</span>
                  Novo Evento
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {showEventModal && (
        <EventModal onClose={() => setShowEventModal(false)} />
      )}
    </>
  );
};

export default MobileSidebar;
