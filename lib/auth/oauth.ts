import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { PRIME_VIDEO_CONFIG } from '@/lib/providers/config'

export interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export interface OAuthUserInfo {
  id: string
  email: string
  name?: string
  metadata?: any
}

export class OAuthProvider {
  protected clientId: string
  protected clientSecret: string
  protected redirectUri: string
  protected scope: string

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    scope: string
  ) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUri = redirectUri
    this.scope = scope
  }

  generateAuthUrl(state: string): string {
    throw new Error('generateAuthUrl must be implemented by subclass')
  }

  async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    throw new Error('exchangeCodeForToken must be implemented by subclass')
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    throw new Error('refreshAccessToken must be implemented by subclass')
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    throw new Error('getUserInfo must be implemented by subclass')
  }
}

export class PrimeVideoOAuth extends OAuthProvider {
  private authEndpoint = PRIME_VIDEO_CONFIG.authEndpoint
  private tokenEndpoint = PRIME_VIDEO_CONFIG.tokenEndpoint
  private userInfoEndpoint = PRIME_VIDEO_CONFIG.userInfoEndpoint

  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state,
    })

    return `${this.authEndpoint}?${params.toString()}`
  }

  async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    // For demo/beta, we'll simulate the token exchange
    // In production, this would make a real API call to Amazon
    if (process.env.NODE_ENV === 'development' || this.clientId === 'demo-client-id') {
      // Simulated response for testing
      return {
        access_token: `demo-access-token-${Date.now()}`,
        refresh_token: `demo-refresh-token-${Date.now()}`,
        expires_in: 3600,
        token_type: 'Bearer'
      }
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    return response.json()
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    // For demo/beta, simulate refresh
    if (process.env.NODE_ENV === 'development' || this.clientId === 'demo-client-id') {
      return {
        access_token: `demo-access-token-refreshed-${Date.now()}`,
        refresh_token: refreshToken,
        expires_in: 3600,
        token_type: 'Bearer'
      }
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    // For demo/beta, return simulated user info
    if (process.env.NODE_ENV === 'development' || this.clientId === 'demo-client-id') {
      return {
        id: 'prime-demo-user-123',
        email: 'demo@primevideo.com',
        name: 'Demo Prime User',
        metadata: {
          subscription: 'Prime',
          region: 'US'
        }
      }
    }

    const response = await fetch(this.userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`User info fetch failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      id: data.user_id,
      email: data.email,
      name: data.name,
      metadata: data
    }
  }
}

export async function storeProviderToken(
  userId: string,
  providerName: string,
  tokenData: OAuthTokenResponse,
  userInfo: OAuthUserInfo
) {
  const supabase = await createClient()
  
  const expiresAt = new Date()
  expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in)

  const { error } = await supabase
    .from('provider_tokens')
    .upsert({
      user_id: userId,
      provider_name: providerName,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
      provider_user_id: userInfo.id,
      provider_email: userInfo.email,
      provider_metadata: userInfo.metadata || {},
    } as any)

  if (error) {
    console.error('Error storing provider token:', error)
    throw error
  }
}

export async function getProviderToken(userId: string, providerName: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('provider_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider_name', providerName)
    .single()

  if (error) {
    console.error('Error fetching provider token:', error)
    return null
  }

  // Check if token needs refresh
  if ((data as any).expires_at && new Date((data as any).expires_at) < new Date()) {
    // Token expired, try to refresh
    if ((data as any).refresh_token && providerName === 'prime-video') {
      try {
        const oauth = new PrimeVideoOAuth(
          PRIME_VIDEO_CONFIG.clientId,
          PRIME_VIDEO_CONFIG.clientSecret,
          PRIME_VIDEO_CONFIG.redirectUri,
          PRIME_VIDEO_CONFIG.scope
        )
        
        const newTokenData = await oauth.refreshAccessToken((data as any).refresh_token)
        
        // Update stored token
        await storeProviderToken(
          userId,
          providerName,
          newTokenData,
          {
            id: (data as any).provider_user_id,
            email: (data as any).provider_email,
            metadata: (data as any).provider_metadata
          }
        )
        
        return {
          ...(data as any),
          access_token: newTokenData.access_token,
          refresh_token: newTokenData.refresh_token || (data as any).refresh_token
        }
      } catch (error) {
        console.error('Error refreshing token:', error)
        return null
      }
    }
    return null
  }

  return data as any
}

export async function revokeProviderToken(userId: string, providerName: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('provider_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('provider_name', providerName)

  if (error) {
    console.error('Error revoking provider token:', error)
    throw error
  }
}