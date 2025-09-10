import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Users, Calendar, DollarSign, TrendingUp, UserCheck, UserX, Eye, Edit, Trash2 } from "lucide-react";

interface Stats {
  total_users: number;
  total_organizers: number;
  total_participants: number;
  total_events: number;
  active_events: number;
  total_registrations: number;
  total_revenue: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  organizer_name: string;
  participant_count: number;
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
    total_registrations: 0,
    total_revenue: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [updatingEvent, setUpdatingEvent] = useState<string | null>(null);
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
        setStats(statsData as Stats);
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role, active, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch events with organizer names and participant counts
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          price,
          status,
          created_at,
          users!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Get participant counts for each event
      const eventsWithDetails = await Promise.all(
        (eventsData || []).map(async (event: any) => {
          const { count } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            id: event.id,
            title: event.title,
            description: event.description || '',
            price: event.price,
            status: event.status,
            organizer_name: event.users.name,
            participant_count: count || 0,
            created_at: event.created_at,
          };
        })
      );

      setEvents(eventsWithDetails);
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

  const toggleUserStatus = async (userId: string, currentActive: boolean) => {
    setUpdatingUser(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: !currentActive })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Usuário ${!currentActive ? 'ativado' : 'desativado'} com sucesso.`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: string) => {
    setUpdatingEvent(eventId);
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
    } finally {
      setUpdatingEvent(null);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este evento? Esta ação não pode ser desfeita.')) {
      return;
    }

    setUpdatingEvent(eventId);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Evento excluído",
        description: "O evento foi removido permanentemente.",
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir evento",
        description: error.message,
      });
    } finally {
      setUpdatingEvent(null);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'organizer':
        return 'Organizador';
      case 'participant':
        return 'Participante';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'organizer':
        return 'default';
      case 'participant':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Visão geral da plataforma EventFlow</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Inscrições</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_registrations}</div>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Users Management */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Lista de todos os usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium">{u.name}</p>
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {getRoleName(u.role)}
                        </Badge>
                        <Badge variant={u.active ? "default" : "secondary"}>
                          {u.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      <p className="text-xs text-gray-400">
                        Cadastrado em: {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={u.active ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleUserStatus(u.id, u.active)}
                        disabled={updatingUser === u.id || u.id === user.id}
                      >
                        {updatingUser === u.id ? (
                          "..."
                        ) : u.active ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum usuário encontrado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Events Management */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Eventos</CardTitle>
              <CardDescription>
                Controle todos os eventos da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium line-clamp-1">{event.title}</p>
                        <Badge variant={event.status === 'active' ? "default" : "secondary"}>
                          {event.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Por {event.organizer_name} • R$ {event.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {event.participant_count} participantes • {new Date(event.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={event.status === 'active' ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleEventStatus(event.id, event.status)}
                        disabled={updatingEvent === event.id}
                      >
                        {updatingEvent === event.id ? (
                          "..."
                        ) : event.status === 'active' ? (
                          <>
                            <Eye className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                        disabled={updatingEvent === event.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum evento encontrado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Usuários ativos:</span>
                  <span className="font-medium">{users.filter(u => u.active).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eventos ativos:</span>
                  <span className="font-medium">{events.filter(e => e.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de eventos ativos:</span>
                  <span className="font-medium">
                    {events.length > 0 ? Math.round((events.filter(e => e.status === 'active').length / events.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Engajamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Média de participantes por evento:</span>
                  <span className="font-medium">
                    {events.length > 0 ? Math.round(events.reduce((acc, e) => acc + e.participant_count, 0) / events.length) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Receita média por evento:</span>
                  <span className="font-medium">
                    R$ {events.length > 0 ? (stats.total_revenue / events.length).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Receita por participante:</span>
                  <span className="font-medium">
                    R$ {stats.total_registrations > 0 ? (stats.total_revenue / stats.total_registrations).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
