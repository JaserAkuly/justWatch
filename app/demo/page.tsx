'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Tv2, PlayCircle, Zap, Users } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()
  const supabase = createClient()

  const startDemoOnboarding = () => {
    // Set demo mode flag for onboarding
    localStorage.setItem('demo-mode', 'true')
    localStorage.setItem('demo-onboarding', 'true')
    
    // Set minimal demo user data for onboarding
    localStorage.setItem('demo-user', JSON.stringify({
      id: 'demo-user-123',
      email: 'demo@television.app',
      name: 'Demo User',
      connected_services: [] // Start with no services selected
    }))
    
    // Also set cookie for middleware
    document.cookie = 'demo-mode=true; path=/; max-age=86400'
    
    // Redirect to onboarding at step 2
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Tv2 className="h-16 w-16 text-blue-600" />
          </div>
          <CardTitle className="text-3xl mb-2">Television Demo</CardTitle>
          <CardDescription className="text-lg">
            Experience the full Television app with mock data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <PlayCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold">15+ Live Games</h4>
              <p className="text-sm text-gray-600">NBA, NFL, NHL, Soccer & more</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold">One-Tap Watch</h4>
              <p className="text-sm text-gray-600">Instant deep links to apps</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold">Connected Services</h4>
              <p className="text-sm text-gray-600">ESPN+, YouTubeTV, Hulu+</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Demo Includes:</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Pre-configured demo account (demo@television.app)</li>
              <li>• Connected streaming services (ESPN+, YouTubeTV, Hulu, Peacock)</li>
              <li>• Live games with working "Watch Now" buttons</li>
              <li>• Complete settings management</li>
              <li>• Responsive design on all devices</li>
            </ul>
          </div>

          <Button onClick={startDemoOnboarding} size="lg" className="w-full text-lg py-6">
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Demo Experience
          </Button>

          <div className="text-center text-sm text-gray-500">
            This demo uses mock data and simulated authentication.
            <br />
            No real accounts or services are connected.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}