import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Calendar, Users, DollarSign, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Stats {
  total_events: number;
  active_events: number;
  total_participants: number;
  total_revenue: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  type_id: string;
  type_name: string;
  participant_count: number;
  created_at: string;
}

interface EventType {
  id: string;
  name: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

const OrganizerDashboard = () => {
  const [user] = useState(() => {
    const userData = localStorage.getItem('eventflow_user');
    return userData ? JSON.parse(userData) : null;
  });

  const [stats, setStats] = useState<Stats>({
    total_events: 0,
    active_events: 0,
    total_participants: 0,
    total_revenue: 0,
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type_id: "",
    price: "",
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch organizer stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_organizer_stats', { organizer_user_id: user.id });

      if (statsError) throw statsError;
      if (statsData && typeof statsData === 'object') {
        setStats(statsData as unknown as Stats);
      }

      // Fetch event types
      const { data: typesData, error: typesError } = await supabase
        .from('event_types')
        .select('*')
        .order('name');

      if (typesError) throw typesError;
      setEventTypes(typesData || []);

      // Fetch events with participant count
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_types!inner(name),
          tickets(count)
        `)
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      
      const formattedEvents = eventsData?.map(event => ({
        ...event,
        type_name: event.event_types?.name || 'N/A',
        participant_count: event.tickets?.length || 0,
      })) || [];

      setEvents(formattedEvents);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventParticipants = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          created_at,
          users!inner(id, name, email)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const participantsList = data?.map(ticket => ({
        id: ticket.users.id,
        name: ticket.users.name,
        email: ticket.users.email,
        created_at: ticket.created_at,
      })) || [];

      setParticipants(participantsList);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar participantes",
        description: error.message,
      });
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.type_id || !eventForm.price) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .insert([{
          title: eventForm.title,
          description: eventForm.description,
          type_id: eventForm.type_id,
          price: parseFloat(eventForm.price),
          organizer_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Evento criado!",
        description: "Seu evento foi criado com sucesso.",
      });

      setEventForm({ title: "", description: "", type_id: "", price: "" });
      setIsCreateDialogOpen(false);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar evento",
        description: error.message,
      });
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent || !eventForm.title || !eventForm.type_id || !eventForm.price) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: eventForm.title,
          description: eventForm.description,
          type_id: eventForm.type_id,
          price: parseFloat(eventForm.price),
        })
        .eq('id', editingEvent.id);

      if (error) throw error;

      toast({
        title: "Evento atualizado!",
        description: "Suas alterações foram salvas.",
      });

      setIsEditDialogOpen(false);
      setEditingEvent(null);
      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar evento",
        description: error.message,
      });
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Evento ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Evento excluído",
        description: "O evento foi removido com sucesso.",
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir evento",
        description: error.message,
      });
    }
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      type_id: event.type_id,
      price: event.price.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openParticipantsDialog = (eventId: string) => {
    setSelectedEventId(eventId);
    fetchEventParticipants(eventId);
    setIsParticipantsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container max-w-7xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Painel do Organizador
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus eventos e acompanhe o desempenho
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Evento</DialogTitle>
                <DialogDescription>
                  Preencha as informações do seu evento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Evento</Label>
                  <Input
                    id="title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nome do evento"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva seu evento"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo do Evento</Label>
                  <Select onValueChange={(value) => setEventForm(prev => ({ ...prev, type_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={eventForm.price}
                    onChange={(e) => setEventForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateEvent}>Criar Evento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_events}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_events} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_participants}</div>
              <p className="text-xs text-muted-foreground">
                Inscritos nos seus eventos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.total_revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Valor arrecadado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Evento</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.total_events > 0 ? (stats.total_revenue / stats.total_events).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Receita média por evento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Eventos</CardTitle>
            <CardDescription>Gerencie todos os seus eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Tipo: {event.type_name}</span>
                      <span>Preço: R$ {event.price.toFixed(2)}</span>
                      <span>{event.participant_count} participantes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openParticipantsDialog(event.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={event.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => toggleEventStatus(event.id, event.status)}
                    >
                      {event.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Você ainda não criou nenhum evento. Clique em "Novo Evento" para começar!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu evento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título do Evento</Label>
              <Input
                id="edit-title"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome do evento"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva seu evento"
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Tipo do Evento</Label>
              <Select value={eventForm.type_id} onValueChange={(value) => setEventForm(prev => ({ ...prev, type_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-price">Preço (R$)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={eventForm.price}
                onChange={(e) => setEventForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditEvent}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Participants Dialog */}
      <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Participantes do Evento</DialogTitle>
            <DialogDescription>
              Lista de todos os participantes inscritos neste evento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-sm text-muted-foreground">{participant.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Inscrito em: {new Date(participant.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            {participants.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum participante inscrito ainda.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizerDashboard;