'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { LiveGame, UserService } from '@/types/database'
import { Tv2, PlayCircle, Settings, LogOut, Clock, Radio, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Rich mock data for demonstration
const MOCK_GAMES: LiveGame[] = [
  // Live Games
  { id: '1', league: 'NBA', match: 'Lakers vs Warriors', network: 'ESPN', app: 'ESPN+', link: 'espn://live/nba-lakers-warriors', start_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(), is_live: true },
  { id: '2', league: 'NBA', match: 'Celtics vs Heat', network: 'TNT', app: 'Hulu', link: 'hulu://live/nba-celtics-heat', start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), is_live: true },
  { id: '3', league: 'NBA', match: 'Mavericks vs Nuggets', network: 'ABC', app: 'YouTubeTV', link: 'youtubetv://live/nba-mavs-nuggets', start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), is_live: true },
  
  { id: '4', league: 'NFL', match: 'Cowboys vs Eagles', network: 'FOX', app: 'YouTubeTV', link: 'youtubetv://live/nfl-cowboys-eagles', start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), is_live: true },
  { id: '5', league: 'NFL', match: 'Chiefs vs Raiders', network: 'CBS', app: 'DirecTV Stream', link: 'directv://live/nfl-chiefs-raiders', start_time: new Date(Date.now() - 20 * 60 * 1000).toISOString(), is_live: true },
  
  { id: '6', league: 'NHL', match: 'Rangers vs Bruins', network: 'ESPN', app: 'ESPN+', link: 'espn://live/nhl-rangers-bruins', start_time: new Date(Date.now() - 40 * 60 * 1000).toISOString(), is_live: true },
  { id: '7', league: 'NHL', match: 'Lightning vs Panthers', network: 'TNT', app: 'Hulu', link: 'hulu://live/nhl-lightning-panthers', start_time: new Date(Date.now() - 25 * 60 * 1000).toISOString(), is_live: true },
  
  { id: '8', league: 'Soccer', match: 'Man United vs Liverpool', network: 'NBC', app: 'Peacock', link: 'peacock://live/soccer-manutd-liverpool', start_time: new Date(Date.now() - 50 * 60 * 1000).toISOString(), is_live: true },
  { id: '9', league: 'Soccer', match: 'Chelsea vs Arsenal', network: 'USA', app: 'Disney+', link: 'disney://live/soccer-chelsea-arsenal', start_time: new Date(Date.now() - 35 * 60 * 1000).toISOString(), is_live: true },
  
  { id: '10', league: 'MLB', match: 'Yankees vs Red Sox', network: 'FOX', app: 'YouTubeTV', link: 'youtubetv://live/mlb-yankees-redsox', start_time: new Date(Date.now() - 90 * 60 * 1000).toISOString(), is_live: true },
  
  // Upcoming Games
  { id: '11', league: 'NBA', match: 'Bucks vs 76ers', network: 'ESPN', app: 'ESPN+', link: 'espn://live/nba-bucks-sixers', start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), is_live: false },
  { id: '12', league: 'NBA', match: 'Suns vs Clippers', network: 'TNT', app: 'Hulu', link: 'hulu://live/nba-suns-clippers', start_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), is_live: false },
  { id: '13', league: 'NFL', match: 'Packers vs Bears', network: 'NBC', app: 'Peacock', link: 'peacock://live/nfl-packers-bears', start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), is_live: false },
  { id: '14', league: 'NFL', match: 'Bills vs Dolphins', network: 'ESPN', app: 'ESPN+', link: 'espn://live/nfl-bills-dolphins', start_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), is_live: false },
  { id: '15', league: 'NHL', match: 'Avalanche vs Stars', network: 'ESPN+', app: 'ESPN+', link: 'espn://live/nhl-avs-stars', start_time: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(), is_live: false },
  { id: '16', league: 'Soccer', match: 'Barcelona vs Real Madrid', network: 'ESPN+', app: 'ESPN+', link: 'espn://live/soccer-barca-real', start_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), is_live: false },
  { id: '17', league: 'College Football', match: 'Alabama vs Auburn', network: 'CBS', app: 'Prime Video', link: 'primevideo://live/cfb-alabama-auburn', start_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), is_live: false },
  { id: '18', league: 'College Basketball', match: 'Duke vs UNC', network: 'ESPN', app: 'ESPN+', link: 'espn://live/cbb-duke-unc', start_time: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(), is_live: false },
]

const SERVICE_MAP: { [key: string]: string } = {
  'ESPN+': 'espn-plus',
  'YouTubeTV': 'youtube-tv',
  'Hulu': 'hulu',
  'Disney+': 'disney-plus',
  'Peacock': 'peacock',
  'Prime Video': 'prime-video',
  'DirecTV Stream': 'directv-stream',
  'Sling': 'sling',
}

