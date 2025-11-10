export interface StreamingProvider {
  id: string
  name: string
  icon: string
  description: string
  authType: 'oauth' | 'credentials' | 'mock'
  authUrl?: string
  apiBaseUrl?: string
  deepLinkPrefix?: string
  isImplemented: boolean
  requiresSubscription: boolean
  features: {
    liveGames: boolean
    onDemand: boolean
    dvr: boolean
    multipleStreams: boolean
  }
}

export const STREAMING_PROVIDERS: Record<string, StreamingProvider> = {
  'prime-video': {
    id: 'prime-video',
    name: 'Prime Video',
    icon: '📦',
    description: 'Thursday Night Football & exclusive games',
    authType: 'oauth',
    authUrl: process.env.NEXT_PUBLIC_PRIME_AUTH_URL || 'https://www.amazon.com/ap/oa',
    apiBaseUrl: 'https://api.amazonvideo.com',
    deepLinkPrefix: 'aiv://aiv/play',
    isImplemented: true,
    requiresSubscription: true,
    features: {
      liveGames: true,
      onDemand: true,
      dvr: false,
      multipleStreams: true
    }
  },
  'espn-plus': {
    id: 'espn-plus',
    name: 'ESPN+',
    icon: '🏈',
    description: 'Live sports, originals & exclusives',
    authType: 'mock',
    isImplemented: false,
    requiresSubscription: true,
    features: {
      liveGames: true,
      onDemand: true,
      dvr: false,
      multipleStreams: false
    }
  },
  'youtube-tv': {
    id: 'youtube-tv',
    name: 'YouTubeTV',
    icon: '📺',
    description: 'Live TV with 100+ channels',
    authType: 'mock',
    isImplemented: false,
    requiresSubscription: true,
    features: {
      liveGames: true,
      onDemand: true,
      dvr: true,
      multipleStreams: true
    }
  },
  'hulu': {
    id: 'hulu',
    name: 'Hulu',
    icon: '🟢',
    description: 'Shows, movies & live TV',
    authType: 'mock',
    isImplemented: false,
    requiresSubscription: true,
    features: {
      liveGames: true,
      onDemand: true,
      dvr: true,
      multipleStreams: false
    }
  },
  'disney-plus': {
    id: 'disney-plus',
    name: 'Disney+',
    icon: '🏰',
    description: 'Disney, Marvel, Star Wars',
    authType: 'mock',
    isImplemented: false,
    requiresSubscription: true,
    features: {
      liveGames: false,
      onDemand: true,
      dvr: false,
      multipleStreams: true
    }
  },
  'peacock': {
    id: 'peacock',
    name: 'Peacock',
    icon: '🦚',
    description: 'NBCUniversal content & sports',
    authType: 'mock',
    isImplemented: false,
    requiresSubscription: true,
    features: {
      liveGames: true,
      onDemand: true,
      dvr: false,
      multipleStreams: true
    }
  },
  'directv-stream': {
    id: 'directv-stream',
    name: 'DirecTV Stream',
    icon: '📡',
    description: 'Live & on-demand streaming',
    authType: 'mock',
    isImplemented: false,
    requiresSubscription: true,
    features: {
      liveGames: true,
      onDemand: true,
      dvr: true,
      multipleStreams: true
    }
  },
  'sling': {
    id: 'sling',
    name: 'Sling',
    icon: '📻',
    description: 'Customizable live TV packages',
    authType: 'mock',
    isImplemented: false,
    requiresSubscription: true,
    features: {
      liveGames: true,
      onDemand: false,
      dvr: true,
      multipleStreams: false
    }
  }
}

// OAuth configuration for Prime Video
export const PRIME_VIDEO_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_PRIME_CLIENT_ID || 'demo-client-id',
  clientSecret: process.env.PRIME_CLIENT_SECRET || 'demo-client-secret',
  redirectUri: process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/prime-video`
    : 'http://localhost:3000/api/auth/callback/prime-video',
  scope: 'profile video:access',
  authEndpoint: 'https://www.amazon.com/ap/oa',
  tokenEndpoint: 'https://api.amazon.com/auth/o2/token',
  userInfoEndpoint: 'https://api.amazon.com/user/profile'
}