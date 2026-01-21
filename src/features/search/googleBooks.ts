import type { UnifiedSearchItem } from './types'
import type { Bindings } from '../../global'

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

export async function searchGoogleBooks(
  env: Bindings,
  query: string
): Promise<UnifiedSearchItem[]> {
  if (!query) return []

  const params = new URLSearchParams({
    q: query,
    maxResults: '10',
    langRestrict: 'ja',
  })

  if (env.GOOGLE_BOOKS_API_KEY) {
    params.set('key', env.GOOGLE_BOOKS_API_KEY)
  }

  const res = await fetch(`${GOOGLE_BOOKS_BASE_URL}?${params.toString()}`)

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error('Google Books API error', res.status, await res.text())
    throw new Error('Google Books API error')
  }

  const data = (await res.json()) as any

  const books: UnifiedSearchItem[] =
    data.items?.map((item: any) => {
      const info = item.volumeInfo ?? {}
      return {
        title: info.title ?? '',
        author: (info.authors ?? []).join(', '),
        imageURL: info.imageLinks?.thumbnail ?? null,
        url: info.infoLink ?? null,
      }
    }) ?? []

  return books
}
