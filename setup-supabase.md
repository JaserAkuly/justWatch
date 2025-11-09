# Supabase Setup Instructions

Your Supabase project is configured! Here's what you need to do:

## 1. Set Up Database Tables

Go to your Supabase Dashboard:
- Navigate to https://supabase.com/dashboard
- Select your project: `lvvgmnthgvpqtoydwvvp`
- Go to "SQL Editor"

## 2. Run Schema SQL

Copy and paste this SQL to create your tables:

```sql
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
```

## 3. Add Sample Data (Optional)

```sql
-- Seed data for live_games table
INSERT INTO public.live_games (league, match, network, app, link, start_time, is_live) VALUES
  ('NBA', 'Mavericks vs Lakers', 'ESPN', 'ESPN+', 'espn://live/12345', NOW(), true),
  ('NBA', 'Warriors vs Celtics', 'ABC', 'YouTubeTV', 'youtubetv://live/nba-warriors-celtics', NOW() + INTERVAL '2 hours', true),
  ('NBA', 'Heat vs Nuggets', 'TNT', 'Hulu', 'hulu://live/nba-heat-nuggets', NOW() - INTERVAL '1 hour', true),
  ('NFL', 'Cowboys vs Eagles', 'FOX', 'YouTubeTV', 'youtubetv://live/67890', NOW(), true),
  ('NFL', 'Patriots vs Bills', 'CBS', 'Prime Video', 'primevideo://live/nfl-patriots-bills', NOW() + INTERVAL '3 hours', true),
  ('NFL', 'Packers vs Bears', 'NBC', 'Peacock', 'peacock://live/nfl-packers-bears', NOW() + INTERVAL '1 hour', true),
  ('NHL', 'Stars vs Avalanche', 'TNT', 'Hulu', 'hulu://live/11223', NOW(), true),
  ('MLB', 'Yankees vs Red Sox', 'FOX', 'YouTubeTV', 'youtubetv://live/mlb-yankees-redsox', NOW(), true),
  ('Soccer', 'Man United vs Liverpool', 'NBC', 'Peacock', 'peacock://live/soccer-manutd-liverpool', NOW(), true);
```

## 4. Configure Email Auth (Optional)

In your Supabase Dashboard:
- Go to "Authentication" > "Settings"
- Configure email templates and SMTP settings if needed

## 5. Test Your App

Your app is now running at: **http://localhost:3001**

Try:
1. Creating an account
2. Connecting streaming services  
3. Viewing the dashboard
4. Managing settings

## Next: Deploy to Production

When ready to deploy:
1. Push your code to GitHub
2. Deploy to Vercel
3. Add environment variables in Vercel
4. Update `NEXT_PUBLIC_APP_URL` to your production domain

Your Television app is ready to go! 🎉