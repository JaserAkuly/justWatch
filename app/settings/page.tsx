'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { UserService } from '@/types/database'
import { Tv2, ArrowLeft, Save, Loader2, User, Link2, Shield } from 'lucide-react'
import Link from 'next/link'

const STREAMING_SERVICES = [
  { id: 'espn-plus', name: 'ESPN+', description: 'Live sports, original shows, and exclusive content' },
  { id: 'youtube-tv', name: 'YouTubeTV', description: 'Cable-free live TV with 100+ channels' },
  { id: 'hulu', name: 'Hulu', description: 'Hit shows, movies, Hulu Originals, and live TV' },
  { id: 'disney-plus', name: 'Disney+', description: 'Disney, Pixar, Marvel, Star Wars, and National Geographic' },
  { id: 'peacock', name: 'Peacock', description: 'Live sports, news, and premium entertainment' },
  { id: 'prime-video', name: 'Prime Video', description: 'Movies, TV shows, and Amazon Originals' },
  { id: 'directv-stream', name: 'DirecTV Stream', description: 'Live and on-demand TV streaming' },
  { id: 'sling', name: 'Sling', description: 'Customizable live TV streaming packages' },
]

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState<Map<string, boolean>>(new Map())
  const [originalServices, setOriginalServices] = useState<Map<string, boolean>>(new Map())
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserAndServices()
  }, [])

  const loadUserAndServices = async () => {
    try {
      // Check for demo mode
      const isDemoMode = localStorage.getItem('demo-mode') === 'true'
      
      if (isDemoMode) {
        const demoUser = JSON.parse(localStorage.getItem('demo-user') || '{}')
        setUser(demoUser)
        
        const serviceMap = new Map<string, boolean>()
        STREAMING_SERVICES.forEach(service => {
          serviceMap.set(service.id, demoUser.connected_services?.includes(service.id) || false)
        })
        
        setServices(serviceMap)
        setOriginalServices(new Map(serviceMap))
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load user services
      const { data: userServices } = await supabase
        .from('user_services')
        .select('*')
        .eq('user_id', user.id)

      const serviceMap = new Map<string, boolean>()
      
      // Initialize all services as disconnected
      STREAMING_SERVICES.forEach(service => {
        serviceMap.set(service.id, false)
      })

      // Update with actual user services
      if (userServices && userServices.length > 0) {
        userServices.forEach((service: UserService) => {
          serviceMap.set(service.service_name, service.connected)
        })
      }

      setServices(serviceMap)
      setOriginalServices(new Map(serviceMap))
    } catch (error) {
      console.error('Error loading user and services:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    const newServices = new Map(services)
    newServices.set(serviceId, !newServices.get(serviceId))
    setServices(newServices)
  }

  const hasChanges = () => {
    for (const [key, value] of services) {
      if (originalServices.get(key) !== value) return true
    }
    return false
  }

  const saveChanges = async () => {
    if (!user) return

    setSaving(true)
    try {
      const isDemoMode = localStorage.getItem('demo-mode') === 'true'
      
      if (isDemoMode) {
        // Update demo user data
        const demoUser = JSON.parse(localStorage.getItem('demo-user') || '{}')
        const connectedServices = Array.from(services.entries())
          .filter(([_, connected]) => connected)
          .map(([serviceId, _]) => serviceId)
        
        demoUser.connected_services = connectedServices
        localStorage.setItem('demo-user', JSON.stringify(demoUser))
        
        setOriginalServices(new Map(services))
        alert('✅ Demo settings updated!\n\nIn a real app, these would be saved to your account.')
        setSaving(false)
        return
      }

      // Real save logic for authenticated users
      const updates: any[] = []

      for (const [serviceId, connected] of services) {
        if (originalServices.get(serviceId) !== connected) {
          updates.push({
            user_id: user.id,
            service_name: serviceId,
            connected
          })
        }
      }

      if (updates.length > 0) {
        // Delete existing entries for this user
        await supabase
          .from('user_services')
          .delete()
          .eq('user_id', user.id)
          .in('service_name', updates.map(u => u.service_name))

        // Insert new/updated entries
        const { error } = await supabase
          .from('user_services')
          .insert(updates as any)

        if (error) throw error

        setOriginalServices(new Map(services))
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Tv2 className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Tv2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Settings</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">Name</Label>
                <p className="font-medium">{user?.user_metadata?.name || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Email</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Account Created</Label>
                <p className="font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Services */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  <CardTitle>Connected Services</CardTitle>
                </div>
                <CardDescription>
                  Select the streaming services you have access to
                </CardDescription>
              </div>
              {hasChanges() && (
                <Button onClick={saveChanges} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {STREAMING_SERVICES.map(service => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <Label htmlFor={service.id} className="text-base font-medium cursor-pointer">
                      {service.name}
                    </Label>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <Switch
                    id={service.id}
                    checked={services.get(service.id) || false}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Download My Data
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}