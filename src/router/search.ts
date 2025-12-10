// src/router/search.ts

import { Hono } from 'hono'
import { searchSpotifyTracks } from '../features/search/spotify/spotify'
import 'dotenv/config'

export const searchRouter = new Hono()

// GET /search/spotify?q=...
searchRouter.get('/spotify', async (c) => {
  const q = c.req.query('q') ?? ''

  if (!q) {
    return c.json({ message: 'query is required' }, 400)
  }

  const token = c.env.SPOTIFY_ACCESS_TOKEN
  if (!token) {
    return c.json({ message: 'Spotify token not configured' }, 500)
  }

  const tracks = await searchSpotifyTracks(q, token)

  return c.json({
    type: 'spotify',
    query: q,
    items: tracks,
  })
})
