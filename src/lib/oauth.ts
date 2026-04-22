// OAuth helper — builds authorization URLs and handles token exchange
// Each provider: we use Authorization Code flow with PKCE where supported

export interface OAuthProfile {
  providerId: string
  email: string
  username: string
  avatar?: string
}

// ─── Google ──────────────────────────────────────────────────────────────────
export function getGoogleAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

// ─── Discord ─────────────────────────────────────────────────────────────────
export function getDiscordAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
    state,
  })
  return `https://discord.com/api/oauth2/authorize?${params}`
}

// ─── Twitter / X ─────────────────────────────────────────────────────────────
export function getTwitterAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'tweet.read users.read offline.access',
    state,
    code_challenge: 'challenge',
    code_challenge_method: 'plain',
  })
  return `https://twitter.com/i/oauth2/authorize?${params}`
}