export default function DashboardPage() {
  const [games, setGames] = useState<LiveGame[]>([])
  const [userServices, setUserServices] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedLeague, setSelectedLeague] = useState<string>('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Check for demo mode
      const isDemoMode = localStorage.getItem('demo-mode') === 'true'
      
      if (isDemoMode) {
        const demoUser = JSON.parse(localStorage.getItem('demo-user') || '{}')
        setUser(demoUser)
        setUserServices(new Set(demoUser.connected_services || ['espn-plus', 'youtube-tv', 'hulu', 'peacock']))
        setGames(MOCK_GAMES)
        setLoading(false)
        return
      }

      // Regular auth flow
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load user services
      const { data: services } = await supabase
        .from('user_services')
        .select('*')
        .eq('user_id', user.id)
        .eq('connected', true)

      if (services && services.length > 0) {
        setUserServices(new Set(services.map((s: UserService) => s.service_name)))
      }

      // For demo, use mock data
      // In production, you would fetch from: await supabase.from('live_games').select('*').eq('is_live', true)
      setGames(MOCK_GAMES)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const isDemoMode = localStorage.getItem('demo-mode') === 'true'
    
    if (isDemoMode) {
      localStorage.removeItem('demo-mode')
      localStorage.removeItem('demo-user')
      // Clear demo cookie
      document.cookie = 'demo-mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/')
      return
    }
    
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleWatchNow = (game: LiveGame) => {
    const serviceId = SERVICE_MAP[game.app]
    if (userServices.has(serviceId)) {
      // Show a realistic demo popup
      const watchMessage = `🎉 Opening ${game.app} app...\n\n` +
        `Game: ${game.match}\n` +
        `Network: ${game.network}\n` +
        `Deep Link: ${game.link}\n\n` +
        `In production, this would automatically open the ${game.app} app and take you directly to this live game!`
      
      alert(watchMessage)
    } else {
      alert(`❌ ${game.app} not connected\n\nTo watch this game, please connect ${game.app} in your settings first.`)
    }
  }

  const isServiceConnected = (app: string): boolean => {
    const serviceId = SERVICE_MAP[app]
    return userServices.has(serviceId)
  }

  const leagues = ['all', ...new Set(games.map(g => g.league))]
  const filteredGames = selectedLeague === 'all' 
    ? games 
    : games.filter(g => g.league === selectedLeague)

  const liveGames = filteredGames.filter(g => g.is_live)
  const upcomingGames = filteredGames.filter(g => !g.is_live)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Tv2 className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-secondary">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary p-2 rounded-xl">
                <Tv2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Television
              </span>
              <Badge className="hidden sm:inline-flex gradient-primary text-white border-0 live-pulse">
                <Radio className="h-3 w-3 mr-1" />
                {liveGames.length} Live
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="hover-lift hidden sm:flex">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover-lift">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* League Filter */}
      <div className="glass border-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {leagues.map((league, index) => (
              <Button
                key={league}
                variant={selectedLeague === league ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLeague(league)}
                className={`whitespace-nowrap hover-lift ${
                  selectedLeague === league 
                    ? 'gradient-primary text-white border-0' 
                    : 'bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50'
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {league === 'all' ? 'All Sports' : league}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Games */}
        {liveGames.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="live-pulse">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Live Now</h2>
              <Badge className="gradient-primary text-white border-0 text-xs">
                {liveGames.length} games
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {liveGames.map((game, index) => (
                <Card key={game.id} className="game-card glass border-0 shadow-lg stagger-item overflow-hidden" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="live-pulse bg-red-500 text-white border-0 text-xs font-semibold">
                        ● LIVE
                      </Badge>
                      <Badge variant="outline" className="text-xs font-medium bg-background/50 backdrop-blur-sm">
                        {game.league}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground leading-tight">{game.match}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-xl">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{game.network}</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{game.app}</span>
                      </div>
                      {isServiceConnected(game.app) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    {isServiceConnected(game.app) ? (
                      <Button 
                        onClick={() => handleWatchNow(game)} 
                        className="w-full gradient-primary text-white hover-lift glow"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Watch Now
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full bg-muted/50 text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Connect {game.app}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Games */}
        {upcomingGames.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Coming Up</h2>
              <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                {upcomingGames.length} scheduled
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {upcomingGames.map((game, index) => (
                <Card key={game.id} className="game-card glass border-0 shadow-lg stagger-item overflow-hidden" style={{animationDelay: `${0.8 + index * 0.1}s`}}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="text-xs font-semibold bg-muted/50 text-foreground">
                        {new Date(game.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-medium bg-background/50 backdrop-blur-sm">
                        {game.league}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground leading-tight">{game.match}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-xl">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{game.network}</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{game.app}</span>
                      </div>
                      {isServiceConnected(game.app) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    {isServiceConnected(game.app) ? (
                      <Button variant="outline" className="w-full bg-background/50 backdrop-blur-sm hover-lift" disabled>
                        <Clock className="mr-2 h-4 w-4" />
                        Starts Soon
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full bg-muted/50 text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Connect {game.app}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <Card className="glass border-0 shadow-lg text-center py-16">
            <CardContent>
              <div className="gradient-primary p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Tv2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">No games found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try selecting a different league or check back later for more games.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}