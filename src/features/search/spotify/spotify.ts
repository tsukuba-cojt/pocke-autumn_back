// src/features/search/spotify/spotify.ts （or spotify.feature.ts）

import type { UnifiedSearchItem } from '../types'
import type { Bindings } from '../../../global.d.ts'

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

async function getSpotifyAccessToken(env: Bindings): Promise<string> {
  const basic = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error('Spotify token error', res.status, await res.text())
    throw new Error('Failed to get Spotify access token')
  }

  const data = (await res.json()) as {
    access_token: string
    expires_in: number
  }

  return data.access_token
}

export async function searchSpotifyTracks(
  env: Bindings,
  query: string
): Promise<UnifiedSearchItem[]> {
  if (!query) return []

  const accessToken = await getSpotifyAccessToken(env)

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: '10',
  })

  const res = await fetch(`${SPOTIFY_BASE_URL}/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error('Spotify API error', res.status, await res.text())
    throw new Error('Spotify API error')
  }

  const data = (await res.json()) as any

  const tracks: UnifiedSearchItem[] =
    data.tracks?.items?.map((t: any) => ({
      title: t.name,
      author: (t.artists ?? []).map((a: any) => a.name).join(', '),
      imageURL: t.album?.images?.[0]?.url ?? null,
      url: t.external_urls?.spotify ?? null,
    })) ?? []

  return tracks
}