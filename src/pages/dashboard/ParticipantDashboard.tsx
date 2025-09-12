import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Calendar, Users, DollarSign, Search, Filter } from "lucide-react";

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
  is_registered: boolean;
}

interface EventType {
  id: string;
  name: string;
}

const ParticipantDashboard = () => {
  const [user] = useState(() => {
    const userData = localStorage.getItem('eventflow_user');
    return userData ? JSON.parse(userData) : null;
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEventTypes();
    fetchEvents();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setEventTypes(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar tipos de evento",
        description: error.message,
      });
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Query corrigida - sem GROUP BY problemático
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          price,
          status,
          type_id,
          created_at,
          event_types(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Buscar registros do usuário atual
      const { data: userTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('event_id')
        .eq('participant_id', user.id);

      if (ticketsError) throw ticketsError;

      const userEventIds = new Set(userTickets?.map(ticket => ticket.event_id) || []);

      // Para cada evento, contar participantes e verificar se usuário está registrado
      const eventsWithDetails = await Promise.all(
        (eventsData || []).map(async (event) => {
          // Contar participantes
          const { count } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            ...event,
            type_name: event.event_types?.name || 'N/A',
            participant_count: count || 0,
            is_registered: userEventIds.has(event.id)
          };
        })
      );

      setEvents(eventsWithDetails);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar eventos",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: string) => {
    setRegistering(eventId);
    try {
      const { error } = await supabase
        .from('tickets')
        .insert([{
          event_id: eventId,
          participant_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito no evento com sucesso.",
      });

      // Atualizar a lista de eventos
      fetchEvents();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na inscrição",
        description: error.message.includes('duplicate') 
          ? "Você já está inscrito neste evento."
          : error.message,
      });
    } finally {
      setRegistering(null);
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    setRegistering(eventId);
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('event_id', eventId)
        .eq('participant_id', user.id);

      if (error) throw error;

      toast({
        title: "Inscrição cancelada",
        description: "Sua inscrição foi cancelada com sucesso.",
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cancelar inscrição",
        description: error.message,
      });
    } finally {
      setRegistering(null);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || event.type_id === selectedType;
    return matchesSearch && matchesType;
  });

  const registeredEvents = events.filter(event => event.is_registered);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando eventos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Participante</h1>
          <p className="text-gray-600">Encontre e participe dos melhores eventos da sua região</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Disponíveis</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                Eventos ativos na plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minhas Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registeredEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                Eventos que você se inscreveu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Eventos Disponíveis</h2>
          
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
                  <p>
                    {searchTerm || selectedType !== 'all' 
                      ? 'Tente ajustar os filtros para encontrar eventos.' 
                      : 'Ainda não há eventos disponíveis. Volte em breve!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{event.type_name}</Badge>
                      <Badge 
                        variant={event.is_registered ? "default" : "secondary"}
                      >
                        {event.is_registered ? "Inscrito" : "Disponível"}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <CardDescription className="flex-1 mb-4 line-clamp-3">
                      {event.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.participant_count} participantes
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          R$ {event.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        {event.is_registered ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => unregisterFromEvent(event.id)}
                            disabled={registering === event.id}
                          >
                            {registering === event.id ? "Cancelando..." : "Cancelar Inscrição"}
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            onClick={() => registerForEvent(event.id)}
                            disabled={registering === event.id}
                          >
                            {registering === event.id ? "Inscrevendo..." : "Se Inscrever"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My Events Section */}
        {registeredEvents.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Meus Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
                <Card key={`registered-${event.id}`} className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{event.type_name}</Badge>
                      <Badge variant="default">Inscrito</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">
                      {event.description}
                    </CardDescription>
                    
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.participant_count} participantes
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {event.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => unregisterFromEvent(event.id)}
                      disabled={registering === event.id}
                    >
                      {registering === event.id ? "Cancelando..." : "Cancelar Inscrição"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>Explore os eventos disponíveis e encontre algo interessante!</p>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
