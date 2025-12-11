// src/features/search/spotify.feature.ts

import type { UnifiedSearchItem } from '../types'

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1'

export async function searchSpotifyTracks(
  query: string,
  accessToken: string
): Promise<UnifiedSearchItem[]> {
  if (!query) return []

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

  const data = await res.json() as any

  const tracks: UnifiedSearchItem[] =
    data.tracks?.items?.map((t: any) => ({
      title: t.name,
      author: (t.artists ?? []).map((a: any) => a.name).join(', '), // アーティスト名まとめて author に
      imageURL: t.album?.images?.[0]?.url ?? null,                  // ジャケット画像
      url: t.external_urls?.spotify ?? null,                        // Spotify のURL
    })) ?? []

  return tracks
}
