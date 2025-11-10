import { NextRequest, NextResponse } from 'next/server'
import { SportsAggregator, STREAMING_SERVICES } from '@/lib/providers/sports-aggregator'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const servicesParam = searchParams.get('services')
    const refresh = searchParams.get('refresh') === 'true'
    
    // Parse user's selected streaming services
    const selectedServices = servicesParam 
      ? servicesParam.split(',').filter(id => STREAMING_SERVICES[id])
      : Object.keys(STREAMING_SERVICES)

    const aggregator = new SportsAggregator()
    
    if (refresh) {
      // Fetch fresh content and sync to database
      console.log('Fetching fresh sports content...')
      const liveGames = await aggregator.fetchLiveContent(selectedServices)
      await aggregator.syncContentToDatabase(liveGames)
      
      return NextResponse.json({
        games: liveGames,
        services: selectedServices,
        lastUpdated: new Date().toISOString(),
        source: 'live_fetch'
      })
    } else {
      // Return cached content from database
      const supabase = await createClient()
      const { data: cachedGames, error } = await supabase
        .from('live_games')
        .select('*')
        .order('start_time', { ascending: true })

      if (error) {
        console.error('Error fetching cached games:', error)
        // Fallback to live fetch
        const liveGames = await aggregator.fetchLiveContent(selectedServices)
        return NextResponse.json({
          games: liveGames,
          services: selectedServices,
          lastUpdated: new Date().toISOString(),
          source: 'live_fetch_fallback'
        })
      }

      // Filter games by user's selected services
      const filteredGames = cachedGames?.filter((game: any) => 
        selectedServices.includes(game.app)
      ) || []

      return NextResponse.json({
        games: filteredGames.map((game: any) => ({
          id: game.id,
          title: game.match,
          league: game.league,
          teams: game.match.includes(' vs ') ? game.match.split(' vs ') : [game.match],
          startTime: game.start_time,
          isLive: game.is_live,
          isUpcoming: new Date(game.start_time) > new Date(),
          network: game.network,
          streamingService: game.app,
          deepLink: game.link,
          description: `Watch on ${game.network}`
        })),
        services: selectedServices,
        lastUpdated: (cachedGames as any)?.[0]?.created_at || new Date().toISOString(),
        source: 'database_cache'
      })
    }
  } catch (error) {
    console.error('Error in /api/sports/live:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sports content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Trigger a fresh content sync
    const { selectedServices } = await request.json()
    
    const validServices = selectedServices?.filter((id: string) => 
      STREAMING_SERVICES[id]
    ) || Object.keys(STREAMING_SERVICES)

    const aggregator = new SportsAggregator()
    console.log('Syncing fresh content for services:', validServices)
    
    const liveGames = await aggregator.fetchLiveContent(validServices)
    await aggregator.syncContentToDatabase(liveGames)

    return NextResponse.json({
      success: true,
      gamesCount: liveGames.length,
      services: validServices,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error syncing sports content:', error)
    return NextResponse.json(
      { error: 'Failed to sync sports content' },
      { status: 500 }
    )
  }
}