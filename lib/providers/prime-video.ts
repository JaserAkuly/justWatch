import { getProviderToken } from '@/lib/auth/oauth'
import { createClient } from '@/lib/supabase/client'

export interface PrimeVideoContent {
  id: string
  title: string
  type: 'live' | 'upcoming' | 'replay'
  league?: string
  teams?: string[]
  startTime: Date
  endTime?: Date
  deepLink: string
  thumbnailUrl?: string
  description?: string
  isLive: boolean
}

export class PrimeVideoProvider {
  private accessToken: string | null = null
  private userId: string

  constructor(userId: string, accessToken?: string) {
    this.userId = userId
    this.accessToken = accessToken || null
  }

  async authenticate(): Promise<boolean> {
    if (this.accessToken) return true

    const tokenData = await getProviderToken(this.userId, 'prime-video')
    if (!tokenData?.access_token) return false

    this.accessToken = tokenData.access_token
    return true
  }

  async getLiveGames(): Promise<PrimeVideoContent[]> {
    // For beta/demo, return mock Prime Video content
    // In production, this would call the actual Prime Video API
    
    const now = new Date()
    const mockContent: PrimeVideoContent[] = [
      {
        id: 'prime-tnf-dolphins-jets',
        title: 'Thursday Night Football: Dolphins vs Jets',
        type: 'live',
        league: 'NFL',
        teams: ['Miami Dolphins', 'New York Jets'],
        startTime: new Date(now.getTime() - 30 * 60 * 1000), // Started 30 min ago
        endTime: new Date(now.getTime() + 150 * 60 * 1000), // Ends in 2.5 hours
        deepLink: 'aiv://aiv/play?gti=amzn1.dv.gti.prime-tnf-dolphins-jets',
        thumbnailUrl: '/api/placeholder/400/225',
        description: 'Live NFL Thursday Night Football exclusive on Prime Video',
        isLive: true
      },
      {
        id: 'prime-uefa-arsenal-psg',
        title: 'UEFA Champions League: Arsenal vs PSG',
        type: 'upcoming',
        league: 'Soccer',
        teams: ['Arsenal', 'Paris Saint-Germain'],
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // In 2 hours
        endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // Ends in 4 hours
        deepLink: 'aiv://aiv/play?gti=amzn1.dv.gti.prime-uefa-arsenal-psg',
        thumbnailUrl: '/api/placeholder/400/225',
        description: 'Champions League match streaming live on Prime Video',
        isLive: false
      },
      {
        id: 'prime-college-oregon-washington',
        title: 'College Football: Oregon vs Washington',
        type: 'upcoming',
        league: 'College Football',
        teams: ['Oregon Ducks', 'Washington Huskies'],
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(now.getTime() + 27 * 60 * 60 * 1000),
        deepLink: 'aiv://aiv/play?gti=amzn1.dv.gti.prime-college-oregon-washington',
        thumbnailUrl: '/api/placeholder/400/225',
        description: 'Pac-12 Championship Game streaming on Prime Video',
        isLive: false
      }
    ]

    return mockContent
  }

  async getOnDemandContent(): Promise<PrimeVideoContent[]> {
    // Return recently aired games available for replay
    const now = new Date()
    
    return [
      {
        id: 'prime-replay-chiefs-bengals',
        title: 'NFL Replay: Chiefs vs Bengals',
        type: 'replay',
        league: 'NFL',
        teams: ['Kansas City Chiefs', 'Cincinnati Bengals'],
        startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        deepLink: 'aiv://aiv/play?gti=amzn1.dv.gti.prime-replay-chiefs-bengals',
        thumbnailUrl: '/api/placeholder/400/225',
        description: 'Full game replay from last Thursday Night Football',
        isLive: false
      }
    ]
  }

  async syncContentToDatabase(): Promise<void> {
    const supabase = createClient()
    
    try {
      const [liveContent, replayContent] = await Promise.all([
        this.getLiveGames(),
        this.getOnDemandContent()
      ])

      const allContent = [...liveContent, ...replayContent]

      // Sync content to provider_content table
      for (const content of allContent) {
        await supabase
          .from('provider_content')
          .upsert({
            provider_name: 'prime-video',
            content_id: content.id,
            content_type: 'game',
            title: content.title,
            league: content.league,
            teams: content.teams || [],
            start_time: content.startTime.toISOString(),
            end_time: content.endTime?.toISOString(),
            deep_link: content.deepLink,
            thumbnail_url: content.thumbnailUrl,
            metadata: {
              type: content.type,
              description: content.description,
              is_live: content.isLive
            }
          } as any)
      }

      console.log(`Synced ${allContent.length} Prime Video content items`)
    } catch (error) {
      console.error('Error syncing Prime Video content:', error)
    }
  }

  static async getContentForUser(userId: string): Promise<PrimeVideoContent[]> {
    const provider = new PrimeVideoProvider(userId)
    
    if (!(await provider.authenticate())) {
      return [] // User not connected to Prime Video
    }

    const [liveGames, onDemand] = await Promise.all([
      provider.getLiveGames(),
      provider.getOnDemandContent()
    ])

    return [...liveGames, ...onDemand]
  }

  static generateDeepLink(contentId: string, userId?: string): string {
    // Generate Prime Video deep link
    return `aiv://aiv/play?gti=${contentId}&ref=television_app`
  }

  static isUserConnected(userId: string): Promise<boolean> {
    return getProviderToken(userId, 'prime-video').then(token => !!token)
  }
}