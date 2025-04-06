import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCalendar } from "@/hooks/useCalendar";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { calendars, isLoadingCalendars } = useCalendar();
  const { toast } = useToast();

  // Estado local das configurações
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    defaultView: "month",
    defaultReminderTime: 10,
    darkMode: false,
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleSettingChange = (setting: string, value: boolean | string | number) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    
    toast({
      title: "Configuração atualizada",
      description: "Suas preferências foram salvas.",
    });
  };

  return (
    <>
      <Sidebar />
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-100">
        <div className="py-6">
          <div className="mx-auto px-4 sm:px-6 md:px-8">
            <div className="space-y-6">
              {/* SettingsHeader */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Configurações</h1>
                <p className="mt-1 text-sm text-gray-500">Gerencie suas preferências e configurações da conta</p>
              </div>

              {/* Perfil do usuário */}
              <Card>
                <CardHeader>
                  <CardTitle>Perfil do Usuário</CardTitle>
                  <CardDescription>Suas informações pessoais e de conta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      {user?.picture ? (
                        <img src={user.picture} alt="Foto de perfil" className="h-16 w-16 rounded-full mr-4" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white mr-4">
                          <span className="text-xl">{user?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-medium">{user?.username}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    <Button variant="outline" onClick={handleLogout} className="mt-4">
                      Sair da conta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Calendários */}
              <Card>
                <CardHeader>
                  <CardTitle>Calendários</CardTitle>
                  <CardDescription>Gerencie seus calendários conectados</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCalendars ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-6 w-10 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {calendars.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum calendário encontrado</p>
                      ) : (
                        calendars.map((calendar: any) => (
                          <div key={calendar.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span 
                                className="w-3 h-3 mr-3 rounded-full" 
                                style={{ backgroundColor: calendar.color }}
                              ></span>
                              <span>{calendar.name}</span>
                            </div>
                            <Switch 
                              checked={calendar.selected} 
                              onCheckedChange={() => {
                                toast({
                                  title: "Calendário atualizado",
                                  description: `Calendário ${calendar.name} ${calendar.selected ? 'desativado' : 'ativado'}.`,
                                });
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preferências */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferências</CardTitle>
                  <CardDescription>Personalize a experiência do aplicativo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Notificações</h4>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifications" className="flex-grow">Notificações no navegador</Label>
                        <Switch 
                          id="notifications" 
                          checked={settings.notifications}
                          onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNotifications" className="flex-grow">Notificações por e-mail</Label>
                        <Switch 
                          id="emailNotifications" 
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Visualização</h4>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="darkMode" className="flex-grow">Modo escuro</Label>
                        <Switch 
                          id="darkMode" 
                          checked={settings.darkMode}
                          onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Assistente IA</h4>
                      <p className="text-sm text-gray-500">
                        O Assistente IA usa a API OpenAI para processar comandos e criar eventos. 
                        Você pode ajustar as configurações abaixo.
                      </p>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="aiEnabled" className="flex-grow">Ativar Assistente IA</Label>
                        <Switch id="aiEnabled" checked={true} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;
