import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrimeVideoOAuth, storeProviderToken } from '@/lib/auth/oauth'
import { PRIME_VIDEO_CONFIG } from '@/lib/providers/config'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const cookieStore = await cookies()
  const storedState = cookieStore.get(`oauth_state_${provider}`)?.value
  const userId = cookieStore.get(`oauth_user_${provider}`)?.value

  try {
    // Handle OAuth errors
    if (error) {
      console.error(`OAuth error for ${provider}:`, error)
      return NextResponse.redirect(
        new URL(`/settings?provider_error=${encodeURIComponent(error)}`, request.url)
      )
    }

    // Validate required parameters
    if (!code || !state || !storedState || !userId) {
      console.error('Missing or invalid OAuth parameters')
      return NextResponse.redirect(
        new URL('/settings?provider_error=invalid_request', request.url)
      )
    }

    // Validate state parameter
    if (state !== storedState) {
      console.error('Invalid state parameter')
      return NextResponse.redirect(
        new URL('/settings?provider_error=invalid_state', request.url)
      )
    }

    // Clear state cookies
    cookieStore.delete(`oauth_state_${provider}`)
    cookieStore.delete(`oauth_user_${provider}`)

    let oauth: any
    let tokenData: any
    let userInfo: any

    switch (provider) {
      case 'prime-video':
        oauth = new PrimeVideoOAuth(
          PRIME_VIDEO_CONFIG.clientId,
          PRIME_VIDEO_CONFIG.clientSecret,
          PRIME_VIDEO_CONFIG.redirectUri,
          PRIME_VIDEO_CONFIG.scope
        )
        
        // Exchange code for tokens
        tokenData = await oauth.exchangeCodeForToken(code)
        userInfo = await oauth.getUserInfo(tokenData.access_token)
        break

      default:
        return NextResponse.redirect(
          new URL('/settings?provider_error=unsupported_provider', request.url)
        )
    }

    // Store the tokens securely
    await storeProviderToken(userId, provider, tokenData, userInfo)

    // Update user_services table
    const supabase = await createClient()
    await supabase
      .from('user_services')
      .upsert({
        user_id: userId,
        service_name: provider,
        connected: true,
      } as any)

    // Redirect back to settings with success message
    return NextResponse.redirect(
      new URL(`/settings?provider_connected=${provider}`, request.url)
    )

  } catch (error) {
    console.error(`OAuth callback error for ${provider}:`, error)
    return NextResponse.redirect(
      new URL(`/settings?provider_error=connection_failed`, request.url)
    )
  }
}