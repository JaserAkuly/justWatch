import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tv2, Zap, Trophy, PlayCircle, Star, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="glass fixed w-full top-0 z-50 border-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary p-2 rounded-xl">
                <Tv2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Television
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <Link href="/demo">
                <Button variant="ghost" size="sm" className="hover-lift">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Demo
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover-lift">
                  Sign In
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button size="sm" className="gradient-primary text-white hover-lift">
                  Get Started
                </Button>
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Link href="/demo">
                <Button size="sm" className="gradient-primary text-white">
                  Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-16">
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 gradient-secondary overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 gradient-primary rounded-full opacity-10 float"></div>
            <div className="absolute -bottom-32 -left-32 w-80 h-80 gradient-primary rounded-full opacity-5 float" style={{animationDelay: "2s"}}></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 stagger-item">
              <Star className="h-4 w-4 mr-2" />
              The future of sports streaming
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight stagger-item">
              All Your Sports,{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                One Tap Away
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed stagger-item">
              Never miss a game again. Connect your streaming services and watch any live sport 
              instantly with one click. No more searching, no more switching apps.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 stagger-item">
              <Link href="/demo">
                <Button size="lg" className="gradient-primary text-white hover-lift text-lg px-8 py-4 glow">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Try Live Demo
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 hover-lift bg-background/50 backdrop-blur-sm">
                  Get Started Free
                </Button>
              </Link>
            </div>
            
            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground stagger-item">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>10,000+ sports fans</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Instant setup</span>
              </div>
            </div>
            
            {/* Supported Services */}
            <div className="mt-20 stagger-item">
              <p className="text-sm text-muted-foreground mb-6">Works seamlessly with your streaming services</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 max-w-4xl mx-auto">
                {[
                  "ESPN+", "YouTubeTV", "Hulu", "Disney+", 
                  "Peacock", "Prime Video", "DirecTV", "Sling"
                ].map((service, index) => (
                  <div 
                    key={service}
                    className="glass p-3 rounded-xl text-xs font-medium text-center hover-lift service-card"
                    style={{animationDelay: `${0.1 + index * 0.1}s`}}
                  >
                    {service}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Why Television is Different
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for the modern sports fan who values simplicity and speed
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group stagger-item">
                <div className="gradient-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  One-tap redirects to your connected streaming apps. No searching, no delays, just instant access to live games.
                </p>
              </div>
              
              <div className="text-center group stagger-item">
                <div className="gradient-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Complete Coverage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  NBA, NFL, NHL, MLB, Soccer, College Sports, and more. Every major league and sport in one beautiful dashboard.
                </p>
              </div>
              
              <div className="text-center group stagger-item">
                <div className="gradient-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Tv2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Smart Filtering</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Only see games available on services you actually have. No frustration, no wasted time on unavailable content.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 gradient-primary overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-white">
              Ready to Never Miss a Game?
            </h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of sports fans who have simplified their viewing experience with Television.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4 hover-lift bg-white text-primary hover:bg-white/90">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Try Demo First
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 hover-lift text-white border-white/30 hover:bg-white/10">
                  Get Started Free
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10K+</div>
                <div className="text-white/80">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">8</div>
                <div className="text-white/80">Streaming Services</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">5M+</div>
                <div className="text-white/80">Games Watched</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background border-t">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <div className="gradient-primary p-2 rounded-xl">
                  <Tv2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Television
                </span>
              </div>
              <div className="text-muted-foreground text-sm">
                &copy; 2024 Television. Built for sports fans.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
