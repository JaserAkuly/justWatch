-- Seed data for live_games table
INSERT INTO public.live_games (league, match, network, app, link, start_time, is_live) VALUES
  ('NBA', 'Mavericks vs Lakers', 'ESPN', 'ESPN+', 'espn://live/12345', NOW(), true),
  ('NBA', 'Warriors vs Celtics', 'ABC', 'YouTubeTV', 'youtubetv://live/nba-warriors-celtics', NOW() + INTERVAL '2 hours', true),
  ('NBA', 'Heat vs Nuggets', 'TNT', 'Hulu', 'hulu://live/nba-heat-nuggets', NOW() - INTERVAL '1 hour', true),
  
  ('NFL', 'Cowboys vs Eagles', 'FOX', 'YouTubeTV', 'youtubetv://live/67890', NOW(), true),
  ('NFL', 'Patriots vs Bills', 'CBS', 'Prime Video', 'primevideo://live/nfl-patriots-bills', NOW() + INTERVAL '3 hours', true),
  ('NFL', 'Packers vs Bears', 'NBC', 'Peacock', 'peacock://live/nfl-packers-bears', NOW() + INTERVAL '1 hour', true),
  ('NFL', 'Chiefs vs Raiders', 'ESPN', 'ESPN+', 'espn://live/nfl-chiefs-raiders', NOW() - INTERVAL '30 minutes', true),
  
  ('NHL', 'Stars vs Avalanche', 'TNT', 'Hulu', 'hulu://live/11223', NOW(), true),
  ('NHL', 'Rangers vs Bruins', 'ESPN', 'ESPN+', 'espn://live/nhl-rangers-bruins', NOW() + INTERVAL '90 minutes', true),
  ('NHL', 'Lightning vs Panthers', 'ESPN+', 'ESPN+', 'espn://live/nhl-lightning-panthers', NOW() - INTERVAL '45 minutes', true),
  
  ('MLB', 'Yankees vs Red Sox', 'FOX', 'YouTubeTV', 'youtubetv://live/mlb-yankees-redsox', NOW(), true),
  ('MLB', 'Dodgers vs Giants', 'ESPN', 'ESPN+', 'espn://live/mlb-dodgers-giants', NOW() + INTERVAL '2 hours', true),
  ('MLB', 'Astros vs Rangers', 'Apple TV+', 'DirecTV Stream', 'directv://live/mlb-astros-rangers', NOW() - INTERVAL '20 minutes', true),
  
  ('Soccer', 'Man United vs Liverpool', 'NBC', 'Peacock', 'peacock://live/soccer-manutd-liverpool', NOW(), true),
  ('Soccer', 'Barcelona vs Real Madrid', 'ESPN+', 'ESPN+', 'espn://live/soccer-barcelona-realmadrid', NOW() + INTERVAL '4 hours', true),
  ('Soccer', 'Chelsea vs Arsenal', 'USA', 'Sling', 'sling://live/soccer-chelsea-arsenal', NOW() + INTERVAL '30 minutes', true),
  
  ('College Football', 'Alabama vs Auburn', 'CBS', 'Prime Video', 'primevideo://live/cfb-alabama-auburn', NOW(), true),
  ('College Football', 'Ohio State vs Michigan', 'FOX', 'YouTubeTV', 'youtubetv://live/cfb-ohiostate-michigan', NOW() + INTERVAL '3 hours', true),
  ('College Football', 'Texas vs Oklahoma', 'ABC', 'Hulu', 'hulu://live/cfb-texas-oklahoma', NOW() - INTERVAL '1 hour', true),
  
  ('College Basketball', 'Duke vs North Carolina', 'ESPN', 'ESPN+', 'espn://live/cbb-duke-unc', NOW(), true),
  ('College Basketball', 'Kentucky vs Louisville', 'CBS', 'DirecTV Stream', 'directv://live/cbb-kentucky-louisville', NOW() + INTERVAL '2 hours', true);

-- Add some games that are not live (for variety)
UPDATE public.live_games 
SET is_live = false 
WHERE start_time < NOW() - INTERVAL '2 hours';