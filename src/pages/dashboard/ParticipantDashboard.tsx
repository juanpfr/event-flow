import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Calendar, MapPin, Clock, Users, Filter, Search } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  type_id: string;
  type_name: string;
  organizer_name: string;
  participant_count: number;
  user_registered: boolean;
  created_at: string;
}

interface EventType {
  id: string;
  name: string;
}

interface UserEvent {
  id: string;
  title: string;
  description: string;
  price: number;
  type_name: string;
  organizer_name: string;
  registered_at: string;
}

const ParticipantDashboard = () => {
  const [user] = useState(() => {
    const userData = localStorage.getItem('eventflow_user');
    return userData ? JSON.parse(userData) : null;
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState<'available' | 'registered'>('available');
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedType]);

  const fetchDashboardData = async () => {
    try {
      // Fetch event types
      const { data: typesData, error: typesError } = await supabase
        .from('event_types')
        .select('*')
        .order('name');

      if (typesError) throw typesError;
      setEventTypes(typesData || []);

      // Fetch all active events with participant info
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_types!inner(name),
          organizer:users!organizer_id(name),
          tickets(count, participant_id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      const formattedEvents = eventsData?.map(event => ({
        ...event,
        type_name: event.event_types?.name || 'N/A',
        organizer_name: event.organizer?.name || 'N/A',
        participant_count: event.tickets?.length || 0,
        user_registered: event.tickets?.some(ticket => ticket.participant_id === user.id) || false,
      })) || [];

      setEvents(formattedEvents);

      // Fetch user's registered events
      const { data: userEventsData, error: userEventsError } = await supabase
        .from('tickets')
        .select(`
          created_at,
          events!inner(
            id,
            title,
            description,
            price,
            event_types!inner(name),
            organizer:users!organizer_id(name)
          )
        `)
        .eq('participant_id', user.id)
        .order('created_at', { ascending: false });

      if (userEventsError) throw userEventsError;

      const formattedUserEvents = userEventsData?.map(ticket => ({
        id: ticket.events.id,
        title: ticket.events.title,
        description: ticket.events.description,
        price: ticket.events.price,
        type_name: ticket.events.event_types?.name || 'N/A',
        organizer_name: ticket.events.organizer?.name || 'N/A',
        registered_at: ticket.created_at,
      })) || [];

      setUserEvents(formattedUserEvents);

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

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by event type
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(event => event.type_id === selectedType);
    }

    setFilteredEvents(filtered);
  };

  const handleBuyTicket = async (eventId: string) => {
    try {
      // Check if user is already registered
      const existingTicket = await supabase
        .from('tickets')
        .select('id')
        .eq('event_id', eventId)
        .eq('participant_id', user.id)
        .single();

      if (existingTicket.data) {
        toast({
          variant: "destructive",
          title: "Já inscrito",
          description: "Você já possui um ingresso para este evento.",
        });
        return;
      }

      const { error } = await supabase
        .from('tickets')
        .insert([{
          event_id: eventId,
          participant_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Ingresso adquirido!",
        description: "Você foi inscrito no evento com sucesso.",
      });

      // Refresh data
      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao comprar ingresso",
        description: error.message,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Descubra Eventos Incríveis
          </h1>
          <p className="text-muted-foreground">
            Encontre e participe dos melhores eventos da sua região
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'available'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Eventos Disponíveis
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'registered'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Meus Eventos ({userEvents.length})
          </button>
        </div>

        {activeTab === 'available' && (
          <>
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:w-48">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <Filter className="w-4 h-4 mr-2" />
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

            {/* Events Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="card-gradient border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{event.type_name}</Badge>
                      <span className="text-2xl font-bold text-primary">
                        R$ {event.price.toFixed(2)}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="text-sm">
                      Por {event.organizer_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event.participant_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.created_at)}</span>
                      </div>
                    </div>

                    {event.user_registered ? (
                      <Button disabled className="w-full" variant="secondary">
                        Já Inscrito
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleBuyTicket(event.id)}
                        className="w-full"
                      >
                        Comprar Ingresso
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhum evento encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedType !== 'all' 
                      ? 'Tente ajustar os filtros para encontrar eventos.'
                      : 'Ainda não há eventos disponíveis. Volte em breve!'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'registered' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEvents.map((event) => (
              <Card key={event.id} className="card-gradient border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="default">{event.type_name}</Badge>
                    <span className="text-xl font-bold text-success">
                      ✓ Inscrito
                    </span>
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="text-sm">
                    Por {event.organizer_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor pago:</span>
                      <span className="font-medium">R$ {event.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inscrito em:</span>
                      <span className="font-medium">{formatDate(event.registered_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {userEvents.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Você ainda não se inscreveu em nenhum evento
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Explore os eventos disponíveis e encontre algo interessante!
                    </p>
                    <Button 
                      onClick={() => setActiveTab('available')}
                      variant="outline"
                    >
                      Ver Eventos Disponíveis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;