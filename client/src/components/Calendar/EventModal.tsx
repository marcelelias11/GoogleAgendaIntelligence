import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EventFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EventModalProps {
  onClose: () => void;
}

const EventModal = ({ onClose }: EventModalProps) => {
  const { calendars, createEvent, isPendingCreateEvent } = useCalendar();
  
  // Obter data atual formatada para os inputs
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const formattedTime = today.toTimeString().slice(0, 5); // HH:MM
  
  // Calcular hora de término padrão (1 hora após a hora atual)
  const endTime = new Date(today);
  endTime.setHours(endTime.getHours() + 1);
  const formattedEndTime = endTime.toTimeString().slice(0, 5); // HH:MM

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    startDate: formattedDate,
    startTime: formattedTime,
    endDate: formattedDate,
    endTime: formattedEndTime,
    description: '',
    calendarId: 'primary',
    reminder: false,
    reminderMinutes: 10,
    allDay: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent(formData);
    onClose();
  };

  return (
    <div className="fixed z-50 inset-0">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <DialogTitle className="text-lg font-medium text-gray-800">Novo Evento</DialogTitle>
              <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form id="eventForm" className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Adicione um título"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="startDate">Data de início</Label>
                  <Input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Hora de início</Label>
                  <Input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    disabled={formData.allDay}
                    required={!formData.allDay}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="endDate">Data de término</Label>
                  <Input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Hora de término</Label>
                  <Input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    disabled={formData.allDay}
                    required={!formData.allDay}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allDay"
                  checked={formData.allDay}
                  onCheckedChange={(checked) => handleCheckboxChange("allDay", !!checked)}
                />
                <Label htmlFor="allDay">Evento de dia inteiro</Label>
              </div>
              <div>
                <Label htmlFor="calendarId">Calendário</Label>
                <Select
                  value={formData.calendarId}
                  onValueChange={(value) => handleSelectChange("calendarId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um calendário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Principal</SelectItem>
                    {calendars.map((calendar: any) => (
                      <SelectItem key={calendar.id} value={calendar.id}>
                        {calendar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Adicione detalhes"
                  rows={3}
                />
              </div>
              <div>
                <div className="flex items-center">
                  <Checkbox
                    id="reminder"
                    checked={formData.reminder}
                    onCheckedChange={(checked) => handleCheckboxChange("reminder", !!checked)}
                  />
                  <Label htmlFor="reminder" className="ml-2">Adicionar lembrete</Label>
                </div>
                {formData.reminder && (
                  <div className="mt-2 ml-6">
                    <Select
                      value={formData.reminderMinutes?.toString()}
                      onValueChange={(value) => handleSelectChange("reminderMinutes", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione quando lembrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutos antes</SelectItem>
                        <SelectItem value="10">10 minutos antes</SelectItem>
                        <SelectItem value="30">30 minutos antes</SelectItem>
                        <SelectItem value="60">1 hora antes</SelectItem>
                        <SelectItem value="1440">1 dia antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="bg-gray-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button 
              type="submit"
              form="eventForm"
              disabled={isPendingCreateEvent}
              className="w-full sm:w-auto"
            >
              {isPendingCreateEvent ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
