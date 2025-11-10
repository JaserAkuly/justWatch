'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { UserService } from '@/types/database'
import { Tv2, ArrowLeft, Save, Loader2, User, Link2, Shield, Zap, Play, ExternalLink, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { STREAMING_PROVIDERS } from '@/lib/providers/config'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'

const STREAMING_SERVICES = Object.values(STREAMING_PROVIDERS)

function SettingsPageContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState<Map<string, boolean>>(new Map())
  const [originalServices, setOriginalServices] = useState<Map<string, boolean>>(new Map())
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadUserAndServices()
    
    // Check for provider callback notifications
    const providerConnected = searchParams.get('provider_connected')
    const providerError = searchParams.get('provider_error')
    
    if (providerConnected) {
      setNotification({
        type: 'success',
        message: `Successfully connected to ${STREAMING_PROVIDERS[providerConnected]?.name || providerConnected}!`
      })
      // Clear URL params
      router.replace('/settings')
    } else if (providerError) {
      const errorMessages = {
        invalid_request: 'Invalid authentication request. Please try again.',
        invalid_state: 'Security validation failed. Please try again.',
        connection_failed: 'Failed to connect to the provider. Please check your account and try again.',
        unsupported_provider: 'This provider is not yet supported.',
      }
      setNotification({
        type: 'error',
        message: errorMessages[providerError as keyof typeof errorMessages] || 'Unknown error occurred.'
      })
      router.replace('/settings')
    }
  }, [searchParams])

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

  const connectProvider = async (providerId: string) => {
    const provider = STREAMING_PROVIDERS[providerId]
    
    if (!provider.isImplemented) {
      // For mock providers, just enable the service
      const newServices = new Map(services)
      newServices.set(providerId, true)
      setServices(newServices)
      return
    }

    if (provider.authType === 'oauth') {
      setConnectingProvider(providerId)
      try {
        // Redirect to OAuth flow
        window.location.href = `/api/auth/providers/${providerId}`
      } catch (error) {
        console.error('Error initiating OAuth:', error)
        setNotification({
          type: 'error',
          message: `Failed to initiate connection to ${provider.name}`
        })
        setConnectingProvider(null)
      }
    }
  }

  const disconnectProvider = async (providerId: string) => {
    if (!user) return
    
    const provider = STREAMING_PROVIDERS[providerId]
    
    if (!provider.isImplemented) {
      // For mock providers, just toggle off
      const newServices = new Map(services)
      newServices.set(providerId, false)
      setServices(newServices)
      return
    }

    try {
      // For real providers, revoke the connection
      const response = await fetch(`/api/auth/providers/${providerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const newServices = new Map(services)
        newServices.set(providerId, false)
        setServices(newServices)
        
        setNotification({
          type: 'success',
          message: `Disconnected from ${provider.name}`
        })
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('Error disconnecting provider:', error)
      setNotification({
        type: 'error',
        message: `Failed to disconnect from ${provider.name}`
      })
    }
  }

  const toggleService = (serviceId: string) => {
    const isConnected = services.get(serviceId)
    
    if (isConnected) {
      disconnectProvider(serviceId)
    } else {
      connectProvider(serviceId)
    }
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
        
        {/* Notification */}
        {notification && (
          <Alert className={`mb-6 ${
            notification.type === 'success' ? 'border-green-500' : 
            notification.type === 'error' ? 'border-red-500' : 'border-blue-500'
          }`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}
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
              {STREAMING_SERVICES.map(service => {
                const isConnected = services.get(service.id) || false
                const isConnecting = connectingProvider === service.id
                
                return (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      service.isImplemented 
                        ? 'border-green-200 bg-green-50/30' 
                        : 'border-gray-200 bg-gray-50/30'
                    } hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">{service.icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Label className="text-base font-semibold cursor-pointer">
                                {service.name}
                              </Label>
                              {service.isImplemented ? (
                                <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  <Zap className="h-3 w-3" />
                                  LIVE
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  <Play className="h-3 w-3" />
                                  DEMO
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            {service.isImplemented && isConnected && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Authenticated • Live content available
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Features */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {service.features?.liveGames && <span className="bg-gray-100 px-2 py-1 rounded">Live Games</span>}
                          {service.features?.onDemand && <span className="bg-gray-100 px-2 py-1 rounded">On Demand</span>}
                          {service.features?.dvr && <span className="bg-gray-100 px-2 py-1 rounded">DVR</span>}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {service.isImplemented ? (
                          <>
                            {isConnected ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => disconnectProvider(service.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Disconnect
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => connectProvider(service.id)}
                                disabled={isConnecting}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isConnecting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Connect
                                  </>
                                )}
                              </Button>
                            )}
                            {isConnected && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                Connected
                              </div>
                            )}
                          </>
                        ) : (
                          <Switch
                            checked={isConnected}
                            onCheckedChange={() => toggleService(service.id)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
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

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Tv2 className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  )
}