-- Demo Account Setup for Television MVP
-- Run this in your Supabase SQL Editor

-- First, let's create a demo user manually in the auth.users table
-- Note: In production, users would sign up normally through the app

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'demo@television.app',
  '$2a$10$QWERASDFZXCVTYUIOPGHJ.K', -- This is a hashed password for "demo123"
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo User","email":"demo@television.app"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
);

-- Add demo user's connected services
INSERT INTO public.user_services (user_id, service_name, connected) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'espn-plus', true),
  ('550e8400-e29b-41d4-a716-446655440000', 'youtube-tv', true),
  ('550e8400-e29b-41d4-a716-446655440000', 'hulu', true),
  ('550e8400-e29b-41d4-a716-446655440000', 'peacock', true),
  ('550e8400-e29b-41d4-a716-446655440000', 'prime-video', false),
  ('550e8400-e29b-41d4-a716-446655440000', 'disney-plus', false),
  ('550e8400-e29b-41d4-a716-446655440000', 'directv-stream', false),
  ('550e8400-e29b-41d4-a716-446655440000', 'sling', false);

-- Clear existing games and add comprehensive demo data
DELETE FROM public.live_games;

-- Live Games (Currently Playing)
INSERT INTO public.live_games (league, match, network, app, link, start_time, is_live) VALUES
  -- NBA - Live Now
  ('NBA', 'Lakers vs Warriors', 'ESPN', 'ESPN+', 'espn://live/nba-lakers-warriors', NOW() - INTERVAL '45 minutes', true),
  ('NBA', 'Celtics vs Heat', 'TNT', 'Hulu', 'hulu://live/nba-celtics-heat', NOW() - INTERVAL '30 minutes', true),
  ('NBA', 'Mavericks vs Nuggets', 'ABC', 'YouTubeTV', 'youtubetv://live/nba-mavs-nuggets', NOW() - INTERVAL '15 minutes', true),
  
  -- NFL - Live Now  
  ('NFL', 'Cowboys vs Eagles', 'FOX', 'YouTubeTV', 'youtubetv://live/nfl-cowboys-eagles', NOW() - INTERVAL '1 hour', true),
  ('NFL', 'Chiefs vs Raiders', 'CBS', 'Prime Video', 'primevideo://live/nfl-chiefs-raiders', NOW() - INTERVAL '20 minutes', true),
  
  -- NHL - Live Now
  ('NHL', 'Rangers vs Bruins', 'ESPN', 'ESPN+', 'espn://live/nhl-rangers-bruins', NOW() - INTERVAL '40 minutes', true),
  ('NHL', 'Lightning vs Panthers', 'TNT', 'Hulu', 'hulu://live/nhl-lightning-panthers', NOW() - INTERVAL '25 minutes', true),
  
  -- Soccer - Live Now
  ('Soccer', 'Man United vs Liverpool', 'NBC', 'Peacock', 'peacock://live/soccer-manutd-liverpool', NOW() - INTERVAL '50 minutes', true),
  ('Soccer', 'Chelsea vs Arsenal', 'USA', 'Sling', 'sling://live/soccer-chelsea-arsenal', NOW() - INTERVAL '35 minutes', true),
  
  -- MLB - Live Now
  ('MLB', 'Yankees vs Red Sox', 'FOX', 'YouTubeTV', 'youtubetv://live/mlb-yankees-redsox', NOW() - INTERVAL '90 minutes', true),
  
  -- Upcoming Games (Not Live Yet)
  ('NBA', 'Bucks vs 76ers', 'ESPN', 'ESPN+', 'espn://live/nba-bucks-sixers', NOW() + INTERVAL '2 hours', false),
  ('NBA', 'Suns vs Clippers', 'TNT', 'Hulu', 'hulu://live/nba-suns-clippers', NOW() + INTERVAL '3 hours', false),
  ('NFL', 'Packers vs Bears', 'NBC', 'Peacock', 'peacock://live/nfl-packers-bears', NOW() + INTERVAL '4 hours', false),
  ('NFL', 'Bills vs Dolphins', 'ESPN', 'ESPN+', 'espn://live/nfl-bills-dolphins', NOW() + INTERVAL '5 hours', false),
  ('NHL', 'Avalanche vs Stars', 'ESPN+', 'ESPN+', 'espn://live/nhl-avs-stars', NOW() + INTERVAL '2.5 hours', false),
  ('Soccer', 'Barcelona vs Real Madrid', 'ESPN+', 'ESPN+', 'espn://live/soccer-barca-real', NOW() + INTERVAL '6 hours', false),
  ('College Football', 'Alabama vs Auburn', 'CBS', 'Prime Video', 'primevideo://live/cfb-alabama-auburn', NOW() + INTERVAL '1 hour', false),
  ('College Basketball', 'Duke vs UNC', 'ESPN', 'ESPN+', 'espn://live/cbb-duke-unc', NOW() + INTERVAL '3.5 hours', false);

-- Update some games to show variety in connected/not connected services
UPDATE public.live_games SET app = 'DirecTV Stream' WHERE match = 'Chiefs vs Raiders';
UPDATE public.live_games SET app = 'Disney+' WHERE match = 'Chelsea vs Arsenal';
UPDATE public.live_games SET app = 'Sling' WHERE match = 'Bucks vs 76ers';