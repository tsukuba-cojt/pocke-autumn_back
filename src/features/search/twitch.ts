import type { UnifiedSearchItem } from './types'
import type { Bindings } from '../../global'

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'
const TWITCH_SEARCH_URL = 'https://api.twitch.tv/helix/search/categories'

async function getTwitchAccessToken(env: Bindings): Promise<string> {
  const params = new URLSearchParams({
    client_id: env.TWITCH_CLIENT_ID,
    client_secret: env.TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials',
  })

  const res = await fetch(TWITCH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error('Twitch token error', res.status, await res.text())
    throw new Error('Failed to get Twitch access token')
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export async function searchTwitchCategories(
  env: Bindings,
  query: string
): Promise<UnifiedSearchItem[]> {
  if (!query) return []

  const accessToken = await getTwitchAccessToken(env)
  const params = new URLSearchParams({ query })

  const res = await fetch(`${TWITCH_SEARCH_URL}?${params.toString()}`, {
    headers: {
      'Client-ID': env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error('Twitch API error', res.status, await res.text())
    throw new Error('Twitch API error')
  }

  const data = (await res.json()) as any

  const items: UnifiedSearchItem[] =
    data.data?.map((item: any) => ({
      title: item.name ?? '',
      author: '',
      imageURL: item.box_art_url
        ? item.box_art_url.replace('{width}', '300').replace('{height}', '400')
        : null,
      url: null,
    })) ?? []

  return items
}
