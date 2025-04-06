import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import LoginButton from "./LoginButton";

interface OAuthModalProps {
  onLogin: () => void;
  onClose: () => void;
}

const OAuthModal = ({ onLogin, onClose }: OAuthModalProps) => {
  const { getLoginUrl } = useAuth();
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  // Obter URL de autenticação
  useEffect(() => {
    const fetchAuthUrl = async () => {
      try {
        const url = await getLoginUrl();
        setAuthUrl(url);
      } catch (error) {
        console.error("Erro ao obter URL de autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthUrl();
  }, [getLoginUrl]);

  // Fechar o diálogo
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  // Abrir janela de autenticação
  const handleGoogleLogin = () => {
    if (!authUrl) return;

    // Abrir a janela de autenticação
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    
    const authWindow = window.open(
      authUrl,
      "googleAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Verificar se a autenticação foi concluída
    const checkAuthInterval = setInterval(() => {
      try {
        // Se a janela foi fechada ou redirecionada para nossa origem
        if (authWindow?.closed) {
          clearInterval(checkAuthInterval);
          // Verificar estado de autenticação após fechar
          fetch("/api/auth/status", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
              if (data.authenticated) {
                onLogin();
              }
            })
            .catch(err => console.error("Erro ao verificar status de autenticação:", err));
        }
      } catch (error) {
        console.error("Erro ao verificar janela de autenticação:", error);
      }
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <span className="material-icons text-primary">security</span>
          </div>
          <DialogTitle className="text-lg">
            Autenticação necessária
          </DialogTitle>
          <DialogDescription>
            Para acessar seu calendário e usar os recursos do assistente, precisamos que você autorize o acesso à sua conta do Google.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center my-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
          ) : (
            <LoginButton onClick={handleGoogleLogin} disabled={!authUrl} />
          )}
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose} variant="outline">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OAuthModal;
