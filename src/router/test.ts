// src/router/test.ts

import { Hono } from 'hono'
import { getTestData } from '../features/test.feature'

export const testRouter = new Hono()

// GET /test/
testRouter.get('/', async (c) => {
  const data = await getTestData()
  return c.json(data)
})

// GET /test/ping
testRouter.get('/ping', (c) => {
  return c.json({ message: 'pong' })
})
