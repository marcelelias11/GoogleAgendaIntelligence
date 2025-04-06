import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Message, ChatConversation } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAssistant() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Carregar lista de conversas
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao carregar conversas");
      return res.json();
    },
  });

  // Carregar mensagens da conversa atual
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    queryFn: async () => {
      if (!currentConversationId) return [];
      
      const res = await fetch(`/api/conversations/${currentConversationId}/messages`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao carregar mensagens");
      return res.json();
    },
    enabled: currentConversationId !== null,
  });

  // Enviar mensagem para o assistente
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/assistant/message", {
        content,
        conversationId: currentConversationId,
      });
    },
    onSuccess: (data) => {
      // Atualizar as mensagens da conversa atual
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", data.conversationId, "messages"] 
      });
      
      // Atualizar a lista de conversas
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      
      // Se for uma nova conversa, definir como conversa atual
      if (currentConversationId !== data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      // Se uma ação foi executada, atualizar as listas de eventos
      if (data.action === "create_event" || data.action === "create_reminder") {
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
        queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming"] });
        
        toast({
          title: data.action === "create_event" ? "Evento criado" : "Lembrete criado",
          description: "O assistente criou um item no seu calendário.",
        });
      }
    },
    onError: (error) => {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Criar nova conversa
  const startNewConversation = () => {
    setCurrentConversationId(null);
  };

  // Formatar data para exibição
  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    conversations,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    currentConversationId,
    setCurrentConversationId,
    sendMessage: sendMessageMutation.mutate,
    isPendingSend: sendMessageMutation.isPending,
    startNewConversation,
    formatMessageTime,
  };
}
