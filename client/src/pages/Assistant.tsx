import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import ChatInterface from "@/components/Assistant/ChatInterface";
import { useAssistant } from "@/hooks/useAssistant";
import { Button } from "@/components/ui/button";

const Assistant = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { 
    conversations, 
    isLoadingConversations, 
    currentConversationId, 
    setCurrentConversationId,
    startNewConversation 
  } = useAssistant();

  return (
    <>
      <Sidebar />
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-100">
        <div className="py-6">
          <div className="mx-auto px-4 sm:px-6 md:px-8">
            <div className="space-y-6">
              {/* AssistantHeader */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">Assistente</h1>
                  <p className="mt-1 text-sm text-gray-500">Use IA para buscar informações e criar eventos</p>
                </div>
                <div>
                  <Button onClick={startNewConversation}>
                    <span className="material-icons mr-1 text-sm">add</span>
                    Nova Conversa
                  </Button>
                </div>
              </div>

              {/* Conversa anterior (opcional em telas maiores) */}
              <div className="hidden lg:grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] overflow-y-auto">
                    <h3 className="text-sm font-medium text-gray-800 mb-3">Conversas</h3>
                    
                    {isLoadingConversations ? (
                      <div className="animate-pulse space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-10 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {conversations.map((conv) => (
                          <li key={conv.id}>
                            <button
                              className={`w-full text-left p-2 rounded-md text-sm ${
                                currentConversationId === conv.id
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-gray-100 text-gray-800"
                              }`}
                              onClick={() => setCurrentConversationId(conv.id)}
                            >
                              <span className="material-icons text-sm mr-1 align-text-bottom">chat</span>
                              {conv.title || `Conversa ${new Date(conv.createdAt).toLocaleDateString()}`}
                            </button>
                          </li>
                        ))}
                        {conversations.length === 0 && (
                          <li className="text-sm text-gray-500 text-center py-4">
                            Nenhuma conversa encontrada
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                
                <div className="col-span-3">
                  <ChatInterface />
                </div>
              </div>

              {/* Interface móvel (ChatInterface apenas) */}
              <div className="lg:hidden">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Assistant;
