import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrimeVideoOAuth } from '@/lib/auth/oauth'
import { PRIME_VIDEO_CONFIG } from '@/lib/providers/config'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const supabase = await createClient()

  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove provider tokens
    const { error: tokenError } = await supabase
      .from('provider_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('provider_name', provider)

    if (tokenError) {
      console.error('Error removing provider token:', tokenError)
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }

    // Update user_services
    const { error: serviceError } = await supabase
      .from('user_services')
      .upsert({
        user_id: user.id,
        service_name: provider,
        connected: false,
      } as any)

    if (serviceError) {
      console.error('Error updating user service:', serviceError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Provider disconnection error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect provider' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const supabase = await createClient()

  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate state parameter for security
    const state = randomBytes(32).toString('hex')
    
    // Store state in session/cookie for validation
    const cookieStore = await cookies()
    cookieStore.set(`oauth_state_${provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })

    // Store user ID for callback
    cookieStore.set(`oauth_user_${provider}`, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    })

    let authUrl: string

    switch (provider) {
      case 'prime-video':
        const primeOAuth = new PrimeVideoOAuth(
          PRIME_VIDEO_CONFIG.clientId,
          PRIME_VIDEO_CONFIG.clientSecret,
          PRIME_VIDEO_CONFIG.redirectUri,
          PRIME_VIDEO_CONFIG.scope
        )
        authUrl = primeOAuth.generateAuthUrl(state)
        break
      
      default:
        return NextResponse.json(
          { error: 'Provider not supported' },
          { status: 400 }
        )
    }

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}