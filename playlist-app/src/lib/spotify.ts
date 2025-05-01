const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

let accessToken: string | null = null
let tokenExpiresAt: number = 0

export async function getSpotifyAccessToken(): Promise<string> {
  const now = Date.now()

  if (accessToken && tokenExpiresAt > now) {
    return accessToken
  }

  const authString = `${clientId}:${clientSecret}`
  const base64 = btoa(authString)

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()

  accessToken = data.access_token
  tokenExpiresAt = now + data.expires_in * 1000

  if (!accessToken) {
    throw new Error('Failed to retrieve Spotify access token')
  }
  return accessToken

}
