// src/router/search.ts

import { Hono } from 'hono'
import { searchSpotifyTracks } from '../features/search/spotify/spotify'
import type { Bindings } from '../global'   // パスはプロジェクトに合わせて

export const searchRouter = new Hono<{ Bindings: Bindings }>()

// GET /search/spotify?q=...
searchRouter.get('/spotify', async (c) => {
  const q = c.req.query('q') ?? ''

  if (!q) {
    return c.json({ message: 'query is required' }, 400)
  }

  const tracks = await searchSpotifyTracks(c.env, q)

  return c.json({
    type: 'spotify',
    query: q,
    items: tracks,
  })
})
