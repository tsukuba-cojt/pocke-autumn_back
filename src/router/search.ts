// src/router/search.ts

import { Hono } from 'hono'
import { searchSpotifyTracks } from '../features/search/spotify'
import { searchGoogleBooks } from '../features/search/googleBooks'
import { searchTwitchCategories } from '../features/search/twitch'
import type { AppEnv } from '../middleware/db'

export const searchRouter = new Hono<AppEnv>()

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

// GET /search/google-books?q=...
searchRouter.get('/google-books', async (c) => {
  const q = c.req.query('q') ?? ''

  if (!q) {
    return c.json({ message: 'query is required' }, 400)
  }

  const books = await searchGoogleBooks(c.env, q)

  return c.json({
    type: 'google-books',
    query: q,
    items: books,
  })
})

// GET /search/twitch?q=...
searchRouter.get('/twitch', async (c) => {
  const q = c.req.query('q') ?? ''

  if (!q) {
    return c.json({ message: 'query is required' }, 400)
  }

  const categories = await searchTwitchCategories(c.env, q)

  return c.json({
    type: 'twitch',
    query: q,
    items: categories,
  })
})
