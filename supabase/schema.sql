-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create live_games table
CREATE TABLE public.live_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league TEXT NOT NULL,
  match TEXT NOT NULL,
  network TEXT NOT NULL,
  app TEXT NOT NULL,
  link TEXT NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  is_live BOOLEAN DEFAULT true
);

-- Create user_services table
CREATE TABLE public.user_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  connected BOOLEAN DEFAULT false,
  UNIQUE(user_id, service_name)
);

-- Create indexes for better performance
CREATE INDEX idx_live_games_is_live ON public.live_games(is_live);
CREATE INDEX idx_live_games_start_time ON public.live_games(start_time);
CREATE INDEX idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX idx_user_services_connected ON public.user_services(connected);

-- Set up Row Level Security (RLS)
ALTER TABLE public.live_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

-- Create policies for live_games (public read)
CREATE POLICY "Public games are viewable by everyone" ON public.live_games
  FOR SELECT USING (true);

-- Create policies for user_services (users can only see their own)
CREATE POLICY "Users can view own services" ON public.user_services
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services" ON public.user_services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" ON public.user_services
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" ON public.user_services
  FOR DELETE USING (auth.uid() = user_id);