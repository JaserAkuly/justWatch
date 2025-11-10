-- Create table for storing provider authentication tokens
CREATE TABLE IF NOT EXISTS public.provider_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  provider_user_id TEXT,
  provider_email TEXT,
  provider_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_name)
);

-- Create index for faster lookups
CREATE INDEX idx_provider_tokens_user_provider ON public.provider_tokens(user_id, provider_name);

-- Enable RLS
ALTER TABLE public.provider_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own provider tokens"
  ON public.provider_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provider tokens"
  ON public.provider_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider tokens"
  ON public.provider_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider tokens"
  ON public.provider_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_provider_tokens_updated_at
  BEFORE UPDATE ON public.provider_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table for tracking provider-specific game availability
CREATE TABLE IF NOT EXISTS public.provider_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'game', 'show', 'movie'
  title TEXT NOT NULL,
  league TEXT,
  teams JSONB DEFAULT '[]',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  deep_link TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_name, content_id)
);

-- Create index for content lookups
CREATE INDEX idx_provider_content_provider ON public.provider_content(provider_name);
CREATE INDEX idx_provider_content_start_time ON public.provider_content(start_time);
CREATE INDEX idx_provider_content_league ON public.provider_content(league);

-- Enable RLS
ALTER TABLE public.provider_content ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read provider content
CREATE POLICY "Authenticated users can view provider content"
  ON public.provider_content FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Demo mode support for provider tokens
CREATE POLICY "Demo users can view demo provider tokens"
  ON public.provider_tokens FOR SELECT
  USING (
    user_id = 'demo-user-123'::UUID OR
    auth.uid() = user_id
  );