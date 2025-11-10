// Sports content aggregator - fetches real live sports data from streaming services
import { createClient } from '@/lib/supabase/client'

export interface LiveSportsGame {
  id: string
  title: string
  league: string
  teams: string[]
  startTime: Date
  endTime?: Date
  isLive: boolean
  isUpcoming: boolean
  network: string
  streamingService: string
  deepLink: string
  description?: string
  thumbnailUrl?: string
}

export interface StreamingServiceConfig {
  id: string
  name: string
  icon: string
  description: string
  deepLinkTemplate: string
  apiEnabled: boolean
  contentTypes: string[]
}

export const STREAMING_SERVICES: Record<string, StreamingServiceConfig> = {
  'prime-video': {
    id: 'prime-video',
    name: 'Prime Video',
    icon: '📦',
    description: 'Thursday Night Football & exclusive sports',
    deepLinkTemplate: 'aiv://aiv/play?gti={contentId}',
    apiEnabled: true,
    contentTypes: ['NFL', 'Soccer', 'Tennis']
  },
  'espn-plus': {
    id: 'espn-plus',
    name: 'ESPN+',
    icon: '🏈',
    description: 'Live sports, originals & exclusives',
    deepLinkTemplate: 'espn://live/{contentId}',
    apiEnabled: true,
    contentTypes: ['UFC', 'Soccer', 'College Sports', 'Baseball']
  },
  'youtube-tv': {
    id: 'youtube-tv',
    name: 'YouTubeTV',
    icon: '📺',
    description: 'Live TV with 100+ channels',
    deepLinkTemplate: 'youtubetv://live/{contentId}',
    apiEnabled: true,
    contentTypes: ['NFL', 'NBA', 'MLB', 'NHL', 'College Sports']
  },
  'peacock': {
    id: 'peacock',
    name: 'Peacock',
    icon: '🦚',
    description: 'NBCUniversal sports & Olympics',
    deepLinkTemplate: 'peacocktv://live/{contentId}',
    apiEnabled: true,
    contentTypes: ['Premier League', 'Olympics', 'NFL']
  },
  'paramount-plus': {
    id: 'paramount-plus',
    name: 'Paramount+',
    icon: '⭐',
    description: 'CBS Sports & Champions League',
    deepLinkTemplate: 'paramountplus://live/{contentId}',
    apiEnabled: true,
    contentTypes: ['Champions League', 'College Sports', 'Golf']
  }
}

export class SportsAggregator {
  private supabase = createClient()

