/* Featured Events Section */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  price: number;
  type_name: string;
  participant_count: number;
}

const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: eventsData, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          price,
          event_types(name)
        `)
        .eq("status", "active");

      if (error) {
        console.error("Erro ao carregar eventos:", error);
        return;
      }

      // Conta participantes de cada evento
      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id);

          return {
            ...event,
            type_name: event.event_types?.name || "N/A",
            participant_count: count || 0,
          };
        })
      );

      // Ordena por inscritos (desc) e pega só os 3 mais populares
      const topEvents = eventsWithCounts
        .sort((a, b) => b.participant_count - a.participant_count)
        .slice(0, 3);

      setEvents(topEvents);
    };

    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Eventos em Destaque
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Os eventos mais populares no momento, com centenas de participantes já inscritos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="border shadow-md hover:shadow-lg transition">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{event.type_name}</Badge>
                  <Badge variant="secondary">{event.participant_count} inscritos</Badge>
                </div>
                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 mb-4">
                  {event.description}
                </CardDescription>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    R$ {event.price.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Em breve
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link to="/login">Ver Detalhes</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
