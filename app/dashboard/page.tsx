'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { LiveGame, UserService } from '@/types/database'
import { Tv2, PlayCircle, Settings, LogOut, Clock, Radio, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { STREAMING_SERVICES } from '@/lib/providers/sports-aggregator'

interface LiveSportsGame {
  id: string
  title: string
  league: string
  teams: string[]
  startTime: string
  isLive: boolean
  isUpcoming: boolean
  network: string
  streamingService: string
  deepLink: string
  description?: string
}

export default function DashboardPage() {
  const [games, setGames] = useState<LiveSportsGame[]>([])
  const [userServices, setUserServices] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedLeague, setSelectedLeague] = useState<string>('all')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      refreshSportsContent()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      // Check for demo mode
      const isDemoMode = localStorage.getItem('demo-mode') === 'true'
      
      if (isDemoMode) {
        const demoUser = JSON.parse(localStorage.getItem('demo-user') || '{}')
        setUser(demoUser)
        const services = demoUser.connected_services || Object.keys(STREAMING_SERVICES).slice(0, 4)
        setUserServices(new Set(services))
        await loadSportsContent(services)
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

      const connectedServices = services?.map((s: UserService) => s.service_name) || []
      setUserServices(new Set(connectedServices))
      
      await loadSportsContent(connectedServices)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSportsContent = async (services: string[]) => {
    try {
      const serviceIds = services.length > 0 ? services.join(',') : Object.keys(STREAMING_SERVICES).join(',')
      const response = await fetch(`/api/sports/live?services=${serviceIds}`)
      const data = await response.json()
      
      if (data.games) {
        setGames(data.games)
        setLastUpdated(data.lastUpdated)
      }
    } catch (error) {
      console.error('Error loading sports content:', error)
    }
  }

  const refreshSportsContent = async () => {
    if (refreshing) return
    
    setRefreshing(true)
    try {
      const serviceIds = Array.from(userServices)
      const serviceQuery = serviceIds.length > 0 ? serviceIds.join(',') : Object.keys(STREAMING_SERVICES).join(',')
      
      const response = await fetch(`/api/sports/live?services=${serviceQuery}&refresh=true`)
      const data = await response.json()
      
      if (data.games) {
        setGames(data.games)
        setLastUpdated(data.lastUpdated)
      }
    } catch (error) {
      console.error('Error refreshing sports content:', error)
    } finally {
      setRefreshing(false)
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

  const handleWatchNow = (game: LiveSportsGame) => {
    if (userServices.has(game.streamingService)) {
      // In production: window.location.href = game.deepLink
      // For MVP demo: Show realistic popup
      const serviceName = STREAMING_SERVICES[game.streamingService]?.name || game.network
      const watchMessage = `🎉 Opening ${serviceName} app...\n\n` +
        `Game: ${game.title}\n` +
        `Network: ${game.network}\n` +
        `Deep Link: ${game.deepLink}\n\n` +
        `In production, this would automatically open the ${serviceName} app and take you directly to this live game!\n\n` +
        `🔗 URL that would open: ${game.deepLink}`
      
      alert(watchMessage)
    } else {
      const serviceName = STREAMING_SERVICES[game.streamingService]?.name || game.network
      alert(`❌ ${serviceName} not connected\n\nTo watch this game, please connect ${serviceName} in your settings first.`)
    }
  }

  const isServiceConnected = (streamingService: string): boolean => {
    return userServices.has(streamingService)
  }

  const leagues = ['all', ...new Set(games.map(g => g.league))]
  const filteredGames = selectedLeague === 'all' 
    ? games 
    : games.filter(g => g.league === selectedLeague)

  const liveGames = filteredGames.filter(g => g.isLive)
  const upcomingGames = filteredGames.filter(g => !g.isLive)

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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshSportsContent}
                disabled={refreshing}
                className="hover-lift"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {refreshing ? 'Updating...' : 'Refresh'}
                </span>
              </Button>
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
                    <CardTitle className="text-lg font-bold text-foreground leading-tight">{game.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-xl">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{game.network}</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{STREAMING_SERVICES[game.streamingService]?.name || game.network}</span>
                      </div>
                      {isServiceConnected(game.streamingService) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    {isServiceConnected(game.streamingService) ? (
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
                        Connect {STREAMING_SERVICES[game.streamingService]?.name || game.network}
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
                        {new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-medium bg-background/50 backdrop-blur-sm">
                        {game.league}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground leading-tight">{game.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-xl">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{game.network}</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium">{STREAMING_SERVICES[game.streamingService]?.name || game.network}</span>
                      </div>
                      {isServiceConnected(game.streamingService) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    {isServiceConnected(game.streamingService) ? (
                      <Button variant="outline" className="w-full bg-background/50 backdrop-blur-sm hover-lift" disabled>
                        <Clock className="mr-2 h-4 w-4" />
                        Starts Soon
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full bg-muted/50 text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Connect {STREAMING_SERVICES[game.streamingService]?.name || game.network}
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