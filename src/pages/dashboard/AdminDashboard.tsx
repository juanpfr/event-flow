import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Users, Calendar, DollarSign, TrendingUp, Plus, X } from "lucide-react";
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
  total_users: number;
  total_organizers: number;
  total_participants: number;
  total_events: number;
  active_events: number;
  total_tickets: number;
  total_revenue: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  plan_id?: string;
}

interface Event {
  id: string;
  title: string;
  status: string;
  organizer_id: string;
  organizer_name: string;
  price: number;
  created_at: string;
}

const AdminDashboard = () => {
  const [user] = useState(() => {
    const userData = localStorage.getItem('eventflow_user');
    return userData ? JSON.parse(userData) : null;
  });

  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_organizers: 0,
    total_participants: 0,
    total_events: 0,
    active_events: 0,
    total_tickets: 0,
    total_revenue: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventType, setNewEventType] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch platform stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_platform_stats');

      if (statsError) throw statsError;
      if (statsData && typeof statsData === 'object') {
        setStats(statsData as unknown as Stats);
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch events with organizer info
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          organizer:users!organizer_id(name)
        `)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData?.map(event => ({
        ...event,
        organizer_name: event.organizer?.name || 'N/A'
      })) || []);

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

  const toggleUserStatus = async (userId: string, currentRole: string) => {
    try {
      const newStatus = currentRole === 'inactive' ? 'participant' : 'inactive';
      
      const { error } = await supabase
        .from('users')
        .update({ role: newStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Usuário ${newStatus === 'inactive' ? 'desativado' : 'ativado'} com sucesso.`,
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

  const toggleEventStatus = async (eventId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Status do evento atualizado",
        description: `Evento ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar evento",
        description: error.message,
      });
    }
  };

  const addEventType = async () => {
    if (!newEventType.trim()) return;

    try {
      const { error } = await supabase
        .from('event_types')
        .insert([{ name: newEventType.trim() }]);

      if (error) throw error;

      toast({
        title: "Tipo de evento criado",
        description: `"${newEventType}" foi adicionado com sucesso.`,
      });

      setNewEventType("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar tipo de evento",
        description: error.message,
      });
    }
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
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma EventFlow
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_organizers} organizadores, {stats.total_participants} participantes
              </p>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">Ingressos Vendidos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tickets}</div>
              <p className="text-xs text-muted-foreground">
                Participações registradas
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
                Receita acumulada
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Users Management */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>Lista de todos os usuários da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <Badge variant={u.role === 'inactive' ? 'destructive' : 'default'}>
                        {u.role}
                      </Badge>
                    </div>
                    <Button 
                      size="sm"
                      variant={u.role === 'inactive' ? 'default' : 'destructive'}
                      onClick={() => toggleUserStatus(u.id, u.role)}
                    >
                      {u.role === 'inactive' ? 'Ativar' : 'Desativar'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Events Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Eventos</CardTitle>
                <CardDescription>Lista de todos os eventos da plataforma</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tipo de Evento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Tipo de Evento</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo tipo de evento na plataforma.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="event-type">Nome do Tipo</Label>
                      <Input
                        id="event-type"
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value)}
                        placeholder="Ex: Hackathon"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addEventType} disabled={!newEventType.trim()}>
                      Adicionar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Por {event.organizer_name} • R$ {event.price.toFixed(2)}
                      </p>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <Button 
                      size="sm"
                      variant={event.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => toggleEventStatus(event.id, event.status)}
                    >
                      {event.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;