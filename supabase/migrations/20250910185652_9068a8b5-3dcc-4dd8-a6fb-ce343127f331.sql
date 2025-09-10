-- Create plans table for organizer subscription plans
CREATE TABLE public.plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    max_events INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.plans (name, max_events, price) VALUES
('Free', 1, 0.00),
('Pro', 5, 29.99),
('Premium', -1, 99.99); -- -1 means unlimited

-- Create event_types table
CREATE TABLE public.event_types (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default event types
INSERT INTO public.event_types (name) VALUES
('Conferência'),
('Workshop'),
('Seminário'),
('Meetup'),
('Festa'),
('Curso'),
('Webinar'),
('Networking');

-- Create users table (extending auth functionality)
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'organizer', 'participant')),
    plan_id UUID REFERENCES public.plans(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type_id UUID NOT NULL REFERENCES public.event_types(id),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(event_id, participant_id) -- Prevent duplicate tickets for same user/event
);

-- Create indexes for better performance
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX idx_tickets_participant_id ON public.tickets(participant_id);

-- Disable RLS on all tables as requested
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types DISABLE ROW LEVEL SECURITY;  
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;

-- Create a function to get user statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM public.users),
        'total_organizers', (SELECT COUNT(*) FROM public.users WHERE role = 'organizer'),
        'total_participants', (SELECT COUNT(*) FROM public.users WHERE role = 'participant'),
        'total_events', (SELECT COUNT(*) FROM public.events),
        'active_events', (SELECT COUNT(*) FROM public.events WHERE status = 'active'),
        'total_tickets', (SELECT COUNT(*) FROM public.tickets),
        'total_revenue', (
            SELECT COALESCE(SUM(e.price), 0) 
            FROM public.tickets t 
            JOIN public.events e ON t.event_id = e.id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get organizer stats
CREATE OR REPLACE FUNCTION get_organizer_stats(organizer_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_events', (
            SELECT COUNT(*) 
            FROM public.events 
            WHERE organizer_id = organizer_user_id
        ),
        'active_events', (
            SELECT COUNT(*) 
            FROM public.events 
            WHERE organizer_id = organizer_user_id AND status = 'active'
        ),
        'total_participants', (
            SELECT COUNT(*) 
            FROM public.tickets t 
            JOIN public.events e ON t.event_id = e.id 
            WHERE e.organizer_id = organizer_user_id
        ),
        'total_revenue', (
            SELECT COALESCE(SUM(e.price), 0) 
            FROM public.tickets t 
            JOIN public.events e ON t.event_id = e.id 
            WHERE e.organizer_id = organizer_user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;