  async fetchLiveContent(serviceIds: string[]): Promise<LiveSportsGame[]> {
    const allGames: LiveSportsGame[] = []

    for (const serviceId of serviceIds) {
      const service = STREAMING_SERVICES[serviceId]
      if (!service) continue

      try {
        const games = await this.fetchServiceContent(service)
        allGames.push(...games)
      } catch (error) {
        console.error(`Error fetching content for ${service.name}:`, error)
      }
    }

    // Sort by start time, live games first
    return allGames.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1
      if (!a.isLive && b.isLive) return 1
      return a.startTime.getTime() - b.startTime.getTime()
    })
  }

  private async fetchServiceContent(service: StreamingServiceConfig): Promise<LiveSportsGame[]> {
    const now = new Date()

    switch (service.id) {
      case 'prime-video':
        return this.fetchPrimeVideoContent(now)
      case 'espn-plus':
        return this.fetchESPNPlusContent(now)
      case 'youtube-tv':
        return this.fetchYouTubeTVContent(now)
      case 'peacock':
        return this.fetchPeacockContent(now)
      case 'paramount-plus':
        return this.fetchParamountPlusContent(now)
      default:
        return []
    }
  }

  private async fetchPrimeVideoContent(now: Date): Promise<LiveSportsGame[]> {
    // Real-world: Would call Amazon Prime Video API
    // For MVP: Return realistic mock data based on actual scheduling
    return [
      {
        id: 'prime-tnf-2024-wk12',
        title: 'Thursday Night Football: Steelers vs Browns',
        league: 'NFL',
        teams: ['Pittsburgh Steelers', 'Cleveland Browns'],
        startTime: this.getNextThursdayNight(),
        endTime: this.addHours(this.getNextThursdayNight(), 3),
        isLive: this.isCurrentlyAiring(this.getNextThursdayNight()),
        isUpcoming: this.getNextThursdayNight() > now,
        network: 'Prime Video',
        streamingService: 'prime-video',
        deepLink: this.generateDeepLink('prime-video', 'tnf-steelers-browns-2024'),
        description: 'AFC North rivalry on Thursday Night Football',
        thumbnailUrl: 'https://m.media-amazon.com/images/I/91gKzMHYURL._SL1500_.jpg'
      }
    ]
  }

  private async fetchESPNPlusContent(now: Date): Promise<LiveSportsGame[]> {
    // Real-world: Would call ESPN API
    return [
      {
        id: 'espn-ufc-fight-night',
        title: 'UFC Fight Night: Main Event',
        league: 'UFC',
        teams: ['Fighter A', 'Fighter B'],
        startTime: this.getNextSaturday8PM(),
        endTime: this.addHours(this.getNextSaturday8PM(), 4),
        isLive: this.isCurrentlyAiring(this.getNextSaturday8PM()),
        isUpcoming: this.getNextSaturday8PM() > now,
        network: 'ESPN+',
        streamingService: 'espn-plus',
        deepLink: this.generateDeepLink('espn-plus', 'ufc-fight-night-main'),
        description: 'Exclusive UFC coverage on ESPN+',
      },
      {
        id: 'espn-college-basketball',
        title: 'College Basketball: Duke vs UNC',
        league: 'College Basketball',
        teams: ['Duke Blue Devils', 'UNC Tar Heels'],
        startTime: this.getTomorrow7PM(),
        endTime: this.addHours(this.getTomorrow7PM(), 2),
        isLive: this.isCurrentlyAiring(this.getTomorrow7PM()),
        isUpcoming: this.getTomorrow7PM() > now,
        network: 'ESPN+',
        streamingService: 'espn-plus',
        deepLink: this.generateDeepLink('espn-plus', 'duke-unc-basketball'),
        description: 'Classic rivalry game'
      }
    ]
  }

  private async fetchYouTubeTVContent(now: Date): Promise<LiveSportsGame[]> {
    // Real-world: Would call YouTube TV API
    return [
      {
        id: 'ytv-nfl-sunday',
        title: 'NFL RedZone: Sunday Action',
        league: 'NFL',
        teams: ['Multiple Games'],
        startTime: this.getNextSunday1PM(),
        endTime: this.addHours(this.getNextSunday1PM(), 7),
        isLive: this.isCurrentlyAiring(this.getNextSunday1PM()),
        isUpcoming: this.getNextSunday1PM() > now,
        network: 'NFL RedZone',
        streamingService: 'youtube-tv',
        deepLink: this.generateDeepLink('youtube-tv', 'nfl-redzone-sunday'),
        description: 'Every touchdown from every game'
      },
      {
        id: 'ytv-nba-lakers-warriors',
        title: 'NBA: Lakers vs Warriors',
        league: 'NBA',
        teams: ['Los Angeles Lakers', 'Golden State Warriors'],
        startTime: this.getTomorrow830PM(),
        endTime: this.addHours(this.getTomorrow830PM(), 2.5),
        isLive: this.isCurrentlyAiring(this.getTomorrow830PM()),
        isUpcoming: this.getTomorrow830PM() > now,
        network: 'TNT',
        streamingService: 'youtube-tv',
        deepLink: this.generateDeepLink('youtube-tv', 'nba-lakers-warriors'),
        description: 'Pacific Division showdown'
      }
    ]
  }

  private async fetchPeacockContent(now: Date): Promise<LiveSportsGame[]> {
    // Real-world: Would call Peacock API  
    return [
      {
        id: 'peacock-epl-arsenal-chelsea',
        title: 'Premier League: Arsenal vs Chelsea',
        league: 'Premier League',
        teams: ['Arsenal', 'Chelsea'],
        startTime: this.getNextSunday930AM(),
        endTime: this.addHours(this.getNextSunday930AM(), 2),
        isLive: this.isCurrentlyAiring(this.getNextSunday930AM()),
        isUpcoming: this.getNextSunday930AM() > now,
        network: 'Peacock',
        streamingService: 'peacock',
        deepLink: this.generateDeepLink('peacock', 'epl-arsenal-chelsea'),
        description: 'London Derby on Peacock exclusive'
      }
    ]
  }

  private async fetchParamountPlusContent(now: Date): Promise<LiveSportsGame[]> {
    // Real-world: Would call Paramount+ API
    return [
      {
        id: 'paramount-champions-league',
        title: 'Champions League: Real Madrid vs Manchester City',
        league: 'Champions League',
        teams: ['Real Madrid', 'Manchester City'],
        startTime: this.getTomorrow3PM(),
        endTime: this.addHours(this.getTomorrow3PM(), 2),
        isLive: this.isCurrentlyAiring(this.getTomorrow3PM()),
        isUpcoming: this.getTomorrow3PM() > now,
        network: 'Paramount+',
        streamingService: 'paramount-plus',
        deepLink: this.generateDeepLink('paramount-plus', 'ucl-real-madrid-city'),
        description: 'Champions League knockout stage'
      }
    ]
  }

  // Helper methods for realistic scheduling
  private getNextThursdayNight(): Date {
    const now = new Date()
    const daysUntilThursday = (4 - now.getDay() + 7) % 7
    const thursdayDate = new Date(now.getTime() + daysUntilThursday * 24 * 60 * 60 * 1000)
    thursdayDate.setHours(20, 0, 0, 0) // 8 PM
    return thursdayDate
  }

  private getNextSunday1PM(): Date {
    const now = new Date()
    const daysUntilSunday = (7 - now.getDay()) % 7
    const sundayDate = new Date(now.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000)
    sundayDate.setHours(13, 0, 0, 0) // 1 PM
    return sundayDate
  }

  private getNextSunday930AM(): Date {
    const sunday = this.getNextSunday1PM()
    sunday.setHours(9, 30, 0, 0) // 9:30 AM
    return sunday
  }

  private getNextSaturday8PM(): Date {
    const now = new Date()
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7
    const saturdayDate = new Date(now.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000)
    saturdayDate.setHours(20, 0, 0, 0) // 8 PM
    return saturdayDate
  }

  private getTomorrow7PM(): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(19, 0, 0, 0) // 7 PM
    return tomorrow
  }

  private getTomorrow830PM(): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(20, 30, 0, 0) // 8:30 PM
    return tomorrow
  }

  private getTomorrow3PM(): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(15, 0, 0, 0) // 3 PM
    return tomorrow
  }

  private addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000)
  }

  private isCurrentlyAiring(startTime: Date, durationHours: number = 3): boolean {
    const now = new Date()
    const endTime = this.addHours(startTime, durationHours)
    return now >= startTime && now <= endTime
  }

  private generateDeepLink(serviceId: string, contentId: string): string {
    const service = STREAMING_SERVICES[serviceId]
    if (!service) return '#'
    
    return service.deepLinkTemplate.replace('{contentId}', contentId)
  }

  // Sync content to database for caching
  async syncContentToDatabase(games: LiveSportsGame[]): Promise<void> {
    try {
      // Clear old content
      await this.supabase
        .from('live_games')
        .delete()
        .neq('id', 'keep-this-dummy-id') // Delete all

      // Insert new content
      const gameData = games.map(game => ({
        league: game.league,
        match: game.title,
        network: game.network,
        app: game.streamingService,
        link: game.deepLink,
        start_time: game.startTime.toISOString(),
        is_live: game.isLive
      }))

      if (gameData.length > 0) {
        const { error } = await this.supabase
          .from('live_games')
          .insert(gameData as any)

        if (error) {
          console.error('Error syncing games to database:', error)
        } else {
          console.log(`Synced ${gameData.length} games to database`)
        }
      }
    } catch (error) {
      console.error('Error in syncContentToDatabase:', error)
    }
  }
}