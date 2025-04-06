import { useState, useRef, useEffect } from "react";
import { useAssistant } from "@/hooks/useAssistant";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ChatInterface = () => {
  const [inputMessage, setInputMessage] = useState("");
  const { 
    messages, 
    sendMessage, 
    isPendingSend,
    formatMessageTime,
  } = useAssistant();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Rolar para o final da conversa quando novas mensagens são adicionadas
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;
    
    sendMessage(inputMessage);
    setInputMessage("");
  };

  // Verificar se há eventos na resposta do assistente
  const renderAssistantContent = (content: string) => {
    // Verificar se o conteúdo contém informações de evento
    if (content.includes('{"id":') || content.includes("eu agendei") || content.includes("criei um")) {
      // Tentar encontrar detalhes do evento no texto
      const eventDetails = {
        title: extractEventDetail(content, "título", "reunião"),
        date: extractEventDetail(content, "data", "amanhã"),
        time: extractEventDetail(content, "horário", "10:00"),
      };
      
      return (
        <>
          <p className="text-sm text-gray-800">{content}</p>
          {(eventDetails.title || eventDetails.date || eventDetails.time) && (
            <div className="mt-2 border border-gray-200 p-3 rounded-md bg-white">
              <div className="flex items-center">
                <span className="material-icons text-primary mr-2">event</span>
                <h4 className="text-sm font-medium text-gray-800">{eventDetails.title}</h4>
              </div>
              <div className="mt-1 text-xs text-gray-500">{eventDetails.date}, {eventDetails.time}</div>
              <div className="mt-2 flex">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  <span className="w-2 h-2 bg-primary rounded-full mr-1"></span>
                  Calendário
                </span>
              </div>
            </div>
          )}
        </>
      );
    }
    
    // Renderização padrão
    return <p className="text-sm text-gray-800">{content}</p>;
  };

  // Extrair detalhes do evento do texto
  const extractEventDetail = (text: string, detailType: string, defaultValue: string): string => {
    const patterns = {
      título: /título[:\s]+["']?([^"'\n,]+)["']?/i,
      data: /data[:\s]+["']?([^"'\n,]+)["']?/i,
      horário: /(às|horário)[:\s]+["']?([^"'\n,]+)["']?/i,
    };
    
    const pattern = patterns[detailType as keyof typeof patterns];
    if (!pattern) return defaultValue;
    
    const match = text.match(pattern);
    return match ? (match[2] || match[1]) : defaultValue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] flex flex-col">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4"
      >
        {/* Mensagem de boas-vindas */}
        {messages.length === 0 && (
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-icons text-white text-sm">smart_toy</span>
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none max-w-[80%]">
              <p className="text-sm text-gray-800">Olá! Sou seu assistente para o Google Agenda. Posso ajudar você a:</p>
              <ul className="list-disc list-inside text-sm text-gray-800 mt-1">
                <li>Criar eventos no seu calendário</li>
                <li>Buscar informações na internet</li>
                <li>Configurar lembretes</li>
              </ul>
              <p className="text-sm text-gray-800 mt-1">Como posso te ajudar hoje?</p>
            </div>
          </div>
        )}

        {/* Mensagens da conversa */}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : ""}`}>
            {message.role === "assistant" && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-icons text-white text-sm">smart_toy</span>
                </div>
              </div>
            )}
            <div className={`${
              message.role === "user" 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-800"
              } p-3 rounded-lg ${
                message.role === "user" 
                  ? "rounded-tr-none" 
                  : "rounded-tl-none"
              } max-w-[80%]`}
            >
              {message.role === "user" ? (
                <p className="text-sm">{message.content}</p>
              ) : (
                renderAssistantContent(message.content)
              )}
              <div className="mt-1 text-right">
                <span className={`text-xs ${message.role === "user" ? "text-white/80" : "text-gray-500"}`}>
                  {formatMessageTime(message.timestamp)}
                </span>
              </div>
            </div>
            {message.role === "user" && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                  <span className="material-icons text-sm">person</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Indicador de digitação durante carga */}
        {isPendingSend && (
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-icons text-white text-sm">smart_toy</span>
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área de entrada */}
      <div className="border-t border-gray-200 pt-4">
        <form onSubmit={handleSubmit} className="flex items-end">
          <div className="flex-1 relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta ou comando..."
              rows={2}
              className="resize-none"
              disabled={isPendingSend}
            />
            <div className="absolute right-2 bottom-2">
              <button type="button" className="p-1.5 text-gray-500 hover:text-primary">
                <span className="material-icons">mic</span>
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="ml-3"
            disabled={isPendingSend || inputMessage.trim() === ""}
          >
            <span className="material-icons">send</span>
          </Button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          Exemplos: "Agende uma reunião com José", "Pesquise sobre melhores práticas em gestão de tempo", "Lembre-me de ligar para o cliente amanhã"
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
