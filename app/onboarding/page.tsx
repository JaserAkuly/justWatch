'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Tv2, Check, ChevronRight, Loader2 } from 'lucide-react'

const STREAMING_SERVICES = [
  { id: 'espn-plus', name: 'ESPN+', icon: '🏈', description: 'Live sports, originals & exclusives' },
  { id: 'youtube-tv', name: 'YouTubeTV', icon: '📺', description: 'Live TV with 100+ channels' },
  { id: 'hulu', name: 'Hulu', icon: '🟢', description: 'Shows, movies & live TV' },
  { id: 'disney-plus', name: 'Disney+', icon: '🏰', description: 'Disney, Marvel, Star Wars' },
  { id: 'peacock', name: 'Peacock', icon: '🦚', description: 'NBCUniversal content & sports' },
  { id: 'prime-video', name: 'Prime Video', icon: '📦', description: 'Movies, shows & originals' },
  { id: 'directv-stream', name: 'DirecTV Stream', icon: '📡', description: 'Live & on-demand streaming' },
  { id: 'sling', name: 'Sling', icon: '📻', description: 'Customizable live TV packages' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) throw error

      if (data.user) {
        setStep(2)
      }
    } catch (error: any) {
      alert(error.message || 'Error creating account')
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices)
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
    } else {
      newSelected.add(serviceId)
    }
    setSelectedServices(newSelected)
  }

  const saveServices = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('No user found')

      // Save selected services
      const services = Array.from(selectedServices).map(serviceId => ({
        user_id: user.id,
        service_name: serviceId,
        connected: true,
      }))

      if (services.length > 0) {
        const { error } = await supabase
          .from('user_services')
          .insert(services as any)

        if (error) throw error
      }

      setStep(3)
    } catch (error: any) {
      alert(error.message || 'Error saving services')
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen gradient-secondary flex items-center justify-center p-4 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 gradient-primary rounded-full opacity-5 float"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 gradient-primary rounded-full opacity-5 float" style={{animationDelay: "2s"}}></div>
      </div>
      
      <Card className="w-full max-w-2xl glass border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="gradient-primary p-4 rounded-2xl">
              <Tv2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome to Television
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Let's get you set up in just a few steps
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between mb-4">
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 1 ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <span className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Account
                </span>
              </div>
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 2 ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Services
                </span>
              </div>
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 3 ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  3
                </div>
                <span className={`text-sm font-medium ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Complete
                </span>
              </div>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Create Account */}
          {step === 1 && (
            <div className="space-y-6 stagger-item">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">Create Your Account</h3>
                <p className="text-muted-foreground">Join thousands of sports fans</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="mt-1 bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="mt-1 bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="mt-1 bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSignUp} 
                className="w-full gradient-primary text-white hover-lift py-6 text-lg font-semibold" 
                disabled={loading || !email || !password || !name}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Connect Services */}
          {step === 2 && (
            <div className="stagger-item">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Services</h3>
                <p className="text-muted-foreground">
                  Select the streaming services you have access to. You can change these anytime.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mb-8">
                {STREAMING_SERVICES.map((service, index) => (
                  <div
                    key={service.id}
                    className={`group service-card p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedServices.has(service.id)
                        ? 'gradient-primary text-white shadow-lg scale-[1.02]'
                        : 'glass border border-border/50 hover:border-primary/30 hover:shadow-md'
                    }`}
                    onClick={() => toggleService(service.id)}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl p-3 rounded-xl transition-all duration-300 ${
                          selectedServices.has(service.id) 
                            ? 'bg-white/20' 
                            : 'bg-muted/50 group-hover:bg-primary/10'
                        }`}>
                          {service.icon}
                        </div>
                        <div>
                          <div className={`font-semibold ${
                            selectedServices.has(service.id) ? 'text-white' : 'text-foreground'
                          }`}>
                            {service.name}
                          </div>
                          <div className={`text-sm ${
                            selectedServices.has(service.id) ? 'text-white/80' : 'text-muted-foreground'
                          }`}>
                            {service.description}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={selectedServices.has(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                        className="ml-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(3)} 
                  className="flex-1 py-6 text-base bg-background/50 backdrop-blur-sm"
                >
                  Skip for Now
                </Button>
                <Button 
                  onClick={saveServices} 
                  className="flex-1 gradient-primary text-white hover-lift py-6 text-base font-semibold" 
                  disabled={loading || selectedServices.size === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue ({selectedServices.size} selected)
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center py-12 stagger-item">
              <div className="mb-8">
                <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 glow">
                  <Check className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">You're All Set!</h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                  Your account is ready and your streaming services are connected. 
                  Let's find some amazing games to watch!
                </p>
                
                {/* Success stats */}
                <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                  <div className="glass p-4 rounded-xl">
                    <div className="text-2xl font-bold text-primary">{selectedServices.size}</div>
                    <div className="text-sm text-muted-foreground">Services Connected</div>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <div className="text-2xl font-bold text-primary">∞</div>
                    <div className="text-sm text-muted-foreground">Games Available</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={completeOnboarding} 
                size="lg" 
                className="gradient-primary text-white hover-lift text-lg px-12 py-6 font-semibold glow"
              >
                Enter Dashboard
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}